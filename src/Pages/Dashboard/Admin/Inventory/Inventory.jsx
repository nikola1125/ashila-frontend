import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';

const Inventory = () => {
    const { publicApi } = useAxiosSecure();
    const [filter, setFilter] = useState('all'); // all, low

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['inventory-products'],
        queryFn: async () => {
            const res = await publicApi.get('/medicines');
            return res.result || res;
        }
    });

    const lowStockThreshold = 10;
    const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold);

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
                        {displayProducts.map(product => (
                            <tr key={product._id} className="hover:bg-amber-50/50">
                                <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                                    <img src={product.image} className="w-8 h-8 rounded object-cover bg-gray-100" />
                                    {product.itemName}
                                </td>
                                <td className="p-4 text-gray-500">{product.categoryName}</td>
                                <td className="p-4 text-gray-400 font-mono text-xs">{product._id.slice(-6).toUpperCase()}</td>
                                <td className="p-4 text-center">
                                    {product.stock === 0 ? (
                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-semibold">Out of Stock</span>
                                    ) : product.stock <= lowStockThreshold ? (
                                        <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-semibold animate-pulse">Low Stock</span>
                                    ) : (
                                        <span className="inline-block px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full font-semibold">In Stock</span>
                                    )}
                                </td>
                                <td className="p-4 text-right font-mono font-bold text-gray-700">{product.stock}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
