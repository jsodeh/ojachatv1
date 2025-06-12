import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  Image, 
  Mic, 
  Camera,
  Link, 
  Search,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
}

export default function AttachmentModal({ isOpen, onClose, onSelect }: AttachmentModalProps) {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const isPaidUser = subscription?.status === 'active';

  const options = [
    { id: 'use-camera', label: 'Use Camera', icon: Camera, color: 'text-blue-500', description: 'Take a photo with your camera' },
    { id: 'upload-gallery', label: 'Upload from Gallery', icon: Image, color: 'text-purple-500', description: 'Upload an image from your gallery' },
    { id: 'upload-pdf', label: 'Upload PDF', icon: Upload, color: 'text-green-500', description: 'Upload a PDF document' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Attachment</DialogTitle>
          <DialogDescription>
            Choose how you would like to add an attachment to your message
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {options.map((option) => (
            <Button
              key={option.id}
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3 px-4"
              onClick={() => {
                onSelect(option.id);
                onClose();
              }}
            >
              <option.icon className={cn("w-5 h-5", option.color)} />
              <div className="flex-1 text-left">
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 