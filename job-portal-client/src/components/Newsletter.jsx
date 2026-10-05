import React, { useState } from 'react'
import { FaEnvelopeOpenText, FaRocket } from "react-icons/fa6"
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const { user } = useAuth();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please enter your email address.' });
      return;
    }
    setEmail('');
    Swal.fire({ icon: 'success', title: 'Success!', text: 'You have been subscribed to our newsletter!' });
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      Swal.fire({ icon: 'warning', title: 'Login Required', text: 'Please log in to submit your resume.' });
      return;
    }
    if (!resumeLink.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please enter your resume link.' });
      return;
    }
    
    try {
      await fetch(`${API_BASE_URL}/user-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          resumeLink,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Your resume has been submitted to top companies!',
      }).then(() => {
        setResumeLink('');
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to submit resume. Try again.' });
    }
  };

  return (
    <div>
      <div>
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <FaEnvelopeOpenText className="text-blue-600" /> Email Latest Jobs
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Subscribe to our Newsletter for the latest job updates
        </p>
        <form onSubmit={handleSubscribe} className="w-full space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full block py-2.5 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            className="w-full block py-2.5 px-4 bg-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm"
          >
            Subscribe
          </button>
        </form>
      </div>

      <div className="mt-14 bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-blue-900">
          <FaRocket className="text-blue-600" /> Get Noticed Faster
        </h3>
        <p className="text-blue-800/80 text-sm mb-5">
          Submit your resume link here to get noticed faster by Top Companies.
        </p>
        <form onSubmit={handleResumeUpload} className="w-full space-y-3">
          <input
            type="url"
            placeholder="Link (e.g. Google Drive, Portfolio)"
            required
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
            className="w-full block py-2.5 px-4 rounded-lg border border-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm shadow-sm"
          />
          <button
            type="submit"
            className="w-full block py-2.5 px-4 bg-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md text-sm"
          >
            Submit Resume
          </button>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;
