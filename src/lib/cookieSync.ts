import Cookies from "js-cookie";

export type CartItem = {
  id: number | string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

export type WishlistItem = {
  id: number | string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

const CART_COOKIE_NAME = "guest_cart";
const WISHLIST_COOKIE_NAME = "guest_wishlist";
const COOKIE_EXPIRY_DAYS = 30;

// Cart Cookie Functions
export const getCartFromCookie = (): CartItem[] => {
  try {
    const cartCookie = Cookies.get(CART_COOKIE_NAME);
    return cartCookie ? JSON.parse(cartCookie) : [];
  } catch (error) {
    console.error("Error parsing cart cookie:", error);
    return [];
  }
};

export const saveCartToCookie = (items: CartItem[]): void => {
  try {
    Cookies.set(CART_COOKIE_NAME, JSON.stringify(items), {
      expires: COOKIE_EXPIRY_DAYS,
    });
  } catch (error) {
    console.error("Error saving cart to cookie:", error);
  }
};

export const clearCartCookie = (): void => {
  Cookies.remove(CART_COOKIE_NAME);
};

// Wishlist Cookie Functions
export const getWishlistFromCookie = (): WishlistItem[] => {
  try {
    const wishlistCookie = Cookies.get(WISHLIST_COOKIE_NAME);
    return wishlistCookie ? JSON.parse(wishlistCookie) : [];
  } catch (error) {
    console.error("Error parsing wishlist cookie:", error);
    return [];
  }
};

export const saveWishlistToCookie = (items: WishlistItem[]): void => {
  try {
    Cookies.set(WISHLIST_COOKIE_NAME, JSON.stringify(items), {
      expires: COOKIE_EXPIRY_DAYS,
    });
  } catch (error) {
    console.error("Error saving wishlist to cookie:", error);
  }
};

export const clearWishlistCookie = (): void => {
  Cookies.remove(WISHLIST_COOKIE_NAME);
};
