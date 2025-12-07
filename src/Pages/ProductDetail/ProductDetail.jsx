import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { CartContext } from '../../Context/Cart/CartContext';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Minus, Plus, Facebook, Twitter, Mail } from 'lucide-react';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../Components/Common/States/LoadingError';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { publicApi } = useAxiosSecure();
  const { addItem } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);

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
      });
    }
  }, [product, quantity, addItem]);

  if (isLoading) return <DataLoading label="Product" />;
  if (error) return <LoadingError label="Product" />;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  const discountedPrice = product.discount > 0
    ? Number(product.price) * (1 - Number(product.discount) / 100)
    : Number(product.price);

  const isInStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{product.itemName} - Product Details</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.itemName}</span>
          </div>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Product Image */}
          <div className="relative bg-white rounded-sm overflow-hidden">
            {/* Product Image */}
            <div className="flex items-center justify-center min-h-[500px] p-8">
              <img
                src={product.image || '/placeholder.png'}
                alt={product.itemName}
                className="max-w-full max-h-[600px] object-contain"
                onError={(e) => {
                  e.target.src = '/placeholder.png';
                }}
              />
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col">
            {/* Shop Name */}
            <p className="text-sm text-gray-500 mb-2">Ashila</p>

            {/* Product Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.itemName}</h1>
            <div className="w-16 h-0.5 bg-gray-900 mb-6"></div>

            {/* Price */}
            <div className="mb-6">
              {product.discount > 0 ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-gray-900">
                    {discountedPrice.toLocaleString()} ALL
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {Number(product.price).toLocaleString()} ALL
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  {Number(product.price).toLocaleString()} ALL
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QUANTITY
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border-2 border-[#946259] hover:bg-[#faf9f6] disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, val));
                  }}
                  className="w-16 h-10 text-center border-2 border-[#946259] focus:outline-none focus:ring-2 focus:ring-[#946259] bg-white"
                  min="1"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={!isInStock}
                  className="w-10 h-10 flex items-center justify-center border-2 border-[#946259] hover:bg-[#faf9f6] disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Status Button */}
            <div className="mb-6">
              {isInStock ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#946259] hover:bg-[#7a4f47] text-white px-6 py-3 font-bold transition-all duration-200 flex items-center justify-center gap-2 border-2 border-[#946259] uppercase tracking-wide"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 px-6 py-3 rounded-sm font-medium cursor-not-allowed"
                >
                  Sold out
                </button>
              )}
            </div>

            {/* Social Sharing */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Share:</span>
              <div className="flex items-center gap-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(product.itemName)}&body=${encodeURIComponent(window.location.href)}`}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
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
      </div>
    </div>
  );
};

export default ProductDetail;

