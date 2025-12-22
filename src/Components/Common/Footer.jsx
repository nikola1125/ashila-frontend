import React from 'react';


const Footer = () => {
  return (
    <footer className="bg-[#F5EDE4] border-t border-[#D9BFA9]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Mission */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-semibold text-[#A67856] mb-2 uppercase tracking-wide">Misioni</h3>
            <p className="text-sm text-[#4A3628] leading-relaxed">
              Misioni ynë është të sjellim këshillim të besueshëm dhe produkte të kuruara, që secili të gjejë zgjidhjen e duhur pa kompromis në cilësi. Ne u shërbejmë klientëve me transparencë, kujdes dhe evidencë shkencore.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-[#A67856] mb-4 uppercase tracking-wide">Kontakt</h3>
            <div className="space-y-2">
              <a href="mailto:farmaciashila11@gmail.com" className="block text-sm text-[#A67856] hover:text-[#A67856] transition-colors">
                farmaciashila11@gmail.com
              </a>
              <a href="tel:+355686879292" className="block text-sm text-[#A67856] hover:text-[#A67856] transition-colors">
                +355 68 687 9292
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