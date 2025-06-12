import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface WelcomeMessageProps {
  className?: string;
}

const WelcomeMessage = ({ className }: WelcomeMessageProps) => {
  const { isAuthenticated, user } = useAuth();
  const [timeGreeting, setTimeGreeting] = useState('');
  const appName = "OjaChat";
  const name = isAuthenticated && user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ")[0]
    : "";
    
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setTimeGreeting('morning');
    } else if (hours < 18) {
      setTimeGreeting('afternoon');
    } else {
      setTimeGreeting('evening');
    }
  }, []);

  const fullGreeting = isAuthenticated
    ? `Good ${timeGreeting}${name ? ', ' + name : ''}`
    : `Hello, good ${timeGreeting}`;

  return (
    <div className={cn("grok-welcome-container", className)}>
      <h1 className="grok-welcome-title text-2xl md:text-3xl mb-1">
        {fullGreeting}
      </h1>
      <p className="grok-welcome-subtitle text-lg">
        What would you like to buy today?
      </p>
    </div>
  );
};

export default WelcomeMessage; 