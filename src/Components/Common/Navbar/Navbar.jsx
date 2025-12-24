import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthContext } from '../../../Context/Auth/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Cart from './Cart';
import CartSidebar from './CartSidebar';
import userLogo from '../../../assets/userLogo.png';
import Logo from '../Logo/Logo';
import { Search, ChevronDown, Menu, X, ChevronRight } from 'lucide-react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useThrottle } from '../../../hooks/useThrottle';
import SearchModal from './SearchModal';


// Static navigation hierarchy for desktop & mobile menus
// Static navigation hierarchy for desktop & mobile menus
const NAV_CATEGORIES = [
  {
    id: 'face-care',
    label: 'Kujdesi per fytyren',
    groups: [
      {
        id: 'skin-type',
        label: 'Tipi i lekures',
        subitems: [
          { id: 'skin-all', label: 'Te gjitha', path: '/shop?subcategory=te-gjitha' },
          { id: 'skin-normal', label: 'Lekure normale', path: '/shop?subcategory=lekure-normale' },
          { id: 'skin-oily', label: 'Lekure e yndyrshme', path: '/shop?subcategory=lekure-e-yndyrshme' },
          { id: 'skin-dry', label: 'Lekure e thate', path: '/shop?subcategory=lekure-e-thate' },
          { id: 'skin-combo', label: 'Lekure mikse', path: '/shop?subcategory=lekure-mikes' },
          { id: 'skin-sensitive', label: 'Lekure sensitive', path: '/shop?subcategory=lekure-sensitive' },
        ],
      },
      {
        id: 'skin-concerns',
        label: 'Problematikat e lekures',
        subitems: [
          { id: 'acne', label: 'Akne', path: '/shop?subcategory=akne' },
          { id: 'wrinkles', label: 'Rrudha', path: '/shop?subcategory=rrudha' },
          { id: 'hyperpigmentation', label: 'Hiperpigmentim', path: '/shop?subcategory=hiperpigmentim' },
          { id: 'pores', label: 'Balancim yndyre/pore evidente', path: '/shop?subcategory=balancim-yndyre-pore-evidente' },
          { id: 'blackheads', label: 'Pika te zeza', path: '/shop?subcategory=pika-te-zeza' },
          { id: 'dehydration', label: 'Dehidratim', path: '/shop?subcategory=dehidratim' },
          { id: 'redness', label: 'Skuqje', path: '/shop?subcategory=skuqje' },
          { id: 'rosacea', label: 'Rozacea', path: '/shop?subcategory=rozacea' },
        ],
      },
    ],
  },
  {
    id: 'body-hair',
    label: 'Kujdesi per trupin dhe floke',
    groups: [
      {
        id: 'body',
        label: 'Per trupin',
        subitems: [
          { id: 'body-wash', label: 'Lares trupi', path: '/shop?subcategory=lares-trupi' },
          { id: 'body-moist', label: 'Hidratues trupi', path: '/shop?subcategory=hidratues-trupi' },
          { id: 'body-scrub', label: 'Scrub trupi', path: '/shop?subcategory=scrub-trupi' },
          { id: 'body-acne', label: 'Akne ne trup', path: '/shop?subcategory=akne-ne-trup' },
          { id: 'sun-care', label: 'Kujdesi ndaj diellit', path: '/shop?subcategory=kujdesi-ndaj-diellit' },
          { id: 'deodorant', label: 'Deodorant', path: '/shop?subcategory=deodorant' },
          { id: 'body-oil', label: 'Vaj per trupin', path: '/shop?subcategory=vaj-per-trupin' },
          { id: 'hands-feet', label: 'Krem per duart & kembet', path: '/shop?subcategory=krem-per-duart-dhe-kembet' },
        ],
      },
      {
        id: 'hair',
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
        id: 'intimate',
        label: 'Higjena intime',
        subitems: [
          { id: 'intimate-wash', label: 'Lares intim', path: '/shop?subcategory=lares-intim' },
          { id: 'intimate-wipes', label: 'Peceta', path: '/shop?subcategory=peceta' },
        ],
      },
      {
        id: 'oral',
        label: 'Higjena orale',
        subitems: [
          { id: 'toothbrush', label: 'Furce dhembesh', path: '/shop?subcategory=furce-dhembesh' },
          { id: 'toothpaste', label: 'Paste dhembesh', path: '/shop?subcategory=paste-dhembesh' },
          { id: 'floss', label: 'Fill dentar/furca interdentare', path: '/shop?subcategory=fill-dentar-furca-interdentare' },
        ],
      },
    ],
  },
  {
    id: 'mom-child',
    label: 'Nena dhe femije',
    groups: [
      {
        id: 'mom',
        label: 'Kujdesi per nenen',
        subitems: [
          { id: 'pregnancy', label: 'Shtatezania', path: '/shop?subcategory=shtatezania' },
          { id: 'post-birth', label: 'Pas lindjes', path: '/shop?subcategory=pas-lindjes' },
          { id: 'breastfeeding', label: 'Ushqyerja me gji', path: '/shop?subcategory=ushqyerja-me-gji' },
        ],
      },
      {
        id: 'child',
        label: 'Kujdesi per femije',
        path: '/shop?category=nena-dhe-femije&subcategory=kujdesi-per-femije', // User gave no options, so linking to generic subcat
      },
    ],
  },
  {
    id: 'supplements',
    label: 'Suplemente dhe vitamina',
    groups: [
      { id: 'vitamins', label: 'Vitamina', path: '/shop?subcategory=vitamina' },
      { id: 'health-supp', label: 'Suplemente per shendetin', path: '/shop?subcategory=suplemente-per-shendetin' },
      { id: 'minerals', label: 'Minerale', path: '/shop?subcategory=minerale' },
      { id: 'herbal', label: 'Suplemente bimore', path: '/shop?subcategory=suplemente-bimore' },
    ],
  },
  {
    id: 'monitors',
    label: 'Monitoruesit e shendetit',
    groups: [
      { id: 'scales', label: 'Peshore', path: '/shop?subcategory=peshore' },
      { id: 'bp', label: 'Aparat tensioni', path: '/shop?subcategory=aparat-tensioni' },
      { id: 'thermometer', label: 'Termometer', path: '/shop?subcategory=termometer' },
      { id: 'diabetes', label: 'Monitorues te diabetit', path: '/shop?subcategory=monitorues-te-diabetit' },
      { id: 'oximeter', label: 'Oksimeter', path: '/shop?subcategory=oksimeter' },
      { id: 'ortho', label: 'Paisje ortopedike', path: '/shop?subcategory=paisje-ortopedike' },
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
  // Desktop hover state for mega menu
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpenCategoryId, setMobileOpenCategoryId] = useState(null);
  const [mobileOpenGroupId, setMobileOpenGroupId] = useState(null);
  // Desktop: which group inside a category is hovered/active in the mega menu
  const [desktopOpenGroupId, setDesktopOpenGroupId] = useState(null);
  const desktopMenuCloseTimeoutRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cancelDesktopMenuClose = useCallback(() => {
    if (desktopMenuCloseTimeoutRef.current) {
      clearTimeout(desktopMenuCloseTimeoutRef.current);
      desktopMenuCloseTimeoutRef.current = null;
    }
  }, []);

  const scheduleDesktopMenuClose = useCallback(() => {
    cancelDesktopMenuClose();
    desktopMenuCloseTimeoutRef.current = setTimeout(() => {
      setOpenCategoryId(null);
      setDesktopOpenGroupId(null);
      desktopMenuCloseTimeoutRef.current = null;
    }, 150);
  }, [cancelDesktopMenuClose]);

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
                // Start transition lock
                setIsTransitioning(true);

                setIsScrolled(newState);
                lastScrollY = scrollY;
                lastState = newState;

                // Release transition lock after CSS duration (150ms) + small buffer
                setTimeout(() => {
                  setIsTransitioning(false);
                }, 200);
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
    <>
      <header
        className={`w-full fixed top-0 left-0 right-0 z-[100] transition-all duration-150 ${isScrolled || isShopPage || isAuthPage ? 'bg-white shadow-md' : 'bg-transparent'
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
          className={`relative border-b transition-all duration-150 ${isScrolled || isShopPage || isAuthPage
            ? 'border-gray-200 bg-white'
            : 'border-transparent bg-transparent'
            }`}
        >
          {/* Navbar content: fixed height 64px mobile, 80px desktop */}
          <div className="w-full mx-auto px-2 sm:px-4 lg:px-4 xl:px-6">
            <div className="h-[64px] lg:h-[80px] flex items-center gap-1 lg:gap-2 lg:justify-start">
              {/* Mobile: left menu button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className={`lg:hidden transition-colors z-50 min-h-[44px] min-w-[44px] flex items-center justify-center ${isScrolled || isAuthPage ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
                  }`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Logo - centered on mobile, left on desktop */}
              <div className="flex-1 flex justify-end lg:flex-none lg:justify-start items-center">
                <div className="scale-75 lg:scale-75">
                  <Logo />
                </div>
              </div>

              {/* Mobile: right search + cart */}
              <div className="flex items-center gap-0.5 lg:hidden relative z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchOpen(true);
                  }}
                  className={`transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${isScrolled || isAuthPage ? 'text-black hover:text-gray-700' : 'text-white hover:text-gray-200'
                    }`}
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>

                <Cart
                  isScrolled={isScrolled || isShopPage || isAuthPage}
                  onCartClick={() => setCartOpen(true)}
                  iconSize={18}
                  disabled={isTransitioning}
                  forceBlack={isScrolled || isShopPage || isAuthPage}
                />
              </div>

              {/* Desktop: main nav + desktop search/cart */}
              <div className="hidden lg:flex items-center flex-1 ml-2">
                <div className="w-full flex items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-center gap-1.5 xl:gap-2">
                      <NavLink
                        to="/"
                        onClick={() => {
                          if (location.pathname === '/') {
                            window.scrollTo({ top: 0, behavior: 'instant' });
                          }
                        }}
                        className="font-medium transition-colors text-[9px] xl:text-[10px] uppercase tracking-wide whitespace-nowrap py-1 text-[#5A3F2A] hover:text-[#4A3320]"
                      >
                        Kreu
                      </NavLink>

                      {/* Desktop categories with hover mega-menu */}
                      {NAV_CATEGORIES.map((category) => {
                        const defaultPath =
                          category.groups?.find((g) => g.path)?.path ||
                          category.groups?.find((g) => g.subitems?.[0]?.path)?.subitems[0].path ||
                          '/shop';

                        return (
                          <div
                            key={category.id}
                            className="relative group"
                            onMouseEnter={() => {
                              cancelDesktopMenuClose();
                              setOpenCategoryId(category.id);
                              setDesktopOpenGroupId(null);
                            }}
                            onMouseLeave={() => {
                              scheduleDesktopMenuClose();
                            }}
                          >
                            <button
                              onClick={() => navigate(defaultPath)}
                              className="flex items-center gap-0.5 font-medium transition-colors text-[9px] xl:text-[10px] uppercase tracking-wide whitespace-nowrap py-1 text-[#5A3F2A] hover:text-[#4A3320]"
                            >
                              {category.label}
                              <ChevronDown className="w-2.5 h-2.5" />
                            </button>

                        {category.groups && category.groups.length > 0 && (
                          <div
                            className={`absolute left-0 mt-2 bg-white rounded-none shadow-md border border-gray-200 py-0 z-[120] transform transition-all duration-200 ${openCategoryId === category.id ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                              }`}
                            onMouseEnter={() => {
                              cancelDesktopMenuClose();
                              setOpenCategoryId(category.id);
                            }}
                            onMouseLeave={() => {
                              scheduleDesktopMenuClose();
                            }}
                          >
                            <div className="relative">
                              <div className="w-[260px]">
                                {category.groups.map((group) => (
                                  <div key={group.id} className="relative">
                                    <button
                                      onMouseEnter={() => {
                                        if (group.subitems && group.subitems.length > 0) {
                                          setDesktopOpenGroupId(group.id);
                                        } else {
                                          setDesktopOpenGroupId(null);
                                        }
                                      }}
                                      onClick={() => {
                                        if (group.path) {
                                          navigate(group.path);
                                          setOpenCategoryId(null);
                                          setDesktopOpenGroupId(null);
                                        } else if (!group.subitems || group.subitems.length === 0) {
                                          setOpenCategoryId(null);
                                          setDesktopOpenGroupId(null);
                                        }
                                      }}
                                      className={`flex items-center justify-between w-full text-left text-[11px] py-2 px-5 leading-tight transition-colors duration-150 ${desktopOpenGroupId === group.id
                                        ? 'bg-gray-50 text-[#5A3F2A]'
                                        : 'text-[#6B4B3A] hover:bg-gray-50 hover:text-[#5A3F2A]'
                                        }`}
                                    >
                                      <span>{group.label}</span>
                                      {group.subitems && group.subitems.length > 0 && (
                                        <ChevronRight
                                          className={`w-4 h-4 ${desktopOpenGroupId === group.id ? 'text-[#5A3F2A]' : 'text-gray-400'
                                            }`}
                                        />
                                      )}
                                    </button>

                                    {group.subitems && group.subitems.length > 0 && (
                                      <div
                                        className={`absolute top-0 left-full ml-2 w-[320px] z-[130] transition-all duration-300 ease-out ${openCategoryId === category.id && desktopOpenGroupId === group.id
                                          ? 'opacity-100 visible translate-x-0'
                                          : 'opacity-0 invisible pointer-events-none -translate-x-2'
                                          }`}
                                        onMouseEnter={() => {
                                          cancelDesktopMenuClose();
                                          setOpenCategoryId(category.id);
                                          setDesktopOpenGroupId(group.id);
                                        }}
                                        onMouseLeave={() => {
                                          scheduleDesktopMenuClose();
                                        }}
                                      >
                                        <div className="absolute top-0 -left-4 w-4 h-full" />
                                        <div className="bg-white rounded-none shadow-md border border-gray-200 py-0">
                                          <ul className="space-y-0">
                                            {group.subitems.map((item) => (
                                              <li key={item.id}>
                                                <button
                                                  onClick={() => {
                                                    navigate(item.path || '/shop');
                                                    setOpenCategoryId(null);
                                                    setDesktopOpenGroupId(null);
                                                  }}
                                                  className="text-[11px] text-[#6B4B3A] hover:text-[#5A3F2A] hover:bg-gray-50 w-full text-left py-2 px-5 leading-tight transition-colors duration-150"
                                                >
                                                  {item.label}
                                                </button>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                    </div>
                  </div>

                  <div className="flex items-center ml-auto lg:mr-0 flex-shrink-0 gap-2 xl:gap-2.5">
                    <button
                      onClick={() => {
                        navigate(user ? '/dashboard' : '/login');
                      }}
                      className="font-medium transition-colors text-[9px] xl:text-[10px] uppercase tracking-wide whitespace-nowrap py-1 text-[#5A3F2A] hover:text-[#4A3320]"
                      aria-label="Account"
                    >
                      {user ? 'Account' : 'Log in'}
                    </button>

                    {!isShopPage && (
                      <button
                        onClick={() => setSearchOpen(true)}
                        className={`transition-colors flex items-center justify-center font-medium text-[9px] xl:text-[10px] uppercase tracking-wide text-[#5A3F2A] hover:text-[#4A3320]`}
                        aria-label="Search"
                      >
                        <div className="flex items-center gap-1">
                          <Search size={16} />
                          <span className="hidden xl:inline">Kërko</span>
                        </div>
                      </button>
                    )}

                    <Cart useNavColors onCartClick={() => setCartOpen(true)} iconSize={16} disabled={isTransitioning} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        <div
          className={`lg:hidden fixed top-full left-0 right-0 border-t border-gray-200 bg-white overflow-hidden z-40 shadow-lg transition-all duration-500 ease-in-out ${mobileMenuOpen
            ? 'opacity-100 translate-y-0 max-h-[calc(100vh-120px)] visible'
            : 'opacity-0 -translate-y-4 max-h-0 invisible pointer-events-none'
            }`}
          style={{ top: '100%' }}
        >
          <div
            className={`py-4 flex flex-col gap-0 max-h-[calc(100vh-140px)] overflow-y-auto ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'
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

            {/* Mobile categories accordion */}
            {NAV_CATEGORIES.map((category) => (
              <div key={category.id} className="border-b border-gray-100">
                <button
                  onClick={() => {
                    setMobileOpenCategoryId((prev) => {
                      const next = prev === category.id ? null : category.id;
                      return next;
                    });
                    setMobileOpenGroupId(null);
                  }}
                  className="w-full text-left text-[#5A3F2A] font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3 flex items-center justify-between"
                >
                  <span>{category.label}</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${mobileOpenCategoryId === category.id ? 'rotate-90' : ''
                      }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${mobileOpenCategoryId === category.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="bg-gray-50 border-t border-gray-100">
                    {category.groups.map((group) => (
                      <div key={group.id} className="border-b border-gray-100">
                        <button
                          onClick={() => {
                            if (group.subitems && group.subitems.length > 0) {
                              setMobileOpenGroupId((prev) => (prev === group.id ? null : group.id));
                              return;
                            }

                            if (group.path) {
                              navigate(group.path);
                            }
                            setMobileMenuOpen(false);
                            setMobileOpenCategoryId(null);
                            setMobileOpenGroupId(null);
                          }}
                          className="w-full text-left text-gray-700 hover:bg-gray-100 transition-colors px-4 py-3 flex items-center justify-between"
                        >
                          <span className="text-[13px]">{group.label}</span>
                          {group.subitems && group.subitems.length > 0 && (
                            <ChevronRight
                              className={`w-4 h-4 transition-transform duration-300 ${mobileOpenGroupId === group.id ? 'rotate-90' : ''
                                }`}
                            />
                          )}
                        </button>

                        {group.subitems && group.subitems.length > 0 && (
                          <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${mobileOpenGroupId === group.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                              }`}
                          >
                            <ul className="space-y-0 bg-white border-t border-gray-100">
                              {group.subitems.map((item) => (
                                <li key={item.id}>
                                  <button
                                    onClick={() => {
                                      navigate(item.path || '/shop');
                                      setMobileMenuOpen(false);
                                      setMobileOpenCategoryId(null);
                                      setMobileOpenGroupId(null);
                                    }}
                                    className="w-full text-left text-[13px] text-gray-700 hover:bg-gray-50 transition-colors px-6 py-2"
                                  >
                                    {item.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile auth/account links */}
            <div className="mt-2 border-t border-gray-200">
              {user ? (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-black font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3 border-b border-gray-200"
                  >
                    <img
                      src={user.photoURL || userLogo}
                      alt="Account"
                      className="w-6 h-6 rounded-full object-cover"
                    />
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
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-[#5A3F2A] font-medium text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors px-4 py-3 border-b border-gray-200"
                  >
                    Log in
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar - outside of header so fixed positioning uses full viewport */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;