import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { CartContext } from '../../Context/Cart/CartContext';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Minus, Plus, Facebook, Twitter, Mail } from 'lucide-react';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../Components/Common/States/LoadingError';
import { getProductImage } from '../../utils/productImages';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { publicApi } = useAxiosSecure();
  const { addItem } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('90GR'); // Default size

  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await publicApi.get(`/medicines/${id}`);
      return response;
    },
    enabled: !!id,
  });

  // Fetch related products (same category, excluding current product)
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', product?.category?._id, id],
    queryFn: async () => {
      if (!product?.category?._id) return [];
      const response = await publicApi.get(`/medicines`);
      const allProducts = response?.result || response || [];
      // Filter: same category, exclude current product, limit to 4
      const related = allProducts
        .filter(p => 
          p._id !== id && 
          (p.category?._id === product.category._id || p.category === product.category._id)
        )
        .slice(0, 4);
      // If not enough in same category, add products in order (no random)
      if (related.length < 4) {
        const additional = allProducts
          .filter(p => p._id !== id && !related.find(r => r._id === p._id))
          .slice(0, 4 - related.length);
        return [...related, ...additional].slice(0, 4);
      }
      return related;
    },
    enabled: !!product && !!product.category,
  });

  const handleQuantityChange = useCallback((delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    // Add item quantity times
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product._id,
        name: product.itemName,
        price: product.price,
        discountedPrice: product.discount > 0
          ? (Number(product.price) * (1 - Number(product.discount) / 100)).toFixed(2)
          : null,
        image: product.image,
        company: product.company,
        genericName: product.genericName,
        discount: product.discount || 0,
        seller: product.seller,
        size: selectedSize,
      });
    }
  }, [product, quantity, selectedSize, addItem]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    handleAddToCart();
    navigate('/cart');
  }, [product, handleAddToCart, navigate]);

  if (isLoading) return <DataLoading label="Product" />;
  if (error) return <LoadingError label="Product" />;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  const discountedPrice = product.discount > 0
    ? Number(product.price) * (1 - Number(product.discount) / 100)
    : Number(product.price);

  const isInStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Helmet>
        <title>{product.itemName} - Product Details</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-32 md:pt-40 pb-10">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mb-10 sm:mb-12">
          {/* Left Column - Product Image */}
          <div className="relative bg-white lux-card lux-card-elevated overflow-hidden">
            {/* Product Image */}
            <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] md:min-h-[500px] p-4 sm:p-6 md:p-8">
              <img
                src={getProductImage(product.image, product._id)}
                alt={product.itemName}
                className="max-w-full max-h-[400px] sm:max-h-[500px] md:max-h-[600px] object-contain w-full h-auto"
                onError={(e) => {
                  e.target.src = getProductImage(null, product._id);
                }}
              />
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col">
            {/* Shop Name */}
            <p className="text-sm text-gray-500 mb-2 font-light">Ashila</p>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#4A3628] mb-2 break-words">{product.itemName}</h1>
            <div className="w-16 h-0.5 bg-[#A67856] mb-4"></div>

            {/* Price */}
            <div className="mb-4 sm:mb-6">
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-[#4A3628]">
                {discountedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ALL
              </span>
            </div>

            <div className="border-t border-[#D9BFA9] pt-6 mb-6"></div>

            {/* SIZE Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#4A3628] uppercase tracking-wide mb-2">
                SIZE
              </label>
              <div className="w-auto inline-block">
                <div className="px-3 py-2 border border-[#4A3628] bg-white text-[#4A3628] font-medium text-sm">
                  {selectedSize}
                </div>
              </div>
            </div>

            {/* QUANTITY Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#4A3628] uppercase tracking-wide mb-2">
                QUANTITY
              </label>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-[#4A3628] hover:bg-[#EBD8C8] disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-lg leading-none text-[#4A3628]"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, val));
                  }}
                  className="w-20 h-12 sm:w-16 sm:h-10 text-center border-2 border-[#4A3628] focus:outline-none bg-white text-[#4A3628] font-medium text-base sm:text-sm min-h-[44px] sm:min-h-0"
                  min="1"
                  readOnly
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={!isInStock}
                  className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-[#4A3628] hover:bg-[#EBD8C8] disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-lg leading-none text-[#4A3628]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              {isInStock ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full lux-btn-outline px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base min-h-[44px]"
                  >
                    Add to cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full lux-btn-primary px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base min-h-[44px]"
                  >
                    Buy it now
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 px-4 sm:px-6 py-3 sm:py-4 font-medium cursor-not-allowed min-h-[44px]"
                >
                  Sold out
                </button>
              )}
            </div>

            {/* Social Sharing */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-.721 0-1.418-.109-2.076-.312.286-.465.713-1.227.95-1.878.098-.35.595-2.394.595-2.394s.152.304.465.496c.435.287.936.46 1.526.46 2.01 0 3.38-1.843 3.38-4.31 0-1.87-1.577-3.174-3.832-3.174-2.602 0-4.198 1.928-4.198 3.922 0 1.152.44 2.17 1.561 2.553.174.071.334.041.384-.107.036-.137.124-.48.163-.656.053-.204.033-.275-.115-.455-.323-.38-.53-.873-.53-1.57 0-2.03 1.54-3.894 4.01-3.894 2.105 0 3.636 1.503 3.636 3.505 0 2.33-1.464 4.296-3.64 4.296-.712 0-1.387-.37-1.617-.863 0 0-.352 1.34-.436 1.67-.158.609-.586 1.37-.872 1.833A11.98 11.98 0 0 0 12 19z"/>
                  </svg>
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(product.itemName)}&body=${encodeURIComponent(window.location.href)}`}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#4A3628] transition-colors"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="border-t border-[#D9BFA9] pt-8 mb-8">
          <h2 className="text-xl font-semibold text-[#4A3628] mb-4">Description</h2>
          <div className="prose max-w-none text-[#4A3628] leading-relaxed">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>
                {product.genericName && (
                  <>
                    <strong>Generic Name:</strong> {product.genericName}
                    <br />
                  </>
                )}
                {product.company && (
                  <>
                    <strong>Company:</strong> {product.company}
                    <br />
                  </>
                )}
                {product.category?.categoryName && (
                  <>
                    <strong>Category:</strong> {product.category.categoryName}
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Breaking Line */}
        <div className="border-t border-[#D9BFA9] my-12"></div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-[#4A3628] mb-8 text-center">Sugjerime</h2>
            <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-5 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-x-visible sm:justify-items-center">
              {relatedProducts.map((relatedProduct, index) => {
                const relatedDiscountedPrice = relatedProduct.discount > 0
                  ? Number(relatedProduct.price) * (1 - Number(relatedProduct.discount) / 100)
                  : Number(relatedProduct.price);

                return (
                  <div
                    key={relatedProduct._id}
                    className="w-[200px] sm:w-full sm:max-w-[280px] flex-shrink-0 border border-gray-200 overflow-hidden bg-white text-center pb-4 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'instant' });
                      navigate(`/product/${relatedProduct._id}`);
                    }}
                  >
                    {/* Product Image Container */}
                    <div 
                      className="relative w-full overflow-hidden bg-[#f9f9f9] h-[200px] md:h-[250px]"
                    >
                      <img
                        src={getProductImage(relatedProduct.image, relatedProduct._id || index)}
                        alt={relatedProduct.itemName}
                        className="w-full h-full object-contain p-5"
                        onError={(e) => {
                          e.target.src = getProductImage(null, relatedProduct._id || index);
                        }}
                      />
                      {relatedProduct.discount > 0 && (
                        <div className="absolute top-2.5 right-2.5 bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold">
                          Save {relatedProduct.discount}%
                        </div>
                      )}
                      {relatedProduct.stock === 0 && (
                        <div className="absolute top-2.5 left-2.5 bg-red-500 text-white px-2.5 py-1.5 text-sm font-bold">
                          Sold Out
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="px-2.5 pt-4 flex flex-col flex-grow">
                      <h3 className="text-base mb-2.5 text-gray-800 min-h-[40px] line-clamp-2">
                        {relatedProduct.itemName}
                      </h3>
                      <div className="flex items-center justify-center gap-2.5 mt-auto">
                        {relatedProduct.discount > 0 ? (
                          <>
                            <span className="text-lg font-bold text-black">
                              {relatedDiscountedPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {Number(relatedProduct.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-black">
                            {Number(relatedProduct.price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ALL
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProductDetail;