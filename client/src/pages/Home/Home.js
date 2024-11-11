import React from "react";
import { Link } from 'react-router-dom';

function Home() {
  return (
    <main className="home">
      <div className="home-text">
        <h1>Flavor of the Season</h1>
        <p>Discover the boldest, creamiest ice creams made with pure ingredients.</p>
        <Link to= "/shop" className="cta-btn">Order Now</Link>
      </div>
      <div className="home-image">
        <img src="/Ice-cream-sundae-hero-11.jpg" alt="Ice Cream" />
      </div>
    </main>
  );
}

export default Home;