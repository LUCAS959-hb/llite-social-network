import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { X, Download, Share2 } from 'lucide-react';

export const MediaLightbox: React.FC = () => {
  const { isLightboxOpen, lightboxUrl, closeLightbox } = useSocial();

  if (!isLightboxOpen || !lightboxUrl) return null;

  return (
    <div
      onClick={closeLightbox}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <a
          href={lightboxUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          onClick={(e) => e.stopPropagation()}
          className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          title="Open original"
        >
          <Download className="w-5 h-5" />
        </a>
        <button
          onClick={closeLightbox}
          className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-4xl max-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        <img
          src={lightboxUrl}
          alt="Expanded media"
          className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
};
