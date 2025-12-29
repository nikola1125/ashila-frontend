import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo/Logo';

const Footer = () => {
  const [phoneMenuOpen, setPhoneMenuOpen] = useState(false);
  const phoneMenuRef = useRef(null);
  const phoneNumber = '+355686879292';
  const phoneDisplay = '+355 68 687 9292';
  const whatsappNumber = '355686879292';
  const mapUrl = 'https://maps.apple.com/?ll=&q=https://maps.apple/p/s7w-BbuA8NfGM_';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneMenuRef.current && !phoneMenuRef.current.contains(event.target)) {
        setPhoneMenuOpen(false);
      }
    };

    if (phoneMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [phoneMenuOpen]);

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
    setPhoneMenuOpen(false);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
    setPhoneMenuOpen(false);
  };

  return (
    <footer className="bg-[#F5EDE4] border-t border-[#D9BFA9]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 mb-4 md:mb-8">
          {/* Logo - First on mobile, last on desktop */}
          <div className="flex items-center justify-center md:justify-start md:order-4 -mt-4 md:mt-0">
            <div className="scale-125 md:scale-125 lg:scale-150">
              <Logo />
            </div>
          </div>

          {/* Logo and Mission */}
          <div className="col-span-1 md:col-span-2 md:order-1 -mt-2 md:mt-0">
            <h3 className="text-sm font-semibold text-[#A67856] mb-2 uppercase tracking-wide">Misioni</h3>
            <p className="text-sm text-[#4A3628] leading-relaxed">
              Misioni ynë është të sjellim këshillim të besueshëm dhe produkte të kuruara, që secili të gjejë zgjidhjen e duhur pa kompromis në cilësi. Ne u shërbejmë klientëve me transparencë, kujdes dhe evidencë shkencore.
            </p>
          </div>

          {/* Customer Care */}
          <div className="md:order-2 mt-6">
            <h3 className="text-sm font-semibold text-[#A67856] uppercase tracking-wide">
              Kujdesi ndaj Klientit
            </h3>

  {/* Content */}
  <div className="mt-2 flex flex-col md:space-y-2">
    {/* Email */}
    <a
      href="mailto:farmaciashila11@gmail.com"
      className="text-sm text-[#A67856] hover:text-[#8B5A3C] underline leading-relaxed"
    >
      farmaciashila11@gmail.com
    </a>

    {/* Phone */}
    <div className="relative -mt-4 md:mt-0" ref={phoneMenuRef}>
      <button
        type="button"
        onClick={() => setPhoneMenuOpen(!phoneMenuOpen)}
        className="text-sm text-[#A67856] hover:text-[#8B5A3C] underline leading-relaxed text-left bg-transparent border-0 block"
        style={{ marginLeft: 0, paddingLeft: 0, textAlign: 'left' }}
      >
        {phoneDisplay}
      </button>

      {phoneMenuOpen && (
        <div className="absolute left-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <button
            onClick={handleCall}
            className="w-full text-left px-4 py-2 text-sm text-[#4A3628] hover:bg-[#F5EDE4]"
          >
            Call
          </button>
          <button
            onClick={handleWhatsApp}
            className="w-full text-left px-4 py-2 text-sm text-[#4A3628] hover:bg-[#F5EDE4]"
          >
            Chat
          </button>
        </div>
      )}
    </div>

    {/* Address */}
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-[#A67856] hover:text-[#8B5A3C] underline leading-relaxed"
    >
      Shiko adresën
    </a>
  </div>
</div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-4 md:pt-8 text-center">
          <p className="text-sm text-[#4A3628] font-medium">
            © {new Date().getFullYear()} Ashila. Të gjitha të drejtat e rezervuara.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;