import React, { useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

import app from '../firebase/firebase.config';
import Navbar from './Navbar';
import Footer from './Footer';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;
      navigate('/', { replace: true });
      Swal.fire({ icon: 'success', title: 'Signup Successful', text: `Welcome, ${currentUser.displayName || currentUser.email}!` });
    } catch (error) {
      let msg = 'An unexpected error occurred.';
      if (error.code === 'auth/popup-closed-by-user') msg = 'Signup cancelled.';
      else if (error.code === 'auth/network-request-failed') msg = 'Network error. Please check your connection.';
      Swal.fire({ icon: 'error', title: 'Signup Failed', text: msg });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!name || !email || !mobile || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter all fields: Name, Email, Mobile, and Password.',
      });
      return; // Exit function if any field is empty
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Successful signup, redirect and display message
      navigate('/', { replace: true }); // Redirect to home page
      Swal.fire({
        icon: 'success',
        title: 'Signup Successful!',
        text: `Welcome, ${name}!`, // Use name for personalized greeting
      });

      // Optionally clear fields after successful signup
      setName('');
      setEmail('');
      setMobile('');
      setPassword('');
    } catch (error) {
      let msg = 'Could not create account.';
      if (error.code === 'auth/email-already-in-use') msg = 'This email is already in use.';
      else if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
      else if (error.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      else if (error.code === 'auth/network-request-failed') msg = 'Network error. Please check your connection.';
      
      Swal.fire({
        icon: 'error',
        title: 'Signup Failed',
        text: msg,
      });
    }
  };

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <Navbar />
      <main className='flex-1 flex items-center justify-center px-4 py-8'>
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        {user ? (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-2">Account ready</h2>
            <p className="text-gray-600 mb-6 text-center">You are signed in as {user.displayName || user.email}</p>
            <button onClick={() => navigate('/')} className="w-full bg-blue hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg">Go to home</button>
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Create account</h2>
              <p className="text-gray-600">Sign up with email or Google.</p>
            </div>

            <form onSubmit={handleSignup} className="w-full space-y-4">
        <div className="mb-4">
        <label style={{ // Inline style to set focus ring color
            outlineColor: '#4F46E5', // Replace with your desired blue color
          }} className=" text-gray-700 text-sm font-bold mb-2 focus-within:ring-indigo-600 flex items-center gap-2" to="name">
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)} // Update name state
          />
          
          <div className="mb-4 mt-4">
          <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2" to="mobile">
            Mobile Number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            id="number"
            type="number"
            placeholder="Enter your mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)} // Update email state
          />
           <div className="mb-4"></div>
          <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2" to="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
          />
        </div>
        <div className="mb-6">
          <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2" to="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            type="submit"
            className="bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Signup
          </button>
        </div>
        </div>
          </form>

          <div className="flex items-center gap-2">
            <div className="h-px bg-gray-300 flex-1" />
            <span className="text-sm text-gray-500">or</span>
            <div className="h-px bg-gray-300 flex-1" />
          </div>

          <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg" onClick={handleGoogleSignup}>
            Sign up with Google
          </button>

          <p className="text-sm text-center text-gray-600">
            Already have an account? <Link to="/login" className="text-blue-600 font-medium">Sign in</Link>
          </p>
        </div>
        )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
