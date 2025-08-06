// utils/tokenUtils.js

// Generate a random token
export const generateToken = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
  let token = "";
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Save token to localStorage
export const saveTokens = (tokens) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("restaurantTokens", JSON.stringify(tokens));
  }
};

// Get tokens from localStorage
export const getTokens = () => {
  if (typeof window !== "undefined") {
    const tokens = localStorage.getItem("restaurantTokens");
    return tokens ? JSON.parse(tokens) : {};
  }
  return {};
};

// Save orders to localStorage
export const saveOrders = (orders) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("restaurantOrders", JSON.stringify(orders));
  }
};

// Get orders from localStorage
export const getOrders = () => {
  if (typeof window !== "undefined") {
    const orders = localStorage.getItem("restaurantOrders");
    return orders ? JSON.parse(orders) : {};
  }
  return {};
};

// Create a new token session
export const createTokenSession = (tokenId, description = "") => {
  const tokens = getTokens();
  tokens[tokenId] = {
    id: tokenId,
    description,
    createdAt: new Date().toISOString(),
    isActive: true,
    totalOrders: 0,
  };
  saveTokens(tokens);
  return tokens[tokenId];
};

// Add order to token
export const addOrderToToken = (tokenId, userName, orderData) => {
  const orders = getOrders();

  if (!orders[tokenId]) {
    orders[tokenId] = [];
  }

  const newOrder = {
    id: Date.now().toString(),
    userName,
    items: orderData.items,
    total: orderData.total,
    timestamp: new Date().toISOString(),
  };

  orders[tokenId].push(newOrder);
  saveOrders(orders);

  // Update token info
  const tokens = getTokens();
  if (tokens[tokenId]) {
    tokens[tokenId].totalOrders = orders[tokenId].length;
    saveTokens(tokens);
  }

  return newOrder;
};

// Get orders for a token
export const getOrdersForToken = (tokenId) => {
  const orders = getOrders();
  return orders[tokenId] || [];
};

// Calculate total for token
export const calculateTokenTotal = (tokenId) => {
  const orders = getOrdersForToken(tokenId);
  return orders.reduce((total, order) => total + order.total, 0);
};

// Get individual user totals for a token
export const getUserTotalsForToken = (tokenId) => {
  const orders = getOrdersForToken(tokenId);
  const userTotals = {};

  orders.forEach((order) => {
    if (!userTotals[order.userName]) {
      userTotals[order.userName] = {
        total: 0,
        orders: [],
      };
    }
    userTotals[order.userName].total += order.total;
    userTotals[order.userName].orders.push(order);
  });

  return userTotals;
};

// Deactivate token
export const deactivateToken = (tokenId) => {
  const tokens = getTokens();
  if (tokens[tokenId]) {
    tokens[tokenId].isActive = false;
    tokens[tokenId].closedAt = new Date().toISOString();
    saveTokens(tokens);
  }
};
