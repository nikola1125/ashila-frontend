import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import DataLoading from '../../../../Components/Common/Loaders/DataLoading';
import Swal from 'sweetalert2';
import CreateProductModal from './CreateProductModal'; // We will create this next

const ManageProducts = () => {
    const { publicApi, privateApi } = useAxiosSecure();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: async () => {
            const res = await publicApi.get('/medicines');
            return res.result || res;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await privateApi.delete(`/medicines/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-products']);
            toast.success('Product deleted successfully');
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            }
        });
    };

    const filteredProducts = products.filter(product =>
        product.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <DataLoading />;

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-amber-900">Manage Products</h2>
                    <p className="text-amber-700 text-sm">Add, edit, or remove products</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { setEditingProduct(null); setIsCreateModalOpen(true); }}
                        className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-amber-50 text-amber-900 font-semibold border-b border-amber-100">
                            <tr>
                                <th className="p-4">Image</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-50">
                            {filteredProducts.map(product => (
                                <tr key={product._id} className="hover:bg-amber-50/50 transition">
                                    <td className="p-4">
                                        <img src={product.image} alt={product.itemName} className="w-12 h-12 object-cover rounded-md border border-amber-100" />
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-800">{product.itemName}</div>
                                        <div className="text-xs text-gray-500">{product.company}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">{product.categoryName}</span>
                                        {product.subcategory && <div className="text-xs text-gray-400 mt-1">{product.subcategory}</div>}
                                    </td>
                                    <td className="p-4 font-medium text-amber-700">{product.price} ALL</td>
                                    <td className="p-4">
                                        {product.variants && product.variants.length > 0 ? (
                                            <div className="space-y-1">
                                                {product.variants.map((variant, idx) => (
                                                    <div key={idx} className={`flex flex-col text-xs px-2 py-1 rounded-md ${variant.stock <= 10 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-50 text-gray-600'}`}>
                                                        <div className="flex justify-between items-center w-full">
                                                            <span className="font-medium">{variant.size}</span>
                                                            <span className="font-bold">{variant.stock}</span>
                                                        </div>
                                                        {variant.stock <= 10 && (
                                                            <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Low on stock</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock <= 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {product.stock} units
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setEditingProduct(product); setIsCreateModalOpen(true); }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">No products found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateProductModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    productToEdit={editingProduct}
                    refetch={() => queryClient.invalidateQueries(['admin-products'])}
                />
            )}
        </div>
    );
};

export default ManageProducts;
