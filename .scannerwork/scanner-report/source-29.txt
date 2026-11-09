import { createSlice } from "@reduxjs/toolkit";

/**
 * Load initial cart items from localStorage if available.
 */
const loadInitialCart = () => {
  try {
    const saved = localStorage.getItem("cartItems");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to parse cartItems from localStorage:", error);
  }
  return [];
};

/**
 * Compute total quantity and total monetary amount for cart items.
 */
const calculateTotals = (items) => {
  const totalQuantity = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  const totalAmount = items.reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );
  return { totalQuantity, totalAmount };
};

const initialItems = loadInitialCart();
const { totalQuantity: initialQuantity, totalAmount: initialAmount } =
  calculateTotals(initialItems);

const initialState = {
  items: initialItems,
  totalQuantity: initialQuantity,
  totalAmount: initialAmount,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Add a book with a specified quantity into the cart.
     * Enforces strict validation against current book stock.
     */
    addToCart: (state, action) => {
      const { book, quantity = 1 } = action.payload;
      if (!book || !book.id) return;

      const requestedQty = Math.max(1, Number(quantity) || 1);
      const maxStock = Number(book.stock) || 0;

      // Cannot add if product has 0 stock
      if (maxStock <= 0) return;

      const existingItem = state.items.find(
        (item) => String(item.id) === String(book.id),
      );

      if (existingItem) {
        // Accumulate quantity up to available inventory limit
        const newQty = existingItem.quantity + requestedQty;
        existingItem.quantity = Math.min(newQty, maxStock);
      } else {
        // Add new item capped at available stock
        state.items.push({
          id: book.id,
          title: book.title,
          author: book.author || "",
          price: Number(book.price) || 0,
          originalPrice: book.originalPrice ? Number(book.originalPrice) : null,
          image: book.image || "",
          stock: maxStock,
          quantity: Math.min(requestedQty, maxStock),
        });
      }

      // Automatically recalculate totals
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;

      try {
        localStorage.setItem("cartItems", JSON.stringify(state.items));
      } catch (err) {
        console.error("Failed to save cartItems to localStorage:", err);
      }
    },

    /**
     * Update quantity of an item directly in the cart.
     */
    updateQuantity: (state, action) => {
      const { bookId, quantity } = action.payload;
      const item = state.items.find((i) => String(i.id) === String(bookId));
      if (item) {
        const parsedQty = Number(quantity) || 1;
        item.quantity = Math.max(1, Math.min(parsedQty, item.stock));

        const totals = calculateTotals(state.items);
        state.totalQuantity = totals.totalQuantity;
        state.totalAmount = totals.totalAmount;

        try {
          localStorage.setItem("cartItems", JSON.stringify(state.items));
        } catch (err) {
          console.error("Failed to save cartItems to localStorage:", err);
        }
      }
    },

    /**
     * Remove an item from the cart.
     */
    removeFromCart: (state, action) => {
      const bookId = action.payload;
      state.items = state.items.filter(
        (item) => String(item.id) !== String(bookId),
      );

      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;

      try {
        localStorage.setItem("cartItems", JSON.stringify(state.items));
      } catch (err) {
        console.error("Failed to save cartItems to localStorage:", err);
      }
    },

    /**
     * Clear all items from the cart.
     */
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      try {
        localStorage.removeItem("cartItems");
      } catch (err) {
        console.error("Failed to remove cartItems from localStorage:", err);
      }
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
