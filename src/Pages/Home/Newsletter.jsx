import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call - replace with actual newsletter subscription logic
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail('');
    }, 1000);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
            Stay Updated with Ashila
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get the latest updates on new medicines, exclusive discounts, health tips, and special offers delivered directly to your inbox.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-6 py-4 text-lg border-2 border-[#d4d4c4] focus:border-[#946259] focus:ring-2 focus:ring-[#946259] focus:outline-none transition-all duration-300 bg-white text-[#2c2c2c]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="px-8 py-4 bg-[#946259] text-white font-bold shadow-md hover:bg-[#7a4f47] focus:outline-none focus:ring-2 focus:ring-[#946259] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap border-2 border-[#946259] uppercase tracking-wide"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Subscribing...
                    </div>
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center p-8 bg-white border-2 border-[#d4d4c4] shadow-md">
              <div className="w-16 h-16 bg-[#946259] flex items-center justify-center mx-auto mb-4 border-2 border-[#946259]">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#946259] mb-2 uppercase tracking-wide">Successfully Subscribed!</h3>
              <p className="text-[#2c2c2c] mb-4">Thank you for subscribing to our newsletter. You'll receive updates soon!</p>
              <button
                onClick={() => setIsSubscribed(false)}
                className="px-6 py-2 bg-[#946259] text-white hover:bg-[#7a4f47] transition-all duration-300 border-2 border-[#946259] font-semibold uppercase tracking-wide"
              >
                Subscribe Another Email
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              🔒 We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Newsletter Benefits */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Weekly Updates</h3>
            <p className="text-gray-600">Get notified about new medicines and health products</p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Exclusive Offers</h3>
            <p className="text-gray-600">Access to subscriber-only discounts and promotions</p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Tips</h3>
            <p className="text-gray-600">Expert advice and wellness information</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter; 
