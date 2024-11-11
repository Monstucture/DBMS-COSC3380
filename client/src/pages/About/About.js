import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <h1>About Us</h1>

      <section>
        <h2>Our Story</h2>
        <p>
          Welcome to Ice Cream Shop, where passion meets flavor! Since our establishment, 
          to every customer who walks through our doors. Today, we continue that 
          tradition with our handcrafted flavors and commitment to excellence.
        </p>
      </section>

      <section>
        <h2>Our Values</h2>
        <ul>
          <li>Quality ingredients sourced from local suppliers</li>
          <li>Environmental responsibility in our practices</li>
          <li>Supporting our local community</li>
        </ul>
      </section>

      <section>
        <h2>Visit Us</h2>
        <div className="contact-info">
          <p>123 Ice Cream Lane</p>
          <p>Dessert City, DC 12345</p>
          <p>Phone: (555) 123-4567</p>
          <p>Email: info@icecreamshop.com</p>
        </div>
      </section>
    </div>
  );
};

export default About;