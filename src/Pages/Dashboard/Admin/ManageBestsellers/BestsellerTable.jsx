import React, { useState } from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';
import { Star, StarOff } from 'lucide-react';

const BestsellerTable = ({ products, refetch }) => {
  const { privateApi } = useAxiosSecure();
  const [updating, setUpdating] = useState(null);

  const bestsellerCategories = [
    { value: 'skincare', label: 'Skincare' },
    { value: 'hair', label: 'Hair Care' },
    { value: 'body', label: 'Body Care' },
  ];

  const handleToggleBestseller = async (product, isBestseller) => {
    setUpdating(product._id);
    try {
      const updateData = {
        isBestseller: !isBestseller,
        bestsellerCategory: !isBestseller ? 'skincare' : null, // Default to skincare when enabling
      };

      await privateApi.patch(`/medicines/${product._id}`, updateData);
      toast.success(
        `Product ${!isBestseller ? 'marked as' : 'removed from'} bestseller`
      );
      refetch();
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    } finally {
      setUpdating(null);
    }
  };

  const handleCategoryChange = async (product, category) => {
    setUpdating(product._id);
    try {
      const updateData = {
        isBestseller: true,
        bestsellerCategory: category || null,
      };

      await privateApi.patch(`/medicines/${product._id}`, updateData);
      toast.success('Bestseller category updated');
      refetch();
    } catch (error) {
      toast.error('Failed to update category');
      console.error(error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bestseller Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.itemName}
                          className="h-12 w-12 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.itemName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.company || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.price?.toLocaleString()} ALL
                    </div>
                    {product.discount > 0 && (
                      <div className="text-xs text-green-600">
                        {product.discount}% off
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isBestseller
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {product.isBestseller ? 'Bestseller' : 'Regular'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.isBestseller ? (
                      <select
                        value={product.bestsellerCategory || ''}
                        onChange={(e) =>
                          handleCategoryChange(product, e.target.value)
                        }
                        disabled={updating === product._id}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        {bestsellerCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        disabled={updating === product._id}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                        title="Edit Product Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>

                      <button
                        onClick={() =>
                          handleToggleBestseller(product, product.isBestseller)
                        }
                        disabled={updating === product._id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${product.isBestseller
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        title={product.isBestseller ? "Remove from Bestsellers" : "Add to Bestsellers"}
                      >
                        {updating === product._id ? (
                          <span>...</span>
                        ) : product.isBestseller ? (
                          <>
                            <StarOff size={14} /> Remove
                          </>
                        ) : (
                          <>
                            <Star size={14} /> Add
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onDelete(product._id)}
                        disabled={updating === product._id}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Delete from Inventory"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BestsellerTable;

