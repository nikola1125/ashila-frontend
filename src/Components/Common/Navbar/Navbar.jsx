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
  
  // Handle scroll to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
          setIsScrolled(scrollY > 20); // Show white navbar after scrolling 20px
          ticking = false;
        });
        ticking = true;
      }
    };

    // Check initial scroll position after a brief delay to ensure page is loaded
    // Only set to true if actually scrolled, otherwise keep it false (transparent)
    const checkInitialScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    // Use setTimeout to check after render
    setTimeout(checkInitialScroll, 0);

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

  return (
    <header 
      className={`w-full fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'
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
        willChange: 'transform',
        WebkitOverflowScrolling: 'touch',
        visibility: 'visible',
        opacity: 1
      }}
    >
      {/* Main Navbar */}
      <nav className={`relative border-b transition-all duration-300 ${
        isScrolled ? 'border-gray-200 bg-white' : 'border-transparent bg-transparent'
      }`}>
        <div className="max-w-[95%] mx-auto px-4 md:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between gap-3">
            {/* Mobile Menu Button - Left Side */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }} 
              className="lg:hidden transition-colors z-50 text-black hover:text-gray-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo - shifted slightly right on mobile */}
            <div className="flex-shrink-0 flex-1 lg:flex-none flex justify-center lg:justify-start pl-10 sm:pl-12 lg:pl-0">
              <Logo />
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-4 flex-1 justify-center">
              <NavLink 
                to="/" 
                    onClick={() => {
                      if (location.pathname === '/') {
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }
                    }}
                    className="font-medium transition-colors text-xs uppercase tracking-wide whitespace-nowrap text-black hover:text-gray-700"
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
                  <button className="flex items-center gap-1 font-medium transition-colors text-xs uppercase tracking-wide py-2 whitespace-nowrap text-black hover:text-gray-700">
                    {category.categoryName}
                    {category.groups && category.groups.length > 0 && (
                      <ChevronDown 
                        size={12} 
                        className="text-gray-700" 
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
                className="font-medium transition-colors text-xs uppercase tracking-wide whitespace-nowrap text-black hover:text-gray-700"
              >
                Kontakt
              </NavLink>
            </div>

            {/* Right Section: Search and Cart (Mobile) / Search, Account, Cart (Desktop) */}
            <div className="flex items-center gap-2 lg:gap-4 lg:ml-auto">
              {/* Mobile Search Icon - Right Side */}
              {!isShopPage && (
                <button
                  onClick={() => navigate('/shop')}
                  className="lg:hidden transition-colors text-black hover:text-gray-700"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              )}

              {/* Desktop Search Icon - Hidden on shop page */}
              {!isShopPage && (
              <button
                  onClick={() => {
                    navigate('/shop');
                  }}
                  className="hidden lg:block transition-colors text-black hover:text-gray-700"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              )}

              {/* Account Dropdown - Desktop Only */}
              {user ? (
                <div 
                  className="hidden lg:block relative"
                  onMouseEnter={() => setAccountDropdownOpen(true)}
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                >
                  <button 
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-1 font-medium transition-colors text-xs uppercase tracking-wide whitespace-nowrap text-black hover:text-gray-700"
                  >
                    Account
                    <ChevronDown 
                      size={12} 
                      className={`text-gray-600 transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`}
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
                  className="hidden lg:block font-medium transition-colors text-xs uppercase tracking-wide whitespace-nowrap text-black hover:text-gray-700"
                >
                  Account
                </NavLink>
              )}

              {/* Cart - Smaller on Mobile */}
              <div className="lg:hidden">
                <Cart onCartClick={() => setCartOpen(true)} iconSize={18} />
              </div>
              <div className="hidden lg:block">
                <Cart onCartClick={() => setCartOpen(true)} iconSize={20} />
              </div>
            </div>
          </div>

          {/* Mobile Menu with Animation */}
          <div 
            className={`lg:hidden fixed top-full left-0 right-0 border-t border-gray-200 bg-white overflow-hidden z-50 shadow-lg transition-all duration-500 ease-out ${
              mobileMenuOpen 
                ? 'opacity-100 translate-y-0 max-h-[calc(100vh-120px)] visible' 
                : 'opacity-0 -translate-y-8 max-h-0 invisible pointer-events-none'
            }`}
          >
        <div className="py-4 flex flex-col gap-0 max-h-[calc(100vh-140px)] overflow-y-auto">

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
                              className="block text-white font-medium text-sm hover:bg-white/10 transition-colors px-6 py-2.5"
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
