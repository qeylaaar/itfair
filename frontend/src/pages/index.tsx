import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import BenefitSection from "../components/BenefitSection";
import FeatureSection from "../components/FeatureSection";
import Testimonials from "../components/Testimonial";
import FAQ from "../components/FAQ";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

export default function HomePage() {
  
 
  return (
    <div className="min-h-screen transition-colors">
        <HeroSection/>
        <FeatureSection/>
        <BenefitSection/>
        <Testimonials/>
        <FAQ/>
    </div>
  )
}