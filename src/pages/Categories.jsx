import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Folder, X, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import {
  GET_CATEGORIES,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from "../config/apiService";

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
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Hủy</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Xóa</button>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ mode, category, onClose, onSaved }) {
  const [categoryName, setCategoryName] = useState(
    mode === "edit" && category ? category.categoryName || "" : ""
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) { setError("Tên danh mục không được để trống"); return; }
    setSaving(true);
    try {
      if (mode === "edit") {
        const payload = {
          categoryId: category.categoryId,
          categoryName: categoryName.trim(),
          description: category.description || null,
        };
        await UPDATE_CATEGORY(category.categoryId, payload);
        // Truyền payload về để cập nhật tại chỗ (giữ vị trí)
        onSaved("Cập nhật danh mục thành công!", null, payload);
      } else {
        const payload = { categoryName: categoryName.trim() };
        await CREATE_CATEGORY(payload);
        onSaved("Thêm danh mục thành công!");
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
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Folder className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === "edit" ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              id="input-category-name"
              type="text"
              value={categoryName}
              onChange={(e) => { setCategoryName(e.target.value); setError(""); }}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${error ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              placeholder="Nhập tên danh mục..."
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {mode === "edit" && category && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
              <span>ID: #{category.categoryId}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Đang lưu..." : mode === "edit" ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState(null); // "add" | "edit" | null
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await GET_CATEGORIES(0, 200);
      setCategories(Array.isArray(data) ? data : (data.content || data || []));
    } catch (error) {
      console.error("Failed to load categories", error);
      showToast("Không thể tải danh sách danh mục", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (message, type = "success") => setToast({ message, type });

  // editedCategory: nếu là edit → cập nhật tại chỗ (giữ vị trí), nếu là add → re-fetch
  const handleSaved = (successMsg, errorMsg, editedCategory = null) => {
    setModalMode(null);
    setSelectedCategory(null);
    if (successMsg) {
      showToast(successMsg, "success");
      if (editedCategory) {
        // Cập nhật tại chỗ → giữ nguyên thứ tự
        setCategories((prev) =>
          prev.map((c) => c.categoryId === editedCategory.categoryId ? editedCategory : c)
        );
      } else {
        // Thêm mới hoặc xóa → re-fetch để lấy ID mới
        fetchCategories();
      }
    } else if (errorMsg) {
      showToast(errorMsg, "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await DELETE_CATEGORY(confirm.categoryId);
      showToast(`Đã xóa danh mục "${confirm.categoryName}"`, "success");
      fetchCategories();
    } catch (err) {
      showToast("Xóa danh mục thất bại. Có thể danh mục đang được sử dụng.", "error");
    } finally {
      setConfirm(null);
    }
  };

  const filteredCategories = categories.filter(
    (c) => c.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Organize your shop structure.</p>
        </div>
        <button
          id="btn-add-category"
          onClick={() => setModalMode("add")}
          className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="search-categories"
              type="text"
              placeholder="Search categories..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-xs text-gray-400 ml-4 hidden sm:block">{filteredCategories.length} danh mục</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-2" />
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.categoryId} className="hover:bg-indigo-50/40 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-50 text-indigo-500 rounded-lg shadow-sm border border-indigo-100">
                          <Folder className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{category.categoryName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        #{category.categoryId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`btn-edit-category-${category.categoryId}`}
                          onClick={() => { setSelectedCategory(category); setModalMode("edit"); }}
                          title="Sửa danh mục"
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-category-${category.categoryId}`}
                          onClick={() => setConfirm({ categoryId: category.categoryId, categoryName: category.categoryName })}
                          title="Xóa danh mục"
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                        >
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

        {/* Footer count */}
        {!loading && filteredCategories.length > 0 && (
          <div className="bg-white px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
            Showing <span className="font-medium">{filteredCategories.length}</span> categories
          </div>
        )}
      </div>

      {/* Modals */}
      {(modalMode === "add" || modalMode === "edit") && (
        <CategoryModal
          mode={modalMode}
          category={selectedCategory}
          onClose={() => { setModalMode(null); setSelectedCategory(null); }}
          onSaved={handleSaved}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={`Bạn có chắc muốn xóa danh mục "${confirm.categoryName}"? Hành động này không thể hoàn tác.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
