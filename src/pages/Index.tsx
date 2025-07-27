import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ActionButtons from '@/components/ActionButtons';
import MessageList from '@/components/MessageList';
import WelcomeMessage from '@/components/WelcomeMessage';
import CartModal from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';
import { Message, ChatSession, OrderStatus } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthWrapper } from '@/components/AuthWrapper';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Maximum number of chat sessions to keep in localStorage
const MAX_SAVED_SESSIONS = 50;

if (!SUPABASE_ANON_KEY || !SUPABASE_URL) {
  console.error('Missing required environment variables');
}

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [shouldCreateChatAfterAuth, setShouldCreateChatAfterAuth] = useState(false);
  const { toast } = useToast();
  const [currentSessionId, setCurrentSessionId] = useState(`session_${Date.now()}`);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const { isAuthenticated } = useAuth();
  const authWrapper = useAuthWrapper();

  // Clean up old sessions to prevent localStorage bloat
  const cleanupOldSessions = useCallback((sessions: ChatSession[]) => {
    if (sessions.length > MAX_SAVED_SESSIONS) {
      // Sort by timestamp (newest first) and keep only the MAX_SAVED_SESSIONS most recent
      const sortedSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
      return sortedSessions.slice(0, MAX_SAVED_SESSIONS);
    }
    return sessions;
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        // Clean up old sessions to prevent localStorage bloat
        const cleanedSessions = cleanupOldSessions(parsedSessions);
        setChatSessions(cleanedSessions);
        
        // If cleaned sessions are fewer than original, update localStorage
        if (cleanedSessions.length < parsedSessions.length) {
          localStorage.setItem('chatSessions', JSON.stringify(cleanedSessions));
        }
      } catch (error) {
        console.error('Error parsing saved sessions:', error);
        localStorage.removeItem('chatSessions');
      }
    }
  }, [cleanupOldSessions]);

  // Check if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && shouldCreateChatAfterAuth) {
      const newSessionId = `session_${Date.now()}`;
      setCurrentSessionId(newSessionId);
      setMessages([]);
      setShouldCreateChatAfterAuth(false);
    }
  }, [isAuthenticated, shouldCreateChatAfterAuth]);

  const handleNewChat = () => {
    // If user is not authenticated, show auth prompt via the AuthWrapper context
    if (!isAuthenticated) {
      setShouldCreateChatAfterAuth(true);
      authWrapper.showAuthModal();
      return;
    }
    
    // Create new chat
    const newSessionId = `session_${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setMessages([]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = async (content: string, sessionId: string) => {
    // Authentication check is now handled in the ChatInput component
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const newMessage: Message = { 
      role: 'user',
      content: {
        text: content,
      },
      timestamp: Date.now()
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    const sessionTitle = messages.length === 0 ? content : chatSessions.find(s => s.id === sessionId)?.title || content;
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    const newSession = {
      id: sessionId,
      title: sessionTitle.slice(0, 40) + (sessionTitle.length > 40 ? '...' : ''),
      messages: newMessages,
      timestamp: Date.now()
    };
    
    const allSessions = [newSession, ...updatedSessions];
    setChatSessions(allSessions);
    localStorage.setItem('chatSessions', JSON.stringify(allSessions));

    let retries = 0;
    let success = false;

    while (retries <= MAX_RETRIES && !success) {
      try {
        const requestBody = {
          chatInput: content,
          sessionId: sessionId
        };
        console.log('Sending request:', requestBody);
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/n8n-router`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
            'testauth': 'testauth'
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Edge function returned status: ${response.status}`);
        }

        const responseText = await response.text();
        if (!responseText) {
          throw new Error('Empty response received from server. Please check if the n8n service is running.');
        }

        let data;
        try {
          data = JSON.parse(responseText);
          if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format from server');
          }
        } catch (e) {
          console.error('Failed to parse response as JSON:', responseText);
          throw new Error('Invalid JSON response from server. Please try again later.');
        }

        console.log('Response data:', data);
        
        let assistantContent;
        if (data?.output) {
          try {
            // Try to parse the output as JSON first
            const parsedOutput = JSON.parse(data.output);
            console.log('Parsed output:', parsedOutput);
            
            assistantContent = {
              text: parsedOutput.text,
              products: parsedOutput.rawResponse?.products || [],
              rawResponse: parsedOutput.rawResponse
            };
          } catch (e) {
            // If parsing fails, use the output as plain text
            console.log('Output is not JSON, using as plain text');
            assistantContent = {
              text: data.output,
              products: []
            };
          }
          console.log('Final assistant content:', assistantContent);
        } else {
          console.error('Unexpected response format:', data);
          throw new Error('Invalid response format from assistant');
        }
        
        console.log('Processed assistant content:', assistantContent);
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantContent,
          timestamp: Date.now()
        };

        const updatedMessages = [...newMessages, assistantMessage];
        setMessages(updatedMessages);

        const updatedSession = {
          ...newSession,
          messages: updatedMessages
        };
        const finalSessions = [updatedSession, ...updatedSessions];
        setChatSessions(finalSessions);
        localStorage.setItem('chatSessions', JSON.stringify(finalSessions));

        success = true;
      } catch (error) {
        console.error(`Edge function error (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
        retries++;
        
        if (retries <= MAX_RETRIES) {
          console.log(`Retrying request (attempt ${retries + 1}/${MAX_RETRIES + 1})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          console.error('Final error after retries:', errorMessage);
          
          toast({
            title: "Connection Error",
            description: `Failed to connect: ${errorMessage}. Please check your connection and try again.`,
            variant: "destructive"
          });
          
          const fallbackMessage: Message = {
            role: 'assistant',
            content: {
              text: "I apologize, but I'm having trouble connecting to the server. This might be due to:",
              actionButtons: [
                {
                  label: "Retry",
                  action: "retry",
                  onClick: () => handleSendMessage(content, sessionId)
                }
              ]
            },
            timestamp: Date.now()
          };
          
          setMessages([...newMessages, fallbackMessage]);
        }
      } finally {
        if (retries >= MAX_RETRIES || success) {
          setIsLoading(false);
        }
      }
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    // Authentication check is now handled in Sidebar component
    setCurrentSessionId(sessionId);
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
    }
  };

  const handleOrderStatus = (status: OrderStatus) => {
    const newMessage: Message = {
      role: 'assistant',
      content: {
        text: status.message,
        richComponent: status
      },
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update the session with the new message
    const updatedSessions = chatSessions.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, newMessage]
        };
      }
      return session;
    });
    
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  return (
    <>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        onNewChat={handleNewChat}
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onCartClick={() => setIsCartModalOpen(true)}
      />
      
      <div className="flex flex-col h-screen w-screen">
        <main className={cn(
          "flex-1 flex flex-col items-center justify-center h-full w-full transition-all duration-300 bg-grok-light-background dark:bg-grok-dark-background"
        )}>
          <ChatHeader 
            isSidebarOpen={isSidebarOpen} 
            onToggle={toggleSidebar}
            onNewChat={handleNewChat}
          />
          
          <div className="w-full max-w-[820px] mx-auto">
          {messages.length === 0 ? (
            <div className="grok-main-content flex flex-col items-center justify-center w-full h-full">
              {/* Top spacing */}
              <div className="grok-vertical-spacing"></div>
              
              {/* Welcome section */}
              <WelcomeMessage />
              
              {/* Input container */}
              <div className="grok-input-container relative">
                <ChatInput 
                  onSend={(content) => handleSendMessage(content, currentSessionId)} 
                  isLoading={isLoading} 
                  isLarge={true} 
                  sessionId={currentSessionId}
                  key={currentSessionId}
                />
              </div>
              
              {/* Action buttons */}
              <div className="grok-action-buttons">
                <button 
                  className="grok-button"
                  onClick={() => handleSendMessage("I want to buy foodstuff", currentSessionId)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                  <span className="text-xs">Buy Foodstuff</span>
                </button>
                
                <button 
                  className="grok-button"
                  onClick={() => handleSendMessage("I want to check prices", currentSessionId)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                  <span className="text-xs">Check Prices</span>
                </button>
                
                <button 
                  className="grok-button"
                  onClick={() => handleSendMessage("I want to buy medicine", currentSessionId)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                  <span className="text-xs">Buy Medicine</span>
                </button>
                
                <button 
                  className="grok-button"
                  onClick={() => handleSendMessage("I want to do a market run", currentSessionId)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart">
                    <circle cx="8" cy="21" r="1"></circle>
                    <circle cx="19" cy="21" r="1"></circle>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                  </svg>
                  <span className="text-xs">Market Runs</span>
                </button>
                
                <button 
                  className="grok-button"
                  onClick={() => handleSendMessage("I want to find a product", currentSessionId)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <path d="M12 17h.01"></path>
                  </svg>
                  <span className="text-xs">Find a Product</span>
                </button>
              </div>
              
              {/* Footer text */}
              <div className="grok-footer">
                OjaChat can make mistakes. Check important info.
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-[calc(100vh-60px)] w-full max-w-[820px] mx-auto">
              <div className="flex-1 w-full overflow-y-auto px-4">
                <MessageList messages={messages} onRetry={handleSendMessage} isLoading={isLoading} />
              </div>
              <div className="w-full px-4 py-2 bg-grok-light-background dark:bg-grok-dark-background sticky bottom-0 z-20">
                <ChatInput 
                  onSend={(content) => handleSendMessage(content, currentSessionId)} 
                  isLoading={isLoading} 
                  isLarge={false} 
                  sessionId={currentSessionId}
                  key={currentSessionId}
                />
              </div>
              <div className="text-xs text-center text-grok-light-text-tertiary dark:text-grok-dark-text-tertiary py-2">
                OjaChat can make mistakes. Check important info.
              </div>
            </div>
          )}
          </div>
        </main>
      </div>

      <CartModal 
        isOpen={isCartModalOpen} 
        onClose={() => setIsCartModalOpen(false)} 
        onCheckout={() => {
          setIsCartModalOpen(false);
          setIsCheckoutModalOpen(true);
        }}
        onOrderStatus={handleOrderStatus}
      />
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />
    </>
  );
};

export default Index;
