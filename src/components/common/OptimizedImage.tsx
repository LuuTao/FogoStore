'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
  className = '',
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        {...rest}
        src={imgSrc || fallbackSrc}
        alt={alt || 'Product Image'}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setIsLoading(false);
        }}
        className={`transition-all duration-300 ${isLoading ? 'scale-105 blur-xs opacity-70' : 'scale-100 blur-0 opacity-100'} ${className}`}
      />
    </div>
  );
};

export default OptimizedImage;