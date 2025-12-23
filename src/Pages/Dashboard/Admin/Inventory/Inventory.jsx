import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';

const Inventory = () => {
    const { publicApi, privateApi } = useAxiosSecure();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all'); // all, low

    // Fetch Global Settings
    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await publicApi.get('/settings');
            return res;
        }
    });

    // Update Settings Mutation
    const { mutate: updateSettings, isPending: updating } = useMutation({
        mutationFn: async (newValue) => {
            const res = await privateApi.patch('/settings', { freeDelivery: newValue });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['settings']);
            toast.success('Store settings updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update settings');
        }
    });

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['inventory-products'],
        queryFn: async () => {
            const res = await privateApi.get('/products');
            return res.result || res;
        }
    });

    const lowStockThreshold = 10;
    const lowStockProducts = products.filter(p => (p.stock || 0) <= lowStockThreshold);

    const displayProducts = filter === 'low' ? lowStockProducts : products;

    if (isLoading) return <DataLoading />;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-amber-900">Inventory Management</h2>
                    <p className="text-amber-700 text-sm">Monitor stock levels and reorder alerts</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-amber-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >
                        All Items
                    </button>
                    <button
                        onClick={() => setFilter('low')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${filter === 'low' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200'}`}
                    >
                        <AlertTriangle size={16} /> Low Stock ({lowStockProducts.length})
                    </button>
                </div>
            </div>

            {/* Store Settings Section */}
            <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-amber-900 mb-4">Store Settings</h3>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div>
                        <h4 className="font-semibold text-amber-900 ">Free Delivery Campaign</h4>
                        <p className="text-sm text-amber-700 mt-1">
                            When active, all customers will receive free delivery (0 ALL shipping fee).
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings?.freeDelivery || false}
                            onChange={(e) => updateSettings(e.target.checked)}
                            disabled={updating}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                            {settings?.freeDelivery ? 'Active' : 'Inactive'}
                        </span>
                    </label>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Total Items</h3>
                    <p className="text-3xl font-bold text-amber-900 mt-2">{products.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
                    <h3 className="text-red-500 text-sm font-medium uppercase flex items-center gap-2"><AlertTriangle size={16} /> Low Stock Alerts</h3>
                    <p className="text-3xl font-bold text-red-700 mt-2">{lowStockProducts.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                    <h3 className="text-blue-500 text-sm font-medium uppercase flex items-center gap-2"><TrendingDown size={16} /> Out of Stock</h3>
                    <p className="text-3xl font-bold text-blue-700 mt-2">{products.filter(p => p.stock === 0).length}</p>
                </div>
            </div>

            {/* Products Table */}
            <div className="w-full mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-amber-100">
                    <table className="w-full text-left">
                        <thead className="bg-amber-50 text-amber-900 text-sm">
                            <tr>
                                <th className="p-4">Product</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">SKU / ID</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-50 text-sm">
                            {displayProducts.map(product => {
                                const stock = product.stock || 0;
                                const isLowStock = stock <= lowStockThreshold && stock > 0;
                                const isOutOfStock = stock === 0;

                                return (
                                    <tr key={product._id} className="hover:bg-amber-50/50">
                                        <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                                            <img src={product.image} className="w-8 h-8 rounded object-cover bg-gray-100" />
                                            <div>
                                                <div>{product.itemName}</div>
                                                {(product.size || product.dosage) && (
                                                    <div className="text-xs text-gray-500">{product.size || product.dosage}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {(Array.isArray(product.categoryPath) ? product.categoryPath.join(' > ') : product.categoryName) || '—'}
                                        </td>
                                        <td className="p-4 text-gray-400 font-mono text-xs">{product._id.slice(-6).toUpperCase()}</td>
                                        <td className="p-4 text-center">
                                            {isOutOfStock ? (
                                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-semibold">Out of Stock</span>
                                            ) : isLowStock ? (
                                                <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-semibold animate-pulse">Low Stock</span>
                                            ) : (
                                                <span className="inline-block px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full font-semibold">In Stock</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-gray-700">
                                            {(product.size || product.dosage) ? (
                                                <div className={`text-xs ${stock <= lowStockThreshold ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded' : 'text-gray-600'}`}>
                                                    <span className="font-medium mr-1">{product.size || product.dosage}:</span>
                                                    <span className={stock <= lowStockThreshold ? 'font-bold' : ''}>{stock}</span>
                                                </div>
                                            ) : (
                                                <span>{stock}</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
