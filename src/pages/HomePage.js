// src/pages/HomePage.js

import React from 'react';
import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
// import Footer from '../components/Footer/Footer'; // Importação comentada
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page-container">
      <Header />
      <HeroSection />
      {/* <Footer /> */} {/* A tag do componente também deve ser comentada */}
    </div>
  );
};

export default HomePage;