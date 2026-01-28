import React from 'react';

const ProductDetailSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#faf9f6]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-32 md:pt-40 pb-10">
                {/* Breadcrumbs Skeleton */}
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse" />

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mb-10 sm:mb-12">
                    {/* Left Column - Product Image Skeleton */}
                    <div className="relative bg-white lux-card lux-card-elevated overflow-hidden h-[400px] sm:h-[500px] flex items-center justify-center animate-pulse">
                        <div className="w-2/3 h-2/3 bg-gray-200 rounded-lg" />
                    </div>

                    {/* Right Column - Product Details Skeleton */}
                    <div className="flex flex-col animate-pulse">
                        {/* Title */}
                        <div className="h-8 md:h-10 bg-gray-200 rounded w-3/4 mb-4" />
                        <div className="w-16 h-0.5 bg-gray-200 mb-6" />

                        {/* Price */}
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
                        <div className="border-t border-gray-200 my-2" />

                        {/* Sizes */}
                        <div className="mb-6">
                            <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
                            <div className="flex gap-2">
                                <div className="w-16 h-10 bg-gray-200 rounded" />
                                <div className="w-16 h-10 bg-gray-200 rounded" />
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-6">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                            <div className="h-12 w-32 bg-gray-200 rounded" />
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3 mb-6">
                            <div className="h-12 bg-gray-200 rounded w-full" />
                            <div className="h-12 bg-gray-200 rounded w-full" />
                        </div>
                    </div>
                </div>

                {/* Description Skeleton */}
                <div className="border-t border-gray-200 pt-8 mb-8 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailSkeleton;
