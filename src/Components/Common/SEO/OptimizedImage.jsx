import React, { useState, useRef, useEffect } from 'react';
import { lazy } from 'react';

/**
 * SEO-Optimized Image Component
 * Ensures Core Web Vitals compliance with proper loading, alt text, and performance
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 80,
  format = 'webp',
  loading = 'lazy',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Generate SEO-friendly alt text if not provided
  const generateAltText = (src, providedAlt) => {
    if (providedAlt && providedAlt.trim()) {
      return providedAlt.trim();
    }
    
    // Extract meaningful text from image filename
    if (src) {
      const filename = src.split('/').pop()?.split('.')[0] || '';
      const cleanName = filename
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      return cleanName || 'Produkt nga Farmaci Ashila';
    }
    
    return 'Produkt nga Farmaci Ashila';
  };

  const altText = generateAltText(src, alt);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // Generate optimized srcset
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc) return '';
    
    const widths = [320, 640, 768, 1024, 1280, 1536];
    const baseUrl = baseSrc.includes('?') ? baseSrc.split('?')[0] : baseSrc;
    const params = new URLSearchParams(baseSrc.includes('?') ? baseSrc.split('?')[1] : '');
    
    return widths
      .map(w => {
        params.set('w', w);
        params.set('q', quality);
        params.set('f', format);
        return `${baseUrl}?${params.toString()} ${w}w`;
      })
      .join(', ');
  };

  const optimizedSrc = src;
  const srcSet = generateSrcSet(src);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    console.warn(`Failed to load image: ${src}`);
  };

  // Placeholder component
  const Placeholder = () => (
    <div
      className={`bg-gray-200 animate-pulse ${className}`}
      style={{
        width: width || '100%',
        height: height || 'auto',
        aspectRatio: width && height ? `${width}/${height}` : 'auto'
      }}
    />
  );

  // Error fallback
  const ErrorFallback = () => (
    <div
      className={`bg-gray-300 flex items-center justify-center text-gray-600 ${className}`}
      style={{
        width: width || '100%',
        height: height || '200px'
      }}
      role="img"
      aria-label={altText}
    >
      <span className="text-sm text-center px-2">Imazhi i padisponueshëm</span>
    </div>
  );

  if (hasError) {
    return <ErrorFallback />;
  }

  if (!isInView && !priority) {
    return (
      <div ref={imgRef} style={{ width, height }}>
        <Placeholder />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0">
          <Placeholder />
        </div>
      )}
      
      <img
        ref={imgRef}
        src={optimizedSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={altText}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        loading={priority ? 'eager' : loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {/* SEO structured data for images */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "ImageObject",
            "contentUrl": optimizedSrc,
            "description": altText,
            "name": altText,
            "width": width,
            "height": height
          })
        }}
      />
    </div>
  );
};

export default OptimizedImage;
