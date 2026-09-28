'use client';

import React from 'react';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProductCardImagesProvider } from '@/components/common/ProductCardExtras';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductCardImagesProvider>{children}</ProductCardImagesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
