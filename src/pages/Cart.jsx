import React, { useState, useEffect } from "react";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowLeft, 
  Info,
  CreditCard,
  Loader2,
  RefreshCw,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  GET_ALL_CARTS, 
  UPDATE_CART_ITEM_QUANTITY, 
  DELETE_CART_ITEM, 
  CLEAR_CART,
  GET_IMG 
} from "../config/apiService";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { user: currentUser } = useAuth();
  const [cartGroups, setCartGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const data = await GET_ALL_CARTS();
      const grouped = data.reduce((acc, item) => {
        const uId = item.userId;
        if (!acc[uId]) {
          acc[uId] = {
            userId: uId,
            user: item.user,
            items: [],
            total: 0
          };
        }
        acc[uId].items.push(item);
        acc[uId].total += (item.product?.price || 0) * item.quantity;
        return acc;
      }, {});
      setCartGroups(Object.values(grouped));
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng tổng hợp:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setUpdatingId(cartItemId);
      await UPDATE_CART_ITEM_QUANTITY(cartItemId, newQuantity);
      
      const updatedItems = cartItems.map(item => 
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      alert("Không thể cập nhật số lượng. Có thể do vượt quá tồn kho.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) return;
    try {
      setUpdatingId(cartItemId);
      await DELETE_CART_ITEM(cartItemId);
      const updatedItems = cartItems.filter(item => item.cartItemId !== cartItemId);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) return;
    try {
      setLoading(true);
      await CLEAR_CART(user.userId || user.UserId);
      setCartItems([]);
      setTotal(0);
    } catch (error) {
      console.error("Lỗi khi xóa giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Đang tải giỏ hàng của bạn...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý giỏ hàng</h1>
          <p className="text-gray-500 mt-1">Theo dõi các sản phẩm đang nằm trong giỏ của tất cả khách hàng</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCartItems}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {cartGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Không có giỏ hàng nào</h2>
          <p className="text-gray-500 mt-2 max-w-xs text-center text-sm">
            Hiện tại chưa có khách hàng nào thêm sản phẩm vào giỏ hàng.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {cartGroups.map((group) => (
            <div key={group.userId} className="space-y-4">
              {/* User Header */}
              <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                    {group.user?.fullName?.slice(0, 1) || group.user?.username?.slice(0, 1) || "?"}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{group.user?.fullName || group.user?.username || "Ẩn danh"}</h2>
                    <p className="text-xs text-gray-400 font-medium">Email: {group.user?.email || "N/A"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tổng giá trị giỏ</p>
                  <p className="text-xl font-black text-blue-600">{formatCurrency(group.total)}</p>
                </div>
              </div>

              {/* Items Table for this user */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sản phẩm</th>
                        <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đơn giá</th>
                        <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số lượng</th>
                        <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thành tiền</th>
                        <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {group.items.map((item) => (
                        <tr key={item.cartItemId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-10 h-10 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                                {item.product?.imageUrl ? (
                                  <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-5 h-5 text-gray-300" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 leading-tight">{item.product?.name || "SP đã bị xóa"}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Mã: {item.product?.productCode || "N/A"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">
                            {formatCurrency(item.product?.price || 0)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
                                disabled={item.quantity <= 1 || updatingId === item.cartItemId}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-bold text-gray-900 text-sm whitespace-nowrap">
                                {updatingId === item.cartItemId ? "..." : item.quantity}
                              </span>
                              <button 
                                onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
                                disabled={updatingId === item.cartItemId}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                            {formatCurrency((item.product?.price || 0) * item.quantity)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleRemoveItem(item.cartItemId)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
