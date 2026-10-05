import React, { useState } from 'react';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import app from '../firebase/firebase.config';
import Navbar from './Navbar';
import Footer from './Footer';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [gender, setGender] = useState('');
  const [skill, setSkill] = useState('');
  const [countryCode, setCountryCode] = useState('Bangladesh (88)');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
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

    // Validate required fields - either email OR mobile is required
    if (!name || (!email && !mobile) || !password || !skill || !gender) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill in all required fields. Either email or mobile number is required.',
      });
      return;
    }

    // Validate password match
    if (password !== retypePassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Passwords do not match.',
      });
      return;
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please agree to the Terms of Use.',
      });
      return;
    }

    // If mobile is provided but no email, we need to create a dummy email for Firebase
    // (Firebase Auth requires an email for email/password authentication)
    let signupEmail = email;
    if (!email && mobile) {
      signupEmail = `${mobile}@mobile.placeholder.com`;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, password);
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
      setRetypePassword('');
      setGender('');
      setSkill('');
      setAgreeToTerms(false);
      setSubscribeNewsletter(false);
    } catch (error) {
      let msg = 'Could not create account.';
      if (error.code === 'auth/email-already-in-use') msg = 'This email or mobile number is already in use.';
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
              <h2 className="text-2xl font-semibold mb-2">Create Account</h2>
            </div>

            <form onSubmit={handleSignup} className="w-full space-y-4">
              {/* Name and Gender Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Name
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Gender Selection */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Gender
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`flex-1 py-3 px-4 rounded border-2 font-medium transition-colors ${
                        gender === 'male'
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      👤 Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`flex-1 py-3 px-4 rounded border-2 font-medium transition-colors ${
                        gender === 'female'
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      👤 Female
                    </button>
                  </div>
                </div>
              </div>

              {/* Skill Selection */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Select your skill from following list (Required)
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="data-science">Data Science</option>
                  <option value="ui-ux-design">UI/UX Design</option>
                  <option value="digital-marketing">Digital Marketing</option>
                  <option value="content-writing">Content Writing</option>
                  <option value="graphic-design">Graphic Design</option>
                  <option value="project-management">Project Management</option>
                  <option value="business-analysis">Business Analysis</option>
                  <option value="devops">DevOps</option>
                </select>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Email Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-2">
                <div className="h-px bg-gray-300 flex-1" />
                <span className="text-sm text-gray-500 font-medium">OR</span>
                <div className="h-px bg-gray-300 flex-1" />
              </div>

              {/* Mobile Field with Country Code */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <select
                    className="shadow appearance-none border rounded py-3 px-2 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    <option value="Bangladesh (88)">Bangladesh (88)</option>
                    <option value="India (91)">India (91)</option>
                    <option value="Pakistan (92)">Pakistan (92)</option>
                    <option value="USA (1)">USA (1)</option>
                    <option value="UK (44)">UK (44)</option>
                  </select>
                  <input
                    className="flex-1 shadow appearance-none border rounded py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    type="tel"
                    placeholder="Your Phone Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>

              {/* Password and Retype Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className="shadow appearance-none border rounded w-full py-3 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  <div className="flex gap-1 mt-2">
                    <div className={`h-1 flex-1 rounded ${password.length >= 2 ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
                    <div className={`h-1 flex-1 rounded ${password.length >= 4 ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
                    <div className={`h-1 flex-1 rounded ${password.length >= 6 ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
                  </div>
                </div>

                {/* Retype Password Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Retype Password
                  </label>
                  <div className="relative">
                    <input
                      className="shadow appearance-none border rounded w-full py-3 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type={showRetypePassword ? "text" : "password"}
                      placeholder="Retype Password"
                      value={retypePassword}
                      onChange={(e) => setRetypePassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRetypePassword(!showRetypePassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showRetypePassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the Bdjobs.com Terms of use.{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms & Conditions
                    </a>
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subscribeNewsletter}
                    onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Subscribe to Bdjobs Newsletter.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Create Account
              </button>
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
