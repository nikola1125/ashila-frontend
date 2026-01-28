import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthContext } from '../../../Context/Auth/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Cart from './Cart';
import CartSidebar from './CartSidebar';
import userLogo from "../../../assets/userLogo.png";
const logo = "/images/logo.png";
import Logo from "../Logo/Logo";
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
          { id: 'skin-all', label: 'Te gjitha', path: '/shop?subcategory=tipi-i-lekures' },
          { id: 'skin-normal', label: 'Lekure normale', path: '/shop?subcategory=lekure-normale' },
          { id: 'skin-oily', label: 'Lekure e yndyrshme', path: '/shop?subcategory=lekure-e-yndyrshme' },
          { id: 'skin-dry', label: 'Lekure e thate', path: '/shop?subcategory=lekure-e-thate' },
          { id: 'skin-combo', label: 'Lekure mikse', path: '/shop?subcategory=lekure-mikes' },
          { id: 'skin-sensitive', label: 'Lekure sensitive', path: '/shop?subcategory=lekure-sensitive' },
        ],
      },
      {
        id: 'skin-concerns',
        label: 'Problematikat e fytyres',
        subitems: [
          { id: 'skin-concerns-all', label: 'Te gjitha', path: '/shop?subcategory=problematikat-e-fytyres' },
          { id: 'acne', label: 'Akne', path: '/shop?subcategory=akne' },
          { id: 'wrinkles', label: 'Rrudha', path: '/shop?subcategory=rrudha' },
          { id: 'hyperpigmentation', label: 'Hiperpigmentim', path: '/shop?subcategory=hiperpigmentim' },
          { id: 'pores', label: 'Balancim yndyre/pore evidente', path: '/shop?subcategory=balancim-yndyre-pore-evidente' },
          { id: 'blackheads', label: 'Pikat e zeza', path: '/shop?subcategory=pika-te-zeza' },
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
          { id: 'body-all', label: 'Te gjitha', path: '/shop?subcategory=per-trupin' },
          { id: 'body-lotion', label: 'Lares trupi', path: '/shop?subcategory=lares-trupi' },
          { id: 'body-hydrating', label: 'Hidratues trupi', path: '/shop?subcategory=hidratues-trupi' },
          { id: 'body-scrub', label: 'Scrub trupi', path: '/shop?subcategory=scrub-trupi' },
          { id: 'body-acne', label: 'Akne ne trup', path: '/shop?subcategory=akne-ne-trup' },
          { id: 'sun-care', label: 'Kujdesi ndaj diellit', path: '/shop?subcategory=kujdesi-ndaj-diellit' },
          { id: 'deodorant', label: 'Deodorant', path: '/shop?subcategory=deodorant' },
          { id: 'body-oil', label: 'Vaj per trupin', path: '/shop?subcategory=vaj-per-trupin' },
          { id: 'hand-foot', label: 'Krem per duart & kembet', path: '/shop?subcategory=krem-per-duart-dhe-kembet' },
          { id: 'body-accessories', label: 'Aksesore', path: '/shop?subcategory=aksesore-trupi' },
        ],
      },
      {
        id: 'hair',
        label: 'Per floke',
        subitems: [
          { id: 'hair-all', label: 'Te gjitha', path: '/shop?subcategory=per-floke' },
          { id: 'dry-scalp', label: 'Skalp i thate', path: '/shop?subcategory=skalp-i-thate' },
          { id: 'oily-scalp', label: 'Skalp i yndyrshem', path: '/shop?subcategory=skalp-i-yndyrshem' },
          { id: 'sensitive-scalp', label: 'Skalp sensitive', path: '/shop?subcategory=skalp-sensitive' },
          { id: 'hair-loss', label: 'Renia e flokut', path: '/shop?subcategory=renia-e-flokut' },
          { id: 'hair-accessories', label: 'Aksesore', path: '/shop?subcategory=aksesore-floke' },
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
          { id: 'intimate-all', label: 'Te gjitha', path: '/shop?subcategory=higjena-intime' },
          { id: 'intimate-wash', label: 'Lares intim', path: '/shop?subcategory=lares-intim' },
          { id: 'intimate-wipes', label: 'Peceta', path: '/shop?subcategory=peceta-intime' },
        ],
      },
      {
        id: 'oral',
        label: 'Higjena orale',
        subitems: [
          { id: 'oral-all', label: 'Te gjitha', path: '/shop?subcategory=higjena-orale' },
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
          { id: 'mom-all', label: 'Te gjitha', path: '/shop?subcategory=kujdesi-per-nenen' },
          { id: 'pregnancy', label: 'Shtatezania', path: '/shop?subcategory=shtatezania' },
          { id: 'post-birth', label: 'Pas lindjes', path: '/shop?subcategory=pas-lindjes' },
          { id: 'breastfeeding', label: 'Ushqyerja me gji', path: '/shop?subcategory=ushqyerja-me-gji' },
          { id: 'mom-accessories', label: 'Aksesore', path: '/shop?subcategory=aksesore-nene' },
        ],
      },
      {
        id: 'child',
        label: 'Kujdesi per femije',
        subitems: [
          { id: 'child-all', label: 'Te gjitha', path: '/shop?subcategory=kujdesi-per-femije' },
          { id: 'baby-food', label: 'Ushqim per femije', path: '/shop?category=nena-dhe-femije&subcategory=ushqim-per-femije' },
          { id: 'diapers', label: 'Pelena', path: '/shop?category=nena-dhe-femije&subcategory=pelena' },
          { id: 'accessories', label: 'Aksesore', path: '/shop?category=nena-dhe-femije&subcategory=aksesore-femije' },
        ],
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
  {
    id: 'sets',
    label: 'Set',
    groups: [
      { id: 'sets-face', label: 'Set per fytyren', path: '/shop?subcategory=set-per-fytyren' },
      { id: 'sets-body', label: 'Set per trupin', path: '/shop?subcategory=set-per-trupin' },
      { id: 'sets-hair', label: 'Set per floket', path: '/shop?subcategory=set-per-floket' },
      { id: 'sets-mom', label: 'Set per nena', path: '/shop?subcategory=set-per-nena' },
      { id: 'sets-child', label: 'Set per femije', path: '/shop?subcategory=set-per-femije' },
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

  useEffect(() => {
    let ticking = false;
    let rafId = null;
    let lastScrollY = 0;
    let scrollThreshold = 25;
    let lastState = false;
    let stateChangeTimeout = null;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const scrollDifference = Math.abs(scrollY - lastScrollY);

          if (isShopPage) {
            if (!lastState) {
              setIsScrolled(true);
              lastState = true;
            }
          } else {
            const newState = scrollY > scrollThreshold;
            if (scrollDifference > 10 && newState !== lastState) {
              if (stateChangeTimeout) clearTimeout(stateChangeTimeout);
              stateChangeTimeout = setTimeout(() => {
                setIsTransitioning(true);
                setIsScrolled(newState);
                lastScrollY = scrollY;
                lastState = newState;
                setTimeout(() => setIsTransitioning(false), 200);
              }, 10);
            } else if (scrollDifference > 10) {
              lastScrollY = scrollY;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const checkInitialScroll = () => {
      lastScrollY = window.scrollY;
      if (isShopPage) {
        setIsScrolled(true);
        lastState = true;
      } else {
        const initialState = window.scrollY > scrollThreshold;
        setIsScrolled(initialState);
        lastState = initialState;
      }
    };

    setTimeout(checkInitialScroll, 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (stateChangeTimeout) clearTimeout(stateChangeTimeout);
    };
  }, [isShopPage]);

  const mobileMenuLastScrollY = useRef(window.scrollY);

  const handleMobileMenuScroll = useCallback(() => {
    if (!mobileMenuOpen) return;
    const currentScrollY = window.scrollY;
    if (Math.abs(currentScrollY - mobileMenuLastScrollY.current) < 10) return;
    if (currentScrollY > mobileMenuLastScrollY.current) {
      setMobileMenuOpen(false);
    }
    mobileMenuLastScrollY.current = currentScrollY;
  }, [mobileMenuOpen]);

  const throttledHandleMobileMenuScroll = useThrottle(handleMobileMenuScroll, 100);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    mobileMenuLastScrollY.current = window.scrollY;
    const handleClickOutside = (event) => {
      const cartSidebar = document.querySelector('[data-cart-sidebar]');
      const header = document.querySelector('header');
      if (cartSidebar && cartSidebar.contains(event.target)) return;
      if (header && !header.contains(event.target)) setMobileMenuOpen(false);
    };
    window.addEventListener("scroll", throttledHandleMobileMenuScroll, { passive: true });
    document.addEventListener("click", handleClickOutside);

    // Don't lock body scroll - this might be causing scroll issues
    // document.body.style.overflow = 'hidden';
    // document.body.style.position = 'fixed';
    // document.body.style.top = `-${window.scrollY}px`;
    // document.body.style.width = '100%';

    return () => {
      window.removeEventListener("scroll", throttledHandleMobileMenuScroll);
      document.removeEventListener("click", handleClickOutside);

      // Don't restore body scroll when mobile menu is closed
      // document.body.style.overflow = '';
      // document.body.style.position = '';
      // document.body.style.top = '';
      // document.body.style.width = '';
      // Don't scroll anywhere when closing mobile menu
    };
  }, [mobileMenuOpen, throttledHandleMobileMenuScroll]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileOpenCategoryId(null);
    setMobileOpenGroupId(null);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`w-full fixed top-0 left-0 right-0 transition-all duration-150 ${isScrolled || isShopPage || isAuthPage ? 'bg-white shadow-md' : 'bg-transparent'}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          WebkitTransform: 'translate3d(0, 0, 0)',
          transform: 'translate3d(0, 0, 0)'
        }}
      >
        <div className={`relative border-b transition-all duration-150 ${isScrolled || isShopPage || isAuthPage ? 'border-gray-200 bg-white' : 'border-transparent bg-transparent'}`}>
          <div className="w-full mx-auto px-2 sm:px-4 lg:px-4 xl:px-6">
            <div className="h-[64px] lg:h-[70px] flex items-center gap-1 lg:gap-2 lg:justify-start">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className={`lg:hidden transition-colors z-50 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg p-2 ${isScrolled || isAuthPage ? 'text-black bg-white' : 'text-white'}`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="flex-1 flex justify-end lg:flex-none lg:justify-start items-center">
                <div className="scale-75 lg:scale-80"><Logo /></div>
              </div>

              <div className="flex items-center gap-0.5 lg:hidden relative z-20">
                <button
                  onClick={() => setSearchOpen(true)}
                  className={`transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${isScrolled || isAuthPage ? 'text-black' : 'text-white'}`}
                >
                  <Search size={18} />
                </button>
                <Cart isScrolled={isScrolled || isShopPage || isAuthPage} onCartClick={() => setCartOpen(true)} iconSize={18} forceBlack={isScrolled || isShopPage || isAuthPage} />
              </div>

              <div className="hidden lg:flex items-center flex-1 ml-2">
                <div className="w-full flex items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-center gap-1.5 xl:gap-2">
                      <NavLink to="/" className="font-medium text-[9px] xl:text-[10px] uppercase py-1 text-[#5A3F2A]">Kreu</NavLink>
                      {NAV_CATEGORIES.map((category, index) => (
                        <div
                          key={category.id}
                          className="relative group"
                          onMouseEnter={() => { cancelDesktopMenuClose(); setOpenCategoryId(category.id); }}
                          onMouseLeave={scheduleDesktopMenuClose}
                        >
                          <button className="flex items-center gap-0.5 font-medium text-[9px] xl:text-[10px] uppercase py-1 text-[#5A3F2A]">
                            {category.label}
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>
                          {category.groups && (
                            <div className={`absolute ${index > 4 ? 'right-0' : 'left-0'} mt-2 bg-white shadow-md py-0 z-[120] transition-all ${openCategoryId === category.id ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                              <div className="w-[260px]">
                                {category.groups.map(group => (
                                  <div key={group.id} className="relative">
                                    <button
                                      onMouseEnter={() => setDesktopOpenGroupId(group.id)}
                                      onClick={() => { if (group.path) { navigate(group.path); setOpenCategoryId(null); } }}
                                      className={`flex items-center justify-between w-full text-left text-[11px] py-2 px-5 ${desktopOpenGroupId === group.id ? 'bg-gray-50' : ''}`}
                                    >
                                      <span>{group.label}</span>
                                      {group.subitems && <ChevronRight className="w-4 h-4" />}
                                    </button>
                                    {group.subitems && desktopOpenGroupId === group.id && (
                                      <div className={`absolute top-0 ${index > 4 ? 'right-full mr-2' : 'left-full ml-2'} w-[320px] bg-white shadow-md py-0`}>
                                        <ul className="space-y-0">
                                          {group.subitems.map(sub => (
                                            <li key={sub.id}>
                                              <button onClick={() => { navigate(sub.path); setOpenCategoryId(null); }} className="text-[11px] w-full text-left py-2 px-5 hover:bg-gray-50">{sub.label}</button>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center ml-auto flex-shrink-0 gap-2 xl:gap-2.5">
                    <button onClick={() => navigate(user ? '/dashboard' : '/login')} className="font-medium text-[9px] xl:text-[10px] uppercase text-[#5A3F2A]">
                      {user ? 'Account' : 'Log in'}
                    </button>
                    <button onClick={() => setSearchOpen(true)} className="flex items-center gap-1 uppercase text-[9px] xl:text-[10px] text-[#5A3F2A]"><Search size={16} /><span>Kërko</span></button>
                    <Cart useNavColors onCartClick={() => setCartOpen(true)} iconSize={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`lg:hidden fixed top-full left-0 right-0 bg-white overflow-hidden z-40 transition-all duration-500 ${mobileMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <div className="py-1 flex flex-col max-h-[95vh] overflow-y-auto bg-white">
            <NavLink
              to="/"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="text-[#5A3F2A] font-medium text-sm uppercase px-4 py-1 hover:bg-gray-50"
            >
              Kreu
            </NavLink>

            {NAV_CATEGORIES.map((category) => {
              const isCategoryOpen = mobileOpenCategoryId === category.id;

              return (
                <div key={category.id} className="border-b border-gray-100">
                  <button
                    onClick={() => {
                      setMobileOpenCategoryId(isCategoryOpen ? null : category.id);
                      setMobileOpenGroupId(null);
                    }}
                    className="w-full text-left font-medium text-sm uppercase px-4 py-1 flex items-center justify-between hover:bg-gray-50"
                  >
                    <span>{category.label}</span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {/* Category submenu */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${isCategoryOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    {category.groups.map((group) => {
                      const isGroupOpen = mobileOpenGroupId === group.id;

                      return (
                        <div key={group.id} className="border-t border-gray-50">
                          {group.subitems ? (
                            <>
                              <button
                                onClick={() => {
                                  setMobileOpenGroupId(isGroupOpen ? null : group.id);
                                }}
                                className="w-full text-left text-gray-700 px-8 py-1 flex items-center justify-between hover:bg-gray-50"
                              >
                                <span className="text-[13px]">{group.label}</span>
                                <ChevronRight
                                  className={`w-4 h-4 transition-transform duration-200 ${isGroupOpen ? 'rotate-90' : ''}`}
                                />
                              </button>

                              {/* Group submenu */}
                              <div
                                className={`overflow-hidden transition-all duration-300 ${isGroupOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                  }`}
                              >
                                <ul>
                                  {group.subitems.map((sub) => (
                                    <li key={sub.id}>
                                      <button
                                        onClick={() => {
                                          navigate(sub.path);
                                          setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left text-gray-700 px-12 py-1 hover:bg-gray-50 text-sm"
                                      >
                                        {sub.label}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          ) : group.path ? (
                            <button
                              onClick={() => {
                                navigate(group.path);
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-left text-gray-700 px-8 py-1 hover:bg-gray-50 text-sm"
                            >
                              {group.label}
                            </button>
                          ) : (
                            <div className="px-8 py-1 text-sm text-gray-500">{group.label}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* User section */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              {user ? (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 font-medium text-sm uppercase px-4 py-1 hover:bg-gray-50"
                  >
                    <img src={user.photoURL || userLogo} alt="Account" className="w-6 h-6 rounded-full" />
                    Account
                  </NavLink>
                  <button
                    onClick={async () => {
                      await signOutUser();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left font-medium text-sm uppercase px-4 py-1 hover:bg-gray-50"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-medium text-sm uppercase px-4 py-1 hover:bg-gray-50"
                >
                  Log in
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </header>
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
