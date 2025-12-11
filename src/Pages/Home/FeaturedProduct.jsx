import React from 'react';

const FeaturedProduct = ({ title = 'Featured Product', description, image }) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-gray-700 mb-6">{description || 'Discover our featured product with great benefits. Carefully selected for quality and efficacy.'}</p>
          <ul className="text-gray-600 space-y-2 mb-6">
            <li>• High-quality ingredients</li>
            <li>• Clinically tested</li>
            <li>• Fast-acting and safe</li>
          </ul>
          <a href="/shop" className="inline-block bg-[#946259] text-white py-3 px-6 font-bold hover:bg-[#7a4f47] transition-all duration-200 border-2 border-[#946259] uppercase tracking-wide">Shop Now</a>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white shadow-md border-2 border-[#d4d4c4] p-6">
            <img 
              src={image || '/placeholder.png'} 
              alt={title} 
              loading="lazy"
              className="w-full h-72 object-contain" 
              onError={(e) => {
                e.target.src = '/placeholder.png';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProduct;
