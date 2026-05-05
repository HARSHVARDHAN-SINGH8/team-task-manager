import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { useSearch } from '../contexts/SearchContext';
import { Moon, Sun, Menu, LogOut, LayoutDashboard, Plus, Search, Folder, CheckCircle, X } from 'lucide-react';
import GlobalCreateModal from './GlobalCreateModal';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { results, search, loading } = useSearch();
  
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      search(value);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
  };

  const handleResultClick = (path) => {
    setShowResults(false);
    setQuery('');
    navigate(path);
  };

  if (!user) {
    return (
      <nav className="bg-white dark:bg-[#1e1f21] border-b border-gray-200 dark:border-gray-800 h-16 flex items-center px-4">
        <Link to="/login" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <LayoutDashboard size={24} /> TaskMgr
        </Link>
      </nav>
    );
  }

  return (
    <nav className="bg-white/80 dark:bg-[#1e1f21] backdrop-blur-md border-b border-slate-200/60 dark:border-gray-800 h-[60px] fixed top-0 left-0 right-0 z-[100] px-4">
      <div className="max-w-full h-full flex items-center justify-between gap-4">
        
        {/* Left: Sidebar Toggle & Create */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500">
            <Menu size={20} />
          </button>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} /> Create
          </button>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              value={query}
              onChange={handleSearchChange}
              onFocus={() => query.trim() && setShowResults(true)}
              placeholder="Search tasks, projects..." 
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-[#2b2d30] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
            />
            {query && (
              <button onClick={handleClear} className="absolute right-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-400">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results Dropdown */}
          {showResults && query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e1f21] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500 italic">Searching...</div>
              ) : (
                <>
                  {/* Projects Section */}
                  {results?.projects?.length > 0 && (
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="px-3 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Projects</p>
                      {results.projects.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => handleResultClick(`/projects/${p.id}`)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#2b2d30] rounded-xl text-sm text-gray-700 dark:text-gray-200 text-left"
                        >
                          <Folder size={16} className="text-blue-500" /> {p.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tasks Section */}
                  {results?.tasks?.length > 0 && (
                    <div className="p-2">
                      <p className="px-3 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tasks</p>
                      {results.tasks.map(t => (
                        <button 
                          key={t.id}
                          onClick={() => handleResultClick(`/projects/${t.project_id}`)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#2b2d30] rounded-xl text-sm text-gray-700 dark:text-gray-200 text-left"
                        >
                          <CheckCircle size={16} className="text-green-500" />
                          <div>
                            <div className="font-medium">{t.title}</div>
                            <div className="text-[10px] text-gray-400">{t.project_name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {(!results?.projects?.length && !results?.tasks?.length) && (
                    <div className="p-8 text-center text-gray-500 text-sm">No results for "{query}"</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Theme & User */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1" />
          <div className="flex items-center gap-3">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-black dark:text-white leading-none">{user?.name?.toUpperCase()}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Member</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <button onClick={logout} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-gray-400 hover:text-red-500">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <GlobalCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </div>
    </nav>
  );
};

export default Navbar;
