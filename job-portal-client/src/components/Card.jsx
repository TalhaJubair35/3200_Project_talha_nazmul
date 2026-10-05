import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiCalendar, FiArrowRight, FiBookmark } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
const Card = ({ data }) => {
  const { _id, companyName, jobTitle, companyLogo, minPrice, maxPrice, salaryType, jobLocation, employmentType, postingDate, description, featured, urgent, verified, status } = data;
  const { user, userProfile, toggleSavedJob } = useAuth();
  const navigate = useNavigate();

  // Show "New" badge if posted within last 3 days
  const isNew = postingDate && (new Date() - new Date(postingDate)) / (1000 * 60 * 60 * 24) <= 3;
  const isSaved = userProfile?.savedJobs?.includes(String(_id));

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      Swal.fire({ title: 'Sign In Required', text: 'Please sign in to save jobs', icon: 'info' }).then(() => navigate('/login'));
      return;
    }
    await toggleSavedJob(String(_id), isSaved);
  };

  const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const bgColors = ['#dbeafe', '#fce7f3', '#dcfce7', '#ede9fe', '#ffedd5'];
  const getBg = (name = '') => { let h = 0; for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h); return bgColors[Math.abs(h) % bgColors.length]; };

  return (
    <Link to={`/job/${_id}`} className="block group">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200 hover:-translate-y-0.5 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          {/* Company Logo / Initials */}
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="flex-shrink-0 object-cover w-12 h-12 border border-gray-100 rounded-xl"/>
            ) : (
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-sm font-bold text-gray-700 rounded-xl"
                   style={{ background: getBg(companyName) }}>
                {getInitials(companyName)}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{companyName}</p>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mt-0.5">{jobTitle}</h3>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={handleSave} className="p-1 text-gray-400 transition-colors hover:text-blue-600">
              <FiBookmark className={`w-5 h-5 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
            </button>
            <div className="flex flex-wrap justify-end gap-1.5 w-32">
              {featured && <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⭐ Featured</span>}
              {urgent && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">⚡ Urgent</span>}
              {verified && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✅ Verified</span>}
              {status === 'closed' ? (
                <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Closed</span>
              ) : isNew ? (
                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">New</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="flex-1 mb-4 text-sm leading-relaxed text-gray-500 line-clamp-2">{description}</p>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-lg">
            <FiMapPin className="w-3 h-3"/> {jobLocation}
          </span>
          <span className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-lg">
            <FiClock className="w-3 h-3"/> {employmentType}
          </span>
          <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg font-medium">
            <FiDollarSign className="w-3 h-3"/> ${minPrice}k–${maxPrice}k/year
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <FiCalendar className="w-3 h-3"/> {postingDate}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition-all group-hover:gap-2">
            View Details <FiArrowRight className="w-3 h-3"/>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Card;
