import React from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Bell, Search, User } from "lucide-react";

export default function Header() {
  const { userEmail, user, logout } = useAuth();
  const displayName = user?.fullName || user?.FullName || userEmail || "Admin";

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center text-gray-500">
        <Search className="w-5 h-5 mr-2" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="border-none bg-transparent focus:ring-0 outline-none text-sm placeholder-gray-400 w-64"
        />
      </div>

      <div className="flex items-center space-x-4 flex-shrink-0">
        <button className="text-gray-400 hover:text-gray-500 relative p-1 rounded-full hover:bg-gray-100 transition-colors">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
            <User className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{displayName}</span>
        </div>

        <button 
          onClick={logout}
          className="ml-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
