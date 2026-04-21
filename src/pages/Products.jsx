import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus, Search, Edit2, Trash2, X, Loader2, Package,
  AlertTriangle, CheckCircle, Upload, ImagePlus
} from "lucide-react";
import {
  GET_PRODUCTS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  GET_CATEGORIES,
  GET_BRANDS,
} from "../config/apiService";

// ─── Convert local image file → base64 data URL (no external service needed) ──────
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Không thể đọc file"));
    reader.readAsDataURL(file);
  });
}
// ──────────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["Available", "OutOfStock", "Discontinued", "Sale"];

const EMPTY_FORM = {
  productCode: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  status: "Available",
  categoryId: "",
  brandId: "",
  imageUrl: "",
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
      {message}
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Xác nhận xóa</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Hủy</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Xóa</button>
        </div>
      </div>
    </div>
  );
}

// ─── Image Upload Zone ────────────────────────────────────────────────────────
function ImageUploadZone({ imageUrl, onImageUploaded }) {
  const inputRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [sizeInfo, setSizeInfo] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Chỉ chấp nhận file ảnh (JPG, PNG, WEBP...)");
      return;
    }
    // Giới hạn 2MB cho base64 (để tránh request quá lớn)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Ảnh không được vượt quá 2MB");
      return;
    }
    setUploadError("");
    setProcessing(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      const kb = (file.size / 1024).toFixed(1);
      setSizeInfo(`${file.name} · ${kb} KB`);
      onImageUploaded(dataUrl);
    } catch (e) {
      setUploadError(e.message || "Không thể đọc file ảnh");
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ảnh sản phẩm</label>

      {imageUrl ? (
        <div className="relative group">
          <img
            src={imageUrl}
            alt="product preview"
            className="w-full h-44 object-contain rounded-xl border border-gray-200 bg-gray-50"
          />
          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-100">
              Đổi ảnh
            </button>
            <button type="button" onClick={() => { onImageUploaded(""); setSizeInfo(""); }}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
              Xóa
            </button>
          </div>
          {sizeInfo && (
            <p className="mt-1.5 text-xs text-gray-400 text-center">{sizeInfo}</p>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? "border-blue-500 bg-blue-50 scale-[1.01]"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/40"
          } ${processing ? "pointer-events-none opacity-60" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {processing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-blue-600 font-medium">Đang xử lý ảnh...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shadow-inner">
                <ImagePlus className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Kéo &amp; thả ảnh vào đây</p>
                <p className="text-xs text-gray-400 mt-1">
                  hoặc{" "}
                  <span className="text-blue-600 font-semibold underline underline-offset-2">chọn file từ máy tính</span>
                </p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                JPG · PNG · WEBP · GIF · tối đa 2MB
              </span>
            </div>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])} />

      {uploadError && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" /> {uploadError}
        </p>
      )}
    </div>
  );
}

// ─── Product Modal ────────────────────────────────────────────────────────────
function ProductModal({ mode, product, categories, brands, onClose, onSaved }) {
  const nameRef = useRef();
  const codeRef = useRef();
  const descRef = useRef();
  const priceRef = useRef();
  const stockRef = useRef();

  const [form, setForm] = useState(
    mode === "edit" && product
      ? {
          status: product.status || "Available",
          categoryId: product.categoryId ?? "",
          brandId: product.brandId ?? "",
          imageUrl: product.imageUrl || product.image || "",
        }
      : {
          status: "Available",
          categoryId: "",
          brandId: "",
          imageUrl: "",
        }
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    const nameVal = nameRef.current?.value || "";
    const codeVal = codeRef.current?.value || "";
    const priceVal = priceRef.current?.value || "";
    const stockVal = stockRef.current?.value || "";

    if (!nameVal.trim()) e.name = "Tên sản phẩm không được để trống";
    if (!codeVal.trim()) e.productCode = "Mã sản phẩm không được để trống";
    if (priceVal === "" || isNaN(Number(priceVal)) || Number(priceVal) < 0) e.price = "Giá phải là số không âm";
    if (stockVal === "" || isNaN(Number(stockVal)) || Number(stockVal) < 0) e.stock = "Tồn kho phải là số không âm";
    if (!form.categoryId) e.categoryId = "Vui lòng chọn danh mục";
    if (!form.brandId) e.brandId = "Vui lòng chọn thương hiệu";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        productCode: codeRef.current?.value.trim() || "",
        name: nameRef.current?.value.trim() || "",
        description: descRef.current?.value.trim() || "",
        price: Number(priceRef.current?.value || 0),
        stock: Number(stockRef.current?.value || 0),
        status: form.status,
        categoryId: Number(form.categoryId),
        brandId: Number(form.brandId),
        imageUrl: form.imageUrl || null,
      };
      if (mode === "edit") {
        await UPDATE_PRODUCT(product.productId, { productId: product.productId, ...payload });
        onSaved("Cập nhật sản phẩm thành công!");
      } else {
        await CREATE_PRODUCT(payload);
        onSaved("Thêm sản phẩm thành công!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || "Có lỗi xảy ra";
      onSaved(null, `Lỗi: ${typeof msg === "string" ? msg : JSON.stringify(msg)}`);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, required, error, children }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  const inputCls = (err) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      err ? "border-red-400 bg-red-50" : "border-gray-200"
    }`;

  return (
    <div className="fixed inset-0 z-[9990] flex items-start justify-center bg-black/40 overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === "edit" ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - two-column layout */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              <Field label="Tên sản phẩm" name="name" required error={errors.name}>
                <textarea 
                  ref={nameRef}
                  name="name" 
                  defaultValue={mode === "edit" ? (product.name || product.productName || "") : ""} 
                  rows={2}
                  className={`${inputCls(errors.name)} resize-none`} 
                  placeholder="Nhập tên sản phẩm (hỗ trợ chuỗi ký tự dài)" 
                />
              </Field>

              <Field label="Mã sản phẩm" name="productCode" required error={errors.productCode}>
                <input 
                  ref={codeRef}
                  name="productCode" 
                  defaultValue={mode === "edit" ? (product.productCode || product.sku || "") : ""} 
                  className={inputCls(errors.productCode)} 
                  placeholder="VD: SP-001" 
                />
              </Field>

              <Field label="Mô tả" name="description">
                <textarea 
                  ref={descRef}
                  name="description" 
                  defaultValue={mode === "edit" ? (product.description || "") : ""} 
                  rows={3} 
                  placeholder="Nhập mô tả sản phẩm"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Giá (₫)" name="price" required error={errors.price}>
                  <input ref={priceRef} name="price" type="number" min="0"
                    defaultValue={mode === "edit" ? product.price : ""}
                    className={inputCls(errors.price)} placeholder="0" />
                </Field>
                <Field label="Tồn kho" name="stock" required error={errors.stock}>
                  <input ref={stockRef} name="stock" type="number" min="0"
                    defaultValue={mode === "edit" ? (product.stock ?? product.quantity) : ""}
                    className={inputCls(errors.stock)} placeholder="0" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Danh mục" name="categoryId" required error={errors.categoryId}>
                  <select name="categoryId" value={form.categoryId} onChange={handleChange}
                    className={`${inputCls(errors.categoryId)} bg-white`}>
                    <option value="">-- Chọn --</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Thương hiệu" name="brandId" required error={errors.brandId}>
                  <select name="brandId" value={form.brandId} onChange={handleChange}
                    className={`${inputCls(errors.brandId)} bg-white`}>
                    <option value="">-- Chọn --</option>
                    {brands.map((b) => (
                      <option key={b.brandId} value={b.brandId}>{b.brandName}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Trạng thái" name="status">
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            {/* RIGHT COLUMN - Image */}
            <div className="space-y-4">
              <ImageUploadZone
                imageUrl={form.imageUrl}
                onImageUploaded={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
              />

              {/* Show current imageUrl as text (read-only) */}
              {form.imageUrl && (
                <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">URL ảnh:</p>
                  <p className="text-xs text-gray-600 break-all truncate">{form.imageUrl}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Đang lưu..." : mode === "edit" ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Products Page ───────────────────────────────────────────────────────
export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  const fetchProducts = async (pageNum = 0) => {
    setLoading(true);
    try {
      const data = await GET_PRODUCTS(pageNum, PAGE_SIZE);
      // Handle both paginated and array response
      const items = Array.isArray(data) ? data : (data.content || data.data || data.products || data.Products || []);
      setProducts(items);
      setTotalPages(data.totalPages || data.TotalPages || 1);
    } catch (error) {
      console.error("Failed to load products", error);
      showToast("Không thể tải danh sách sản phẩm", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [catData, brandData] = await Promise.all([
        GET_CATEGORIES(0, 200),
        GET_BRANDS(),
      ]);
      setCategories(Array.isArray(catData) ? catData : (catData.content || []));
      setBrands(Array.isArray(brandData) ? brandData : (brandData.content || brandData || []));
    } catch (e) {
      console.error("Failed to load meta", e);
    }
  };

  useEffect(() => {
    fetchProducts(0);
    fetchMeta();
  }, []);

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleSaved = (successMsg, errorMsg) => {
    setModalMode(null);
    setSelectedProduct(null);
    if (successMsg) {
      showToast(successMsg, "success");
      fetchProducts(page);
    } else if (errorMsg) {
      showToast(errorMsg, "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await DELETE_PRODUCT(confirm.productId);
      showToast(`Đã xóa sản phẩm "${confirm.name}"`, "success");
      fetchProducts(page);
    } catch (err) {
      showToast("Xóa sản phẩm thất bại", "error");
    } finally {
      setConfirm(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) => (p.name || p.productName || "")?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const categoryName = (id) => categories.find((c) => c.categoryId === id)?.categoryName || "—";
  const brandName = (id) => brands.find((b) => b.brandId === id)?.brandName || "—";

  const statusBadge = (status) => {
    const map = {
      Available: "bg-green-100 text-green-800",
      OutOfStock: "bg-red-100 text-red-800",
      Discontinued: "bg-gray-100 text-gray-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your catalogue and inventory.</p>
        </div>
        <button id="btn-add-product" onClick={() => setModalMode("add")}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Plus className="h-5 w-5 mr-2" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input id="search-products" type="text" placeholder="Search products..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-colors"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tồn kho</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-2" />
                  Loading products...
                </td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No products found.
                </td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.productId || product.ProductId} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-11 w-11 rounded-lg border border-gray-100 shadow-sm overflow-hidden bg-gray-50">
                          {product.imageUrl || product.image ? (
                            <img className="h-full w-full object-cover"
                              src={product.imageUrl || product.image}
                              alt={product.name}
                              onError={(e) => { e.target.src = "https://placehold.co/44x44?text=?"; }} />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-[200px]">
                          <div className="text-sm font-semibold text-gray-900 truncate">{product.name || product.productName}</div>
                          <div className="text-xs text-gray-400 truncate">{brandName(product.brandId)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{product.productCode || product.sku}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{categoryName(product.categoryId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(product.price || 0).toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (product.stock ?? product.quantity) > 10 ? "bg-green-100 text-green-800" :
                        (product.stock ?? product.quantity) > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                        {product.stock ?? product.quantity ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(product.status)}`}>
                        {product.status || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button id={`btn-edit-product-${product.productId || product.ProductId}`}
                          onClick={() => { setSelectedProduct(product); setModalMode("edit"); }}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button id={`btn-delete-product-${product.productId || product.ProductId}`}
                          onClick={() => setConfirm({ productId: product.productId || product.ProductId, name: product.name || product.productName || product.Name || product.ProductName })}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-100 sm:px-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Trang <span className="font-medium">{page + 1}</span> / <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex space-x-2">
            <button disabled={page === 0}
              onClick={() => { const p = page - 1; setPage(p); fetchProducts(p); }}
              className="px-3 py-1 border border-gray-200 text-gray-600 rounded-md text-sm hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed">
              Previous
            </button>
            <button disabled={page >= totalPages - 1}
              onClick={() => { const p = page + 1; setPage(p); fetchProducts(p); }}
              className="px-3 py-1 border border-gray-200 text-gray-600 rounded-md text-sm hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(modalMode === "add" || modalMode === "edit") && (
        <ProductModal mode={modalMode} product={selectedProduct}
          categories={categories} brands={brands}
          onClose={() => { setModalMode(null); setSelectedProduct(null); }}
          onSaved={handleSaved} />
      )}
      {confirm && (
        <ConfirmDialog
          message={`Bạn có chắc muốn xóa sản phẩm "${confirm.name}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
