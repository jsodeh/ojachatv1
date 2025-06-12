import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Phone, User } from 'lucide-react';

interface ProfileSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSetup = ({ isOpen, onClose }: ProfileSetupProps) => {
  const { user } = useUser();
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);
  
  // Update state when user data changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone_number || '');
      setAvatarUrl(user.avatar_url || null);
    }
  }, [user]);

  // Also update from the profile if available
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhoneNumber(profile.phone_number || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Get first and last name initials for avatar fallback
  const getInitials = () => {
    if (!fullName) return 'U';
    
    const names = fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image too large. Maximum size is 5MB.');
        return;
      }
      
      setAvatarFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error('Phone number is required');
      return;
    }
    
    if (!user || !user.id) {
      toast.error('User not found. Please sign in again.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Upload avatar if provided
      let uploadedAvatarUrl = null;
      
      if (avatarFile) {
        try {
          const fileExt = avatarFile.name.split('.').pop();
          const filePath = `${user.id}/avatar.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });
            
          if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            toast.error('Failed to upload avatar, but will save other profile information');
          } else {
            // Get the public URL
            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
              
            uploadedAvatarUrl = publicUrlData.publicUrl;
          }
        } catch (uploadErr) {
          console.error('Unexpected error during upload:', uploadErr);
          // Continue with profile update even if avatar upload fails
        }
      }
      
      // Prepare profile data
      const profileData = {
        id: user.id,
        full_name: fullName,
        phone_number: phoneNumber,
        ...(uploadedAvatarUrl && { avatar_url: uploadedAvatarUrl }),
        updated_at: new Date().toISOString()
      };
      
      // Use upsert operation to either create or update the profile
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData);
        
      if (upsertError) {
        console.error('Error updating profile:', upsertError);
        throw upsertError;
      }
      
      // Also update user metadata
      try {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { full_name: fullName }
        });
        
        if (metadataError) {
          console.error('Error updating user metadata:', metadataError);
        }
      } catch (metadataErr) {
        console.error('Failed to update user metadata:', metadataErr);
        // Continue anyway since the profile was updated
      }
      
      // Refresh the profile in the AuthContext to update throughout the app
      await refreshProfile();
      
      toast.success('Profile updated successfully!');
      
      // Small delay before closing to ensure the toast is visible
      setTimeout(() => {
        if (isMounted.current) {
          setIsLoading(false);
          onClose();
        }
      }, 800);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };
  
  // If user is not present, prompt to sign in again
  if (!user || !user.id) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Complete Your Profile</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-red-600 font-medium">
            User not found. Please sign in again.
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isLoading) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Complete Your Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={triggerFileInput}>
              <AvatarImage src={avatarUrl || user?.avatar_url || ''} />
              <AvatarFallback className="bg-gray-200 text-gray-700 text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileInput}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            
            <p className="text-xs text-gray-500">Optional: Upload a profile picture</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => !isLoading && onClose()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading || !phoneNumber || !fullName}
            >
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSetup; 