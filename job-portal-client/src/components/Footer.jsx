import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-screen-xl px-6 py-10 mx-auto xl:px-24">
        <div className="grid grid-cols-2 gap-8 mb-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <svg width="24" height="24" viewBox="0 0 29 30" xmlns="http://www.w3.org/2000/svg" fill="none">
                <circle cx="12.0143" cy="12.5143" r="12.0143" fill="#3575E2" fillOpacity="0.4" />
                <circle cx="16.9857" cy="17.4857" r="12.0143" fill="#3575E2" />
              </svg>
              <span className="font-bold text-gray-900">JobNest</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Connecting top talent with leading companies across the globe.
            </p>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-gray-800">Job Seekers</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-gray-500 transition-colors hover:text-blue-600">Find Jobs</Link></li>
              <li><Link to="/salary" className="text-sm text-gray-500 transition-colors hover:text-blue-600">Salary Insights</Link></li>
              <li><Link to="/my-job" className="text-sm text-gray-500 transition-colors hover:text-blue-600">My Applications</Link></li>
              <li><Link to="/profile" className="text-sm text-gray-500 transition-colors hover:text-blue-600">Edit Profile</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-gray-800">Employers</h4>
            <ul className="space-y-2">
              <li><Link to="/post-job" className="text-sm text-gray-500 transition-colors hover:text-blue-600">Post a Job</Link></li>
              <li><Link to="/companies" className="text-sm text-gray-500 transition-colors hover:text-blue-600">Browse Companies</Link></li>
              <li><Link to="/my-job" className="text-sm text-gray-500 transition-colors hover:text-blue-600">Manage Jobs</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-gray-800">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-sm text-gray-500 transition-colors hover:text-blue-600">Login</Link></li>
              <li><Link to="/sign-up" className="text-sm text-gray-500 transition-colors hover:text-blue-600">Sign up</Link></li>
              <li><Link to="/forgot-password" className="text-sm text-gray-500 transition-colors hover:text-blue-600">Forgot Password</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-sm text-gray-500 border-t border-gray-100 sm:flex-row">
          <p>© 2026 JobNest. Made by
            <a href="https://www.facebook.com/talha.jubu.14/" target="_blank" rel="noopener noreferrer" className="font-medium text-blue hover:underline"> Talha Jubair </a> 
            
            &
            
            <a href="https://www.facebook.com/mn.huda.029" target="_blank" rel="noopener noreferrer" className="font-medium text-blue hover:underline"> Nazmul Huda </a></p>
          <p className="text-xs text-gray-400">Built with React, Node.js & MongoDB</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
