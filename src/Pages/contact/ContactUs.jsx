import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our services? Need support? We'd love to hear
            from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white shadow-md border-2 border-[#d4d4c4] p-8">
            <h2 className="text-2xl font-semibold text-[#946259] mb-6 uppercase tracking-wide">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm bg-gray-50 text-gray-900 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm bg-gray-50 text-gray-900 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition duration-200"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm bg-gray-50 text-gray-900 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition duration-200"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm bg-gray-50 text-gray-900 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 outline-none transition duration-200 resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-sm font-semibold hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 transition duration-200"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white shadow-md border-2 border-[#d4d4c4] p-8">
            <h2 className="text-2xl font-semibold text-[#946259] mb-6 uppercase tracking-wide">
              Contact Information
            </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#946259] uppercase tracking-wide">
                      Address
                    </h3>
                    <p className="text-[#2c2c2c]">
                      123 Healthcare Street
                      <br />
                      Medical District, City 12345
                      <br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#946259] uppercase tracking-wide">Phone</h3>
                    <p className="text-[#2c2c2c]">
                      Main: +1 (555) 123-4567
                      <br />
                      Support: +1 (555) 987-6543
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#946259] uppercase tracking-wide">Email</h3>
                    <p className="text-[#2c2c2c]">
                      info@medimart.com
                      <br />
                      support@medimart.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#946259] uppercase tracking-wide">
                      Business Hours
                    </h3>
                    <p className="text-[#2c2c2c]">
                      Monday - Friday: 8:00 AM - 8:00 PM
                      <br />
                      Saturday: 9:00 AM - 6:00 PM
                      <br />
                      Sunday: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Support */}
            <div className="bg-[#946259] shadow-md border-2 border-[#946259] p-8 text-white">
              <h3 className="text-xl font-semibold mb-4 uppercase tracking-wide">
                Need Immediate Help?
              </h3>
              <p className="text-white/90 mb-6">
                Our customer support team is available 24/7 to assist you with
                any urgent matters.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-white/80 animate-pulse"></div>
                  <span className="text-sm">Live Chat Available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-white/80 animate-pulse"></div>
                  <span className="text-sm">24/7 Support Hotline</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-white/80 animate-pulse"></div>
                  <span className="text-sm">Emergency Response</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        {/* <div className="mt-16">
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Find Us on the Map
            </h2>
            <div className="bg-gray-200 rounded-sm h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                  />
                </svg>
                <p className="text-lg font-medium">Interactive Map</p>
                <p className="text-sm">Map integration can be added here</p>
              </div>
            </div>
          </div>
        </div> */}

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="bg-white shadow-md border-2 border-[#d4d4c4] p-8">
            <h2 className="text-2xl font-semibold text-[#946259] mb-6 text-center uppercase tracking-wide">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-[#946259] pl-4">
                <h3 className="font-medium text-[#946259] mb-2 uppercase tracking-wide">
                  How can I track my order?
                </h3>
                <p className="text-[#2c2c2c] text-sm">
                  You can track your order through your account dashboard or by
                  using the tracking number sent to your email.
                </p>
              </div>
              <div className="border-l-4 border-[#946259] pl-4">
                <h3 className="font-medium text-[#946259] mb-2 uppercase tracking-wide">
                  What is your return policy?
                </h3>
                <p className="text-[#2c2c2c] text-sm">
                  We offer a 30-day return policy for most items. Please contact
                  our support team for specific details.
                </p>
              </div>
              <div className="border-l-4 border-[#946259] pl-4">
                <h3 className="font-medium text-[#946259] mb-2 uppercase tracking-wide">
                  Do you ship internationally?
                </h3>
                <p className="text-[#2c2c2c] text-sm">
                  Yes, we ship to most countries worldwide. Shipping costs and
                  delivery times vary by location.
                </p>
              </div>
              <div className="border-l-4 border-[#946259] pl-4">
                <h3 className="font-medium text-[#946259] mb-2 uppercase tracking-wide">
                  How can I become a seller?
                </h3>
                <p className="text-[#2c2c2c] text-sm">
                  To become a seller, please fill out our seller application
                  form and our team will review your request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
