import { useAnimatedHints } from '@/hooks/use-animated-hints';
import { useLocation } from '@/hooks/use-location';
import { cn } from '@/lib/utils';

interface AnimatedHintProps {
  className?: string;
}

const AnimatedHint = ({ className }: AnimatedHintProps) => {
  const { location } = useLocation();
  const { currentText, isTyping, isDeleting } = useAnimatedHints({
    location: location?.area
  });

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <span className="text-4xl font-semibold text-center">
        {currentText}
        <span 
          className={cn(
            "inline-block w-[2px] h-8 bg-white ml-1 -mb-1",
            (isTyping || isDeleting) ? "animate-blink" : "opacity-0"
          )}
        />
      </span>
    </div>
  );
};

export default AnimatedHint; 