import React from 'react';
import { Link } from 'react-router';
import { HomeIconLogo, logo } from '@/assets/image/images';
import { SidebarTrigger } from './ui/sidebar';
import { Separator } from './ui/separator';
import { useDispatch, useSelector } from 'react-redux';
import { removeSessionItem } from '@/lib/helperFunction';
import { resetUser } from '@/features/user/userSlice';
import { environment } from '@/config';
import { RootState } from '@/app/store';
import Heading from './ui/heading';

const SiteHeader: React.FC = ({ showtoggle = true }: { showtoggle?: boolean }) => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    removeSessionItem('token');
    dispatch(resetUser());
    window.location.href = environment.logoutUrl;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 w-full z-50 border-b-4 border-red-600 h-[80px]">
      <div className="flex items-center justify-between pr-8 py-4">
        <div className="flex items-center space-x-6">
          {showtoggle && (
            <>
              <SidebarTrigger className="text-primary w-12 h-12  rounded-md transition-all " />
              <Separator orientation="vertical" className="h-8 bg-gray-300" />
            </>
          )}

          <Link to="#" className="hidden sm:flex flex-col text-primary">
            <span className="text-md md:text-lg font-semibold">
              Dedicated Freight Corridor Corporation of India Limited
            </span>
            <span className="text-sm md:text-md text-gray-600">A Govt. of India (Ministry of Railways) Enterprise</span>
          </Link>
        </div>

        {/* Right Section (User Info + Logout Button) */}
        <div className="flex items-center space-x-6">
          {/* User Name */}
          {showtoggle && (
            <div className="hidden md:block text-gray-800 text-md md:text-lg font-semibold">{user.unique_name}</div>
          )}
          {/* Logout Button */}
          {/* <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center justify-center rounded-md bg-gray-100 shadow-md p-3 hover:bg-gray-200 transition-all"
          >
            <img src={HomeIconLogo} alt="Logout" className="w-6 h-6" />
          </button> */}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <p className="text-primary text-center rounded-md px-2 bg-white font-bold text-lg">
          Grievance Management System
        </p>
      </div>
    </header>
  );
};

export default SiteHeader;
