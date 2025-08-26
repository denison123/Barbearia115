// src/pages/HomePage.js

import React from 'react';
import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
//import Footer from '../components/Footer/Footer';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page-container">
      <Header />
      <HeroSection />
      <Footer />
    </div>
  );
};

export default HomePage;