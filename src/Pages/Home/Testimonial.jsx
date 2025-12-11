import React from 'react'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
  {
    name: "Sarah Rahman",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    review:
      "Ashila made it so easy to get my prescription delivered to my doorstep. Fast, reliable, and trustworthy! Highly recommended.",
  },
  {
    name: "Md. Hasan Ali",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    review:
      "I was worried about buying medicine online, but Ashila's service is excellent. The medicines are genuine and the support team is great!",
  },
  {
    name: "Ayesha Siddiqua",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
    review:
      "Very convenient and affordable! I love how easy it is to order and track my medicines. Will use again.",
  },
];

const Testimonial = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4000,
    adaptiveHeight: true,
  };

  return (
    <section className="bg-white py-12 px-4 md:px-0">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-[#946259] mb-2 uppercase tracking-wide">What Our Customers Say</h2>
        <p className="text-[#2c2c2c] mb-10">
          Trusted by thousands of customers. See how Ashila is making online medicine shopping easy and safe.
        </p>
        <Slider {...settings}>
          {testimonials.map((t, idx) => (
            <div key={idx}>
              <div className="bg-white shadow-sm border-2 border-[#d4d4c4] p-8 flex flex-col items-center hover:shadow-lg transition-all min-h-[340px]">
                <img
                  src={t.photo}
                  alt={t.name}
                  className="w-20 h-20 border-4 border-[#946259] mb-4 object-cover"
                />
                <p className="text-[#2c2c2c] italic mb-3">"{t.review}"</p>
                <span className="font-semibold text-[#946259] uppercase tracking-wide">{t.name}</span>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Testimonial
