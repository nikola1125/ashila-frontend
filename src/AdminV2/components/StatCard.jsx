import React from 'react';

const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="bg-white border border-amber-100 rounded-2xl shadow-sm p-5">
      <div className="text-xs uppercase tracking-widest text-amber-700 font-semibold">
        {title}
      </div>
      <div className="mt-2 text-2xl font-bold text-amber-950">{value}</div>
      {subtitle ? (
        <div className="mt-1 text-sm text-gray-500">{subtitle}</div>
      ) : null}
    </div>
  );
};

export default StatCard;
