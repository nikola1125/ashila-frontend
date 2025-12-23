import React, { useContext, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CartContext } from '../../Context/Cart/CartContext';
import { AuthContext } from '../../Context/Auth/AuthContext';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { getProductImage } from '../../utils/productImages';

const ALBANIA_CITIES = [
  "Tirana", "Durrës", "Vlorë", "Shkodër", "Fier", "Korçë", "Elbasan", "Berat", "Lushnje", "Kavajë",
  "Gjirokastër", "Sarandë", "Lezhë", "Kukës", "Burrel", "Peshkopi", "Patos", "Krujë", "Kuçovë",
  "Laç", "Pogradec", "Librazhd", "Delvinë", "Tepelenë", "Gramsh", "Bulqizë", "Përmet", "Ersekë",
  "Rrëshen", "Ballsh", "Mamurras", "Bajram Curri", "Krumë", "Peqin", "Divjakë", "Selenicë",
  "Roskovec", "Pukë", "Rrogozhinë", "Vorë", "Urë Vajgurore", "Himarë", "Rubik", "Koplik",
  "Maliq", "Poliçan", "Memaliaj", "Çorovodë", "Këlcyrë", "Belsh", "Orikum", "Prrenjas",
  "Krrabë", "Libohovë", "Konispol", "Fushë-Krujë", "Shijak", "Kamëz"
].sort();

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, totalQuantity, discountedTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { publicApi, privateApi } = useAxiosSecure();

  const cartItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch Global Settings for Free Delivery
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await publicApi.get('/settings');
      return res;
    }
  });


  const shippingCost = settings?.freeDelivery ? 0 : 300;

  const api = user ? privateApi : publicApi;

  const computedItems = useMemo(() => {
    return cartItems.map((item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      const discount = Number(item.discount) || 0;

      return {
        productId: item.id,
        itemName: item.name,
        quantity,
        price,
        discount,
        image: item.image,
        seller: item.seller || null,
        sellerEmail: item.sellerEmail || null,
      };
    });
  }, [cartItems]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Shporta është bosh');
      return;
    }

    if (!fullName.trim() || !street.trim() || !city.trim() || !postalCode.trim() || !phoneNumber.trim()) {
      toast.error('Ju lutem plotësoni të gjitha fushat');
      return;
    }

    if (!user && !email.trim()) {
      toast.error('Ju lutem shkruani email-in tuaj');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        items: computedItems,
        buyerEmail: user?.email || email.trim(),
        buyerName: fullName.trim(),
        deliveryAddress: {
          street: street.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: 'Albania',
          phoneNumber: phoneNumber.trim(),
        },
        paymentStatus: 'unpaid',
        status: 'Pending',
        shippingCost: shippingCost, // Frontend hint, backend enforces this
      };

      await api.post('/orders', payload);

      clearCart();
      toast.success('Porosia u dergua per konfirmim.');
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('Porosia dështoi. Ju lutem provoni përsëri.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet key={location.pathname}>
        <title>Checkout</title>
      </Helmet>
      <div className="min-h-screen bg-[#f9f7f4] py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Customer info */}
            <div className="bg-white border border-gray-200 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Të dhënat e klientit</h2>
              <form onSubmit={onSubmit} className="space-y-4">
                {!user && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A3F2A]/30"
                      placeholder="Email juaj"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Emër Mbiemër</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A3F2A]/30"
                    placeholder="Emër Mbiemër"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Adresë</label>
                  <input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A3F2A]/30"
                    placeholder="Rruga, numri, hyrja..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Qyteti</label>
                    <input
                      list="albania-cities"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A3F2A]/30"
                      placeholder="Zgjidh qytetin..."
                      required
                    />
                    <datalist id="albania-cities">
                      {ALBANIA_CITIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Postal code</label>
                    <input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A3F2A]/30"
                      placeholder="1001"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Numër telefoni</label>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A3F2A]/30"
                    placeholder="+355..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#5A3F2A] hover:bg-[#4A3320] text-white font-semibold transition disabled:opacity-60"
                >
                  {loading ? 'Duke dërguar...' : 'Konfirmo porosinë (Cash on delivery)'}
                </button>
              </form>
            </div>

            {/* Right: Cart summary */}
            <div className="bg-white border border-gray-200 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shporta</h2>

              {cartItems.length === 0 ? (
                <div className="text-gray-600">Shporta është bosh.</div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {cartItems.map((item, index) => (
                      <div key={`${item.id}-${item.selectedSize || 'nosize'}-${index}`} className="flex gap-3 border border-gray-100 p-3 bg-gray-50">
                        <div className="w-16 h-16 bg-white border border-gray-200 overflow-hidden shrink-0">
                          <img
                            src={getProductImage(item.image, item.id)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = getProductImage(null, item.id);
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm break-words">{item.name}</div>
                          <div className="text-xs text-gray-600 mt-1">Sasia: {item.quantity}</div>
                          <div className="text-xs text-gray-600">
                            Çmimi: {(Number(item.discountedPrice) && Number(item.discountedPrice) < Number(item.price)
                              ? Number(item.discountedPrice)
                              : Number(item.price)
                            ).toLocaleString('en-US')} ALL
                          </div>
                        </div>
                        <div className="text-sm font-bold text-gray-900 lux-price-number">
                          {(
                            (Number(item.discountedPrice) && Number(item.discountedPrice) < Number(item.price)
                              ? Number(item.discountedPrice)
                              : Number(item.price)
                            ) * (Number(item.quantity) || 1)
                          ).toLocaleString('en-US')} ALL
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Totali i artikujve</span>
                      <span className="font-semibold lux-price-number">{totalQuantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Nëntotali</span>
                      <span className="font-semibold lux-price-number">
                        {Number(discountedTotal).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ALL
                      </span>
                    </div>
                    {/* Delivery Fee Display */}
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Transporti</span>
                      <span className="font-semibold lux-price-number">
                        {shippingCost.toLocaleString('en-US')} ALL
                      </span>
                    </div>
                    {/* Total with Delivery Fee */}
                    <div className="flex items-center justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                      <span>Totali (përfshirë transportin)</span>
                      <span className="lux-price-number">
                        {(Number(discountedTotal) + shippingCost).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ALL
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Pagesa bëhet në dorëzim.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
