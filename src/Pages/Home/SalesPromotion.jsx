import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getNextProductImage } from '../../utils/productImages';

// Mock promotional data for demonstration
const mockPromotions = [
  {
    id: 1,
    title: 'Summer Health Sale',
    description: 'Get up to 50% off on summer essentials',
    discount: '50%',
    image: getNextProductImage(),
  },
  {
    id: 2,
    title: 'New Customer Special',
    description: 'First-time buyers get 25% off',
    discount: '25%',
    image: getNextProductImage(),
  },
  {
    id: 3,
    title: 'Bulk Purchase Bonus',
    description: 'Buy 3+ items and save 30%',
    discount: '30%',
    image: getNextProductImage(),
  },
];

const SalesPromotion = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
            🎉 Sales & Promotions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing deals, exclusive offers, and limited-time
            promotions on premium health products
          </p>
        </div>

        {/* Promotional Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockPromotions.map((promo) => (
            <div
              key={promo.id}
              className="relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/shop')}
            >
              <img
                src={promo.image}
                alt={promo.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 pill-badge font-bold text-lg">
                  {promo.discount} OFF
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {promo.title}
                </h3>
                <p className="text-white/90 mb-4">{promo.description}</p>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 w-fit">
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesPromotion;
