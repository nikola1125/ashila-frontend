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
  const { user, signOutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { publicApi } = useAxiosSecure();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null);
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpenCategoryId, setMobileOpenCategoryId] = useState(null);
  const [mobileOpenGroupId, setMobileOpenGroupId] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  // Check if we're on shop page, product detail page, or cart page
  const isShopPage = location.pathname === '/shop' || location.pathname.startsWith('/product/') || location.pathname === '/cart';
  
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

  // Handle scroll to make navbar visible - optimized single handler with debounce
  useEffect(() => {
    let ticking = false;
    let rafId = null;
    let lastScrollY = 0;
    let scrollTimeout = null;
    let lastState = false;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const scrollDifference = Math.abs(scrollY - lastScrollY);
          
          // On shop page, always show white navbar. On home page, show after scrolling
          if (isShopPage) {
            if (!lastState) {
              setIsScrolled(true); // Always white navbar on shop page
              lastState = true;
            }
          } else {
            // Only update if scroll difference is significant AND state would actually change
            const newState = scrollY > 20;
            if (scrollDifference > 10 && newState !== lastState) {
              setIsScrolled(newState);
              lastScrollY = scrollY;
              lastState = newState;
            } else if (scrollDifference > 10) {
              lastScrollY = scrollY;
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    // Check initial scroll position
    const checkInitialScroll = () => {
      lastScrollY = window.scrollY;
      // On shop page, always show white navbar
      if (isShopPage) {
        setIsScrolled(true);
        lastState = true;
      } else {
        const initialState = window.scrollY > 20;
        setIsScrolled(initialState);
        lastState = initialState;
      }
    };
    
    // Check after render
    setTimeout(checkInitialScroll, 0);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [isShopPage]);

  // Close mobile menu when clicking outside, scrolling, or on route change
  useEffect(() => {
    if (!mobileMenuOpen) return;

    let lastScrollY = window.scrollY;
    let scrollTimeout = null;

    const handleClickOutside = (event) => {
      const header = document.querySelector('header');
      if (header && !header.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Close menu when scrolling down (more than 10px difference)
      if (currentScrollY > lastScrollY + 10) {
        setMobileMenuOpen(false);
      }
      lastScrollY = currentScrollY;
    };

    // Allow scrolling but close menu on scroll
    // Use mousedown instead of click to avoid conflicts
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
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

  return (
    <header 
      className={`w-full fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled || isShopPage ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        WebkitTransform: 'translate3d(0, 0, 0)',
        transform: 'translate3d(0, 0, 0)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        willChange: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Main Navbar */}
      <nav className={`relative border-b transition-all duration-300 ${
        isScrolled || isShopPage ? 'border-gray-200 bg-white' : 'border-transparent bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2 sm:py-2.5 lg:py-2 flex items-center justify-between gap-2 lg:gap-3">
            {/* Mobile Menu Button - Left Side */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }} 
              className={`lg:hidden transition-colors z-50 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isScrolled ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo - Mobile: Centered, Desktop: Left inside navbar */}
            <div className="flex-shrink-0 flex-1 lg:flex-none lg:flex lg:justify-start flex justify-center items-center absolute left-1/2 lg:relative lg:left-0 lg:transform-none transform -translate-x-1/2 z-10">
              <Logo />
            </div>

            {/* Desktop Menu - All items centered */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-4 justify-center flex-1">
              <NavLink 
                to="/" 
                    onClick={() => {
                      if (location.pathname === '/') {
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }
                    }}
                    className={`font-medium transition-colors text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap py-1 ${
                      isScrolled ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
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
                  <button className={`flex items-center gap-1 font-medium transition-colors text-[10px] xl:text-xs uppercase tracking-wide py-1 whitespace-nowrap ${
                    isScrolled ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
                  }`}>
                    {category.categoryName}
                    {category.groups && category.groups.length > 0 && (
                      <ChevronDown 
                        size={10} 
                        className={isScrolled ? 'text-gray-700' : 'text-white/80'} 
                      />
                    )}
                  </button>

                  {/* First Level: Groups */}
                  {category.groups && category.groups.length > 0 && (
                    <div className={`absolute left-0 top-full mt-1 w-56 bg-white shadow-md border border-gray-200 py-1 rounded-sm z-20 transition-all duration-300 ease-out ${
                      openCategoryId === category._id 
                        ? 'opacity-100 translate-y-0 visible' 
                        : 'opacity-0 -translate-y-2 invisible'
                    }`}>
                      {category.groups.map((group) => (
                        <div
                          key={group._id}
                          className="relative group/submenu"
                          onMouseEnter={() => setActiveGroup(`${category._id}-${group._id}`)}
                        >
                          {group.subitems && group.subitems.length > 0 ? (
                            <>
                              <button className="flex items-center justify-between w-full px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors duration-150">
                                {group.groupName}
                                <ChevronRight size={14} className="text-gray-600" />
                              </button>
                              {/* Second Level: Subitems */}
                              <div className={`absolute left-full top-0 ml-1 w-48 bg-white shadow-md border border-gray-200 py-1 z-20 transition-all duration-300 ease-out ${
                                activeGroup === `${category._id}-${group._id}` 
                                  ? 'opacity-100 translate-x-0 visible' 
                                  : 'opacity-0 -translate-x-2 invisible'
                              }`}>
                                {group.subitems.map((subitem) => (
                                  <NavLink
                                    key={subitem._id}
                                    to={`/shop?subcategory=${subitem.name.toLowerCase().replace(/\s+/g, '-')}`}
                                    onClick={() => {
                                      setActiveGroup(null);
                                      setOpenCategoryId(null);
                                    }}
                                    className="block px-4 py-2 text-sm text-black hover:bg-gray-100 transition-all duration-150"
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
                              className="flex items-center justify-between w-full px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors duration-150"
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
                className={`font-medium transition-colors text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap py-1 ${
                  isScrolled ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
                }`}
              >
                Kontakt
              </NavLink>

              {/* Desktop Search Icon - Part of centered menu */}
              {!isShopPage && (
              <button
                  onClick={() => {
                    navigate('/shop');
                  }}
                  className={`hidden lg:block transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                    isScrolled ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
                  }`}
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              )}

              {/* Account Dropdown - Desktop Only, Part of centered menu */}
              {user ? (
                <div 
                  className="hidden lg:block relative"
                  onMouseEnter={() => setAccountDropdownOpen(true)}
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                >
                  <button 
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className={`flex items-center gap-1 font-medium transition-colors text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap py-1 ${
                      isScrolled ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
                    }`}
                  >
                    Account
                    <ChevronDown 
                      size={10} 
                      className={`transition-transform ${accountDropdownOpen ? 'rotate-180' : ''} ${
                        isScrolled ? 'text-gray-600' : 'text-white/80'
                      }`}
                    />
                  </button>
                  
                  {/* Account Dropdown Menu */}
                  {accountDropdownOpen && (
                    <div 
                      className="absolute right-0 top-full mt-1 w-48 bg-white shadow-md border border-gray-200 py-1 rounded-sm z-20"
                      onMouseEnter={() => setAccountDropdownOpen(true)}
                      onMouseLeave={() => setAccountDropdownOpen(false)}
                    >
                      <NavLink
                        to="/dashboard"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors duration-150"
                      >
                        Account
                      </NavLink>
                  <button 
                        onClick={async () => {
                          try {
                            await signOutUser();
                            setAccountDropdownOpen(false);
                            navigate('/');
                          } catch (error) {
                            console.error('Logout error:', error);
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors duration-150"
                  >
                        Log out
                  </button>
                </div>
                  )}
              </div>
              ) : (
                <NavLink 
                  to="/sign-up" 
                  className={`hidden lg:block font-medium transition-colors text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap py-1 ${
                    isScrolled ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
                  }`}
                >
                  Account
                </NavLink>
              )}

              {/* Cart - Part of centered menu on desktop */}
              <div className="hidden lg:block">
                <Cart isScrolled={isScrolled} onCartClick={() => setCartOpen(true)} iconSize={18} />
              </div>
            </div>

            {/* Mobile Right Section: Search and Cart - Very close together */}
            <div className="flex items-center gap-0 lg:hidden ml-auto">
              {/* Mobile Search Icon - Right Side */}
              {!isShopPage && (
                <button
                  onClick={() => navigate('/shop')}
                  className={`transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-3 ${
                    isScrolled || isShopPage ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
                  }`}
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              )}

              {/* Cart - Mobile */}
              <Cart isScrolled={isScrolled || isShopPage} onCartClick={() => setCartOpen(true)} iconSize={18} />
            </div>
          </div>

          {/* Mobile Menu with Animation */}
          <div 
            className={`lg:hidden fixed top-full left-0 right-0 border-t border-gray-200 bg-white overflow-hidden z-40 shadow-lg transition-all duration-300 ease-out ${
              mobileMenuOpen 
                ? 'opacity-100 translate-y-0 max-h-[calc(100vh-120px)] visible' 
                : 'opacity-0 -translate-y-8 max-h-0 invisible pointer-events-none'
            }`}
            style={{ top: '100%' }}
          >
        <div className={`py-4 flex flex-col gap-0 max-h-[calc(100vh-140px)] overflow-y-auto ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0'
        }`}>

              {/* Mobile Navigation Links */}
              <NavLink 
                to="/" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }
                }}
                className="text-black font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3 border-b border-gray-200"
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
                    className="w-full flex items-center justify-between text-black font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3"
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
                    <div className="bg-transparent overflow-hidden transition-all duration-300">
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
                                className="w-full flex items-center justify-between text-black font-medium text-sm hover:bg-gray-100 transition-colors px-6 py-2.5"
                              >
                                <span>{group.groupName}</span>
                                <ChevronRight 
                                  size={16} 
                                  className={`text-gray-400 transition-transform duration-300 ${
                                    mobileOpenGroupId === `${category._id}-${group._id}` ? 'rotate-90' : ''
                                  }`}
                                />
                              </button>
                              {/* Subitems */}
                              {mobileOpenGroupId === `${category._id}-${group._id}` && (
                                <div className={`bg-transparent overflow-hidden transition-all duration-300 ease-out ${
                                  mobileOpenGroupId === `${category._id}-${group._id}`
                                    ? 'max-h-96 opacity-100'
                                    : 'max-h-0 opacity-0'
                                }`}>
                                  {group.subitems.map((subitem) => (
                                    <NavLink
                                      key={subitem._id}
                                      to={`/shop?subcategory=${subitem.name.toLowerCase().replace(/\s+/g, '-')}`}
                                      onClick={() => {
                                        setMobileMenuOpen(false);
                                        setMobileOpenGroupId(null);
                                        setMobileOpenCategoryId(null);
                                      }}
                                      className="block text-black text-sm hover:bg-gray-100 transition-colors px-8 py-2"
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
                              className="block text-black font-medium text-sm hover:bg-gray-100 transition-colors px-6 py-2.5"
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
                className="text-black font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3 border-b border-gray-200"
              >
                Kontakt
              </NavLink>

              {/* Account in Mobile Menu */}
              {user ? (
                <>
                  <NavLink 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-black font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3 border-b border-gray-200"
                  >
                    Account
                  </NavLink>
                  <button
                    onClick={async () => {
                      try {
                        await signOutUser();
                        setMobileMenuOpen(false);
                        navigate('/');
                      } catch (error) {
                        console.error('Logout error:', error);
                      }
                    }}
                    className="w-full text-left text-black font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3 border-b border-gray-200"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <NavLink 
                  to="/sign-up" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-black font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3 border-b border-gray-200"
                >
                  Sign Up
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};

export default Navbar;
