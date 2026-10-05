import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiSearch, FiAlertCircle } from 'react-icons/fi';

const NotFound = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      {/* Floating decorative orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #3575E2, transparent)' }} />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
        style={{ background: 'radial-gradient(circle, #3575E2, transparent)' }} />

      <div
        className="text-center relative z-10"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease' }}
      >
        {/* 404 Giant Text */}
        <div className="relative mb-6 select-none">
          <span
            className="font-black text-white leading-none"
            style={{ fontSize: 'clamp(120px, 20vw, 220px)', opacity: 0.06 }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-black text-transparent leading-none"
              style={{
                fontSize: 'clamp(80px, 13vw, 150px)',
                WebkitTextStroke: '2px rgba(255,255,255,0.8)',
              }}
            >
              404
            </span>
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(53, 117, 226, 0.15)', border: '1px solid rgba(53,117,226,0.3)' }}
          >
            <FiAlertCircle className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto mb-10 leading-relaxed">
          Oops! The page you're looking for doesn't exist, has been moved, or the URL is incorrect.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #3575E2, #5b8dee)' }}
          >
            <FiHome className="w-5 h-5" />
            Go Back Home
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
          >
            <FiSearch className="w-5 h-5" />
            Browse Jobs
          </Link>
        </div>

        {/* Dots decoration */}
        <div className="flex justify-center gap-2 mt-16">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: i === 2 ? '#3575E2' : 'rgba(255,255,255,0.2)',
                transform: i === 2 ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
