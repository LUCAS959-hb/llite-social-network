import React, { useState, useEffect } from 'react';
import { usePresence } from '../../context/PresenceContext';

export interface UserAvatarProps {
  src?: string;
  name?: string;
  userId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'Utilizador',
  userId,
  size = 'md',
  showBadge = true,
  className = '',
  onClick,
}) => {
  const { isUserOnline } = usePresence();
  const online = userId ? isUserOnline(userId) : false;
  const [imageError, setImageError] = useState(false);

  // Reset error when src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-28 h-28 sm:w-36 sm:h-36',
  };

  const silhouetteSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4.5 h-4.5',
    md: 'w-5.5 h-5.5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
    '2xl': 'w-16 h-16 sm:w-20 sm:h-20',
  };

  const badgeSizeClasses = {
    xs: 'w-2 h-2 ring-1',
    sm: 'w-2.5 h-2.5 ring-1.5',
    md: 'w-3 h-3 ring-2',
    lg: 'w-3.5 h-3.5 ring-2',
    xl: 'w-4 h-4 ring-2.5',
    '2xl': 'w-6 h-6 ring-3',
  };

  const hasValidSrc = Boolean(src && typeof src === 'string' && src.trim() !== '' && !imageError);

  return (
    <div
      onClick={onClick}
      className={`relative inline-block shrink-0 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      title={name ? `${name} • ${online ? 'Online' : 'Offline'}` : undefined}
    >
      {hasValidSrc ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-slate-100 bg-slate-100 transition-all`}
          onError={() => setImageError(true)}
        />
      ) : (
        /* Neutral generic silhouette SVG fallback - clean, neutral grey silhouette on soft grey background */
        <div
          className={`${sizeClasses[size]} rounded-full bg-slate-200 text-slate-400 ring-2 ring-slate-100 flex items-center justify-center overflow-hidden`}
          aria-label={name || 'Avatar padrão'}
        >
          <svg
            className={`${silhouetteSizes[size]} fill-current text-slate-400`}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Neutral generic silhouette head and torso */}
            <circle cx="12" cy="7.5" r="4" />
            <path d="M4 20c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5H4z" />
          </svg>
        </div>
      )}

      {/* Real-time Connection Status Indicator Badge */}
      {showBadge && userId && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white ${badgeSizeClasses[size]} ${
            online ? 'bg-emerald-500 ring-2' : 'bg-slate-400 ring-2'
          }`}
          aria-label={online ? 'Online' : 'Offline'}
        >
          {online && (
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          )}
        </span>
      )}
    </div>
  );
};
