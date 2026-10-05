import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import app from '../firebase/firebase.config';
import Navbar from './Navbar';
import Footer from './Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = getAuth(app);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please enter your email address.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      
      Swal.fire({
        icon: 'success',
        title: 'Check Your Email',
        text: 'A password reset link has been sent to your email address.',
        confirmButtonColor: '#3575E2'
      }).then(() => {
        navigate('/login');
      });
      
    } catch (error) {
      let msg = 'Could not send reset email.';
      if (error.code === 'auth/user-not-found') msg = 'No user found with this email address.';
      else if (error.code === 'auth/invalid-email') msg = 'Invalid email address format.';
      else if (error.code === 'auth/too-many-requests') msg = 'Too many requests. Please try again later.';
      
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: msg,
        confirmButtonColor: '#3575E2'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col bg-[#f8fafc]'>
      <Navbar />
      <main className='flex-1 flex items-center justify-center px-4 py-16 sm:py-24'>
        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Forgot password?</h2>
            <p className="text-gray-500 text-[15px]">No worries, we'll send you reset instructions.</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-8">
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#3575E2] hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Reset password'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 font-medium inline-flex items-center gap-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to log in
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
