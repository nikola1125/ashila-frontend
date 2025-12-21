import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, X, Loader2 } from 'lucide-react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';

const SelectProductModal = ({ isOpen, onClose, refetch }) => {
    const { publicApi, privateApi } = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');
    const [addingId, setAddingId] = useState(null);

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['non-bestsellers'],
        queryFn: async () => {
            // Fetch all and filter client side or backend? Backend doesn't have "not bestseller" filter easily.
            // We'll fetch all and filter in JS for now as list isn't huge yet.
            // Or fetch /medicines which returns all.
            const res = await publicApi.get('/medicines');
            const allProducts = res.result || res || [];
            // Filter out existing bestsellers
            return allProducts.filter(p => !p.isBestseller);
        }
    });

    const filteredProducts = products.filter(product =>
        product.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addMutation = useMutation({
        mutationFn: async (id) => {
            // Default to 'skincare' or just set flag.
            // BestsellerTable sets default to 'skincare' so we do too.
            await privateApi.patch(`/medicines/${id}`, {
                isBestseller: true,
                bestsellerCategory: 'skincare'
            });
        },
        onSuccess: () => {
            toast.success('Product added to Best Sellers');
            refetch(); // Refetch parent list
            // We can also invalidate 'non-bestsellers' to remove it from this list
        },
        onError: () => {
            toast.error('Failed to add product');
        }
    });

    const handleAdd = async (id) => {
        setAddingId(id);
        await addMutation.mutateAsync(id);
        setAddingId(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-amber-900">Select Product</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 border-b bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-amber-600" /></div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">No available products found.</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredProducts.map(product => (
                                <div key={product._id} className="flex items-center justify-between p-3 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-100 transition">
                                    <div className="flex items-center gap-3">
                                        <img src={product.image} alt={product.itemName} className="w-10 h-10 object-cover rounded-md" />
                                        <div>
                                            <div className="font-medium text-gray-800">{product.itemName}</div>
                                            <div className="text-xs text-gray-500">{product.company} • {product.price} ALL</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAdd(product._id)}
                                        disabled={addingId === product._id}
                                        className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition disabled:opacity-50"
                                    >
                                        {addingId === product._id ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectProductModal;
