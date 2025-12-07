import React from 'react';
import { useNavigate } from 'react-router-dom';

const items = [
  { key: 'wrinkles', title: 'Rrudha', icon: '🌊' },
  { key: 'hyperpigmentation', title: 'Hiperpigmentim', icon: '🌙' },
  { key: 'oily-pores', title: 'Balancim yndyre', icon: '💧' },
  { key: 'dehydration', title: 'Dehidratim', icon: '🏜️' },
  { key: 'redness', title: 'Skuqje', icon: '🔴' },
  { key: 'rosacea', title: 'Rosacea', icon: '🌸' }
];

const AcneCategories = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-12">Bli sipas problematikës së lëkurës</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(`/shop?category=${item.key}`)}
              className="flex flex-col items-center gap-3 p-4 hover:bg-[#faf9f6] transition-all border-2 border-[#d4d4c4] bg-white shadow-sm hover:shadow-lg"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 bg-[#946259] flex items-center justify-center text-4xl border-2 border-[#946259]">
                {item.icon}
              </div>
              <p className="text-sm font-semibold text-[#946259] text-center leading-tight uppercase tracking-wide">
                {item.title}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AcneCategories;
