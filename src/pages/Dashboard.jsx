import React, { useState, useEffect } from "react";
import { Users, ShoppingBag, FolderTree, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { GET_DASHBOARD_STATS } from "../config/apiService";

export default function Dashboard() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await GET_DASHBOARD_STATS();
        setStatsData(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { 
      name: "Doanh thu tổng", 
      value: (statsData?.totalRevenue ?? statsData?.TotalRevenue) ? `${(statsData.totalRevenue ?? statsData.TotalRevenue).toLocaleString("vi-VN")}₫` : "0₫", 
      icon: DollarSign, 
      color: "bg-indigo-500", 
      trend: "+10.3%" 
    },
    { 
      name: "Sản phẩm đang bán", 
      value: statsData?.activeProducts ?? statsData?.ActiveProducts ?? "0", 
      icon: ShoppingBag, 
      color: "bg-blue-500", 
      trend: "+12.5%" 
    },
    { 
      name: "Đơn hàng đang chờ", 
      value: statsData?.pendingOrders ?? statsData?.PendingOrders ?? "0", 
      icon: TrendingUp, 
      color: "bg-teal-500", 
      trend: "+5.1%" 
    },
    { 
      name: "Tổng danh mục", 
      value: "45", // Mock hoặc lấy thêm từ API khác nếu cần
      icon: FolderTree, 
      color: "bg-purple-500", 
      trend: "+3.2%" 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">Chào mừng quay trở lại. Đây là tình hình kinh doanh hôm nay.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl text-white ${stat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-emerald-500 font-medium">{stat.trend}</span>
              <span className="text-gray-400 ml-2">so với tháng trước</span>
            </div>
            
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${stat.color} opacity-5 group-hover:scale-150 transition-transform duration-700 pointer-events-none`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="flex items-center justify-center h-[300px] text-gray-400 italic">
            Dữ liệu biểu đồ đang được xử lý...
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm bán chạy nhất</h2>
          <div className="flex items-center justify-center h-[300px] text-gray-400 italic">
            Danh sách đang cập nhật...
          </div>
        </div>
      </div>
    </div>
  );
}
