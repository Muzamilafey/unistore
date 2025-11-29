import React, { useEffect, useState } from 'react';
import './WishlistButton.css';

const WishlistButton = ({ productId }) => {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    try {
      let list = JSON.parse(localStorage.getItem('mw_wishlist') || '[]');
      // normalize stored values to an array of id strings
      if (!Array.isArray(list)) list = [];
      list = list.map((v) => (v && typeof v === 'object' ? (v._id || v.id || String(v)) : String(v)));
      setFav(list.includes(String(productId)));
    } catch (e) {
      setFav(false);
    }
  }, [productId]);

  const toggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      let list = JSON.parse(localStorage.getItem('mw_wishlist') || '[]');
      if (!Array.isArray(list)) list = [];
      // normalize to string ids
      list = list.map((v) => (v && typeof v === 'object' ? (v._id || v.id || String(v)) : String(v)));
      const idStr = String(productId);
      let next;
      if (list.includes(idStr)) {
        next = list.filter((id) => id !== idStr);
        setFav(false);
      } else {
        // add to front and ensure uniqueness
        next = [idStr, ...list.filter((id) => id !== idStr)];
        setFav(true);
      }
      localStorage.setItem('mw_wishlist', JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button className={`wishlist-btn ${fav ? 'active' : ''}`} onClick={toggle} aria-label="Add to wishlist">
      {fav ? '♥' : '♡'}
    </button>
  );
};

export default WishlistButton;
