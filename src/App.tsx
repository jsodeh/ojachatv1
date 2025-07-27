import React, { useState } from "react";
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Index from '@/pages/Index';
import DeliveryCheckoutWrapper from '@/components/DeliveryCheckoutWrapper';
import { ElevenLabsProvider } from '@/providers/ElevenLabsProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthWrapper from '@/components/AuthWrapper';
import AuthModal from '@/components/AuthModal';
import SubscriptionModal from '@/components/SubscriptionModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import SubscriptionHistory from '@/components/SubscriptionHistory';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import ElevenLabsConversationalModal from '@/components/ElevenLabsConversationalModal';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import './styles/globals.css';

// Component to handle auth modal display
function AuthModalHandler() {
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    // Listen for custom events to show/hide auth modal
    const handleShowModal = () => {
      if (!isAuthenticated) {
        setShowAuthModal(true);
      }
    };

    const handleHideModal = () => {
      setShowAuthModal(false);
    };

    window.addEventListener('ojachat:show-auth-modal', handleShowModal);
    window.addEventListener('ojachat:hide-auth-modal', handleHideModal);

    return () => {
      window.removeEventListener('ojachat:show-auth-modal', handleShowModal);
      window.removeEventListener('ojachat:hide-auth-modal', handleHideModal);
    };
  }, [isAuthenticated]);

  return (
    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      initialMode="options"
    />
  );
}

// Component to handle subscription modal display
function SubscriptionModalHandler() {
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);

  React.useEffect(() => {
    // Listen for custom events to show/hide subscription modal
    const handleShowModal = () => {
      setShowSubscriptionModal(true);
    };
    const handleHideModal = () => {
      setShowSubscriptionModal(false);
    };
    window.addEventListener('ojachat:show-subscription-modal', handleShowModal);
    window.addEventListener('ojachat:hide-subscription-modal', handleHideModal);
    return () => {
      window.removeEventListener('ojachat:show-subscription-modal', handleShowModal);
      window.removeEventListener('ojachat:hide-subscription-modal', handleHideModal);
    };
  }, []);

  return (
    <SubscriptionModal
      isOpen={showSubscriptionModal}
      onClose={() => setShowSubscriptionModal(false)}
    />
  );
}

export default function App() {
  const [isConversationalModalOpen, setIsConversationalModalOpen] = useState(false);

  const handleOpenConversationalModal = () => {
    setIsConversationalModalOpen(true);
  };

  const handleCloseConversationalModal = () => {
    setIsConversationalModalOpen(false);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="flex h-screen w-full bg-grok-light-background dark:bg-grok-dark-background text-grok-light-text-primary dark:text-grok-dark-text-primary">
          <BrowserRouter>
            <AuthProvider>
              <SubscriptionProvider>
                <CartProvider>
                  <NotificationProvider>
                    <AuthWrapper>
                    <ElevenLabsProvider>
                      <Routes>
                        {/* Main App Routes */}
                        <Route path="/" element={
                            <Index />
                        } />
                        <Route path="delivery/checkout" element={<DeliveryCheckoutWrapper />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        {/* Add more main app routes here */}
                      </Routes>
                      <AuthModalHandler />
                      <SubscriptionModalHandler />
                      <Toaster />
                        {/* Floating Action Button for ElevenLabs Conversational Modal */}
                        <Button 
                          onClick={handleOpenConversationalModal}
                          className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg bg-green-500 border-0 flex items-center justify-center text-white hover:bg-green-600"
                          aria-label="Open conversational AI"
                        >
                          <Mic className="h-7 w-7" />
                        </Button>
                        <ElevenLabsConversationalModal
                          isOpen={isConversationalModalOpen}
                          onClose={handleCloseConversationalModal}
                        />
                    </ElevenLabsProvider>
                    </AuthWrapper>
                  </NotificationProvider>
                </CartProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
