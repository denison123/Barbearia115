// src/pages/HomePage.js

import React from 'react';
import Header from '../components/Header/Header';
import HeroSection from '../components/HeroSection/HeroSection';
import Footer from '../components/Footer/Footer';

const HomePage = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      {/* Aqui você pode adicionar outras seções, como a de serviços ou diferenciais */}
      <Footer />
    </div>
  );
};

export default HomePage;