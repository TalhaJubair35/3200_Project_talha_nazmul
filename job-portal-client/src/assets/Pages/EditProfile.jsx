import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, updateProfile } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import app from '../../firebase/firebase.config';
import { FiUser, FiMail, FiPhone, FiLinkedin, FiFileText, FiSave, FiArrowLeft, FiBriefcase } from 'react-icons/fi';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const EditProfile = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth(app);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    displayName: '',
    phone: '',
    headline: '',
    bio: '',
    linkedinUrl: '',
    resumeLink: '',
  });

  // Pre-fill from Firebase + DB profile on load
  useEffect(() => {
    setForm({
      displayName: userProfile?.displayName || user?.displayName || '',
      phone: userProfile?.phone || '',
      headline: userProfile?.headline || '',
      bio: userProfile?.bio || '',
      linkedinUrl: userProfile?.linkedinUrl || '',
      resumeLink: userProfile?.resumeLink || '',
    });
  }, [user, userProfile]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) return;
    setIsSaving(true);

    try {
      // 1. Update Firebase display name
      if (form.displayName && form.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: form.displayName });
      }

      // 2. Save full profile to MongoDB
      await fetch(`${API_BASE_URL}/user-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          photoURL: user.photoURL,
          ...form,
        }),
      });

      refreshProfile();
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your changes have been saved.',
        confirmButtonColor: '#3575E2',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not save your profile. Please try again.', confirmButtonColor: '#3575E2' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">You must be logged in to edit your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 py-12 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-100 hover:text-white text-sm mb-6 transition-colors w-fit font-medium">
            <FiArrowLeft /> Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-600 tracking-tight">Edit Profile</h1>
          <p className="text-blue-100 text-sm md:text-base mt-2 max-w-xl leading-relaxed">Keep your professional details up-to-date. A complete profile increases your chances of getting noticed by top recruiters by up to 70%.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Avatar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8 text-center sticky top-8">
              <div className="relative inline-block mb-5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer" className="w-28 h-28 rounded-full object-cover mx-auto ring-4 ring-blue-50 shadow-md" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-blue-50 flex items-center justify-center mx-auto ring-4 ring-white shadow-md">
                    <FiUser className="w-12 h-12 text-blue-500" />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full" title="Online"></div>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{form.displayName || user.displayName || 'Your Name'}</h2>
              <p className="text-sm font-medium text-blue-600 mt-1 mb-6">{form.headline || 'Add a professional headline'}</p>

              <div className="pt-6 border-t border-gray-100 text-left space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600 group">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <span className="truncate" title={user.email}>{user.email}</span>
                </div>
                {form.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 group">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <FiPhone className="w-4 h-4" />
                    </div>
                    <span>{form.phone}</span>
                  </div>
                )}
                {form.linkedinUrl && (
                  <a href={form.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 group hover:text-blue-600 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <FiLinkedin className="w-4 h-4" />
                    </div>
                    <span className="truncate">LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: Edit Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info Card */}
              <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-50">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><FiUser /></div>
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input name="displayName" value={form.displayName} onChange={handleChange}
                      placeholder="John Doe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-gray-400" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+91 98765 43210" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Professional Card */}
              <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-50">
                  <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><FiBriefcase /></div>
                  Professional Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Professional Headline</label>
                    <input name="headline" value={form.headline} onChange={handleChange}
                      placeholder="e.g. Senior Frontend Engineer at Acme Corp" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bio / About</label>
                    <textarea name="bio" value={form.bio} onChange={handleChange} rows={5}
                      placeholder="Tell companies a little about yourself, your experience, and what you are looking for..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none shadow-sm placeholder:text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Links Card */}
              <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3 pb-4 border-b border-gray-50">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><FiFileText /></div>
                  Links & Resumes
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn URL</label>
                    <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} type="url"
                      placeholder="https://linkedin.com/in/yourprofile" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm placeholder:text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Resume / Portfolio Link</label>
                    <input name="resumeLink" value={form.resumeLink} onChange={handleChange} type="url"
                      placeholder="https://drive.google.com/..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm placeholder:text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#3575E2] hover:bg-blue-700 text-white font-extrabold text-lg rounded-2xl shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70">
                  {isSaving ? (
                    <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Saving Profile...</>
                  ) : (
                    <><FiSave className="w-5 h-5" /> Save Profile Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
