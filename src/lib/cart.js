// Simple cart using localStorage
const CART_KEY = 'ajkeyzzz-cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch { return []; }
}

function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export const cart = {
  getItems: getCart,
  addItem: (item) => {
    const items = getCart();
    // item: { beatId, beatTitle, beatSlug, tier, price, coverEmoji, coverColor }
    const existing = items.findIndex(i => i.beatId === item.beatId);
    if (existing >= 0) items[existing] = item;
    else items.push(item);
    setCart(items);
    return items;
  },
  removeItem: (beatId) => {
    const items = getCart().filter(i => i.beatId !== beatId);
    setCart(items);
    return items;
  },
  clear: () => { setCart([]); return []; },
  getTotal: () => getCart().reduce((sum, i) => sum + (i.price || 0), 0),
  getCount: () => getCart().length,
};
