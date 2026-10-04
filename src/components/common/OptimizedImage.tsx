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
  quality = 75,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw',
  priority = false,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {isLoading && <div className="absolute inset-0 animate-pulse bg-gray-100" aria-hidden="true" />}
      <Image
        {...rest}
        src={imgSrc || fallbackSrc}
        alt={alt || 'Product Image'}
        quality={quality}
        sizes={sizes}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setIsLoading(false);
        }}
        className={`transition-all duration-300 ${isLoading ? 'scale-105 opacity-0' : 'scale-100 opacity-100'} ${className}`}
      />
    </div>
  );
};

export default OptimizedImage;
