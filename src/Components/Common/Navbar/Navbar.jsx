import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../Context/Auth/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Cart from './Cart';
import CartSidebar from './CartSidebar';
import userLogo from '../../../assets/userLogo.png';
import Logo from '../Logo/Logo';
import { Search, ChevronDown, Menu, X, ChevronRight } from 'lucide-react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { publicApi } = useAxiosSecure();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);
  const [navHovered, setNavHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpenCategoryId, setMobileOpenCategoryId] = useState(null);
  const [mobileOpenGroupId, setMobileOpenGroupId] = useState(null);

  // Check if we're on shop page, product detail page, or cart page
  const isShopPage = location.pathname === '/shop' || location.pathname.startsWith('/product/') || location.pathname === '/cart';
  
  // Check if we're on home page
  const isHomePage = location.pathname === '/';

  // Fetch categories on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await publicApi.get('/categories');
        const cats = Array.isArray(res) ? res : (res?.result || res || []);
        if (mounted) setCategories(cats || []);
      } catch (err) {
        console.warn('Failed to fetch categories:', err);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();
    return () => (mounted = false);
  }, [publicApi]);

  // Handle scroll to make navbar visible - throttled with requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    let rafId = null;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsScrolled(scrollY > 50); // Show navbar after scrolling 50px
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event) => {
      const header = document.querySelector('header');
      if (header && !header.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
    
    // Use mousedown instead of click to avoid conflicts
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileOpenCategoryId(null);
    setMobileOpenGroupId(null);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const isNavbarVisible = navHovered || isScrolled;
  
  // On shop page, always show white navbar. On home page, transparent at top, white on scroll. Other pages always white.
  const shouldShowWhiteNavbar = isShopPage || isScrolled || !isHomePage;

  return (
    <header 
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        shouldShowWhiteNavbar
          ? 'bg-white shadow-sm' 
          : 'bg-transparent'
      }`}
      onMouseEnter={() => setNavHovered(true)}
      onMouseLeave={() => setNavHovered(false)}
    >
      {/* Promo Strip */}
      <div className="bg-[#946259] text-white text-xs py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <span className="text-center">Dërgesat në Tiranë 200 ALL dhe në qytetet e tjera 300 ALL. Shih artikujt e fundit në blog.</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`transition-all duration-300 ${
        shouldShowWhiteNavbar
          ? 'border-b border-gray-200 bg-white' 
          : 'border-b border-transparent bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo isScrolled={shouldShowWhiteNavbar} />
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
              <NavLink 
                to="/" 
                className={`font-medium transition-colors text-sm uppercase tracking-wide ${
                  shouldShowWhiteNavbar
                    ? 'text-gray-900 hover:text-gray-600'
                    : 'text-white hover:text-gray-200'
                }`}
              >
                Kreu
              </NavLink>

              {/* Dynamic Categories with 3-level hierarchy */}
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="relative group"
                  onMouseEnter={() => setOpenCategoryId(category._id)}
                  onMouseLeave={() => {
                    setOpenCategoryId(null);
                    setActiveGroup(null);
                  }}
                >
                  <button className={`flex items-center gap-1 font-medium transition-colors text-sm uppercase tracking-wide py-2 ${
                    shouldShowWhiteNavbar
                      ? 'text-gray-900 hover:text-gray-600'
                      : 'text-white hover:text-gray-200'
                  }`}>
                    {category.categoryName}
                    {category.groups && category.groups.length > 0 && (
                      <ChevronDown 
                        size={14} 
                        className={shouldShowWhiteNavbar ? 'text-gray-600' : 'text-white'} 
                      />
                    )}
                  </button>

                  {/* First Level: Groups */}
                  {category.groups && category.groups.length > 0 && (
                    <div className={`absolute left-0 top-full mt-1 w-56 bg-white shadow-md border border-gray-200 transition-all duration-200 py-1 rounded-sm z-20 ${
                      openCategoryId === category._id ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}>
                      {category.groups.map((group) => (
                        <div
                          key={group._id}
                          className="relative group/submenu"
                          onMouseEnter={() => setActiveGroup(`${category._id}-${group._id}`)}
                        >
                          {group.subitems && group.subitems.length > 0 ? (
                            <>
                              <button className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150">
                                {group.groupName}
                                <ChevronRight size={14} className="text-gray-400" />
                              </button>
                              {/* Second Level: Subitems */}
                              <div className={`absolute left-full top-0 ml-1 w-48 bg-white shadow-md border-2 border-[#d4d4c4] transition-all duration-200 py-1 z-20 ${
                                activeGroup === `${category._id}-${group._id}` ? 'opacity-100 visible' : 'opacity-0 invisible'
                              }`}>
                                {group.subitems.map((subitem) => (
                                  <NavLink
                                    key={subitem._id}
                                    to={`/shop?subcategory=${subitem.name.toLowerCase().replace(/\s+/g, '-')}`}
                                    onClick={() => {
                                      setActiveGroup(null);
                                      setOpenCategoryId(null);
                                    }}
                                    className="block px-4 py-2 text-sm text-[#946259] hover:bg-[#faf9f6] hover:text-[#946259] transition-all duration-150"
                                  >
                                    {subitem.name}
                                  </NavLink>
                                ))}
                              </div>
                            </>
                          ) : (
                            <NavLink
                              to={`/shop?group=${group.groupName.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={() => {
                                setActiveGroup(null);
                                setOpenCategoryId(null);
                              }}
                              className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                            >
                              {group.groupName}
                            </NavLink>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <NavLink 
                to="/contact" 
                className={`font-medium transition-colors text-sm uppercase tracking-wide ${
                  shouldShowWhiteNavbar
                    ? 'text-gray-900 hover:text-gray-600'
                    : 'text-white hover:text-gray-200'
                }`}
              >
                Kontakt
              </NavLink>
            </div>

            {/* Right Section: Search, Currency, Account, Cart */}
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              {/* Mobile Search Button - Opens menu with search */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`sm:hidden transition-colors ${shouldShowWhiteNavbar ? 'text-gray-900' : 'text-white'}`}
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="hidden sm:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`px-3 py-2 text-xs w-32 focus:outline-none focus:ring-2 border transition-all ${
                      shouldShowWhiteNavbar
                        ? 'border-[#d4d4c4] bg-white text-[#2c2c2c] placeholder-[#946259] focus:ring-[#946259] focus:border-[#946259]'
                        : 'border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:ring-white/50'
                    }`}
                  />
                  <button 
                    type="submit" 
                    className={`absolute right-2 top-1/2 -translate-y-1/2 transition ${
                      shouldShowWhiteNavbar
                        ? 'text-gray-500 hover:text-gray-700'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <Search size={16} />
                  </button>
                </div>
              </form>

              {/* Currency Display */}
              <div className="hidden md:block">
                <span className={`text-sm font-medium ${
                  shouldShowWhiteNavbar
                    ? 'text-gray-900'
                    : 'text-white'
                }`}>
                  ALL
                </span>
              </div>

              {/* Account Icon */}
              {user ? (
                <NavLink to="/profile" className="hover:opacity-80 transition-opacity">
                  <img 
                    src={user.photoURL || userLogo} 
                    alt="avatar" 
                    className={`w-7 h-7 object-cover ${shouldShowWhiteNavbar ? '' : 'brightness-0 invert'}`} 
                  />
                </NavLink>
              ) : (
                <NavLink 
                  to="/sign-up" 
                  className={`transition-colors ${
                    shouldShowWhiteNavbar
                      ? 'text-gray-900 hover:text-gray-700' 
                      : 'text-white hover:text-gray-200'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </NavLink>
              )}

              {/* Cart */}
              <Cart isScrolled={shouldShowWhiteNavbar} onCartClick={() => setCartOpen(true)} />

              {/* Mobile Menu Toggle */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(!mobileMenuOpen);
                }} 
                className={`lg:hidden transition-colors z-50 ${
                  shouldShowWhiteNavbar
                    ? 'text-gray-900 hover:text-gray-700'
                    : 'text-white hover:text-gray-200'
                }`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4 flex flex-col gap-0 bg-white max-h-[calc(100vh-120px)] overflow-y-auto z-50">
              {/* Mobile Search */}
              <div className="px-4 mb-4">
                <form onSubmit={(e) => {
                  handleSearch(e);
                  setMobileMenuOpen(false);
                }} className="relative">
                  <input
                    id="mobile-search-input"
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#d4d4c4] bg-white text-[#2c2c2c] placeholder-[#946259] focus:ring-2 focus:ring-[#946259] focus:border-[#946259] focus:outline-none"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <Search size={18} />
                  </button>
                </form>
              </div>

              {/* Mobile Navigation Links */}
              <NavLink 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:bg-gray-50 transition-colors px-4 py-3 border-b border-gray-100"
              >
                Kreu
              </NavLink>

              {/* Mobile Categories with Expandable Structure */}
              {categories.map((category) => (
                <div key={category._id} className="border-b border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileOpenCategoryId(
                        mobileOpenCategoryId === category._id ? null : category._id
                      );
                      setMobileOpenGroupId(null);
                    }}
                    className="w-full flex items-center justify-between text-gray-900 font-medium text-sm uppercase tracking-wide hover:bg-gray-50 transition-colors px-4 py-3"
                  >
                    <span>{category.categoryName}</span>
                    {category.groups && category.groups.length > 0 && (
                      <ChevronDown 
                        size={18} 
                        className={`text-gray-600 transition-transform ${
                          mobileOpenCategoryId === category._id ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Groups */}
                  {category.groups && category.groups.length > 0 && mobileOpenCategoryId === category._id && (
                    <div className="bg-gray-50">
                      {category.groups.map((group) => (
                        <div key={group._id}>
                          {group.subitems && group.subitems.length > 0 ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMobileOpenGroupId(
                                    mobileOpenGroupId === `${category._id}-${group._id}` 
                                      ? null 
                                      : `${category._id}-${group._id}`
                                  );
                                }}
                                className="w-full flex items-center justify-between text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors px-6 py-2.5"
                              >
                                <span>{group.groupName}</span>
                                <ChevronRight 
                                  size={16} 
                                  className={`text-gray-400 transition-transform ${
                                    mobileOpenGroupId === `${category._id}-${group._id}` ? 'rotate-90' : ''
                                  }`}
                                />
                              </button>
                              {/* Subitems */}
                              {mobileOpenGroupId === `${category._id}-${group._id}` && (
                                <div className="bg-white">
                                  {group.subitems.map((subitem) => (
                                    <NavLink
                                      key={subitem._id}
                                      to={`/shop?subcategory=${subitem.name.toLowerCase().replace(/\s+/g, '-')}`}
                                      onClick={() => {
                                        setMobileMenuOpen(false);
                                        setMobileOpenGroupId(null);
                                        setMobileOpenCategoryId(null);
                                      }}
                                      className="block text-[#946259] text-sm hover:bg-[#faf9f6] transition-colors px-8 py-2"
                                    >
                                      {subitem.name}
                                    </NavLink>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <NavLink
                              to={`/shop?group=${group.groupName.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileOpenCategoryId(null);
                              }}
                              className="block text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors px-6 py-2.5"
                            >
                              {group.groupName}
                            </NavLink>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <NavLink 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-900 font-medium text-sm uppercase tracking-wide hover:bg-gray-50 transition-colors px-4 py-3 border-b border-gray-100"
              >
                Kontakt
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};

export default Navbar;
