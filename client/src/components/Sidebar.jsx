import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Folder, X, Search, ChevronRight, CheckCircle, Bell, BarChart3 } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const { search } = useSearch();

  if (!user) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className={`fixed top-[60px] inset-0 bg-black/40 backdrop-blur-[2px] z-[85] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />
      
      <aside className={`
        fixed top-[60px] left-0 z-[90] h-[calc(100vh-60px)] w-[260px] flex flex-col 
        bg-slate-50/90 dark:bg-[#1e1f21] backdrop-blur-xl border-r border-slate-200/60 dark:border-gray-800
        transition-transform duration-300 ease-in-out overflow-y-auto overscroll-contain
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
      {/* Sidebar Header */}
      <div className="h-[60px] flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">TaskMgr</span>
        </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar px-4 space-y-8">
          {/* Search */}
          <div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
              <input 
                type="text" 
                onChange={(e) => search(e.target.value)}
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#2b2d30] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <div>
              <h3 className="px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Workspace</h3>
              <nav className="space-y-1">
                <NavLink 
                  to="/home" 
                  onClick={toggleSidebar}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2b2d30]'}
                  `}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Home
                </NavLink>

                <NavLink 
                  to="/my-tasks" 
                  onClick={toggleSidebar}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2b2d30]'}
                  `}
                >
                  <CheckCircle className="w-5 h-5" />
                  My Tasks
                </NavLink>

                <NavLink 
                  to="/inbox" 
                  onClick={toggleSidebar}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2b2d30]'}
                  `}
                >
                  <Bell className="w-5 h-5" />
                  Inbox
                </NavLink>

                <NavLink 
                  to="/reporting" 
                  onClick={toggleSidebar}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2b2d30]'}
                  `}
                >
                  <BarChart3 className="w-5 h-5" />
                  Reporting
                </NavLink>
              </nav>
            </div>

            <div>
              <h3 className="px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Projects</h3>
              <nav className="space-y-1">
                <NavLink 
                  to="/projects" 
                  onClick={toggleSidebar}
                  className={({ isActive }) => `
                    flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2b2d30]'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5" />
                    All Projects
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </NavLink>
              </nav>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#2b2d30] rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
