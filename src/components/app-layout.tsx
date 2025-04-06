import React from 'react';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider } from './ui/sidebar';
import SiteHeader from './site-header';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider className="flex flex-col w-full h-screen">
      <SiteHeader />
      <div className="w-full bg-gray-100 flex-1 overflow-hidden">
        <div className="flex flex-row h-full">
          <AppSidebar />
          <div className="w-full flex flex-col h-full">
            <div className="flex items-center mt-2 gap-0 justify-center text-primary text-center rounded-md font-bold text-3xl">
              e-निवारण
            </div>
            <div className="bg-white flex-1 overflow-auto">{children}</div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
