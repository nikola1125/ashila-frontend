import React, { memo } from 'react';
import Hero from './Hero';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import BestSeller from './BestSeller';
import HydrationSection from './HydrationSection';
import FluSection from './FluSection';
import InteractiveProductSelector from './InteractiveProductSelector';
import AcneCategories from './AcneCategories';
import SEO from "../../Components/Common/SEO/SEO";
import StructuredData from "../../Components/Common/SEO/StructuredData";

const Home = memo(() => {
  const location = useLocation();
  return (
    <>
      <SEO
        title="Farmaci Ashila | Mjekësi & Kujdes Shëndetësor në Shqipëri | Farmaci Online"
        description="Farmaci Ashila - Partneri juaj i besueshëm për produkte mjekësore të kuruara, këshillim profesional dhe kujdes shëndetësor cilësor në Shqipëri. Porositni online barna dhe kozmetikë."
        keywords="farmaci ashila, farmaci online shqiperi, farmaci ne tirane, mjekësi, shëndet, produkte farmaceutike, kujdes shëndetësor, e-pharma albania, barna online, kozmetike"
        canonicalUrl="https://www.farmaciashila.com/"
      />
      <StructuredData type="LocalBusiness" />
      <div className="relative" style={{ marginTop: 0, paddingTop: 0 }}>
        <h1 className="sr-only">Farmaci Ashila - Produkte Mjekësore të Kuruara dhe Kujdes Shëndetësor</h1>
        <Hero />
      </div>

      <div className="relative z-10 bg-white">
        <div className="mb-12 md:mb-0">
          <BestSeller />
        </div>
        <div className="mt-12 md:mt-0">
          <AcneCategories />
        </div>
        <HydrationSection />
        <FluSection />
        <InteractiveProductSelector />
      </div>
    </>
  );
});

Home.displayName = 'Home';

export default Home;
