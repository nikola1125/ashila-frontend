import React from 'react';

const ShopGridSkeleton = ({ itemsPerPage = 30 }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 justify-items-center">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
                <div
                    key={index}
                    className="w-full max-w-[280px] border border-gray-100 overflow-hidden bg-white text-center pb-2 flex flex-col h-full animate-pulse"
                >
                    {/* Image Skeleton */}
                    <div className="relative w-full h-[160px] md:h-[200px] bg-gray-200" />

                    {/* Content Skeleton */}
                    <div className="px-1.5 md:px-2.5 pt-1 md:pt-2 flex flex-col flex-grow gap-2">
                        {/* Decorative Line Skeleton */}
                        <div className="mx-auto mb-2 h-[1px] w-[30px] bg-gray-200" />

                        {/* Title Skeleton */}
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-1" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />

                        <div className="mt-auto pt-4 flex flex-col gap-2">
                            {/* Price Skeleton */}
                            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto" />

                            {/* Button Skeleton */}
                            <div className="h-8 bg-gray-200 rounded w-full mt-2" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ShopGridSkeleton;
