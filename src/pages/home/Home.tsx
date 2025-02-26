import React from 'react';
import { Button } from '@/components/ui/button'; // Ensure correct import path for your project
import { WhiteLogo } from '@/assets/image/images';

const HomePage = () => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center min-h-screen bg-primary relative overflow-hidden p-2 sm:p-0">
        <div className="absolute w-32 h-32 bg-blue-500 rounded-full opacity-30 top-10 right-2 animate-pulse"></div>
        <div className="absolute w-64 h-64 bg-blue-400 rounded-full opacity-20 -bottom-10 -right-6 animate-ping"></div>
        <div className="text-center space-y-6 z-10">
          <img src={WhiteLogo} alt="DFCCIL Logo" className="mx-auto w-40 h-auto" />
          <h1 className="text-white text-4xl font-bold">
            Welcome to <span className="text-yellow-400">DFCCIL</span>
          </h1>
          <p className="text-white text-lg max-w-md mx-auto">
            Transforming freight transport in India. Join us in building the future of railway infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
