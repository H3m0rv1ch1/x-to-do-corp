/**
 * Image Compression Utility
 * Compresses images to WebP format with heavy compression to save storage
 */

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8, // 80% quality - heavy compression, good visual quality
};

/**
 * Compresses an image file to WebP format
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed image as Blob
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<Blob> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Canvas context not supported'));
            return;
        }

        img.onload = () => {
            try {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;

                if (width > opts.maxWidth! || height > opts.maxHeight!) {
                    const aspectRatio = width / height;

                    if (width > height) {
                        width = opts.maxWidth!;
                        height = width / aspectRatio;
                    } else {
                        height = opts.maxHeight!;
                        width = height * aspectRatio;
                    }
                }

                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw and compress image
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to WebP blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/webp',
                    opts.quality
                );
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        // Load the image
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Get compression info for display
 */
export function getCompressionInfo(originalSize: number, compressedSize: number) {
    const reduction = ((originalSize - compressedSize) / originalSize) * 100;
    return {
        originalSize: formatFileSize(originalSize),
        compressedSize: formatFileSize(compressedSize),
        reduction: `${reduction.toFixed(1)}%`,
    };
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
