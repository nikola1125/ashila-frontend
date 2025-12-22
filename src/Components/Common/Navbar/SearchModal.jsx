import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { getProductImage } from '../../../utils/productImages';

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { publicApi } = useAxiosSecure();

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 50);
        }
    }, [isOpen]);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setQuery('');
            setResults([]);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim()) {
                setLoading(true);
                try {
                    // Using the existing shop endpoint but just for name search
                    const res = await publicApi.get(`/products?search=${encodeURIComponent(query)}&limit=5`);
                    // Ensure we handle the response structure safely (sometimes paginated, sometimes array)
                    // Ensure we handle the response structure safely (backwards compatibility)
                    // Interceptor returns response.data directly
                    const data = res;
                    const products = Array.isArray(data) ? data : (data.result || data.products || data.medicines || []);
                    setResults(products.slice(0, 5));
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, publicApi]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/shop?search=${encodeURIComponent(query)}`);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div
                className="bg-white w-full max-w-2xl mx-auto mt-20 rounded-2xl shadow-2xl overflow-hidden transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Header */}
                <form onSubmit={handleSearchSubmit} className="relative border-b border-gray-100 p-4 flex items-center gap-3">
                    <Search className="text-gray-400 w-6 h-6" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Kërkoni produkte..."
                        className="flex-1 text-lg outline-none placeholder:text-gray-300 text-gray-800"
                    />
                    <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </form>

                {/* Results Area */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Duke kërkuar...</div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            <div className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rezultatet</div>
                            {results.map(product => (
                                <div
                                    key={product._id}
                                    onClick={() => {
                                        navigate(`/product/${product._id}`);
                                        onClose();
                                    }}
                                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                        <img
                                            src={getProductImage(product.image, product._id)}
                                            alt={product.itemName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">{product.itemName}</h4>
                                        <div className="text-xs text-brand-brown font-semibold">
                                            {Number(product.price).toLocaleString()} ALL
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </div>
                            ))}
                            <button
                                onClick={handleSearchSubmit}
                                className="w-full py-3 text-center text-sm font-medium text-brand-brown hover:bg-brand-brown/5 transition-colors"
                            >
                                Shiko të gjitha rezultatet për "{query}"
                            </button>
                        </div>
                    ) : query ? (
                        <div className="p-8 text-center text-gray-500">
                            Nuk u gjetën produkte për "{query}"
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Shkruani për të kërkuar...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
