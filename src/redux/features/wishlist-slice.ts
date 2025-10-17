import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getWishlistFromCookie, saveWishlistToCookie } from "@/lib/cookieSync";

type InitialState = {
  items: WishListItem[];
};

type WishListItem = {
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

// Initialize from cookie if available
const initialState: InitialState = {
  items: typeof window !== 'undefined' ? getWishlistFromCookie() : [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { id, title, price, quantity, imgs, discountedPrice, status } =
        action.payload;
      // Check if item already exists using both string and number comparison
      const existingItem = state.items.find((item) => String(item.id) === String(id) || item.id === id);

      // Only add if it doesn't exist - wishlist should only have one of each item
      if (!existingItem) {
        state.items.push({
          id,
          title,
          price,
          quantity,
          imgs,
          discountedPrice,
          status,
        });
      }

      // Save to cookie
      saveWishlistToCookie(state.items);
    },
    removeItemFromWishlist: (state, action: PayloadAction<number | string>) => {
      const itemId = action.payload;
      // Handle both string UUID and number comparison
      state.items = state.items.filter((item) => {
        // Compare as strings to handle UUID
        return String(item.id) !== String(itemId) && item.id !== itemId;
      });

      // Save to cookie
      saveWishlistToCookie(state.items);
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];

      // Save to cookie
      saveWishlistToCookie(state.items);
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;
export default wishlist.reducer;
