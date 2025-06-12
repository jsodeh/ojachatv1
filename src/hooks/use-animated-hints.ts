import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface AnimatedHintOptions {
  typingSpeed?: number;
  backspaceSpeed?: number;
  pauseDuration?: number;
  location?: string | null;
}

const defaultHints = [
  "How much is a bag of rice at Mile 12?",
  "Where can I find fresh seafood in Abuja?",
  "Help me buy provisions from Mushin Market?",
  "I want to buy foodstuff from Mile 12",
  "Where can I get a bag of yellow garri in Ibadan?"
];

export const useAnimatedHints = ({
  typingSpeed = 50,
  backspaceSpeed = 30,
  pauseDuration = 2000,
  location = null
}: AnimatedHintOptions = {}) => {
  const [hints, setHints] = useState<string[]>(defaultHints);
  const [currentText, setCurrentText] = useState('');
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch location-based hints from Supabase
  useEffect(() => {
    const fetchLocationHints = async () => {
      if (!location) return;

      try {
        const { data, error } = await supabase
          .from('page_content')
          .select('content')
          .eq('content_type', 'hint')
          .textSearch('content', location, {
            type: 'websearch',
            config: 'english'
          });

        if (error) throw error;

        if (data && data.length > 0) {
          const locationHints = data.map(item => item.content);
          setHints([
            ...locationHints,
            ...defaultHints.filter(hint => !locationHints.includes(hint))
          ]);
        }
      } catch (error) {
        console.error('Error fetching location hints:', error);
      }
    };

    fetchLocationHints();
  }, [location]);

  // Handle typing animation
  useEffect(() => {
    const currentHint = hints[currentHintIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (currentText.length < currentHint.length) {
        timeout = setTimeout(() => {
          setCurrentText(currentHint.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else if (isDeleting) {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, backspaceSpeed);
      } else {
        setIsDeleting(false);
        setIsTyping(true);
        setCurrentHintIndex((currentHintIndex + 1) % hints.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isTyping, isDeleting, currentHintIndex, hints, typingSpeed, backspaceSpeed, pauseDuration]);

  return {
    currentText,
    isTyping,
    isDeleting
  };
}; 