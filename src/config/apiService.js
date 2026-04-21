import axios from "axios";

const API_URL = "https://studentshop.onrender.com/api";

// ===== Token & Email (localStorage) =====
export function getToken() {
  return localStorage.getItem("admin-jwt-token");
}

export function setToken(token) {
  localStorage.setItem("admin-jwt-token", token);
}

export function removeToken() {
  localStorage.removeItem("admin-jwt-token");
}

export function getUserEmail() {
  return localStorage.getItem("admin-email");
}

export function setUserEmail(email) {
  localStorage.setItem("admin-email", email);
}

export function removeEmail() {
  localStorage.removeItem("admin-email");
}

export function setUserData(user) {
  localStorage.setItem("admin-user", JSON.stringify(user));
}

export function getUserData() {
  const user = localStorage.getItem("admin-user");
  return user ? JSON.parse(user) : null;
}

export function removeUserData() {
  localStorage.removeItem("admin-user");
}

// ===== Axios instance =====
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Auto attach token
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== callApi =====
export async function callApi(endpoint, method = "GET", data = null, params = null) {
  try {
    const res = await axiosInstance({
      method,
      url: endpoint.startsWith("/") ? endpoint : `/${endpoint}`,
      data,
      params,
    });
    return res.data;
  } catch (error) {
    console.error("API call error:", error?.response || error);
    throw error;
  }
}

// ===== Products =====
export function GET_PRODUCTS(pageNumber = 0, pageSize = 100, sortBy = "productId", sortOrder = "desc") {
  return callApi("Product", "GET", null, { pageNumber, pageSize, sortBy, sortOrder });
}

export function GET_PRODUCT_BY_ID(productId) {
  return callApi(`Product/${productId}`, "GET");
}

export function CREATE_PRODUCT(data) {
  return callApi(`Product`, "POST", data);
}

export function UPDATE_PRODUCT(productId, data) {
  return callApi(`Product/${productId}`, "PUT", data);
}

export function DELETE_PRODUCT(productId) {
  return callApi(`Product/${productId}`, "DELETE");
}

// ===== Categories =====
export function GET_CATEGORIES() {
  return callApi("Categories", "GET");
}

export function GET_CATEGORY_BY_ID(categoryId) {
  return callApi(`Categories/${categoryId}`, "GET");
}

export function CREATE_CATEGORY(data) {
  return callApi(`Categories`, "POST", data);
}

export function UPDATE_CATEGORY(categoryId, data) {
  return callApi(`Categories/${categoryId}`, "PUT", data);
}

export function DELETE_CATEGORY(categoryId) {
  return callApi(`Categories/${categoryId}`, "DELETE");
}

// ===== Brands =====
export function GET_BRANDS() {
  return callApi("Brands", "GET");
}

export function GET_BRAND_BY_ID(brandId) {
  return callApi(`Brands/${brandId}`, "GET");
}

export function CREATE_BRAND(data) {
  return callApi("Brands", "POST", data);
}

export function UPDATE_BRAND(brandId, data) {
  return callApi(`Brands/${brandId}`, "PUT", data);
}

export function DELETE_BRAND(brandId) {
  return callApi(`Brands/${brandId}`, "DELETE");
}

// ===== Orders =====
export function GET_ORDERS(pageNumber = 0, pageSize = 100) {
  return callApi("Order", "GET", null, { pageNumber, pageSize });
}

export function GET_ORDER_BY_ID(orderId) {
  return callApi(`Order/${orderId}`, "GET");
}

export function POST_CHECKOUT(payload) {
  return callApi("Order/checkout", "POST", payload);
}

// ===== Users =====
export function GET_ALL_USERS() {
  return callApi("Auth/users", "GET");
}

export function GET_USER_PROFILE() {
  return callApi("Auth/profile", "GET");
}

// ===== Login =====
export async function POST_LOGIN(email, password) {
  const data = await callApi("auth/login", "POST", { username: email, password });
  const token = data?.token || data?.Token;
  const user = data?.user || data?.User;

  if (!token) throw new Error("Không nhận được token");

  setToken(token);
  if (user) {
    setUserData(user);
    setUserEmail(user.email);
  } else {
    setUserEmail(email);
  }

  return data;
}

export function LOGOUT() {
  removeToken();
  removeEmail();
  removeUserData();
}

export function GET_IMG(endpoint, imgName) {
  return `${API_URL}/public/${endpoint}/${imgName}`;
}

// ===== Dashboard & Stats =====
export async function GET_DASHBOARD_STATS() {
  // Gọi trực tiếp endpoint dashboard ở Backend
  return callApi("Report/dashboard", "GET");
}

// ===== Cart =====
export function GET_CART_ITEMS(userId) {
  return callApi(`Cart/${userId}`, "GET");
}

export function GET_ALL_CARTS() {
  return callApi("Cart/all", "GET");
}

export function ADD_TO_CART(userId, productId, quantity = 1) {
  return callApi("Cart", "POST", { userId, productId, quantity });
}

export function UPDATE_CART_ITEM_QUANTITY(cartItemId, quantity) {
  return callApi(`Cart/${cartItemId}`, "PUT", quantity);
}

export function DELETE_CART_ITEM(cartItemId) {
  return callApi(`Cart/${cartItemId}`, "DELETE");
}

export function CLEAR_CART(userId) {
  return callApi(`Cart/user/${userId}`, "DELETE");
}
