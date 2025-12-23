import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo/Logo';

const Footer = () => {
  const [phoneMenuOpen, setPhoneMenuOpen] = useState(false);
  const phoneMenuRef = useRef(null);
  const phoneNumber = '+355686879292';
  const phoneDisplay = '+355 68 687 9292';
  const whatsappNumber = '355686879292'; // Without + for WhatsApp
  const mapUrl = 'https://maps.apple.com/?ll=&q=https://maps.apple/p/s7w-BbuA8NfGM_';

  // Close menu when clicking outside
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Logo - First on mobile, last on desktop */}
          <div className="flex items-center justify-center md:justify-start md:order-4">
            <div className="scale-125 md:scale-100">
              <Logo />
            </div>
          </div>

          {/* Logo and Mission */}
          <div className="col-span-1 md:col-span-2 md:order-1">
            <h3 className="text-sm font-semibold text-[#A67856] mb-2 md:mb-2 uppercase tracking-wide">Misioni</h3>
            <p className="text-sm text-[#4A3628] leading-relaxed">
              Misioni ynë është të sjellim këshillim të besueshëm dhe produkte të kuruara, që secili të gjejë zgjidhjen e duhur pa kompromis në cilësi. Ne u shërbejmë klientëve me transparencë, kujdes dhe evidencë shkencore.
            </p>
          </div>

          {/* Customer Care */}
          <div className="md:order-2 mt-6 md:mt-0 md:ml-4">
            <h3 className="text-sm font-semibold text-[#A67856] mb-3 md:mb-4 uppercase tracking-wide">Kujdesi ndaj Klientit</h3>
            <div className="space-y-1.5">
              <a 
                href="mailto:farmaciashila11@gmail.com" 
                className="block text-sm text-[#A67856] hover:text-[#8B5A3C] transition-colors underline break-all text-left leading-normal"
              >
                farmaciashila11@gmail.com
              </a>
              
              {/* Phone with dropdown */}
              <div className="relative block -mt-5" ref={phoneMenuRef}>
                <button
                  type="button"
                  onClick={() => setPhoneMenuOpen(!phoneMenuOpen)}
                  className="block text-sm text-[#A67856] hover:text-[#8B5A3C] transition-colors underline text-left w-full p-0 m-0 bg-transparent border-0 appearance-none cursor-pointer leading-normal font-normal"
                  style={{ textAlign: 'left', padding: 0, margin: 0, lineHeight: 'normal' }}
                >
                  {phoneDisplay}
                </button>
                
                {phoneMenuOpen && (
                  <div className="absolute left-0 mt-2 w-44 md:w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleCall}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#4A3628] hover:bg-[#F5EDE4] transition-colors rounded-t-md flex items-center gap-2 active:bg-[#F5EDE4]"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#4A3628] hover:bg-[#F5EDE4] transition-colors rounded-b-md flex items-center gap-2 active:bg-[#F5EDE4]"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
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
                className="block text-sm text-[#A67856] hover:text-[#8B5A3C] transition-colors underline text-left leading-normal"
              >
                Shiko adresën
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Ashila. Të gjitha të drejtat e rezervuara.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;