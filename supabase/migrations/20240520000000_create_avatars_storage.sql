-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for viewing avatars (public access)
CREATE POLICY "Public Access to Avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Policy for uploading avatars (authenticated users only)
CREATE POLICY "Users Can Upload Avatars" ON storage.objects
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = owner_id);

-- Policy for updating avatars (users can only update their own)
CREATE POLICY "Users Can Update Own Avatars" ON storage.objects
FOR UPDATE TO authenticated 
USING (bucket_id = 'avatars' AND auth.uid()::text = owner_id);

-- Policy for deleting avatars (users can only delete their own)
CREATE POLICY "Users Can Delete Own Avatars" ON storage.objects
FOR DELETE TO authenticated 
USING (bucket_id = 'avatars' AND auth.uid()::text = owner_id); 