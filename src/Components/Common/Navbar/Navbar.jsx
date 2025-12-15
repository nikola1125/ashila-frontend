import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../../Context/Auth/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Cart from './Cart';
import CartSidebar from './CartSidebar';
import userLogo from '../../../assets/userLogo.png';
import Logo from '../Logo/Logo';
import { Search, ChevronDown, Menu, X, ChevronRight } from 'lucide-react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useThrottle } from '../../../hooks/useThrottle';


// Static navigation hierarchy for desktop & mobile menus
const NAV_CATEGORIES = [
  {
    id: 'face-care',
    label: 'Kujdesi per fytyren',
    groups: [
      {
        id: 'face-all',
        label: 'Te gjitha',
        path: '/shop?category=kujdesi-per-fytyren',
      },
      {
        id: 'skin-type',
        label: 'Tipi i lekures',
        subitems: [
          { id: 'skin-all', label: 'Te gjitha', path: '/shop?subcategory=tipi-i-lekures-te-gjitha' },
          { id: 'skin-normal', label: 'Lekure normale', path: '/shop?subcategory=lekure-normale' },
          { id: 'skin-oily', label: 'Lekure e yndyrshme', path: '/shop?subcategory=lekure-e-yndyrshme' },
          { id: 'skin-dry', label: 'Lekure e thate', path: '/shop?subcategory=lekure-e-thate' },
          { id: 'skin-combination', label: 'Lekure mikes', path: '/shop?subcategory=lekure-mikes' },
          { id: 'skin-sensitive', label: 'Lekure sensitive', path: '/shop?subcategory=lekure-sensitive' },
        ],
      },
      {
        id: 'skin-concerns',
        label: 'Problematikat e lekures',
        subitems: [
          { id: 'concern-acne', label: 'Akne', path: '/shop?subcategory=akne' },
          { id: 'concern-wrinkles', label: 'Rrudha', path: '/shop?subcategory=rrudha' },
          { id: 'concern-hyperpigmentation', label: 'Hiperpigmentim', path: '/shop?subcategory=hiperpigmentim' },
          { id: 'concern-oil-balance', label: 'Balancim yndyre/pore evidente', path: '/shop?subcategory=balancim-yndyre-pore-evidente' },
          { id: 'concern-blackheads', label: 'Pika te zeza', path: '/shop?subcategory=pika-te-zeza' },
          { id: 'concern-dehydration', label: 'Dehidratim', path: '/shop?subcategory=dehidratim' },
          { id: 'concern-redness', label: 'Skuqje', path: '/shop?subcategory=skuqje' },
          { id: 'concern-rosacea', label: 'Rozacea', path: '/shop?subcategory=rozacea' },
        ],
      },
    ],
  },
  {
    id: 'body-hair-care',
    label: 'Kujdesi per trupin & floke',
    groups: [
      {
        id: 'body-care',
        label: 'Per trupin',
        subitems: [
          { id: 'body-wash', label: 'Lares trupi', path: '/shop?subcategory=lares-trupi' },
          { id: 'body-moisturizer', label: 'Hidratues trupi', path: '/shop?subcategory=hidratues-trupi' },
          { id: 'body-scrub', label: 'Scrub  trupi', path: '/shop?subcategory=scrub-trupi' },
          { id: 'body-acne', label: 'Akne ne trup', path: '/shop?subcategory=akne-ne-trup' },
          { id: 'body-sun-care', label: 'Kujdesi ndaj diellit', path: '/shop?subcategory=kujdesi-ndaj-diellit' },
          { id: 'body-deodorant', label: 'Deodorant', path: '/shop?subcategory=deodorant' },
          { id: 'body-oil', label: 'Vaj per trupin', path: '/shop?subcategory=vaj-per-trupin' },
          { id: 'body-hands-feet', label: 'Krem per duart & kembet', path: '/shop?subcategory=krem-per-duart-dhe-kembet' },
        ],
      },
      {
        id: 'hair-care',
        label: 'Per floke',
        subitems: [
          { id: 'scalp-dry', label: 'Skalp i thate', path: '/shop?subcategory=skalp-i-thate' },
          { id: 'scalp-oily', label: 'Skalp i yndyrshem', path: '/shop?subcategory=skalp-i-yndyrshem' },
          { id: 'scalp-sensitive', label: 'Skalp sensitive', path: '/shop?subcategory=skalp-sensitive' },
          { id: 'hair-loss', label: 'Renia e flokut', path: '/shop?subcategory=renia-e-flokut' },
        ],
      },
    ],
  },
  {
    id: 'hygiene',
    label: 'Higjene',
    groups: [
      {
        id: 'intimate-hygiene',
        label: 'Higjena intime',
        subitems: [
          { id: 'intimate-wash', label: 'Lares intim', path: '/shop?subcategory=lares-intim' },
          { id: 'intimate-wipes', label: 'Peceta', path: '/shop?subcategory=peceta-intime' },
        ],
      },
      {
        id: 'oral-hygiene',
        label: 'Higjena orale',
        subitems: [
          { id: 'toothbrush', label: 'Furce dhembesh', path: '/shop?subcategory=furce-dhembesh' },
          { id: 'toothpaste', label: 'Paste dhembesh', path: '/shop?subcategory=paste-dhembesh' },
          { id: 'dental-floss', label: 'Fill dentar/furca interdentare', path: '/shop?subcategory=fill-dentar-furca-interdentare' },
        ],
      },
    ],
  },
  {
    id: 'mother-child',
    label: 'Nena & femije',
    groups: [
      {
        id: 'mother-care',
        label: 'Kujdesi per nenen',
        subitems: [
          { id: 'pregnancy', label: 'Shtatezania', path: '/shop?subcategory=shtatezania' },
          { id: 'postpartum', label: 'Pas lindjes', path: '/shop?subcategory=pas-lindjes' },
          { id: 'breastfeeding', label: 'Ushqyerja me gji', path: '/shop?subcategory=ushqyerja-me-gji' },
        ],
      },
      {
        id: 'child-care',
        label: 'Kujdesi per femijen',
        path: '/shop?subcategory=kujdesi-per-femijen',
      },
    ],
  },
  {
    id: 'supplements',
    label: 'Suplemente & vitamina',
    groups: [
      { id: 'vitamins', label: 'Vitamina', path: '/shop?subcategory=vitamina' },
      { id: 'health-supplements', label: 'Suplemente per shendetin', path: '/shop?subcategory=suplemente-per-shendetin' },
      { id: 'minerals', label: 'Minerale', path: '/shop?subcategory=minerale' },
      { id: 'herbal', label: 'Suplemente bimore', path: '/shop?subcategory=suplemente-bimore' },
    ],
  },
  {
    id: 'health-monitors',
    label: 'Monitoruesit e shendetit',
    groups: [
      { id: 'scales', label: 'Peshore', path: '/shop?subcategory=peshore' },
      { id: 'bp-monitor', label: 'Aparat tensioni', path: '/shop?subcategory=aparat-tensioni' },
      { id: 'thermometer', label: 'Termometer', path: '/shop?subcategory=termometer' },
      { id: 'diabetes-monitors', label: 'Monitorues te diabetit', path: '/shop?subcategory=monitorues-te-diabetit' },
      { id: 'oximeter', label: 'Oksimeter', path: '/shop?subcategory=oksimeter' },
      { id: 'orthopedic', label: 'Paisje ortopedike', path: '/shop?subcategory=paisje-ortopedike' },
    ],
  },
];

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

  // Check if we're on shop page, product detail page, cart page, or sign-up page
  const isShopPage = location.pathname === '/shop' || location.pathname.startsWith('/product/') || location.pathname === '/cart' || location.pathname === '/sign-up';
  // Check if we're on login or register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/sign-up';
    // Fetch categories on mount (kept for compatibility, but navbar uses NAV_CATEGORIES)
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
    let stateChangeTimeout = null;
    const isMobile = window.innerWidth < 1024; // lg breakpoint

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
            // Use slightly higher threshold for mobile but keep it responsive
            const scrollThreshold = isMobile ? 25 : 20;
            const newState = scrollY > scrollThreshold;
            
            // Lower threshold for faster response
            const minScrollDiff = isMobile ? 8 : 10;
            
            if (scrollDifference > minScrollDiff && newState !== lastState) {
              // Clear any pending state change
              if (stateChangeTimeout) {
                clearTimeout(stateChangeTimeout);
              }
              
              // Minimal delay on mobile for instant feel
              const delay = isMobile ? 10 : 0;
              
              stateChangeTimeout = setTimeout(() => {
                setIsScrolled(newState);
                lastScrollY = scrollY;
                lastState = newState;
              }, delay);
            } else if (scrollDifference > minScrollDiff) {
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
        // Use slightly higher threshold for mobile but keep it responsive
        const scrollThreshold = isMobile ? 25 : 20;
        const initialState = window.scrollY > scrollThreshold;
        setIsScrolled(initialState);
        lastState = initialState;
      }
    };
    
    // Check after render with slight delay to ensure accurate scroll position
    setTimeout(checkInitialScroll, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      if (stateChangeTimeout) {
        clearTimeout(stateChangeTimeout);
      }
    };
  }, [isShopPage]);

  // Ref to track last scroll position for mobile menu
  const mobileMenuLastScrollY = React.useRef(window.scrollY);

  // Handle scroll for mobile menu - defined at component level
  const handleMobileMenuScroll = useCallback(() => {
    if (!mobileMenuOpen) return;
    
    const currentScrollY = window.scrollY;
    const lastScrollY = mobileMenuLastScrollY.current;

    // iPhone fix: require real scroll, ignore minor Safari bounce (0–5px)
    if (Math.abs(currentScrollY - lastScrollY) < 10) return;

    // Only close when user scrolls DOWN at least 10px
    if (currentScrollY > lastScrollY) {
      setMobileMenuOpen(false);
    }

    mobileMenuLastScrollY.current = currentScrollY;
  }, [mobileMenuOpen]);

  // Throttle scroll handler for better performance - called at component level
  const throttledHandleMobileMenuScroll = useThrottle(handleMobileMenuScroll, 100);

  // Close mobile menu when clicking outside, scrolling, or on route change
  useEffect(() => {
    if (!mobileMenuOpen) return;

    mobileMenuLastScrollY.current = window.scrollY;

    const handleClickOutside = (event) => {
      // Don't close mobile menu if clicking on cart sidebar
      const cartSidebar = document.querySelector('[data-cart-sidebar]');
      const header = document.querySelector('header');
      if (cartSidebar && cartSidebar.contains(event.target)) {
        return; // Don't close mobile menu if clicking on cart
      }
      if (header && !header.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", throttledHandleMobileMenuScroll, { passive: true });
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", throttledHandleMobileMenuScroll);
      document.removeEventListener("click", handleClickOutside);
    };
}, [mobileMenuOpen, throttledHandleMobileMenuScroll]);

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
      className={`w-full fixed top-0 left-0 right-0 z-[100] transition-all duration-150 ${
        isScrolled || isShopPage || isAuthPage ? 'bg-white shadow-md' : 'bg-transparent'
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
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Main navbar wrapper - match original size/behavior */}
      <div
        className={`relative border-b transition-all duration-150 ${
          isScrolled || isShopPage || isAuthPage
            ? 'border-gray-200 bg-white'
            : 'border-transparent bg-transparent'
        }`}
      >
        {/* Navbar content: fixed height 64px mobile, 80px desktop */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[64px] lg:h-[80px] flex items-center justify-between gap-2 lg:gap-3">
            {/* Mobile: left menu button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className={`lg:hidden transition-colors z-50 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isScrolled || isAuthPage ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo - centered on mobile, left on desktop */}
            <div className="flex-shrink-0 flex-1 lg:flex-none flex justify-center lg:justify-start items-center absolute left-1/2 lg:relative lg:left-0 lg:transform-none transform -translate-x-1/2 z-10 lg:-ml-20">
              <div className="scale-75 lg:scale-75">
                <Logo />
              </div>
            </div>

            {/* Mobile: right search + cart */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => {
                  navigate('/shop');
                }}
                className={`transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${
                  isScrolled || isAuthPage ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
                }`}
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <Cart
                isScrolled={isScrolled || isShopPage || isAuthPage}
                onCartClick={() => setCartOpen(true)}
                iconSize={18}
              />
            </div>

            {/* Desktop: main nav + desktop search/cart */}
            <div className="hidden lg:flex items-center justify-between flex-1 ml-4">
              <div className="flex items-center gap-3 xl:gap-4">
                <NavLink
                  to="/"
                  onClick={() => {
                    if (location.pathname === '/') {
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }
                  }}
                  className="font-medium transition-colors text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap py-1 text-[#5A3F2A] hover:text-[#4A3320]"
                >
                  Kreu
                </NavLink>

                {NAV_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      navigate('/shop');
                    }}
                    className="font-medium transition-colors text-[10px] xl:text-xs uppercase tracking-wide whitespace-nowrap py-1 text-[#5A3F2A] hover:text-[#4A3320]"
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center">
                {!isShopPage && (
                  <button
                    onClick={() => {
                      navigate('/shop');
                    }}
                    className="transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center mr-3 text-[#5A3F2A] hover:text-[#4A3320]"
                    aria-label="Search"
                  >
                    <Search size={18} />
                  </button>
                )}

                <Cart useNavColors onCartClick={() => setCartOpen(true)} iconSize={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={`lg:hidden fixed top-full left-0 right-0 border-t border-gray-200 bg-white overflow-hidden z-40 shadow-lg transition-all duration-300 ease-out ${
          mobileMenuOpen
            ? 'opacity-100 translate-y-0 max-h-[calc(100vh-120px)] visible'
            : 'opacity-0 -translate-y-8 max-h-0 invisible pointer-events-none'
        }`}
        style={{ top: '100%' }}
      >
        <div
          className={`py-4 flex flex-col gap-0 max-h-[calc(100vh-140px)] overflow-y-auto ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <NavLink
            to="/"
            onClick={() => {
              setMobileMenuOpen(false);
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'instant' });
              }
            }}
            className="text-[#5A3F2A] font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3 border-b border-gray-200"
          >
            Kreu
          </NavLink>

          {NAV_CATEGORIES.map((category) => (
            <div key={category.id} className="border-b border-gray-100">
              <button
                onClick={() => {
                  if (mobileOpenCategoryId === category.id) {
                    setMobileOpenCategoryId(null);
                  } else {
                    setMobileOpenCategoryId(category.id);
                  }
                }}
                className="w-full text-left text-[#5A3F2A] font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3 flex items-center justify-between"
              >
                {category.label}
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    mobileOpenCategoryId === category.id ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {mobileOpenCategoryId === category.id && (
                <div className="bg-gray-50">
                  {category.groups.map((group) => (
                    <NavLink
                      key={group.id}
                      to={group.path}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileOpenCategoryId(null);
                      }}
                      className="block text-[#5A3F2A] text-sm hover:bg-gray-100 transition-colors px-6 py-2.5"
                    >
                      {group.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}

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
              className="text-[#5A3F2A] font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3 border-b border-gray-200"
            >
              Sign Up
            </NavLink>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};

export default Navbar;