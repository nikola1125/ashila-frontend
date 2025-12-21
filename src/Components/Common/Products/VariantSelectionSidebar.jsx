import React, { useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImage } from '../../../utils/productImages';

const VariantSelectionSidebar = ({
    isOpen,
    onClose,
    product,
    selectedVariant,
    onSelectVariant,
    onAddToCart
}) => {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md bg-[#faf9f6] shadow-2xl flex flex-col h-full pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9BFA9] bg-white">
                            <h2 className="lux-serif-text text-xl font-semibold text-[#4A3628]">
                                Select Option
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-500 hover:text-[#4A3628] transition-colors rounded-full hover:bg-gray-100"
                                aria-label="Close sidebar"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="flex flex-col gap-4">
                                {product.variants.map((variant, idx) => {
                                    const isSelected = selectedVariant && (selectedVariant._id === variant._id || selectedVariant === variant);
                                    const variantPrice = Number(variant.price);
                                    const variantDiscount = Number(variant.discount || 0);
                                    const discountedPrice = variantDiscount > 0
                                        ? variantPrice * (1 - variantDiscount / 100)
                                        : variantPrice;

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => onSelectVariant(variant)}
                                            className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 group ${isSelected
                                                ? 'border-[#4A3628] bg-white ring-1 ring-[#4A3628] shadow-md'
                                                : 'border-gray-200 bg-white hover:border-[#4A3628]/50 hover:shadow-sm'
                                                }`}
                                        >
                                            {/* Image Thumbnail */}
                                            <div className="w-20 h-20 flex-shrink-0 bg-[#f9f9f9] rounded-md overflow-hidden border border-gray-100">
                                                <img
                                                    src={getProductImage(product.image, product._id)}
                                                    alt={`${product.itemName} - ${variant.size}`}
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="ml-4 flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-[#4A3628] font-medium text-lg">
                                                        {variant.size}
                                                    </h3>
                                                </div>

                                                <div className="mt-1 flex items-baseline gap-2">
                                                    <span className="text-[#4A3628] font-semibold">
                                                        {discountedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                                                    </span>
                                                    {variantDiscount > 0 && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            {variantPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Stock Status */}
                                                <div className="mt-1 text-xs">
                                                    {Number(variant.stock) > 0 ? (
                                                        <span className="text-green-600 font-medium">In Stock</span>
                                                    ) : (
                                                        <span className="text-red-500 font-medium">Out of Stock</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Radio Indicator */}
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ml-3 ${isSelected ? 'border-[#4A3628]' : 'border-gray-300'
                                                }`}>
                                                {isSelected && (
                                                    <div className="w-3 h-3 rounded-full bg-[#4A3628]" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer - Action Button */}
                        <div className="p-6 border-t border-[#D9BFA9] bg-white">
                            <button
                                onClick={onAddToCart}
                                disabled={!selectedVariant || Number(selectedVariant.stock) <= 0}
                                className={`w-full py-4 flex items-center justify-center gap-2 text-white font-medium text-lg uppercase tracking-wide transition-all ${!selectedVariant || Number(selectedVariant.stock) <= 0
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-[#4A3628] hover:bg-[#3d2e22]'
                                    }`}
                            >
                                <ShoppingBag size={20} />
                                {Number(selectedVariant?.stock) <= 0 ? 'Out of Stock' : 'Shto ne shporte'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default VariantSelectionSidebar;
