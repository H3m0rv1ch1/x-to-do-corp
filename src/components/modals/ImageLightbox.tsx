import React from 'react';
import { HiX } from 'react-icons/hi';

interface ImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors"
        onClick={onClose}
        aria-label="Close image view"
      >
        <HiX className="w-6 h-6" />
      </button>
      <div className="relative max-w-4xl max-h-[90vh] w-full p-4">
         <img
            src={imageUrl}
            alt="Lightbox view"
            className="w-full h-full object-contain"
            onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ImageLightbox;