/**
 * Image Upload Service
 * Handles uploading compressed images to Supabase Storage
 */

import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { compressImage } from '@/utils/imageCompression';

const BUCKET_NAME = 'images';

/**
 * Uploads an image to Supabase Storage with compression
 * @param file - The image file to upload
 * @param userId - The authenticated user's ID
 * @param folder - Optional subfolder (e.g., 'todos', 'profiles')
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
    file: File,
    userId: string,
    folder: string = 'general'
): Promise<string> {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured');
    }

    // Compress the image first
    const compressedBlob = await compressImage(file);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const filename = `${timestamp}-${randomStr}.webp`;
    const filePath = `${userId}/${folder}/${filename}`;

    const supabase = getSupabase();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, compressedBlob, {
            contentType: 'image/webp',
            upsert: false,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

/**
 * Deletes an image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
        // Extract file path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
        if (pathParts.length < 2) return;

        const filePath = pathParts[1];
        const supabase = getSupabase();

        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    } catch (error) {
        console.error('Failed to delete image:', error);
        // Don't throw - deletion is not critical
    }
}
