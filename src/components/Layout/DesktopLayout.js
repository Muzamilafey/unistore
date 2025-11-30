import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import './DesktopLayout.css';

const DesktopLayout = ({ mainContent, heroCarousel, deals, featuredCategories }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/products/categories');
        setCategories(data.slice(0, 8));
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="desktop-layout">
      {/* Top Section: Carousel with Sidebars */}
      <div className="carousel-section">
        {/* Left Sidebar - Categories */}
        <aside className="desktop-left-sidebar-top">
          <div className="sidebar-section">
            <div className="sidebar-header">
              <span className="header-icon">📦</span>
              <strong>Categories</strong>
            </div>
            <div className="categories-list">
              {categories.map((cat) => (
                <a key={cat} href={`/?category=${encodeURIComponent(cat)}`} className="category-link">
                  {cat}
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* Hero Carousel */}
        <div className="main-carousel-wrapper">
          {heroCarousel}
        </div>

        {/* Right Sidebar - Info Boxes */}
        <aside className="desktop-right-sidebar-top">
               
          {/* Call to Order Box */}
          <div className="info-box call-box">
            <div className="box-icon"></div>
            <div className="box-label">CALL OR WHATSAPP</div>
            <div className="box-action">0722651888</div>
            <div className="box-action-sub">TO ORDER</div>
          </div>
        </aside>
      </div>

      {/* Main Content Section - Below Carousel */}
      <main className="desktop-main-content">
        {/* Featured Carousel & Hero */}
        <div className="main-content-section">
          {mainContent}
        </div>

        {/* Deals Section */}
        <div className="deals-section-desktop">
          {deals}
        </div>

        {/* Featured Categories */}
        <div className="featured-cats-desktop">
          {featuredCategories}
        </div>
      </main>
    </div>
  );
};

export default DesktopLayout;
