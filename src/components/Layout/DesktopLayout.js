import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import './DesktopLayout.css';

const DesktopLayout = ({ mainContent, heroCarousel, deals, featuredCategories }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/products/categories');
        setCategories(data.slice(0, 12));
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="desktop-layout">
      {/* Left Sidebar - Categories */}
      <aside className="desktop-left-sidebar">
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

      {/* Main Content */}
      <main className="desktop-main-content">
        {/* Hero Carousel */}
        <div className="main-carousel-wrapper">
          {heroCarousel}
        </div>

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

      {/* Right Sidebar - Info Boxes */}
      <aside className="desktop-right-sidebar">
        {/* WhatsApp Box */}
        <div className="info-box whatsapp-box">
          <div className="box-icon">💬</div>
          <div className="box-label">WhatsApp</div>
          <div className="box-action">Text To Order</div>
        </div>

        {/* China Town Box */}
        <div className="info-box china-town-box">
          <div className="box-icon">🏪</div>
          <div className="box-label">CHINA TOWN</div>
          <div className="box-action">NOW ON JUMIA</div>
        </div>

        {/* Sell on Jumia Box */}
        <div className="info-box sell-box">
          <div className="box-icon">📊</div>
          <div className="box-label">SELL ON JUMIA</div>
          <div className="box-action">Millions Of Visitors</div>
        </div>

        {/* Call to Order Box */}
        <div className="info-box call-box">
          <div className="box-icon">📞</div>
          <div className="box-label">CALL OR WHATSAPP</div>
          <div className="box-action">0711 011 011</div>
          <div className="box-action-sub">TO ORDER</div>
        </div>
      </aside>
    </div>
  );
};

export default DesktopLayout;
