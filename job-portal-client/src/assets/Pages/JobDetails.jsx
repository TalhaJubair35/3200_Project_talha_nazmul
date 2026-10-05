import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiMapPin, FiClock, FiDollarSign, FiCalendar, FiBriefcase, FiUser, FiX, FiCheck, FiArrowLeft, FiBookmark, FiStar, FiShare2, FiMessageCircle, FiLinkedin, FiMail, FiLink } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

const JobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, userProfile, toggleSavedJob } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [resumeLink, setResumeLink] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState('')

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const isSaved = userProfile?.savedJobs?.includes(String(id));

  const handleSave = async () => {
    if (!user) { navigate('/login'); return; }
    await toggleSavedJob(String(id), isSaved);
  }

  const handleReviewSubmit = async () => {
    if (!rating) return;
    try {
      await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: job.companyName, reviewerEmail: user.email, rating, comment: reviewComment })
      });
      setReviewSubmitted(true);
    } catch { }
  }

  const shareJob = (platform) => {
    const url = window.location.href;
    const title = `${job.jobTitle} at ${job.companyName}`;
    const text = `Check out this amazing job opportunity: ${title} on JobJunction!`;
    const fullMessage = `${text}\n\n${url}`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'mail') {
      window.location.href = `mailto:?subject=${encodeURIComponent("Job Opportunity: " + title)}&body=${encodeURIComponent(fullMessage)}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(fullMessage).then(() => {
        Swal.fire({
          title: "Link Copied!",
          text: "Job link copied to clipboard.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      });
    }
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/all-jobs/${id}`)
      .then(res => res.json())
      .then(data => { setJob(data); setLoading(false); })
      .catch(() => setLoading(false))
  }, [id])

  const handleApplyClick = () => {
    if (!user) { navigate('/login'); return; }
    setShowModal(true)
  }

  const handleSubmitApplication = async () => {
    if (!resumeLink.trim()) { setError('Please enter your resume link'); return; }
    setApplying(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/apply-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: id,
          applicantEmail: user.email,
          applicantName: user.displayName || user.email,
          resumeLink: resumeLink.trim()
        })
      })
      const data = await res.json()
      if (data.acknowledged) { setApplied(true); setShowModal(false); setResumeLink(''); }
      else setError('Submission failed. Please try again.')
    } catch { setError('Network error. Please try again.'); }
    finally { setApplying(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 text-lg">Job not found.</p>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline flex items-center gap-1">
          <FiArrowLeft /> Back to Jobs
        </button>
      </div>
    )
  }

  const skills = Array.isArray(job.skills)
    ? job.skills
    : typeof job.skills === 'string' ? [job.skills] : []

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3575E2 60%, #60a5fa 100%)' }} className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-white hover:text-blue-100 text-base font-semibold transition-colors shadow-sm"
            >
              <FiArrowLeft className="w-5 h-5" /> Back to Jobs
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors text-sm font-medium">
              <FiBookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} /> {isSaved ? 'Saved' : 'Save Job'}
            </button>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {job.companyLogo && (
              <div className="bg-white rounded-2xl p-3 shadow-lg flex-shrink-0">
                <img
                  src={job.companyLogo} alt={job.companyName}
                  className="w-16 h-16 object-contain"
                  onError={e => { e.target.style.display = 'none' }}
                />
              </div>
            )}
            <div className="text-white flex-1">
              <p className="text-blue-200 text-sm font-medium mb-1 uppercase tracking-wider">{job.companyName}</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{job.jobTitle}</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-100">
                <span className="flex items-center gap-1.5"><FiMapPin className="flex-shrink-0" />{job.jobLocation}</span>
                <span className="flex items-center gap-1.5"><FiClock className="flex-shrink-0" />{job.employmentType}</span>
                <span className="flex items-center gap-1.5"><FiDollarSign className="flex-shrink-0" />${job.minPrice}k–${job.maxPrice}k/year</span>
                <span className="flex items-center gap-1.5"><FiCalendar className="flex-shrink-0" />Posted {job.postingDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <FiBriefcase className="text-blue-600" /> Job Description
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 text-sm font-medium rounded-full border"
                    style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
                  >
                    {typeof skill === 'object' ? skill.label || skill.value : skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Apply Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center sticky top-4">
            {applied ? (
              <div>
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <FiCheck className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-bold text-lg text-gray-900">Applied!</p>
                <p className="text-sm text-gray-500 mt-1 mb-6">Good luck with your application 🎉</p>

                {/* Review Section */}
                {!reviewSubmitted ? (
                  <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-100">
                    <p className="font-medium text-sm text-gray-900 mb-2">Rate {job.companyName}</p>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <FiStar
                          key={star}
                          className={`w-6 h-6 cursor-pointer ${star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                    <textarea
                      placeholder="Optional feedback..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      className="w-full text-sm p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                      rows="2"
                    />
                    <button
                      onClick={handleReviewSubmit}
                      disabled={!rating}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      Submit Review
                    </button>
                  </div>
                ) : (
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-sm font-medium">
                    Thank you for your feedback! ⭐
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <FiBriefcase className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  {isAdmin ? "Admins cannot apply to jobs." : job.status === 'closed' ? "This job is no longer accepting applications." : "Ready to take the next step in your career?"}
                </p>
                {isAdmin ? null : job.status === 'closed' ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 text-white rounded-xl font-semibold bg-gray-400 cursor-not-allowed"
                  >
                    Job Closed
                  </button>
                ) : (
                  <button
                    onClick={handleApplyClick}
                    className="w-full py-3 px-6 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #3575E2, #5b8dee)' }}
                  >
                    Apply Now
                  </button>
                )}
                {!user && job.status !== 'closed' && <p className="text-xs text-gray-400 mt-2">Sign in required to apply</p>}
              </>
            )}
          </div>

          {/* Job Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Job Overview</h3>
            <div className="space-y-4">
              {[
                { icon: <FiMapPin />, color: '#eff6ff', iconColor: '#2563eb', label: 'Location', value: job.jobLocation },
                { icon: <FiDollarSign />, color: '#f0fdf4', iconColor: '#16a34a', label: 'Salary', value: `$${job.minPrice}k–$${job.maxPrice}k/year` },
                { icon: <FiClock />, color: '#faf5ff', iconColor: '#7c3aed', label: 'Employment Type', value: job.employmentType },
                { icon: <FiUser />, color: '#fff7ed', iconColor: '#ea580c', label: 'Experience', value: job.experienceLevel },
                { icon: <FiCalendar />, color: '#fdf2f8', iconColor: '#db2777', label: 'Date Posted', value: job.postingDate },
              ].filter(item => item.value).map(({ icon, color, iconColor, label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: color, color: iconColor }}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p className="font-medium text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Job */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiShare2 className="text-blue-600" /> Share This Job
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <button onClick={() => shareJob('whatsapp')} className="flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-colors group" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dcfce7'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}>
                <FiMessageCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">WhatsApp</span>
              </button>
              <button onClick={() => shareJob('linkedin')} className="flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-colors group" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dbeafe'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#eff6ff'}>
                <FiLinkedin className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">LinkedIn</span>
              </button>
              <button onClick={() => shareJob('mail')} className="flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-colors group" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fef2f2'}>
                <FiMail className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Email</span>
              </button>
              <button onClick={() => shareJob('copy')} className="flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-colors group" style={{ backgroundColor: '#f3f4f6', color: '#374151' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e5e7eb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}>
                <FiLink className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Apply for this Job</h3>
                <p className="text-sm text-gray-500 mt-0.5">{job.jobTitle} at {job.companyName}</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                <input type="text" value={user?.displayName || user?.email || ''} disabled
                  className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Email</label>
                <input type="email" value={user?.email || ''} disabled
                  className="w-full px-4 py-2.5 border rounded-xl bg-gray-50 text-gray-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Resume / Portfolio Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/your-resume"
                  value={resumeLink}
                  onChange={e => { setResumeLink(e.target.value); setError(''); }}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#3575E2' }}
                />
                <p className="text-xs text-gray-400 mt-1">Google Drive, Dropbox, or any public link</p>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={applying}
                className="flex-1 py-2.5 px-4 text-white rounded-xl font-semibold transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #3575E2, #5b8dee)' }}
              >
                {applying ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetails
