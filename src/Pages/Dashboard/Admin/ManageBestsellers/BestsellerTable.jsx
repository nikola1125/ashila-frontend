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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isBestseller
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
                    <button
                      onClick={() =>
                        handleToggleBestseller(product, product.isBestseller)
                      }
                      disabled={updating === product._id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        product.isBestseller
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updating === product._id ? (
                        <span>Updating...</span>
                      ) : product.isBestseller ? (
                        <>
                          <StarOff size={16} />
                          Remove
                        </>
                      ) : (
                        <>
                          <Star size={16} />
                          Mark as Bestseller
                        </>
                      )}
                    </button>
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

