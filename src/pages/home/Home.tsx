import React from 'react';
import { Button } from '@/components/ui/button';
import { WhiteLogo } from '@/assets/image/images';
import { ArrowRight, Train, Building2, Users, FileText } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex items-center justify-center min-h-[100vh] bg-gradient-to-b from-blue-900 to-blue-800 relative overflow-hidden p-2 sm:p-0">
      <div className="text-center space-y-6 z-10 max-w-4xl mx-auto px-4">
        <img src={WhiteLogo} alt="DFCCIL Logo" className="mx-auto w-48 h-auto" />
        <h1 className="text-white text-3xl md:text-5xl font-bold">
          Dedicated Freight Corridor Corporation of India Limited
        </h1>
        <p className="text-white/90 text-xl max-w-2xl mx-auto">
          A Government of India (Ministry of Railways) Enterprise
        </p>
      </div>
    </div>
  );
};

export default HomePage;
