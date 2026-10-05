import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, updateProfile } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import app from '../../firebase/firebase.config';
import { 
  FiUser, FiMail, FiPhone, FiLinkedin, FiFileText, FiSave, FiArrowLeft, 
  FiBriefcase, FiGlobe, FiCalendar, FiMapPin, FiCamera, FiPlus, FiTrash2,
  FiAward, FiBook, FiCode, FiEye, FiCheck
} from 'react-icons/fi';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const EditProfile = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth(app);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  // All sections for progress tracking
  const sections = [
    { id: 'basic', label: 'Basic Information', icon: FiUser },
    { id: 'education', label: 'Education', icon: FiBook },
    { id: 'experience', label: 'Work Experience', icon: FiBriefcase },
    { id: 'skills', label: 'Skills', icon: FiCode },
    { id: 'preferences', label: 'Job Preferences', icon: FiMapPin },
    { id: 'projects', label: 'Projects', icon: FiGlobe },
    { id: 'certifications', label: 'Certifications', icon: FiAward },
    { id: 'languages', label: 'Languages', icon: FiGlobe },
    { id: 'documents', label: 'Documents', icon: FiFileText },
    { id: 'visibility', label: 'Profile Visibility', icon: FiEye },
  ];

  // Section completion tracking
  const [completedSections, setCompletedSections] = useState(new Set());

  // Form state with all fields
  const [form, setForm] = useState({
    // Basic Information
    fullName: '',
    email: '',
    phone: '',
    backupPhone: '',
    profilePhoto: '',
    dateOfBirth: '',
    gender: '',
    currentLocation: '',
    preferredWorkLocation: '',
    linkedinProfile: '',
    personalWebsite: '',

    // Education (array)
    education: [{ degree: '', field: '', institution: '', startYear: '', endYear: '', grade: '', description: '' }],

    // Work Experience (array)
    workExperience: [{ jobTitle: '', company: '', employmentType: '', location: '', startDate: '', endDate: '', currentlyWorking: false, responsibilities: '', achievements: '' }],

    // Skills (array)
    skills: [],
    currentSkill: { name: '', level: '', yearsOfExperience: '' },

    // Job Preferences
    desiredJobTitles: '',
    preferredIndustry: '',
    preferredEmploymentType: '',
    preferredJobLocation: '',
    workMode: '',
    expectedSalary: '',
    salaryCurrency: 'BDT',
    availableFrom: '',
    willingToRelocate: false,
    willingToTravel: false,

    // Projects (array)
    projects: [],
    currentProject: { name: '', description: '', role: '', technologies: '', projectUrl: '', githubUrl: '', startDate: '', endDate: '' },

    // Certifications (array)
    certifications: [],
    currentCertification: { name: '', organization: '', issueDate: '', expirationDate: '', credentialId: '', credentialUrl: '' },

    // Languages (array)
    languages: [],
    currentLanguage: { language: '', reading: '', writing: '', speaking: '' },

    // Documents
    resumeUrl: '',
    coverLetterUrl: '',
    portfolioUrl: '',

    // Profile Visibility
    profileVisibility: 'employers-only',
    allowRecruitersContact: true,
    showPhoneNumber: false,
    showEmailAddress: true,
  });

  // Pre-fill from Firebase + DB profile on load
  useEffect(() => {
    if (userProfile || user) {
      setForm(prev => ({
        ...prev,
        fullName: userProfile?.displayName || user?.displayName || '',
        email: user?.email || '',
        phone: userProfile?.phone || '',
        profilePhoto: user?.photoURL || '',
        gender: userProfile?.gender || '',
        ...userProfile,
      }));
    }
  }, [user, userProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Handle array field changes
  const handleArrayChange = (arrayName, index, field, value) => {
    setForm(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add new item to array
  const addArrayItem = (arrayName, template) => {
    setForm(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], template]
    }));
  };

  // Add completed item and reset current (for skills, projects, certifications, languages)
  const addCompletedItem = (arrayName, currentFieldName) => {
    const currentItem = form[currentFieldName];
    
    // Check if current item has at least one filled field
    const hasContent = Object.values(currentItem).some(val => val !== '' && val !== false);
    
    if (hasContent) {
      setForm(prev => ({
        ...prev,
        [arrayName]: [...prev[arrayName], currentItem],
        [currentFieldName]: getEmptyTemplate(arrayName)
      }));
    }
  };

  // Get empty template based on array type
  const getEmptyTemplate = (arrayName) => {
    switch(arrayName) {
      case 'skills':
        return { name: '', level: '', yearsOfExperience: '' };
      case 'projects':
        return { name: '', description: '', role: '', technologies: '', projectUrl: '', githubUrl: '', startDate: '', endDate: '' };
      case 'certifications':
        return { name: '', organization: '', issueDate: '', expirationDate: '', credentialId: '', credentialUrl: '' };
      case 'languages':
        return { language: '', reading: '', writing: '', speaking: '' };
      default:
        return {};
    }
  };

  // Handle current item change (for skills, projects, certifications, languages)
  const handleCurrentItemChange = (fieldName, field, value) => {
    setForm(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [field]: value
      }
    }));
  };

  // Remove item from array
  const removeArrayItem = (arrayName, index) => {
    setForm(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  // Mark section as complete and move to next
  const completeSection = async () => {
    // Save current section data before moving
    await saveCurrentSection();
    
    setCompletedSections(prev => new Set([...prev, currentSection]));
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  // Save current section data
  const saveCurrentSection = async () => {
    if (!user?.email) return;

    try {
      // Save to backend
      await fetch(`${API_BASE_URL}/user-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          photoURL: user.photoURL,
          ...form,
        }),
      });

      Swal.fire({
        icon: 'success',
        title: 'Section Saved!',
        text: 'Your progress has been saved.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Could not save your progress, but you can continue.',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  // Calculate progress percentage
  const progressPercentage = (completedSections.size / sections.length) * 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) return;
    setIsSaving(true);

    try {
      // 1. Update Firebase display name
      if (form.fullName && form.fullName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: form.fullName });
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

  // Render section content
  const renderSectionContent = () => {
    switch (currentSection) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h3>
            
            {/* Profile Photo */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {form.profilePhoto ? (
                  <img src={form.profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-50" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiUser className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <button type="button" className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <FiCamera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Profile Photo</h4>
                <p className="text-sm text-gray-500">Upload a professional photo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={form.fullName} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+880 1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Backup Phone Number</label>
                <input 
                  type="tel" 
                  name="backupPhone" 
                  value={form.backupPhone} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+880 1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                <input 
                  type="date" 
                  name="dateOfBirth" 
                  value={form.dateOfBirth} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select 
                  name="gender" 
                  value={form.gender} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Location</label>
                <input 
                  type="text" 
                  name="currentLocation" 
                  value={form.currentLocation} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dhaka, Bangladesh"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Work Location</label>
                <input 
                  type="text" 
                  name="preferredWorkLocation" 
                  value={form.preferredWorkLocation} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dhaka, Bangladesh"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn Profile</label>
                <input 
                  type="url" 
                  name="linkedinProfile" 
                  value={form.linkedinProfile} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Personal Website/Portfolio</label>
                <input 
                  type="url" 
                  name="personalWebsite" 
                  value={form.personalWebsite} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Education
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Education</h3>
              <button
                type="button"
                onClick={() => addArrayItem('education', { degree: '', field: '', institution: '', startYear: '', endYear: '', grade: '', description: '' })}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FiPlus /> More Education?
              </button>
            </div>

            {form.education.map((edu, index) => (
              <div key={index} className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Education #{index + 1}</h4>
                  {form.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('education', index)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <FiTrash2 /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Degree / Qualification *</label>
                    <input 
                      type="text" 
                      value={edu.degree}
                      onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Bachelor of Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Field of Study *</label>
                    <input 
                      type="text" 
                      value={edu.field}
                      onChange={(e) => handleArrayChange('education', index, 'field', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Computer Science"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Institution *</label>
                    <input 
                      type="text" 
                      value={edu.institution}
                      onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="University Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Year *</label>
                    <input 
                      type="text" 
                      value={edu.startYear}
                      onChange={(e) => handleArrayChange('education', index, 'startYear', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="2018"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Year *</label>
                    <input 
                      type="text" 
                      value={edu.endYear}
                      onChange={(e) => handleArrayChange('education', index, 'endYear', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="2022"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grade/GPA</label>
                    <input 
                      type="text" 
                      value={edu.grade}
                      onChange={(e) => handleArrayChange('education', index, 'grade', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="3.8/4.0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea 
                      value={edu.description}
                      onChange={(e) => handleArrayChange('education', index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Key courses, achievements, extracurricular activities..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 2: // Work Experience
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Work Experience</h3>
              <button
                type="button"
                onClick={() => addArrayItem('workExperience', { jobTitle: '', company: '', employmentType: '', location: '', startDate: '', endDate: '', currentlyWorking: false, responsibilities: '', achievements: '' })}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FiPlus /> More Experience?
              </button>
            </div>

            {form.workExperience.map((exp, index) => (
              <div key={index} className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Experience #{index + 1}</h4>
                  {form.workExperience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('workExperience', index)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <FiTrash2 /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                    <input 
                      type="text" 
                      value={exp.jobTitle}
                      onChange={(e) => handleArrayChange('workExperience', index, 'jobTitle', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                    <input 
                      type="text" 
                      value={exp.company}
                      onChange={(e) => handleArrayChange('workExperience', index, 'company', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Tech Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
                    <select 
                      value={exp.employmentType}
                      onChange={(e) => handleArrayChange('workExperience', index, 'employmentType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select Type</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input 
                      type="text" 
                      value={exp.location}
                      onChange={(e) => handleArrayChange('workExperience', index, 'location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Dhaka, Bangladesh"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                    <input 
                      type="month" 
                      value={exp.startDate}
                      onChange={(e) => handleArrayChange('workExperience', index, 'startDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                    <input 
                      type="month" 
                      value={exp.endDate}
                      onChange={(e) => handleArrayChange('workExperience', index, 'endDate', e.target.value)}
                      disabled={exp.currentlyWorking}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={exp.currentlyWorking}
                        onChange={(e) => handleArrayChange('workExperience', index, 'currentlyWorking', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">Currently Working Here</span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Responsibilities</label>
                    <textarea 
                      value={exp.responsibilities}
                      onChange={(e) => handleArrayChange('workExperience', index, 'responsibilities', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Describe your key responsibilities..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Achievements</label>
                    <textarea 
                      value={exp.achievements}
                      onChange={(e) => handleArrayChange('workExperience', index, 'achievements', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Highlight your key achievements and impact..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 3: // Skills
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Skills</h3>

            {/* Display added skills */}
            {form.skills.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-gray-700">Your Skills:</h4>
                <div className="space-y-2">
                  {form.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{skill.name}</div>
                        <div className="text-sm text-gray-600">
                          Level: {skill.level} • Experience: {skill.yearsOfExperience} year(s)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('skills', index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input for new skill */}
            <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {form.skills.length > 0 ? 'Add Another Skill' : 'Add Your First Skill'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skill Name *</label>
                  <input 
                    type="text" 
                    value={form.currentSkill.name}
                    onChange={(e) => handleCurrentItemChange('currentSkill', 'name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="React.js"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Skill Level *</label>
                  <select 
                    value={form.currentSkill.level}
                    onChange={(e) => handleCurrentItemChange('currentSkill', 'level', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience *</label>
                  <input 
                    type="number" 
                    value={form.currentSkill.yearsOfExperience}
                    onChange={(e) => handleCurrentItemChange('currentSkill', 'yearsOfExperience', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="3"
                    min="0"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => addCompletedItem('skills', 'currentSkill')}
                className="mt-4 flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <FiPlus /> {form.skills.length > 0 ? 'More Skills?' : 'Add Skill'}
              </button>
            </div>
          </div>
        );

      case 4: // Job Preferences
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Job Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Desired Job Title(s)</label>
                <input 
                  type="text" 
                  name="desiredJobTitles" 
                  value={form.desiredJobTitles} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Software Engineer, Full Stack Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Industry</label>
                <input 
                  type="text" 
                  name="preferredIndustry" 
                  value={form.preferredIndustry} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Technology, Finance"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Employment Type</label>
                <select 
                  name="preferredEmploymentType" 
                  value={form.preferredEmploymentType} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Location</label>
                <input 
                  type="text" 
                  name="preferredJobLocation" 
                  value={form.preferredJobLocation} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dhaka, Bangladesh"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Mode</label>
                <select 
                  name="workMode" 
                  value={form.workMode} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Mode</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Salary</label>
                <div className="flex gap-2">
                  <select 
                    name="salaryCurrency" 
                    value={form.salaryCurrency} 
                    onChange={handleChange}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BDT">BDT</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <input 
                    type="number" 
                    name="expectedSalary" 
                    value={form.expectedSalary} 
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Available From</label>
                <input 
                  type="date" 
                  name="availableFrom" 
                  value={form.availableFrom} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="willingToRelocate" 
                    checked={form.willingToRelocate} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Willing to Relocate</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="willingToTravel" 
                    checked={form.willingToTravel} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Willing to Travel</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 5: // Projects
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Projects</h3>

            {/* Display added projects */}
            {form.projects.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-gray-700">Your Projects:</h4>
                <div className="space-y-3">
                  {form.projects.map((project, index) => (
                    <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-lg">{project.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{project.description}</div>
                          <div className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Role:</span> {project.role} • 
                            <span className="font-medium"> Tech:</span> {project.technologies}
                          </div>
                          {(project.projectUrl || project.githubUrl) && (
                            <div className="text-sm text-blue-600 mt-1">
                              {project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Live Demo</a>}
                              {project.projectUrl && project.githubUrl && ' • '}
                              {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeArrayItem('projects', index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input for new project */}
            <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {form.projects.length > 0 ? 'Add Another Project' : 'Add Your First Project'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name *</label>
                  <input 
                    type="text" 
                    value={form.currentProject.name}
                    onChange={(e) => handleCurrentItemChange('currentProject', 'name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="E-commerce Platform"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea 
                    value={form.currentProject.description}
                    onChange={(e) => handleCurrentItemChange('currentProject', 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Role</label>
                  <input 
                    type="text" 
                    value={form.currentProject.role}
                    onChange={(e) => handleCurrentItemChange('currentProject', 'role', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Lead Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Technologies Used</label>
                  <input 
                    type="text" 
                    value={form.currentProject.technologies}
                    onChange={(e) => handleCurrentItemChange('currentProject', 'technologies', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project URL</label>
                  <input 
                    type="url" 
                    value={form.currentProject.projectUrl}
                    onChange={(e) => handleCurrentItemChange('currentProject', 'projectUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://project.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">GitHub URL</label>
                  <input 
                    type="url" 
                    value={form.currentProject.githubUrl}
                    onChange={(e) => handleCurrentItemChange('currentProject', 'githubUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://github.com/user/repo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input 
                    type="month" 
                    value={form.currentProject.startDate}
                    onChange={(e) => handleCurrentItemChange('currentProject', 'startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input 
                    type="month" 
                    value={form.currentProject.endDate}
                    onChange={(e) => handleCurrentItemChange('currentProject', 'endDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => addCompletedItem('projects', 'currentProject')}
                className="mt-4 flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <FiPlus /> {form.projects.length > 0 ? 'More Projects?' : 'Add Project'}
              </button>
            </div>
          </div>
        );

      case 6: // Certifications
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Certifications & Courses</h3>

            {/* Display added certifications */}
            {form.certifications.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-gray-700">Your Certifications:</h4>
                <div className="space-y-3">
                  {form.certifications.map((cert, index) => (
                    <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-lg">{cert.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{cert.organization}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Issued: {cert.issueDate} {cert.expirationDate && `• Expires: ${cert.expirationDate}`}
                          </div>
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                              View Credential
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeArrayItem('certifications', index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input for new certification */}
            <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {form.certifications.length > 0 ? 'Add Another Certification' : 'Add Your First Certification'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Certification Name *</label>
                  <input 
                    type="text" 
                    value={form.currentCertification.name}
                    onChange={(e) => handleCurrentItemChange('currentCertification', 'name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="AWS Certified Solutions Architect"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Issuing Organization *</label>
                  <input 
                    type="text" 
                    value={form.currentCertification.organization}
                    onChange={(e) => handleCurrentItemChange('currentCertification', 'organization', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Amazon Web Services"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Date</label>
                  <input 
                    type="month" 
                    value={form.currentCertification.issueDate}
                    onChange={(e) => handleCurrentItemChange('currentCertification', 'issueDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expiration Date</label>
                  <input 
                    type="month" 
                    value={form.currentCertification.expirationDate}
                    onChange={(e) => handleCurrentItemChange('currentCertification', 'expirationDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Credential ID</label>
                  <input 
                    type="text" 
                    value={form.currentCertification.credentialId}
                    onChange={(e) => handleCurrentItemChange('currentCertification', 'credentialId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ABC123XYZ"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Credential URL</label>
                  <input 
                    type="url" 
                    value={form.currentCertification.credentialUrl}
                    onChange={(e) => handleCurrentItemChange('currentCertification', 'credentialUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://verify.certificate.com"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => addCompletedItem('certifications', 'currentCertification')}
                className="mt-4 flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <FiPlus /> {form.certifications.length > 0 ? 'More Certifications?' : 'Add Certification'}
              </button>
            </div>
          </div>
        );

      case 7: // Languages
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Languages</h3>

            {/* Display added languages */}
            {form.languages.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-gray-700">Your Languages:</h4>
                <div className="space-y-2">
                  {form.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{lang.language}</div>
                        <div className="text-sm text-gray-600">
                          Reading: {lang.reading} • Writing: {lang.writing} • Speaking: {lang.speaking}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('languages', index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input for new language */}
            <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {form.languages.length > 0 ? 'Add Another Language' : 'Add Your First Language'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Language *</label>
                  <input 
                    type="text" 
                    value={form.currentLanguage.language}
                    onChange={(e) => handleCurrentItemChange('currentLanguage', 'language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="English"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reading Level *</label>
                  <select 
                    value={form.currentLanguage.reading}
                    onChange={(e) => handleCurrentItemChange('currentLanguage', 'reading', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Level</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Limited Working">Limited Working</option>
                    <option value="Professional Working">Professional Working</option>
                    <option value="Full Professional">Full Professional</option>
                    <option value="Native">Native</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Writing Level *</label>
                  <select 
                    value={form.currentLanguage.writing}
                    onChange={(e) => handleCurrentItemChange('currentLanguage', 'writing', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Level</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Limited Working">Limited Working</option>
                    <option value="Professional Working">Professional Working</option>
                    <option value="Full Professional">Full Professional</option>
                    <option value="Native">Native</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Speaking Level *</label>
                  <select 
                    value={form.currentLanguage.speaking}
                    onChange={(e) => handleCurrentItemChange('currentLanguage', 'speaking', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Level</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Limited Working">Limited Working</option>
                    <option value="Professional Working">Professional Working</option>
                    <option value="Full Professional">Full Professional</option>
                    <option value="Native">Native</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => addCompletedItem('languages', 'currentLanguage')}
                className="mt-4 flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <FiPlus /> {form.languages.length > 0 ? 'More Languages?' : 'Add Language'}
              </button>
            </div>
          </div>
        );

      case 8: // Documents
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Documents</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Resume/CV URL</label>
                <input 
                  type="url" 
                  name="resumeUrl" 
                  value={form.resumeUrl} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://drive.google.com/your-resume"
                />
                <p className="text-xs text-gray-500 mt-1">Upload your resume to cloud storage and paste the link here</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter URL</label>
                <input 
                  type="url" 
                  name="coverLetterUrl" 
                  value={form.coverLetterUrl} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://drive.google.com/your-cover-letter"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio URL</label>
                <input 
                  type="url" 
                  name="portfolioUrl" 
                  value={form.portfolioUrl} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FiFileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Document Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Keep your resume updated and tailored to your target roles</li>
                      <li>• Use PDF format for better compatibility</li>
                      <li>• Ensure documents are publicly accessible or shareable via link</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 9: // Profile Visibility
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Profile Visibility</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Visibility</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="profileVisibility" 
                      value="public" 
                      checked={form.profileVisibility === 'public'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Public</div>
                      <div className="text-sm text-gray-500">Anyone can view your profile</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="profileVisibility" 
                      value="employers-only" 
                      checked={form.profileVisibility === 'employers-only'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Employers Only</div>
                      <div className="text-sm text-gray-500">Only verified employers can view your profile</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="profileVisibility" 
                      value="private" 
                      checked={form.profileVisibility === 'private'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Private</div>
                      <div className="text-sm text-gray-500">Only you can view your profile</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Contact Preferences</h4>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="allowRecruitersContact" 
                    checked={form.allowRecruitersContact} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Allow recruiters to contact me</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="showPhoneNumber" 
                    checked={form.showPhoneNumber} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show phone number on profile</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="showEmailAddress" 
                    checked={form.showEmailAddress} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show email address on profile</span>
                </label>
              </div>
            </div>

            {/* Note: Last section doesn't need Save & Proceed, it has final Submit */}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-4 transition-colors"
          >
            <FiArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Build a comprehensive profile to attract top employers</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Profile Completion</span>
              <span className="font-semibold">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Section Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isCompleted = completedSections.has(index);
              const isCurrent = currentSection === index;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setCurrentSection(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                    isCurrent 
                      ? 'bg-green-600 text-white' 
                      : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {(isCompleted || isCurrent) ? <FiCheck className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit}>
            {renderSectionContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {/* Left side: Previous and Skip buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                  disabled={currentSection === 0}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {currentSection < sections.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentSection(currentSection + 1)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Skip
                  </button>
                )}
              </div>

              {/* Right side: Save & Proceed button */}
              <div>
                {currentSection < sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={completeSection}
                    className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow-md transition-colors"
                  >
                    <FiSave /> Save & Proceed
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 disabled:opacity-70 shadow-md"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave /> Save Profile
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
