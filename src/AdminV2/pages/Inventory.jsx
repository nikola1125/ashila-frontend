import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../Components/Common/States/LoadingError';

const Inventory = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => axiosSecure.get('/products'),
  });

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

  const updateStockMutation = useMutation({
    mutationFn: ({ productId, stock }) => {
      return axiosSecure.patch(`/inventory/${productId}`, { stock });
    },
    onSuccess: () => {
      toast.success('Stock updated successfully');
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update stock');
    },
  });

  const [editingStock, setEditingStock] = useState({});
  const [draftStock, setDraftStock] = useState({});

  const handleStockChange = (productId, newStock) => {
    setDraftStock(prev => ({ ...prev, [productId]: newStock }));
  };

  const handleUpdateStock = (productId) => {
    const newStock = draftStock[productId];
    if (newStock === undefined || newStock === '') return;
    
    const stock = parseInt(newStock, 10);
    if (isNaN(stock) || stock < 0) {
      toast.error('Please enter a valid stock number');
      return;
    }

    updateStockMutation.mutate({ productId, stock });
    setEditingStock(prev => ({ ...prev, [productId]: false }));
  };

  const handleCancelEdit = (productId) => {
    setEditingStock(prev => ({ ...prev, [productId]: false }));
    setDraftStock(prev => ({ ...prev, [productId]: undefined }));
  };

  if (isLoading) return <DataLoading label="Inventory" />;
  if (isError) return <LoadingError label="Inventory" retry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groupedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-gray-500 text-center py-8">No products found</td>
                </tr>
              ) : (
                groupedProducts.map((group) => (
                  <React.Fragment key={group.variantGroupId || group.baseProduct._id}>
                    {/* Base product row */}
                    <tr className={group.variants.length > 0 ? 'border-b-2 border-b-amber-200' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {group.baseProduct.image && (
                            <img
                              className="h-10 w-10 rounded object-cover mr-3"
                              src={group.baseProduct.image}
                              alt={group.baseProduct.name}
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">
                                {group.baseProduct.itemName}
                              </div>
                              {group.variants.length > 0 && (
                                <span className="badge badge-info badge-xs">Base</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{group.baseProduct.size || group.baseProduct.dosage || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {group.baseProduct.sku || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStock[group.baseProduct._id] ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              className="w-20 px-2 py-1 border rounded text-sm"
                              defaultValue={group.baseProduct.stock}
                              onChange={(e) => handleStockChange(group.baseProduct._id, e.target.value)}
                            />
                            <button
                              onClick={() => handleUpdateStock(group.baseProduct._id)}
                              className="text-green-600 hover:text-green-800 text-sm"
                              disabled={updateStockMutation.isLoading}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => handleCancelEdit(group.baseProduct._id)}
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-900">{group.baseProduct.stock}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            group.baseProduct.stock === 0
                              ? 'bg-red-100 text-red-800'
                              : group.baseProduct.stock < 10
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {group.baseProduct.stock === 0
                            ? 'Out of Stock'
                            : group.baseProduct.stock < 10
                            ? 'Low Stock'
                            : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!editingStock[group.baseProduct._id] && (
                          <button
                            onClick={() => setEditingStock(prev => ({ ...prev, [group.baseProduct._id]: true }))}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit Stock
                          </button>
                        )}
                      </td>
                    </tr>
                    {/* Variant rows */}
                    {group.variants.map((variant) => (
                      <tr key={variant._id} className="bg-gray-50 border-l-4 border-l-amber-300">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {variant.image && (
                              <img
                                className="h-10 w-10 rounded object-cover mr-3 opacity-75"
                                src={variant.image}
                                alt={variant.name}
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-600">
                                  {variant.itemName}
                                </div>
                                <span className="badge badge-warning badge-xs">Variant</span>
                              </div>
                              <div className="text-xs text-gray-500">{variant.size || variant.dosage || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {variant.sku || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingStock[variant._id] ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                className="w-20 px-2 py-1 border rounded text-sm"
                                defaultValue={variant.stock}
                                onChange={(e) => handleStockChange(variant._id, e.target.value)}
                              />
                              <button
                                onClick={() => handleUpdateStock(variant._id)}
                                className="text-green-600 hover:text-green-800 text-sm"
                                disabled={updateStockMutation.isLoading}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => handleCancelEdit(variant._id)}
                                className="text-gray-600 hover:text-gray-800 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-900">{variant.stock}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              variant.stock === 0
                                ? 'bg-red-100 text-red-800'
                                : variant.stock < 10
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {variant.stock === 0
                              ? 'Out of Stock'
                              : variant.stock < 10
                              ? 'Low Stock'
                              : 'In Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!editingStock[variant._id] && (
                            <button
                              onClick={() => setEditingStock(prev => ({ ...prev, [variant._id]: true }))}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;