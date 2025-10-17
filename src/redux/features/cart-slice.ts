import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getCartFromCookie, saveCartToCookie } from "@/lib/cookieSync";

type InitialState = {
  items: CartItem[];
};

type CartItem = {
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

// Initialize from cookie if available
const initialState: InitialState = {
  items: typeof window !== 'undefined' ? getCartFromCookie() : [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, price, quantity, discountedPrice, imgs } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          title,
          price,
          quantity,
          discountedPrice,
          imgs,
        });
      }

      // Save to cookie
      saveCartToCookie(state.items);
    },
    removeItemFromCart: (state, action: PayloadAction<number | string>) => {
      const itemId = action.payload;
      // Handle both string UUID and number comparison
      state.items = state.items.filter((item) => {
        return String(item.id) !== String(itemId) && item.id !== itemId;
      });

      // Save to cookie
      saveCartToCookie(state.items);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: number | string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => String(item.id) === String(id) || item.id === id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }

      // Save to cookie
      saveCartToCookie(state.items);
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];

      // Save to cookie
      saveCartToCookie(state.items);
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    return total + item.discountedPrice * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;
export default cart.reducer;
