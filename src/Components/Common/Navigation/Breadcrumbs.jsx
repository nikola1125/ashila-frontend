import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ paths }) => {
    // Breadcrumb Schema (JSON-LD)
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": paths.map((path, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": path.name,
            "item": `https://www.farmaciashila.com${path.url}`
        }))
    };
    

    return (
        <nav className="w-full mb-6 overflow-hidden" aria-label="Breadcrumb">
            <script type="application/ld+json">
                {JSON.stringify(breadcrumbSchema)}
            </script>
            <ol className="flex flex-row items-center flex-nowrap overflow-x-auto whitespace-nowrap scrollbar-hide text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-gray-400 font-light lux-serif-text">
                <li className="flex items-center flex-shrink-0">
                    <Link to="/" className="hover:text-[#A67856] transition-colors flex items-center py-1">
                        <Home size={11} className="mr-1.5" />
                        <span>Kreu</span>
                    </Link>
                </li>

                {paths.map((path, index) => (
                    <li key={index} className="flex items-center flex-shrink-0">
                        <ChevronRight size={10} className="mx-2 sm:mx-3 text-gray-300 flex-shrink-0" />
                        {index === paths.length - 1 ? (
                            <span className="font-medium text-[#4A3628] truncate max-w-[150px] sm:max-w-none py-1" aria-current="page">
                                {path.name}
                            </span>
                        ) : (
                            <Link to={path.url} className="hover:text-[#A67856] transition-colors flex items-center py-1 truncate max-w-[100px] sm:max-w-none">
                                {path.name}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
