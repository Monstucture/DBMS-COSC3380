import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import iceCream1 from "../../assets/images/ice-cream-1.jpg";
import iceCream2 from "../../assets/images/ice-cream-2.jpg";
import iceCream3 from "../../assets/images/ice-cream-3.jpg";
import iceCream4 from "../../assets/images/ice-cream-4.jpg";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [iceCream1, iceCream2, iceCream3, iceCream4];

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === 0 ? images.length - 1 : prevSlide - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === images.length - 1 ? 0 : prevSlide + 1));
  };

  return (
    <main className="home">
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="absolute left-4 z-10 text-white hover:text-gray-300 transition-colors"
            onClick={handlePrevSlide}
          >
            <ChevronLeftIcon size={32} />
          </button>
          <img
            src={images[currentSlide]}
            alt="Ice Cream"
            className="w-full h-full object-cover"
          />
          <button
            className="absolute right-4 z-10 text-white hover:text-gray-300 transition-colors"
            onClick={handleNextSlide}
          >
            <ChevronRightIcon size={32} />
          </button>
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="bg-white bg-opacity-80 px-8 py-6 rounded-md">
          <h1 className="text-4xl font-bold text-black mb-4">Flavor of the Season</h1>
          <p className="text-lg text-black mb-8">
            Discover the boldest, creamiest ice creams made with pure ingredients.
          </p>
          <Link to="/shop" className="bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors">
            Order Now
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Home;