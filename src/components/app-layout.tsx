import React from 'react';
import { AppSidebar } from './app-sidebar';
import { SidebarInset, SidebarProvider } from './ui/sidebar';
import SiteHeader from './site-header';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      {/* Site Header */}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AppSidebar className="w-64 bg-gray-800 text-white flex-shrink-0 " />

        {/* Content Area */}
        <div className="flex-1  bg-gray-100 overflow-auto">
          <SiteHeader />
          <div className="flex-1 w-full"> {children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
