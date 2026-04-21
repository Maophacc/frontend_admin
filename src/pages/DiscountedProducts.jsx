import React, { useState, useEffect } from "react";
import {
  Search, Package, Loader2, Tag, Percent, ArrowRight, ShoppingCart
} from "lucide-react";
import { GET_PRODUCTS, GET_CATEGORIES, GET_BRANDS } from "../config/apiService";

export default function DiscountedProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodData, catData, brandData] = await Promise.all([
        GET_PRODUCTS(0, 1000), // Get all products to filter on frontend for simplicity
        GET_CATEGORIES(0, 200),
        GET_BRANDS(),
      ]);
      
      const allProds = Array.isArray(prodData) ? prodData : (prodData.content || prodData.data || prodData.products || prodData.Products || []);
      // Filter for "Sale" products or just simulate some if none exist yet
      const saleProds = allProds.filter(p => p.status === "Sale");
      
      // If no products are marked as Sale yet, show some simulated ones for the user to see the design
      if (saleProds.length === 0 && allProds.length > 0) {
        setProducts(allProds.slice(0, 5).map(p => ({ ...p, status: "Sale", simulated: true })));
      } else {
        setProducts(saleProds);
      }

      setCategories(Array.isArray(catData) ? catData : (catData.content || catData.data || catData.categories || catData.Categories || []));
      setBrands(Array.isArray(brandData) ? brandData : (brandData.content || brandData.data || brandData.brands || brandData.Brands || []));
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter(
    (p) => (p.name || p.Name || p.productName || p.ProductName)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (id) => categories.find((c) => c.categoryId === id)?.categoryName || "—";
  const getBrandName = (id) => brands.find((b) => b.brandId === id)?.brandName || "—";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-5 h-5 bg-white/20 p-1 rounded-full" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-100">Flash Sale - Đặc quyền Admin</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Sản phẩm Giảm giá</h1>
          <p className="text-red-100 mt-2 max-w-lg">Quản lý và theo dõi các mặt hàng đang chạy chương trình khuyến mãi. Tăng doanh số hiệu quả với các chiến dịch sale.</p>
        </div>
        <Tag className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm sản phẩm giảm giá..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white transition-all shadow-sm"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">
              Tổng cộng: <span className="text-red-600 font-bold">{filteredProducts.length}</span> sản phẩm
            </span>
          </div>
        </div>

        {/* Grid View for Sales */}
        <div className="p-6">
          {loading ? (
            <div className="py-24 text-center text-gray-400">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-red-500 mb-4" />
              <p className="font-medium">Đang tải danh sách khuyến mãi...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                <Tag className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Chưa có sản phẩm nào được đánh dấu giảm giá.</p>
              <p className="text-sm text-gray-400 mt-1">Hãy chuyển trạng thái sản phẩm sang "Sale" để hiển thị tại đây.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                // Simulate an original price being 20-40% higher
                const originalPrice = Math.round((product.price || 0) * 1.3 / 1000) * 1000;
                const discountPercent = 23;

                return (
                  <div key={product.productId || product.ProductId} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                    {/* Image Area */}
                    <div className="relative h-48 bg-gray-50 overflow-hidden">
                      {product.imageUrl || product.image ? (
                        <img className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          src={product.imageUrl || product.image}
                          alt={product.name} />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-200" />
                        </div>
                      )}
                      
                      {/* Badge */}
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-tighter">
                        -{discountPercent}% OFF
                      </div>
                      
                      {product.simulated && (
                        <div className="absolute top-3 right-3 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                          Mẫu Demo
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {getCategoryName(product.categoryId)}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-3 h-10">
                        {product.name || product.productName}
                      </h3>
                      
                      <div className="mt-auto pt-3 border-t border-gray-50">
                        <div className="flex items-end gap-2">
                          <span className="text-lg font-black text-red-600">
                            {(product.price || 0).toLocaleString("vi-VN")}₫
                          </span>
                          <span className="text-xs text-gray-400 line-through mb-1">
                            {originalPrice.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-[10px] font-medium text-gray-500">
                             Kho: <span className={(product.stock ?? product.Stock ?? 0) > 10 ? "text-green-600" : "text-orange-500"}>{product.stock ?? product.Stock ?? 0}</span>
                          </div>
                          <button className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
