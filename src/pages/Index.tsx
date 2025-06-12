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
import ProductDetailsModal from '@/components/ProductDetailsModal';
import { Message, ChatSession, OrderStatus, Product } from '@/types/chat';
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
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | undefined>(undefined);
  const [checkoutStatus, setCheckoutStatus] = useState<string | undefined>(undefined);
  const [checkoutTotalAmount, setCheckoutTotalAmount] = useState<number | undefined>(undefined);
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
              richComponent: parsedOutput.rawResponse?.richComponent,
              actionButtons: parsedOutput.rawResponse?.actionButtons,
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
            title: "Error",
            description: `Failed to get response after multiple retries: ${errorMessage}`,
            variant: "destructive"
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(session.id);
      setIsSidebarOpen(false); // Close sidebar on session select
    }
  };

  const handleOpenProductDetailsModal = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDetailsModalOpen(true);
  };

  const handleCloseProductDetailsModal = () => {
    setIsProductDetailsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleOpenCartModal = () => {
    setIsCartModalOpen(true);
  };

  const handleCloseCartModal = () => {
    setIsCartModalOpen(false);
  };

  const handleOpenCheckoutModal = (orderId: string, status: string, totalAmount: number) => {
    setCheckoutOrderId(orderId);
    setCheckoutStatus(status);
    setCheckoutTotalAmount(totalAmount);
    setIsCheckoutModalOpen(true);
  };

  const handleCloseCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutOrderId(undefined);
    setCheckoutStatus(undefined);
    setCheckoutTotalAmount(undefined);
  };
  
  return (
    <>
      <div className="flex h-screen bg-grok-light-background dark:bg-grok-dark-background">
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          chatSessions={chatSessions} 
          onNewChat={handleNewChat} 
          onSessionSelect={handleSessionSelect}
        />
        
        <div className="flex flex-col flex-1 relative">
          <ChatHeader 
            toggleSidebar={toggleSidebar} 
            isMobile={isMobile} 
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onCartClick={handleOpenCartModal}
          />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 w-full overflow-y-auto px-4">
              {messages.length === 0 ? (
                <WelcomeMessage onStartChat={() => {}} />
              ) : (
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  onOpenProductDetailsModal={handleOpenProductDetailsModal}
                  onOpenCartModal={handleOpenCartModal}
                  onOpenCheckoutModal={handleOpenCheckoutModal}
                />
              )}
            </div>
            <div className="w-full px-4 py-2 bg-grok-light-background dark:bg-grok-dark-background sticky bottom-0 z-20">
              {isMobile ? (
                <ChatInput
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                  isLarge={false}
                  sessionId={currentSessionId}
                  key={currentSessionId}
                  onAttachment={() => {}}
                  onOptionSelect={() => {}}
                />
              ) : (
                <ChatInput
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                  isLarge={true}
                  sessionId={currentSessionId}
                  key={currentSessionId}
                  onAttachment={() => {}}
                  onOptionSelect={() => {}}
                />
              )}
            </div>
            <div className="text-xs text-center text-grok-light-text-tertiary dark:text-grok-dark-text-tertiary py-2">
              OjaChat can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </div>

      <CartModal isOpen={isCartModalOpen} onClose={handleCloseCartModal} onCheckoutSuccess={handleOpenCheckoutModal} />
      {checkoutOrderId && checkoutStatus && checkoutTotalAmount !== undefined && (
        <CheckoutModal isOpen={isCheckoutModalOpen} onClose={handleCloseCheckoutModal} orderId={checkoutOrderId} status={checkoutStatus} totalAmount={checkoutTotalAmount} />
      )}
      {selectedProduct && (
        <ProductDetailsModal
          isOpen={isProductDetailsModalOpen}
          onClose={handleCloseProductDetailsModal}
          product={selectedProduct}
        />
      )}
    </>
  );
};

export default Index;
