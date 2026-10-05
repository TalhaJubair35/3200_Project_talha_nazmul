import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import app from '../firebase/firebase.config';
import Navbar from './Navbar';
import Footer from './Footer';

const Login = () => {
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;
      const userName = currentUser.displayName || currentUser.email.split('@')[0];
      navigate('/', { replace: true });
      Swal.fire({
        icon: 'success',
        title: `Welcome, ${userName}!`,
        text: 'You have been successfully logged in.',
      });
    } catch (error) {
      let msg = 'An unexpected error occurred.';
      if (error.code === 'auth/popup-closed-by-user') msg = 'Login cancelled.';
      else if (error.code === 'auth/network-request-failed') msg = 'Network error. Please check your connection.';
      Swal.fire({ icon: 'error', title: 'Login Failed', text: msg });
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/', { replace: true });
      Swal.fire({ icon: 'success', title: 'Login Successful', text: 'You are now signed in.' });
    } catch (error) {
      let msg = 'Invalid email or password.';
      if (error.code === 'auth/invalid-credential') msg = 'Incorrect email or password.';
      else if (error.code === 'auth/too-many-requests') msg = 'Too many failed attempts. Try again later.';
      else if (error.code === 'auth/network-request-failed') msg = 'Network error. Please check your connection.';
      Swal.fire({ icon: 'error', title: 'Login Failed', text: msg });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/', { replace: true });
      Swal.fire({ icon: 'info', title: 'Logout Successful', text: 'You have been logged out.' });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Logout Error', text: error.message });
    }
  };

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <Navbar />
      <main className='flex-1 flex items-center justify-center px-4 py-8'>
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {user ? (
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
              <p className="text-gray-600 mb-6 text-center">Logged in as {user.displayName || user.email}</p>
              <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Login</h2>
                <p className="text-gray-600">Sign in to post jobs and manage your account.</p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                  <div className="text-right mt-1.5">
                    <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg mt-2">
                  Sign in with Email
                </button>
              </form>

              <div className="flex items-center gap-2">
                <div className="h-px bg-gray-300 flex-1" />
                <span className="text-sm text-gray-500">or</span>
                <div className="h-px bg-gray-300 flex-1" />
              </div>

              <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg" onClick={handleGoogleLogin}>
                Sign in with Google
              </button>

              <p className="text-sm text-center text-gray-600">
                Don’t have an account? <Link to="/sign-up" className="text-blue-600 font-medium">Create one</Link>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
