import React, { useState, useEffect } from "react";
import {
  ShoppingCart, Trash2, Plus, Minus, Search, Package,
  Loader2, CheckCircle, AlertTriangle, X, ShoppingBag, CreditCard,
  Clock, ClipboardList, List, ChevronRight, Hash, User as UserIcon
} from "lucide-react";
import { GET_PRODUCTS, GET_CATEGORIES, callApi, GET_IMG, GET_ORDERS } from "../config/apiService";

// ─── API Checkout ─────────────────────────────────────────────────────────────
function CHECKOUT(payload) {
  return callApi("Order/checkout", "POST", payload);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
      {message}
    </div>
  );
}

// ─── Checkout Modal ───────────────────────────────────────────────────────────
function CheckoutModal({ cartItems, products, onClose, onSuccess }) {
  const [customerId, setCustomerId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState(1);
  const [voucherCode, setVoucherCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = cartItems.reduce((sum, item) => {
    const p = products.find((x) => (x.productId || x.ProductId) === item.productId);
    return sum + (p?.price || p?.Price || 0) * item.quantity;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await CHECKOUT({
        customerId: customerId ? Number(customerId) : null,
        paymentMethodId: Number(paymentMethodId),
        voucherCode: voucherCode.trim() || null,
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      onSuccess("Đặt hàng thành công!");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi khi đặt hàng";
      onSuccess(null, `Lỗi: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/40 backdrop-blur-sm py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Xác nhận đơn hàng</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Order summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tóm tắt đơn hàng</p>
            {cartItems.map((item) => {
              const p = products.find((x) => (x.productId || x.ProductId) === item.productId);
              return (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate max-w-[220px]">
                    {p?.name || p?.Name || p?.productName || p?.ProductName || `SP #${item.productId}`} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900 ml-2">
                    {((p?.price || p?.Price || 0) * item.quantity).toLocaleString("vi-VN")}₫
                  </span>
                </div>
              );
            })}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900">
              <span>Tổng cộng</span>
              <span className="text-blue-600">{total.toLocaleString("vi-VN")}₫</span>
            </div>
          </div>

          {/* Customer ID */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">ID Khách hàng (tùy chọn)</label>
            <input type="number" min="1" value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Để trống nếu khách vãng lai" />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phương thức thanh toán <span className="text-red-500">*</span></label>
            <select value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value={1}>Tiền mặt (COD)</option>
              <option value={2}>Chuyển khoản</option>
              <option value={3}>Thẻ tín dụng</option>
              <option value={4}>Ví điện tử</option>
            </select>
          </div>

          {/* Voucher */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mã giảm giá (tùy chọn)</label>
            <input type="text" value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mã voucher..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Hủy
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Product Picker Modal ─────────────────────────────────────────────────────
function ProductPicker({ products, categories, cartProductIds, onAdd, onClose }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const filtered = products.filter((p) => {
    const name = (p.name || p.productName || "").toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchCat = catFilter ? String(p.categoryId) === String(catFilter) : true;
    return matchSearch && matchCat;
  });

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center bg-black/40 backdrop-blur-sm py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Chọn sản phẩm</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Tìm sản phẩm..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full sm:w-48">
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
          </select>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-gray-500 text-sm">Không tìm thấy sản phẩm</p>
          ) : (
            filtered.map((p) => {
              const inCart = cartProductIds.includes(p.productId);
              const isAvailable = (p.stock ?? p.quantity ?? 0) > 0;
              return (
                <div key={p.productId}
                  className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors ${!isAvailable ? "opacity-50" : ""}`}>
                  <div className="w-12 h-12 rounded-lg border border-gray-100 bg-gray-50 flex-shrink-0 overflow-hidden">
                    {p.imageUrl || p.image ? (
                      <img src={p.imageUrl || p.image} alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://placehold.co/48x48?text=?"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name || p.productName}</p>
                    <p className="text-xs text-gray-400">{(p.price || 0).toLocaleString("vi-VN")}₫ · Còn {p.stock ?? p.quantity ?? 0} sp</p>
                  </div>
                  <button
                    onClick={() => isAvailable && onAdd(p)}
                    disabled={inCart || !isAvailable}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      inCart ? "bg-green-100 text-green-700 cursor-default" :
                      isAvailable ? "bg-blue-600 text-white hover:bg-blue-700" :
                      "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}>
                    {inCart ? "✓ Đã thêm" : isAvailable ? "Thêm" : "Hết hàng"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Orders / Cart Page ───────────────────────────────────────────────────────
export default function Orders() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState([]); // [{ productId, quantity }]
  const [showPicker, setShowPicker] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [view, setView] = useState("list"); // "list" or "create"
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await GET_ORDERS();
      // Handle array or paginated response
      setOrders(Array.isArray(data) ? data : (data.content || data.orders || data.Orders || []));
    } catch (e) {
      console.error(e);
      showToast("Không thể tải danh sách đơn hàng", "error");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const data = await callApi(`Order/${orderId}`, "GET");
      setSelectedOrder(data);
      setShowDetailModal(true);
    } catch (e) {
      console.error(e);
      showToast("Không thể tải chi tiết đơn hàng", "error");
    }
  };

  useEffect(() => {
    if (view === "list") {
      fetchOrders();
    }
  }, [view]);

  useEffect(() => {
    const loadAll = async () => {
      setLoadingProducts(true);
      try {
        const [prodData, catData] = await Promise.all([
          GET_PRODUCTS(0, 200),
          GET_CATEGORIES(0, 200),
        ]);
        setProducts(Array.isArray(prodData) ? prodData : (prodData.content || prodData.data || prodData.products || prodData.Products || []));
        setCategories(Array.isArray(catData) ? catData : (catData.content || catData.data || catData.categories || catData.Categories || []));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadAll();
  }, []);

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.productId === (product.productId || product.ProductId));
      if (exists) return prev.map((i) => i.productId === (product.productId || product.ProductId) ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.productId || product.ProductId, quantity: 1 }];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) { removeFromCart(productId); return; }
    const p = products.find((x) => x.productId === productId);
    const maxStock = p?.stock ?? p?.quantity ?? 9999;
    setCart((prev) => prev.map((i) =>
      i.productId === productId ? { ...i, quantity: Math.min(qty, maxStock) } : i
    ));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => {
    const p = products.find((x) => (x.productId || x.ProductId) === item.productId);
    return sum + (p?.price || p?.Price || 0) * item.quantity;
  }, 0);

  const handleCheckoutSuccess = (successMsg, errorMsg) => {
    setShowCheckout(false);
    if (successMsg) {
      showToast(successMsg, "success");
      clearCart();
      setView("list"); // Switch back to list after successful order
    } else if (errorMsg) {
      showToast(errorMsg, "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {view === "list" ? "Quản lý đơn hàng" : "Tạo đơn hàng mới"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {view === "list" 
              ? "Xem lại lịch sử các đơn hàng đã thanh toán và đang xử lý." 
              : "Chọn sản phẩm và xác nhận đơn hàng cho khách."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {view === "list" ? (
            <button 
              onClick={() => setView("create")}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" /> Tạo đơn hàng
            </button>
          ) : (
            <button 
              onClick={() => setView("list")}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <List className="h-5 w-5 mr-2" /> Danh sách đơn
            </button>
          )}
        </div>
      </div>

      {view === "list" ? (
        /* Order History View */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã đơn</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loadingOrders ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-2" />
                      Đang tải danh sách đơn hàng...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      Chưa có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-bold text-gray-900">#{order.orderId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                            <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-700">{order.customer?.customerName || "Khách lẻ"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === "Pending" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                        }`}>
                          {order.status === "Pending" ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-600">
                          {(order.bill?.total || 0).toLocaleString("vi-VN")}₫
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => fetchOrderDetail(order.orderId)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 ml-auto"
                        >
                          Chi tiết <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Create Order View (POS Interface) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items list */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold text-gray-800">Giỏ hàng</h2>
              {cart.length > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                  {cart.length}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
              </button>
            )}
          </div>

          {loadingProducts ? (
            <div className="py-16 text-center text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-2" />
              Đang tải sản phẩm...
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center text-gray-400 gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Giỏ hàng trống</p>
                <p className="text-xs text-gray-400 mt-1">Nhấn "Thêm sản phẩm" để bắt đầu</p>
              </div>
              <button onClick={() => setShowPicker(true)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                + Thêm sản phẩm
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {cart.map((item) => {
                const p = products.find((x) => (x.productId || x.ProductId) === item.productId);
                if (!p) return null;
                const subtotal = (p.price || p.Price || 0) * item.quantity;
                return (
                  <li key={item.productId} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 group">
                    {/* Image */}
                    <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 shrink-0 overflow-hidden">
                      {p.imageUrl || p.image ? (
                        <img src={p.imageUrl || p.image} alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "https://placehold.co/56x56?text=?"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name || p.productName}</p>
                      <p className="text-xs text-gray-400">{(p.price || 0).toLocaleString("vi-VN")}₫ / sp</p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                      <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-l-lg transition-colors text-gray-600">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input type="number" min="1"
                        value={item.quantity}
                        onChange={(e) => updateQty(item.productId, parseInt(e.target.value) || 1)}
                        className="w-12 text-center text-sm font-medium border-x border-gray-200 py-1 focus:outline-none" />
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-r-lg transition-colors text-gray-600">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="w-24 text-right">
                      <p className="text-sm font-semibold text-gray-900">{subtotal.toLocaleString("vi-VN")}₫</p>
                    </div>

                    {/* Remove */}
                    <button onClick={() => removeFromCart(item.productId)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Số sản phẩm</span>
                <span className="font-medium">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tạm tính</span>
                <span className="font-medium">{cartTotal.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{cartTotal.toLocaleString("vi-VN")}₫</span>
              </div>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setShowCheckout(true)}
              className="mt-5 w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              Thanh toán
            </button>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2">💡 Hướng dẫn</p>
            <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
              <li>Nhấn "+ Thêm sản phẩm" để chọn từ kho</li>
              <li>Điều chỉnh số lượng bằng nút +/−</li>
              <li>Nhấn "Thanh toán" để tạo đơn hàng</li>
            </ul>
          </div>
        </div>
      </div>
      )}

      {/* Modals */}
      {showPicker && (
        <ProductPicker
          products={products}
          categories={categories}
          cartProductIds={cart.map((i) => i.productId)}
          onAdd={(p) => { addToCart(p); setShowPicker(false); showToast(`Đã thêm "${p.name || p.productName}" vào giỏ hàng`); }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          cartItems={cart}
          products={products}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {showDetailModal && selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => { setShowDetailModal(false); setSelectedOrder(null); }} 
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── Order Detail Modal ────────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/40 backdrop-blur-sm py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Chi tiết đơn hàng #{order.orderId}</h2>
              <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleString("vi-VN")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin khách hàng</p>
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <p className="text-sm font-bold text-gray-900">{order.customer?.customerName || "Khách lẻ"}</p>
                <p className="text-xs text-gray-500">{order.customer?.phone || "Không có số điện thoại"}</p>
                <p className="text-xs text-gray-500">{order.customer?.address || "Không có địa chỉ"}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái & Thanh toán</p>
              <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Trạng thái:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    order.status === "Pending" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Phương thức:</span>
                  <span className="font-semibold text-gray-700">{order.bill?.paymentMethod?.name || "Tiền mặt"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm đã mua</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Sản phẩm</th>
                    <th className="px-4 py-2 text-center text-[10px] font-bold text-gray-500 uppercase">SL</th>
                    <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Giá</th>
                    <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Tổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.orderDetails?.map((detail) => (
                    <tr key={detail.orderDetailId} className="text-sm">
                      <td className="px-4 py-3 font-medium text-gray-900">{detail.product?.name || `SP #${detail.productId}`}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{detail.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{detail.unitPrice.toLocaleString("vi-VN")}₫</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{(detail.unitPrice * detail.quantity).toLocaleString("vi-VN")}₫</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tạm tính:</span>
                <span className="font-medium">{(order.bill?.subtotal || 0).toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Giảm giá:</span>
                <span className="font-medium text-red-500">-{(order.bill?.discount || 0).toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">VAT (10%):</span>
                <span className="font-medium">{(order.bill?.vat || 0).toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-lg font-black text-gray-900">
                <span>Tổng tiền:</span>
                <span className="text-blue-600">{(order.bill?.total || 0).toLocaleString("vi-VN")}₫</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
