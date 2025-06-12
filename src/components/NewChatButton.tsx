import { Pencil } from 'lucide-react';
import { generateSessionId } from '../utils/sessionManager';

interface NewChatButtonProps {
  onNewChat: (sessionId: string) => void;
  className?: string;
}

const NewChatButton = ({ onNewChat, className = '' }: NewChatButtonProps) => {
  const handleClick = () => {
    const newSessionId = generateSessionId();
    onNewChat(newSessionId);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 hover:bg-gray-700 rounded-full ${className}`}
      title="Start new chat"
    >
      <Pencil className="h-5 w-5" />
    </button>
  );
};

export default NewChatButton;
