import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { 
  Building2, LayoutDashboard, Users, FileText, 
  AlertTriangle, PieChart, Info, ShieldAlert, User, Megaphone, HeartHandshake, Menu, X
} from 'lucide-react';

function DashboardLayout({ children, isAdmin }) {
  const { user } = useUser();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeClass = "bg-indigo-50 text-indigo-700 font-semibold border-r-4 border-indigo-600";
  const inactiveClass = "text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors";

  return (
    <div className="flex h-screen bg-slate-50 font-sans relative">
      {isMobileOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)}></div>}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out z-50 w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm`}>
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Building2 className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">SDS</h1>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setIsMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="px-6 py-2 mb-4">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Menu</div>
          <nav className="flex flex-col gap-1 -mx-2">
            
            {isAdmin ? (
              <>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <LayoutDashboard size={20} /> Dashboard
                </NavLink>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/houses" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <Users size={20} /> Managed Houses
                </NavLink>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/maintenance" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <FileText size={20} /> Billing & Dues
                </NavLink>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/complaints" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <AlertTriangle size={20} /> Resolving Tickets
                </NavLink>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/religious-funds" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <FileText size={20} /> Religious Funds
                </NavLink>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/reports" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <PieChart size={20} /> Financials
                </NavLink>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/notices" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <Megaphone size={20} /> Notice Board
                </NavLink>
              </>
            ) : (
              <>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <LayoutDashboard size={20} /> My Dashboard
                </NavLink>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/my-profile" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <User size={20} /> Resident Profile
                </NavLink>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/my-maintenance" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <FileText size={20} /> My Maintenance
                </NavLink>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/my-complaints" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <AlertTriangle size={20} /> My Complaints
                </NavLink>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/notices" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <Megaphone size={20} /> Notice Board
                </NavLink>
                <NavLink onClick={() => setIsMobileOpen(false)} to="/religious-funds" className={({isActive}) => `px-4 py-2.5 rounded-l-lg flex items-center gap-3 ${isActive ? activeClass : inactiveClass}`}>
                  <HeartHandshake size={20} /> Religious Funds
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto p-6">
           <div className={`p-4 rounded-xl flex items-start gap-3 ${isAdmin ? 'bg-indigo-50 border border-indigo-100' : 'bg-emerald-50 border border-emerald-100'}`}>
             <ShieldAlert size={20} className={isAdmin ? 'text-indigo-600' : 'text-emerald-600'} />
             <div>
               <p className={`text-sm font-bold ${isAdmin ? 'text-indigo-900' : 'text-emerald-900'}`}>
                 {isAdmin ? "Admin Portal" : "Resident Portal"}
               </p>
               <p className={`text-xs mt-1 ${isAdmin ? 'text-indigo-600' : 'text-emerald-600'}`}>
                 You have {isAdmin ? 'full access' : 'restricted access'}.
               </p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
             <button className="md:hidden text-slate-500 hover:text-indigo-600" onClick={() => setIsMobileOpen(true)}>
                <Menu size={24} />
             </button>
             <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
               Welcome, {user?.firstName || 'User'} 👋
             </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-100 px-3 py-1.5 rounded-full text-sm text-slate-600 font-medium flex items-center gap-2">
               <Info size={16} /> Beta
             </div>
             <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-10 h-10 ring-2 ring-indigo-50 hover:ring-indigo-200 transition" } }} />
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50 relative">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
