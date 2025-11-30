import React, { useState, useEffect } from "react";
import Hero from "../components/Hero/Hero";
import DiscountedCarousel from "../components/Carousel/DiscountedCarousel";
import FeaturedCarousel from "../components/Carousel/FeaturedCarousel";
import FeaturedCategories from "../components/Featured/FeaturedCategories";
import ApiDebug from "../components/Debug/ApiDebug";
import TrustBadges from "../components/Trust/TrustBadges";
import DealBannerCarousel from "../components/deals/DealBannerCarousel";
import DealsList from "../components/deals/DealsList";
import DesktopLayout from "../components/Layout/DesktopLayout";
import { Helmet } from "react-helmet";
import "./index.css";

const HomePage = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop Layout Components
  const heroCarousel = <DiscountedCarousel />;
  const mainContent = (
    <>
      <FeaturedCarousel />
      <div className="hero-section-standalone">
        <Hero />
      </div>
    </>
  );
  const deals = <DealsList />;
  const featuredCategories = <FeaturedCategories />;

  return (
    <div className="products-section">
      {/* DEBUG: show API response to help diagnose deployment issues */}
      
      {isDesktop ? (
        // Desktop Layout - Three Column
        <DesktopLayout
          mainContent={mainContent}
          heroCarousel={heroCarousel}
          deals={deals}
          featuredCategories={featuredCategories}
        />
      ) : (
        // Mobile Layout - Traditional vertical stack
        <>
          <div className="hero-carousel-wrapper">
            <DiscountedCarousel />
          </div>
          <FeaturedCarousel />
          <div className="hero-section-standalone">
            <Hero />
          </div>
          <DealBannerCarousel />
          <DealsList />
          <FeaturedCategories />
        </>
      )}
      <TrustBadges />
      <Helmet>
        {/* Home Page Meta Tags */}
        <title>Unistore Store | Trendy Fashion Clothing in Eastleigh, Nairobi</title>
        <meta
          name="description"
          content="Shop premium quality fashion for men & women at Unistore Store. Affordable, stylish, and latest trends in Eastleigh. Visit us or shop online now!"
        />
        <meta name="keywords" content="
          online fashion store kenya,
          best online shop kenya,
          trendy clothes kenya,
          eastleigh fashion,
          eastleigh clothes online,
          affordable fashion kenya,
          men fashion kenya,
          women fashion kenya,
          unisex fashion kenya,
          latest fashion trends kenya,
          designer clothes kenya,
          casual wear kenya,
          streetwear kenya,
          official wear kenya,
          men suits kenya,
          women dresses kenya,
          hoodies kenya,
          t-shirts kenya,
          jeans kenya,
          shoes kenya,
          handbags kenya,
          fashion accessories kenya,
          online shopping kenya,
          nairobi fashion store,
          wholesale clothes kenya,
          eastleigh wholesale fashion,
          best clothing store kenya,
          top online fashion shop kenya,
          quality clothes kenya,
          fashion deals kenya,
          Unistore store,
          Unistore clothing kenya
      " />
        <meta name="author" content="Unistore Store" />

        {/* Open Graph */}
        <meta property="og:title" content="Unistore Store | Trendy Fashion Clothing in Eastleigh, Nairobi" />
        <meta property="og:description" content="Shop premium quality fashion for men & women at Unistore Store. Affordable, stylish, and latest trends in Eastleigh. Visit us or shop online now!" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://github.com/Muzamilafey/myassets/blob/main/Mandera%20-%201.png?raw=true" />
        <meta property="og:url" content="https://manwellstore.com" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Unistore Store | Trendy Fashion Clothing in Eastleigh, Nairobi" />
        <meta name="twitter:description" content="Shop premium quality fashion for men & women at Unistore Store. Affordable, stylish, and latest trends in Eastleigh. Visit us or shop online now!" />
        <meta name="twitter:image" content="https://github.com/Muzamilafey/myassets/blob/main/Mandera%20-%201.png?raw=true" />
      </Helmet>
    </div>
  );
};

export default HomePage;
