import React, { useState } from 'react';

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`bg-gray-800 text-white w-64 flex-shrink-0 transition-all duration-300 ${
          isSidebarOpen ? 'block' : 'hidden'
        } md:block`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <h1 className="text-xl font-bold">My Dashboard</h1>
        </div>
        <nav className="p-4 space-y-2">
          <a href="#" className="block py-2 px-4 bg-gray-700 rounded hover:bg-gray-600">Home</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700">Analytics</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700">Settings</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700">Profile</a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-4">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {/* Hamburger Icon */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Welcome, User</span>
            <div className="h-8 w-8 bg-blue-500 rounded-full"></div>
          </div>
        </header>

        {/* Dashboard Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Stat Cards */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">1,245</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">$34,500</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Active Sessions</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">342</p>
            </div>
          </div>

          {/* Main Chart/Data Area */}
          <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center">
            <p className="text-gray-400">Chart or Data Table Content Goes Here</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;