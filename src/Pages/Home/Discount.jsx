import React from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import DataLoading from '../../Components/Common/Loaders/DataLoading';
import LoadingError from '../../Components/Common/States/LoadingError';
import EmptyArray from '../../Components/Common/States/EmptyArray';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import DiscountCard from './DiscountCard';

const Discount = () => {
  const { publicApi } = useAxiosSecure();
  const { data, isLoading, error } = useQuery({
    queryKey: ['top-discount'],
    queryFn: async () => {
      try {
        const res = await publicApi.get('/medicines/top-discount');
        // normalize response to array
        const arr = Array.isArray(res) ? res : (res?.medicines || res?.result || res || []);
        return arr;
      } catch (err) {
        console.warn('Top-discount API not available, returning empty array');
        return [];
      }
    },
  });

  const medicines = data || [];

  if (isLoading) {
    return <DataLoading label="discounted medicines" />;
  }

  if (error) {
    return <LoadingError label="discounted medicines" />;
  }

  if (!medicines || medicines.length === 0) {
    return <EmptyArray message="No discounted medicines found" />;
  }

  // Render the discounted medicines list here
  return (
    <section className="py-8 px-2 md:px-0 max-w-6xl mx-auto">
      <h2 className="text-2xl md:text-4xl font-bold mb-6 text-center text-[#946259] uppercase tracking-wide">
        Top Discounts
      </h2>
      <Swiper
        modules={[Navigation, Pagination, Mousewheel, Autoplay]}
        spaceBetween={24}
        slidesPerView={2}
        mousewheel={true}
        // navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="discount-swiper pb-10"
      >
        {medicines.map((medicine) => (
          <SwiperSlide key={medicine._id}>
            <DiscountCard medicine={medicine} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Discount;
