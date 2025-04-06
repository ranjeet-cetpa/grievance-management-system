import React from 'react';

import { SidebarProvider } from "@/components/ui/sidebar";
import SiteHeader from "@/components/site-header";
import { AdminSidebar } from "../sidebar/AdminSidebar";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SidebarProvider className="flex flex-col w-full h-screen">
            <SiteHeader />
            <div className="w-full bg-gray-100 flex-1 overflow-hidden">
                <div className="flex flex-row h-full">
                    <AdminSidebar />
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

export default AdminLayout;