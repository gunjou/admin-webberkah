import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#1a1419] font-poppins transition-colors duration-300">
      {/* Kirim isDark ke Sidebar */}
      <Sidebar isOpen={isSidebarOpen} isDark={isDark} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Kirim isDark dan fungsi toggle ke Navbar */}
        <Navbar
          isDark={isDark}
          setIsDark={setIsDark}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-[#231b21] p-4 md:p-6 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
