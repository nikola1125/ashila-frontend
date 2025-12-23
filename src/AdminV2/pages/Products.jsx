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
  variants: [{ size: '', price: '', stock: 0, discount: 0 }],
  isVariantMode: false,
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
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [selectedExistingProduct, setSelectedExistingProduct] = React.useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-v2', 'products'],
    queryFn: () => privateApi.get('/products'),
  });

  const products = (data?.result || data || []).filter(Boolean);

  // Group products by variantGroupId to show relationships
  const groupedProducts = React.useMemo(() => {
    const groups = {};
    products.forEach(product => {
      const key = product.variantGroupId || product._id;
      if (!groups[key]) {
        groups[key] = {
          variantGroupId: product.variantGroupId,
          baseProduct: product,
          variants: []
        };
      }
      if (product.variantGroupId && product._id !== groups[key].baseProduct._id) {
        groups[key].variants.push(product);
      }
    });
    return Object.values(groups);
  }, [products]);

  const resetAndClose = () => {
    setOpen(false);
    setMode('create');
    setActiveId(null);
    setForm(emptyForm);
    setSelectedExistingProduct(null);
    setSearchTerm('');
    setSearchResults([]);
  };

  const openCreate = () => {
    console.log('openCreate called');
    setMode('create');
    setActiveId(null);
    setForm(emptyForm);
    setSelectedExistingProduct(null);
    setSearchTerm('');
    setSearchResults([]);
    setOpen(true);
  };

  const openCreateFromExisting = () => {
    console.log('openCreateFromExisting called');
    setMode('create-from-existing');
    setActiveId(null);
    setForm(emptyForm);
    setSelectedExistingProduct(null);
    setSearchTerm('');
    setSearchResults([]);
    setOpen(true);
  };

  const handleSearch = async (searchValue) => {
    setSearchTerm(searchValue);
    if (searchValue.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await privateApi.get(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      const results = response.data?.result || response.data || [];
      setSearchResults(results.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const selectExistingProduct = (product) => {
    setSelectedExistingProduct(product);
    
    // Auto-fill form with existing product data
    const currentPath = Array.isArray(product.categoryPath) ? product.categoryPath : null;
    let idx = 0;
    if (currentPath) {
      const key = currentPath.join(' > ');
      const found = categoryPaths.findIndex((x) => x.join(' > ') === key);
      if (found >= 0) idx = found;
    }

    setForm({
      // Copy all existing product data
      itemName: product.itemName || '',
      genericName: product.genericName || '',
      company: product.company || '',
      subcategory: product.subcategory || '',
      productType: product.productType || '',
      option: product.option || '',
      dosage: product.dosage || '',
      manufacturer: product.manufacturer || '',
      skinProblem: product.skinProblem || '',
      description: product.description || '',
      categoryPathIndex: idx,
      imageFile: null,
      imageUrl: product.imageUrl || product.image || '',
      // Variant data (empty for manual input)
      variants: [{ size: '', price: product.price || 0, stock: 0, discount: product.discount || 0 }],
      isVariantMode: true,
      // Keep original data as fallback
      price: product.price || 0,
      stock: 0, // Reset stock for new variant
      size: '', // Reset size for new variant
      discount: product.discount || 0,
      // Pass variantGroupId to link with existing variants
      variantGroupId: product.variantGroupId || null,
    });
    
    setSearchTerm('');
    setSearchResults([]);
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
      variants: [{ size: '', price: '', stock: 0, discount: 0 }],
      isVariantMode: false,
    });
    setOpen(true);
  };

  const openAddVariant = (p) => {
    const currentPath = Array.isArray(p.categoryPath) ? p.categoryPath : null;
    let idx = 0;
    if (currentPath) {
      const key = currentPath.join(' > ');
      const found = categoryPaths.findIndex((x) => x.join(' > ') === key);
      if (found >= 0) idx = found;
    }

    setMode('add-variant');
    setActiveId(p._id);
    setForm({
      // Original product data to be copied
      itemName: p.itemName || '',
      genericName: p.genericName || '',
      company: p.company || '',
      subcategory: p.subcategory || '',
      productType: p.productType || '',
      option: p.option || '',
      dosage: p.dosage || '',
      manufacturer: p.manufacturer || '',
      skinProblem: p.skinProblem || '',
      description: p.description || '',
      categoryPathIndex: idx,
      imageFile: null,
      imageUrl: p.imageUrl || p.image || '',
      // New variant data
      variants: [{ size: '', price: p.price || 0, stock: 0, discount: p.discount || 0 }],
      isVariantMode: true,
      // Keep original price and stock as fallback
      price: p.price || 0,
      stock: p.stock || 0,
      size: p.size || p.dosage || '',
      discount: p.discount || 0,
      // Pass the variantGroupId to link variants together
      variantGroupId: p.variantGroupId || null,
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

      if (mode === 'create-from-existing') {
        // Create new variant(s) from existing product
        // Map all variants to the format expected by the backend
        const variantsData = form.variants
          .filter(v => v.size && v.size.trim()) // Only include variants with a size
          .map(variant => ({
            size: String(variant.size || '').trim(),
            price: Number(variant.price || form.price || 0),
            stock: Number(variant.stock || 0),
            discount: Number(variant.discount || form.discount || 0),
          }));

        if (variantsData.length === 0) {
          toast.error('At least one variant with size is required');
          setSaving(false);
          return;
        }

        const variantPayload = {
          // Copy all existing product data
          itemName: String(form.itemName || '').trim(),
          genericName: String(form.genericName || '').trim(),
          company: String(form.company || '').trim(),
          subcategory: String(form.subcategory || '').trim(),
          productType: String(form.productType || '').trim(),
          option: String(form.option || '').trim(),
          dosage: String(form.dosage || '').trim(),
          manufacturer: String(form.manufacturer || '').trim(),
          skinProblem: String(form.skinProblem || '').trim(),
          description: String(form.description || '').trim(),
          categoryPath: path,
          categoryName,
          // Send all variant data in variants array format
          variants: variantsData,
          isVariantMode: true,
          // Pass variantGroupId to link with existing variants
          variantGroupId: form.variantGroupId,
          // Image handling
          ...(imageMeta ? { imageUrl: imageMeta.imageUrl, imageId: imageMeta.imageId } : { imageUrl: form.imageUrl, imageId: null }),
        };

        await privateApi.post('/products', variantPayload);
        toast.success(`Created ${variantsData.length} new variant${variantsData.length > 1 ? 's' : ''} from existing product`);
      } else if (mode === 'add-variant') {
        // Create new product with same data as original but new variant(s)
        // Map all variants to the format expected by the backend
        const variantsData = form.variants
          .filter(v => v.size && v.size.trim()) // Only include variants with a size
          .map(variant => ({
            size: String(variant.size || '').trim(),
            price: Number(variant.price || form.price || 0),
            stock: Number(variant.stock || 0),
            discount: Number(variant.discount || form.discount || 0),
          }));

        if (variantsData.length === 0) {
          toast.error('At least one variant with size is required');
          setSaving(false);
          return;
        }

        const variantPayload = {
          // Copy all original product data
          itemName: String(form.itemName || '').trim(),
          genericName: String(form.genericName || '').trim(),
          company: String(form.company || '').trim(),
          subcategory: String(form.subcategory || '').trim(),
          productType: String(form.productType || '').trim(),
          option: String(form.option || '').trim(),
          dosage: String(form.dosage || '').trim(),
          manufacturer: String(form.manufacturer || '').trim(),
          skinProblem: String(form.skinProblem || '').trim(),
          description: String(form.description || '').trim(),
          categoryPath: path,
          categoryName,
          // Send all variant data in variants array format
          variants: variantsData,
          isVariantMode: true,
          // Pass variantGroupId to link with existing variants
          variantGroupId: form.variantGroupId,
          // Image handling
          ...(imageMeta ? { imageUrl: imageMeta.imageUrl, imageId: imageMeta.imageId } : { imageUrl: form.imageUrl, imageId: null }),
        };

        await privateApi.post('/products', variantPayload);
        toast.success(`Created ${variantsData.length} new variant${variantsData.length > 1 ? 's' : ''} as separate product${variantsData.length > 1 ? 's' : ''}`);
      } else {
        // Regular create or edit
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

  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { 
        size: '', 
        price: prev.price || prev.variants[0]?.price || '', 
        stock: 0, 
        discount: prev.discount || prev.variants[0]?.discount || 0 
      }]
    }));
  };

  const removeVariant = (index) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  if (isLoading) return <DataLoading label="Products" />;
  if (isError) return <LoadingError label="Products" showAction={true} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Products"
        subtitle="Create, edit, and delete pharmacy products"
        right={
          <div className="flex gap-2">
            {/* Test buttons first */}
            <button 
              className="btn btn-outline btn-sm" 
              onClick={() => {
                console.log('Test Create New clicked');
                openCreate();
              }}
            >
              Create New
            </button>
            <button 
              className="btn btn-outline btn-sm" 
              onClick={() => {
                console.log('Test Create from Existing clicked');
                openCreateFromExisting();
              }}
            >
              Create from Existing
            </button>
            
            {/* Original dropdown */}
            <div className="dropdown dropdown-end">
              <button 
                tabIndex={0} 
                className="btn btn-primary"
                onClick={() => console.log('Dropdown button clicked')}
              >
                Add product
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-56">
                <ul>
                  <li>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Dropdown Create New clicked');
                        openCreate();
                      }} 
                      className="w-full text-left"
                    >
                      Create New Product
                    </button>
                  </li>
                  <li>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Dropdown Create from Existing clicked');
                        openCreateFromExisting();
                      }} 
                      className="w-full text-left"
                    >
                      Create from Existing
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
              <th className="text-center">Variants</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-gray-500">No products found.</td>
              </tr>
            ) : (
              groupedProducts.map((group) => (
                <React.Fragment key={group.variantGroupId || group.baseProduct._id}>
                  {/* Base product row */}
                  <tr className={group.variants.length > 0 ? 'border-b-2 border-b-amber-200' : ''}>
                    <td className="font-medium">
                      <div className="flex items-center gap-3">
                        {group.baseProduct.imageUrl || group.baseProduct.image ? (
                          <img
                            src={group.baseProduct.imageUrl || group.baseProduct.image}
                            alt={group.baseProduct.itemName}
                            className="w-10 h-10 rounded-lg object-cover border border-amber-100"
                          />
                        ) : null}
                        <div>
                          <div className="flex items-center gap-2">
                            {group.baseProduct.itemName}
                            {group.variants.length > 0 && (
                              <span className="badge badge-info badge-xs">Base</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{group.baseProduct.size || group.baseProduct.dosage || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {(Array.isArray(group.baseProduct.categoryPath) ? group.baseProduct.categoryPath.join(' > ') : group.baseProduct.categoryName) || '—'}
                      </div>
                    </td>
                    <td className="text-right">{Number(group.baseProduct.price || 0).toLocaleString()} ALL</td>
                    <td className="text-right font-semibold text-amber-950">
                      {(group.baseProduct.size || group.baseProduct.dosage) ? `${group.baseProduct.size || group.baseProduct.dosage}: ${group.baseProduct.stock ?? 0}` : `${group.baseProduct.stock ?? 0}`}
                    </td>
                    <td className="text-center">
                      {group.variants.length > 0 ? (
                        <span className="badge badge-ghost badge-sm">
                          {group.variants.length + 1} sizes
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(group.baseProduct)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => openAddVariant(group.baseProduct)}>
                          Add Variant
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          disabled={deletingId === group.baseProduct._id}
                          onClick={() => deleteProduct(group.baseProduct._id)}
                        >
                          {deletingId === group.baseProduct._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Variant rows */}
                  {group.variants.map((variant) => (
                    <tr key={variant._id} className="bg-gray-50 border-l-4 border-l-amber-300">
                      <td className="font-medium">
                        <div className="flex items-center gap-3">
                          {variant.imageUrl || variant.image ? (
                            <img
                              src={variant.imageUrl || variant.image}
                              alt={variant.itemName}
                              className="w-10 h-10 rounded-lg object-cover border border-amber-100 opacity-75"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-amber-100 opacity-50"></div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">{variant.itemName}</span>
                              <span className="badge badge-warning badge-xs">Variant</span>
                            </div>
                            <div className="text-xs text-gray-500">{variant.size || variant.dosage || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-600">
                          {(Array.isArray(variant.categoryPath) ? variant.categoryPath.join(' > ') : variant.categoryName) || '—'}
                        </div>
                      </td>
                      <td className="text-right">{Number(variant.price || 0).toLocaleString()} ALL</td>
                      <td className="text-right font-semibold text-amber-950">
                        {(variant.size || variant.dosage) ? `${variant.size || variant.dosage}: ${variant.stock ?? 0}` : `${variant.stock ?? 0}`}
                      </td>
                      <td className="text-center">
                        <span className="text-xs text-gray-500">Variant</span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button className="btn btn-sm btn-outline" onClick={() => openEdit(variant)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={() => openAddVariant(variant)}>
                            Add Variant
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            disabled={deletingId === variant._id}
                            onClick={() => deleteProduct(variant._id)}
                          >
                            {deletingId === variant._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
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
                {mode === 'create' ? 'Add product' : mode === 'create-from-existing' ? 'Create from Existing Product' : mode === 'add-variant' ? 'Add variant' : 'Edit product'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {mode === 'create-from-existing' ? 'Search for an existing product to create a variant.' : mode === 'add-variant' ? 'Add a new variant to existing product.' : 'Fill all required fields and save.'}
              </p>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={resetAndClose}>
              ✕
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {/* Search Section for Create from Existing */}
            {mode === 'create-from-existing' && !selectedExistingProduct && (
              <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                <div className="text-sm font-semibold text-amber-950 mb-3">Search for Existing Product</div>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered w-full pr-10"
                    placeholder="Search products by name, company, or category..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => selectExistingProduct(product)}
                      >
                        <div className="font-medium text-sm">{product.itemName}</div>
                        <div className="text-xs text-gray-500">
                          {product.company} • {product.size || product.dosage || 'No size'} • {Number(product.price || 0).toLocaleString()} ALL
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchTerm.length >= 2 && searchResults.length === 0 && (
                  <div className="mt-2 text-sm text-gray-500">No products found</div>
                )}
              </div>
            )}

            {/* Selected Product Display */}
            {mode === 'create-from-existing' && selectedExistingProduct && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="text-sm font-semibold text-green-950 mb-2">Creating variant from:</div>
                <div className="flex items-center gap-3">
                  {selectedExistingProduct.imageUrl && (
                    <img
                      src={selectedExistingProduct.imageUrl}
                      alt={selectedExistingProduct.itemName}
                      className="w-12 h-12 rounded-lg object-cover border border-green-200"
                    />
                  )}
                  <div>
                    <div className="font-medium">{selectedExistingProduct.itemName}</div>
                    <div className="text-xs text-gray-600">
                      {selectedExistingProduct.company} • {selectedExistingProduct.size || selectedExistingProduct.dosage || 'No size'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto btn btn-xs btn-ghost"
                    onClick={() => {
                      setSelectedExistingProduct(null);
                      setForm(emptyForm);
                    }}
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Hide main product fields when adding variant - only show variant section */}
            {!(mode === 'add-variant' || (mode === 'create-from-existing' && selectedExistingProduct)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Product name *</div>
                  <input
                    className="input input-bordered w-full"
                    value={form.itemName}
                    onChange={(e) => setForm((p) => ({ ...p, itemName: e.target.value }))}
                    required
                    disabled={mode === 'create-from-existing' && selectedExistingProduct}
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Category path *</div>
                  <select
                    className="select select-bordered w-full"
                    value={form.categoryPathIndex}
                    onChange={(e) => setForm((p) => ({ ...p, categoryPathIndex: e.target.value }))}
                    disabled={mode === 'create-from-existing' && selectedExistingProduct}
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
                    disabled={mode === 'create-from-existing' && selectedExistingProduct}
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
                    disabled={mode === 'create-from-existing' && selectedExistingProduct}
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Size / Volume</div>
                  <input
                    className="input input-bordered w-full"
                    placeholder="e.g. 100ml / 30 tablets"
                    value={form.size}
                    onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
                    disabled={mode === 'create-from-existing' && selectedExistingProduct}
                  />
                </div>
              </div>
            )}

            {/* Show read-only product info when adding variant */}
            {(mode === 'add-variant' || (mode === 'create-from-existing' && selectedExistingProduct)) && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="text-sm font-semibold text-blue-950 mb-2">Product Information (copied from parent)</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-600">Product Name</div>
                    <div className="font-medium">{form.itemName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Category</div>
                    <div className="font-medium">{categoryPaths[Number(form.categoryPathIndex) || 0]?.join(' > ') || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Base Price</div>
                    <div className="font-medium">{Number(form.price || 0).toLocaleString()} ALL</div>
                  </div>
                </div>
                <div className="text-xs text-blue-700 mt-2">
                  ⓘ These details will be copied to the new variant. Enter the variant-specific details below.
                </div>
              </div>
            )}

              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Image</div>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) =>
                    setForm((p) => ({ ...p, imageFile: e.target.files?.[0] || null }))
                  }
                  disabled={mode === 'create-from-existing' && selectedExistingProduct}
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

            {/* Variant Section - Show for both add-variant and create-from-existing */}
            {(mode === 'add-variant' || (mode === 'create-from-existing' && selectedExistingProduct)) && (
              <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-amber-950">
                    {mode === 'create-from-existing' ? 'New Variant Details' : 'New Variant Details'}
                  </div>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="btn btn-xs btn-outline btn-primary"
                  >
                    + Add Variant
                  </button>
                </div>
                <div className="text-xs text-amber-800 bg-amber-100 rounded p-2 mb-3">
                  ⚠️ <strong>Important:</strong> Each variant must have a <strong>different size</strong> than existing variants. This will create a <strong>new separate product</strong> with the same details but different size/price/stock.
                </div>
                {form.variants.map((variant, index) => (
                  <div key={index} className="mb-4 p-3 bg-white rounded-lg border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-gray-600">Variant {index + 1}</div>
                      {form.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="btn btn-xs btn-ghost text-error"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">Size / Volume *</div>
                        <input
                          className="input input-bordered w-full"
                          placeholder="e.g. 50ml, 100ml"
                          value={variant.size}
                          onChange={(e) => updateVariant(index, 'size', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">Price (ALL) *</div>
                        <input
                          type="number"
                          className="input input-bordered w-full"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">Quantity (stock) *</div>
                        <input
                          type="number"
                          className="input input-bordered w-full"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">Discount (%)</div>
                        <input
                          type="number"
                          className="input input-bordered w-full"
                          placeholder="0"
                          value={variant.discount}
                          onChange={(e) => updateVariant(index, 'discount', e.target.value)}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Description - Hide in create-from-existing mode until product is selected */}
            {!(mode === 'create-from-existing' && !selectedExistingProduct) && (
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Description</div>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  disabled={mode === 'create-from-existing' && selectedExistingProduct}
                />
              </div>
            )}

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
