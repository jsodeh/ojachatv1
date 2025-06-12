#!/bin/bash

# Set up avatars storage bucket
echo "Creating avatars storage bucket..."
supabase storage create bucket avatars

# Update storage bucket policy
echo "Creating storage bucket policies..."
# Policy for viewing avatars
supabase storage create policy avatars_public --bucket=avatars --name=public --permission=select --definition="true"

# Policy for uploading avatars
supabase storage create policy avatars_insert --bucket=avatars --name=user_upload --permission=insert --definition="auth.uid() = auth.uid()"

# Policy for updating avatars
supabase storage create policy avatars_update --bucket=avatars --name=user_update --permission=update --definition="auth.uid() = auth.uid()"

# Policy for deleting avatars
supabase storage create policy avatars_delete --bucket=avatars --name=user_delete --permission=delete --definition="auth.uid() = auth.uid()"

echo "Storage setup complete!" 