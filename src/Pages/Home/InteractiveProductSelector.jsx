import React from 'react';

const InteractiveProductSelector = () => {
  return (
    <section
      className="w-full flex justify-center items-center"
      style={{
        backgroundColor: '#ffffff', // Matches page background
        paddingTop: 'clamp(0px, 10vh, 120px)',
        paddingBottom: 'clamp(80px, 10vh, 120px)',
      }}
    >
      <div className="max-w-[480px] px-6 text-center">
        {/* Optional decorative divider */}
        <div
          className="mx-auto mb-8 h-[1px] w-[60px]"
          style={{ backgroundColor: 'rgba(74, 54, 40, 0.3)' }}
        ></div>

        {/* Title */}
        <h2
          className="mb-6 text-[1.25rem] md:text-[1.5rem]"
          style={{
            fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
            color: '#4A3628',
            fontWeight: 500,
            letterSpacing: '0.05em'
          }}
        >
          Ndal për një moment.
        </h2>

        {/* Body Text */}
        <p
          className="text-[0.95rem] md:text-[1.05rem]"
          style={{
            fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
            color: '#4A3628',
            opacity: 0.9,
            lineHeight: 1.8,
            fontWeight: 400
          }}
        >
          Në fund të kësaj faqeje, kujtojmë se kujdesi cilësor nuk ka të bëjë me sasinë por me zgjedhjen e duhur.
        </p>
      </div>
    </section>
  );
};

export default InteractiveProductSelector;
