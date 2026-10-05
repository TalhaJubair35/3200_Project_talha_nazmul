import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom';
import { FaBarsStaggered, FaXmark } from "react-icons/fa6";
import { useAuth } from '../context/AuthContext';
import { FiUser, FiSettings, FiLogOut, FiChevronDown, FiBriefcase } from 'react-icons/fi';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const { user, logout, loading, isAdmin } = useAuth();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = [
    { path: "/", title: "Find Jobs", always: true },
    { path: "/companies", title: "Companies", always: true },
    { path: "/salary", title: "Salary Insights", always: true },
    { path: "/my-job", title: isAdmin ? "Manage Jobs" : "My Jobs", show: !!user },
    { path: "/post-job", title: "Post a Job", show: isAdmin },
    { path: "/talent", title: "Talent Pool", show: isAdmin },
    { path: "/analytics", title: "Analytics", show: isAdmin },
    { path: "/manage-admins", title: "Admins", show: isAdmin },
  ].filter(item => item.always || item.show);

  return (
    <header className='container relative z-50 px-4 mx-auto bg-white border-b border-gray-100 max-w-screen xl:px-24'>
      <nav className="flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0 gap-2 text-xl font-bold text-black">
          <svg width="28" height="28" viewBox="0 0 29 30" xmlns="http://www.w3.org/2000/svg" fill="none">
            <circle cx="12.0143" cy="12.5143" r="12.0143" fill="#3575E2" fillOpacity="0.4" />
            <circle cx="16.9857" cy="17.4857" r="12.0143" fill="#3575E2" />
          </svg>
          <span>JobNest</span>
        </Link>

        {/* Desktop Nav Items */}
        <ul className="items-center hidden gap-8 lg:flex">
          {navItems.map(({ path, title }) => (
            <li key={path} className="text-sm">
              <NavLink
                to={path}
                className={({ isActive }) =>
                  isActive
                    ? "text-blue font-semibold relative after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-blue after:rounded-full"
                    : "text-gray-600 hover:text-gray-900 transition-colors"
                }
              >
                {title}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Auth Controls (Desktop) */}
        <div className="items-center hidden gap-3 lg:flex">
          {loading ? null : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsAvatarOpen(prev => !prev)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer" className="object-cover w-8 h-8 rounded-full" />
                                ) : (
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-blue-600 rounded-full">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800 max-w-[100px] truncate leading-none">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                  {isAdmin && <span className="text-[10px] text-blue-600 font-medium">Admin</span>}
                </div>
                <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isAvatarOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {isAvatarOpen && (
                <div className="absolute right-0 z-50 py-2 mt-2 bg-white border border-gray-100 shadow-xl top-full w-52 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 mb-1 border-b border-gray-50">
                    <p className="text-xs font-semibold text-gray-800 truncate">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setIsAvatarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <FiUser className="w-4 h-4 text-gray-400" /> Edit Profile
                  </Link>
                  <Link to="/my-job" onClick={() => setIsAvatarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <FiBriefcase className="w-4 h-4 text-gray-400" /> My Jobs
                  </Link>
                  <div className="pt-1 mt-1 border-t border-gray-50">
                    <button onClick={() => { logout(); setIsAvatarOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <FiLogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 rounded-xl hover:bg-gray-50">
                Log in
              </Link>
              <Link to="/sign-up" className="text-sm font-semibold bg-[#3575E2] text-white px-5 py-2 rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all hover:-translate-y-0.5">
                Sign up free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="p-2 rounded-lg lg:hidden hover:bg-gray-50" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FaXmark className="w-5 h-5 text-gray-700" /> : <FaBarsStaggered className="w-5 h-5 text-gray-700" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`lg:hidden absolute left-0 right-0 top-full bg-white shadow-xl border-t border-gray-100 overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 py-5 space-y-1">
          {navItems.map(({ path, title }) => (
            <NavLink key={path} to={path}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`
              }
            >
              {title}
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer" className="object-cover w-10 h-10 rounded-full" />
                  ) : (
                    <div className="flex items-center justify-center w-10 h-10 text-base font-bold text-white bg-blue-600 rounded-full">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 rounded-xl hover:bg-gray-50">
                  <FiUser className="w-4 h-4" /> Edit Profile
                </Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="flex items-center w-full gap-3 px-4 py-3 text-sm text-red-500 rounded-xl hover:bg-red-50">
                  <FiLogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}
                  className="w-full py-3 text-sm font-medium text-center text-gray-700 border border-gray-200 rounded-xl">
                  Log in
                </Link>
                <Link to="/sign-up" onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center py-3 bg-[#3575E2] text-white rounded-xl text-sm font-semibold shadow-sm">
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
