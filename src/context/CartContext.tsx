'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string | number; // variantId
  name: string;
  price: number;
  originalPrice?: number;
  storage?: string;
  color?: string;
  imageUrl: string;
  quantity: number;
  modelSlug?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  addToCart: (item: CartItem) => Promise<void>;
  updateQuantity: (id: string | number, quantity: number) => Promise<void>;
  removeFromCart: (id: string | number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Helper lấy ID user đang đăng nhập (từ localStorage hoặc cookie auth của bạn)
  // Helper lấy chính xác ID của tài khoản đang đăng nhập
  const getActiveUserId = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      // Quét tất cả các key thường dùng khi đăng nhập
      const rawUser = 
        localStorage.getItem('fogo_user') || 
        localStorage.getItem('user') || 
        localStorage.getItem('currentUser') ||
        localStorage.getItem('auth');

      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        // Trả về id, _id, hoặc username/email tùy theo cấu trúc object lưu lúc login
        return parsed.id || parsed._id || parsed.userId || parsed.email || parsed.username || null;
      }
    } catch (e) {
      console.error('Lỗi parse user từ localStorage:', e);
    }
    return null;
  };

  // Nạp giỏ hàng từ Database của đúng tài khoản đó
  const fetchCartFromDB = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/cart/${userId}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: CartItem[] = json.data.map((item: any) => ({
          id: item.variantId || item.id,
          name: item.name,
          price: item.price,
          storage: item.storage,
          color: item.color,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
        }));
        setCartItems(mapped);
      } else {
        setCartItems([]);
      }
    } catch (e) {
      console.error('Lỗi khi fetch giỏ hàng:', e);
      setCartItems([]);
    }
  }, []);

  // Lắng nghe trạng thái đăng nhập / đăng xuất
  useEffect(() => {
    const checkAuthAndLoadCart = () => {
      const activeId = getActiveUserId();
      setCurrentUserId(activeId);

      if (activeId) {
        fetchCartFromDB(activeId);
      } else {
        // Nếu đã đăng xuất, xóa sạch state trên màn hình
        setCartItems([]);
      }
    };

    checkAuthAndLoadCart();

    // Lắng nghe sự kiện đăng nhập/đăng xuất giữa các tab
    window.addEventListener('storage', checkAuthAndLoadCart);
    return () => window.removeEventListener('storage', checkAuthAndLoadCart);
  }, [fetchCartFromDB]);

  // 1. THÊM VÀO GIỎ
  const addToCart = async (item: CartItem) => {
    const userId = currentUserId || getActiveUserId();

    // Cập nhật UI tạm thời ngay lập tức
    setCartItems((prev) => {
      const existing = prev.find((p) => String(p.id) === String(item.id));
      if (existing) {
        return prev.map((p) =>
          String(p.id) === String(item.id) ? { ...p, quantity: p.quantity + item.quantity } : p
        );
      }
      return [...prev, item];
    });

    // Nếu đã đăng nhập -> Lưu thẳng vào Database
    if (userId) {
      try {
        await fetch('http://localhost:5000/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            variantId: String(item.id),
            name: item.name,
            price: item.price,
            storage: item.storage || '',
            color: item.color || '',
            imageUrl: item.imageUrl || '',
            quantity: item.quantity,
          }),
        });
      } catch (err) {
        console.error('Lỗi sync DB giỏ hàng:', err);
      }
    }
  };

  // 2. CẬP NHẬT SỐ LƯỢNG
  const updateQuantity = async (id: string | number, quantity: number) => {
    const userId = currentUserId || getActiveUserId();

    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, quantity } : p))
    );

    if (userId) {
      try {
        await fetch('http://localhost:5000/api/cart/update-quantity', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, variantId: String(id), quantity }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 3. XÓA MÓN
  const removeFromCart = async (id: string | number) => {
    const userId = currentUserId || getActiveUserId();

    setCartItems((prev) => prev.filter((p) => String(p.id) !== String(id)));

    if (userId) {
      try {
        await fetch('http://localhost:5000/api/cart/remove', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, variantId: String(id) }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 4. XÓA TOÀN BỘ GIỎ
  const clearCart = async () => {
    const userId = currentUserId || getActiveUserId();
    setCartItems([]);

    if (userId) {
      try {
        await fetch(`http://localhost:5000/api/cart/clear/${userId}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const totalQuantity = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  const totalPrice = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalQuantity,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: () => (currentUserId ? fetchCartFromDB(currentUserId) : Promise.resolve()),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};