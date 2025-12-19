import React from 'react';

const SectionHeader = ({ title, subtitle, right }) => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-2xl md:text-3xl font-extrabold text-amber-950">
          {title}
        </div>
        {subtitle ? <div className="text-sm text-gray-500 mt-1">{subtitle}</div> : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
};

export default SectionHeader;
