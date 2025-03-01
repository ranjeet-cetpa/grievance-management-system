import React from 'react';

import { SidebarProvider } from "@/components/ui/sidebar";
import SiteHeader from "@/components/site-header";
import { AdminSidebar } from "../sidebar/AdminSidebar";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <SidebarProvider className="flex flex-col flex-1">
                <div className="flex flex-1 overflow-hidden">
                    <AdminSidebar className="w-64 bg-gray-800 text-white flex-shrink-0" />
                    <div className=" w-full bg-gray-100 overflow-auto">
                        <SiteHeader />
                        <div className="p-2">{children}</div>
                    </div>
                </div>
            </SidebarProvider>
        </div>
    );
};

export default AdminLayout;