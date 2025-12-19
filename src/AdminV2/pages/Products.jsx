import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { uploadImage } from '../../utils/uploadImage';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../Components/Common/States/LoadingError';
import SectionHeader from '../components/SectionHeader';
import { flattenCategoryTree } from '../adminCategories';

const categoryPaths = flattenCategoryTree();

const emptyForm = {
  itemName: '',
  price: '',
  size: '',
  stock: 0,
  description: '',
  categoryPathIndex: 0,
  imageFile: null,
  imageUrl: '',
};

const Products = () => {
  const { privateApi } = useAxiosSecure();
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState('create');
  const [activeId, setActiveId] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm);
  const [deletingId, setDeletingId] = React.useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-v2', 'products'],
    queryFn: () => privateApi.get('/products'),
  });

  const products = (data?.result || data || []).filter(Boolean);

  const resetAndClose = () => {
    setOpen(false);
    setMode('create');
    setActiveId(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setMode('create');
    setActiveId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p) => {
    const currentPath = Array.isArray(p.categoryPath) ? p.categoryPath : null;
    let idx = 0;
    if (currentPath) {
      const key = currentPath.join(' > ');
      const found = categoryPaths.findIndex((x) => x.join(' > ') === key);
      if (found >= 0) idx = found;
    }

    setMode('edit');
    setActiveId(p._id);
    setForm({
      itemName: p.itemName || '',
      price: p.price ?? '',
      size: p.size || p.dosage || '',
      stock: p.stock ?? 0,
      description: p.description || '',
      categoryPathIndex: idx,
      imageFile: null,
      imageUrl: p.imageUrl || p.image || '',
    });
    setOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const path = categoryPaths[Number(form.categoryPathIndex) || 0] || [];
      const categoryName = path[path.length - 1] || path[0] || '';

      let imageMeta = null;
      if (form.imageFile) {
        imageMeta = await uploadImage(form.imageFile, privateApi);
        if (!imageMeta) {
          toast.error('Image upload failed');
          return;
        }
      }

      const payload = {
        itemName: String(form.itemName || '').trim(),
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
        size: String(form.size || '').trim(),
        description: String(form.description || '').trim(),
        categoryPath: path,
        categoryName,
        ...(imageMeta ? { imageUrl: imageMeta.imageUrl, imageId: imageMeta.imageId } : {}),
      };

      if (!payload.itemName) {
        toast.error('Product name is required');
        return;
      }

      if (mode === 'create') {
        await privateApi.post('/products', payload);
        toast.success('Product created');
      } else {
        await privateApi.patch(`/products/${activeId}`, payload);
        toast.success('Product updated');
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-v2', 'products'] });
      resetAndClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      setDeletingId(id);
      await privateApi.delete(`/products/${id}`);
      toast.success('Product deleted');
      await queryClient.invalidateQueries({ queryKey: ['admin-v2', 'products'] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <DataLoading label="Products" />;
  if (isError) return <LoadingError label="Products" showAction={true} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Products"
        subtitle="Create, edit, and delete pharmacy products"
        right={
          <button className="btn btn-primary" onClick={openCreate}>
            Add product
          </button>
        }
      />

      <div className="overflow-x-auto bg-white border border-amber-100 rounded-2xl shadow-sm">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th className="text-right">Price</th>
              <th className="text-right">Stock</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-gray-500">No products found.</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td className="font-medium">
                    <div className="flex items-center gap-3">
                      {p.imageUrl || p.image ? (
                        <img
                          src={p.imageUrl || p.image}
                          alt={p.itemName}
                          className="w-10 h-10 rounded-lg object-cover border border-amber-100"
                        />
                      ) : null}
                      <div>
                        <div>{p.itemName}</div>
                        <div className="text-xs text-gray-500">{p.size || p.dosage || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {(Array.isArray(p.categoryPath) ? p.categoryPath.join(' > ') : p.categoryName) || '—'}
                    </div>
                  </td>
                  <td className="text-right">{Number(p.price || 0).toLocaleString()} ALL</td>
                  <td className="text-right font-semibold text-amber-950">{p.stock ?? 0}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        disabled={deletingId === p._id}
                        onClick={() => deleteProduct(p._id)}
                      >
                        {deletingId === p._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <dialog className={`modal ${open ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-xl text-amber-950">
                {mode === 'create' ? 'Add product' : 'Edit product'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Fill all required fields and save.
              </p>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={resetAndClose}>
              ✕
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Product name *</div>
                <input
                  className="input input-bordered w-full"
                  value={form.itemName}
                  onChange={(e) => setForm((p) => ({ ...p, itemName: e.target.value }))}
                  required
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Category path *</div>
                <select
                  className="select select-bordered w-full"
                  value={form.categoryPathIndex}
                  onChange={(e) => setForm((p) => ({ ...p, categoryPathIndex: e.target.value }))}
                >
                  {categoryPaths.map((path, idx) => (
                    <option key={path.join('|')} value={idx}>
                      {path.join(' > ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Price (ALL) *</div>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  required
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Quantity (stock) *</div>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={form.stock}
                  onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                  required
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Size / Volume</div>
                <input
                  className="input input-bordered w-full"
                  placeholder="e.g. 100ml / 30 tablets"
                  value={form.size}
                  onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Image</div>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) =>
                    setForm((p) => ({ ...p, imageFile: e.target.files?.[0] || null }))
                  }
                />
                {form.imageUrl ? (
                  <div className="mt-2">
                    <img
                      src={form.imageUrl}
                      alt="preview"
                      className="w-24 h-24 rounded-xl border border-amber-100 object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Description</div>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={resetAndClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default Products;
