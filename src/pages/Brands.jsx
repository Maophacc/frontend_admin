import React, { useState, useEffect } from "react";
import {
  Plus, Search, Edit2, Trash2, X, Loader2, AlertTriangle, CheckCircle, Tag, Globe
} from "lucide-react";
import { GET_BRANDS, CREATE_BRAND, UPDATE_BRAND, DELETE_BRAND } from "../config/apiService";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
      {message}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Xác nhận xóa</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Xóa</button>
        </div>
      </div>
    </div>
  );
}

// ─── Brand Modal ──────────────────────────────────────────────────────────────
function BrandModal({ mode, brand, onClose, onSaved }) {
  const [form, setForm] = useState(
    mode === "edit" && brand
      ? { brandName: brand.brandName || "", origin: brand.origin || "" }
      : { brandName: "", origin: "" }
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.brandName.trim()) {
      setErrors({ brandName: "Tên thương hiệu không được để trống" });
      return;
    }
    setSaving(true);
    try {
      if (mode === "edit") {
        const payload = {
          brandId: brand.brandId,
          brandName: form.brandName.trim(),
          origin: form.origin.trim() || null,
        };
        await UPDATE_BRAND(brand.brandId, payload);
        // Trả về payload để cập nhật tại chỗ
        onSaved("Cập nhật thương hiệu thành công!", null, payload);
      } else {
        const payload = {
          brandName: form.brandName.trim(),
          origin: form.origin.trim() || null,
        };
        await CREATE_BRAND(payload);
        onSaved("Thêm thương hiệu thành công!");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
      onSaved(null, `Lỗi: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <Tag className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === "edit" ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Tên thương hiệu <span className="text-red-500">*</span>
            </label>
            <input
              id="input-brand-name"
              name="brandName"
              type="text"
              value={form.brandName}
              onChange={handleChange}
              autoFocus
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${errors.brandName ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              placeholder="Nhập tên thương hiệu..."
            />
            {errors.brandName && <p className="text-xs text-red-500 mt-1">{errors.brandName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Xuất xứ (tùy chọn)
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="origin"
                type="text"
                value={form.origin}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                placeholder="VD: Việt Nam, Nhật Bản..."
              />
            </div>
          </div>

          {mode === "edit" && brand && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
              <span>ID: #{brand.brandId}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Đang lưu..." : mode === "edit" ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Brands Page ─────────────────────────────────────────────────────────
export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await GET_BRANDS();
      setBrands(Array.isArray(data) ? data : (data.content || data || []));
    } catch (error) {
      console.error("Failed to load brands", error);
      showToast("Không thể tải danh sách thương hiệu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  // editedBrand: nếu có → cập nhật tại chỗ (giữ vị trí); nếu null → re-fetch
  const handleSaved = (successMsg, errorMsg, editedBrand = null) => {
    setModalMode(null);
    setSelectedBrand(null);
    if (successMsg) {
      showToast(successMsg, "success");
      if (editedBrand) {
        setBrands((prev) => prev.map((b) => b.brandId === editedBrand.brandId ? editedBrand : b));
      } else {
        fetchBrands();
      }
    } else if (errorMsg) {
      showToast(errorMsg, "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await DELETE_BRAND(confirm.brandId);
      showToast(`Đã xóa thương hiệu "${confirm.brandName}"`, "success");
      setBrands((prev) => prev.filter((b) => b.brandId !== confirm.brandId));
    } catch (err) {
      showToast("Xóa thất bại. Có thể thương hiệu đang được sử dụng.", "error");
    } finally {
      setConfirm(null);
    }
  };

  const filtered = brands.filter(
    (b) => b.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           b.origin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Thương hiệu</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thương hiệu sản phẩm.</p>
        </div>
        <button id="btn-add-brand" onClick={() => setModalMode("add")}
          className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-colors">
          <Plus className="h-5 w-5 mr-2" /> Thêm thương hiệu
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input id="search-brands" type="text" placeholder="Tìm thương hiệu..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <span className="text-xs text-gray-400 ml-4 hidden sm:block">{filtered.length} thương hiệu</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thương hiệu</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Xuất xứ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500 mb-2" />
                  Đang tải...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  Không có thương hiệu nào.
                </td></tr>
              ) : (
                filtered.map((brand) => (
                  <tr key={brand.brandId} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center border border-orange-200 shrink-0">
                          <Tag className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{brand.brandName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {brand.origin ? (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                          {brand.origin}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        #{brand.brandId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button id={`btn-edit-brand-${brand.brandId}`}
                          onClick={() => { setSelectedBrand(brand); setModalMode("edit"); }}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button id={`btn-delete-brand-${brand.brandId}`}
                          onClick={() => setConfirm({ brandId: brand.brandId, brandName: brand.brandName })}
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

        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
            Hiển thị <span className="font-medium">{filtered.length}</span> thương hiệu
          </div>
        )}
      </div>

      {/* Modals */}
      {(modalMode === "add" || modalMode === "edit") && (
        <BrandModal mode={modalMode} brand={selectedBrand}
          onClose={() => { setModalMode(null); setSelectedBrand(null); }}
          onSaved={handleSaved} />
      )}
      {confirm && (
        <ConfirmDialog
          message={`Bạn có chắc muốn xóa thương hiệu "${confirm.brandName}"?`}
          onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
