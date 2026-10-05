import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiMapPin, FiSearch, FiExternalLink, FiStar } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/all-jobs`)
      .then(res => res.json())
      .then(jobs => {
        // Deduplicate companies from jobs list
        const companyMap = {};
        jobs.forEach(job => {
          const name = job.companyName;
          if (!name) return;
          if (!companyMap[name]) {
            companyMap[name] = {
              name,
              logo: job.companyLogo || null,
              location: job.jobLocation || 'Remote',
              openJobs: 0,
              jobs: [],
            };
          }
          companyMap[name].openJobs += 1;
          companyMap[name].jobs.push(job);
        });
        const list = Object.values(companyMap).sort((a, b) => b.openJobs - a.openJobs);
        
        // Fetch reviews
        Promise.all(list.map(async (company) => {
          try {
             const res = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(company.name)}`);
             const rData = await res.json();
             return { ...company, avgRating: rData.avgRating, reviewsCount: rData.count, reviews: rData.reviews };
          } catch {
             return { ...company, avgRating: 0, reviewsCount: 0, reviews: [] };
          }
        })).then(listWithReviews => {
          setCompanies(listWithReviews);
          setFiltered(listWithReviews);
          setIsLoading(false);
        });
      })
      .catch(() => { setCompanies([]); setFiltered([]); setIsLoading(false); });
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    if (!q.trim()) { setFiltered(companies); return; }
    setFiltered(companies.filter(c => c.name.toLowerCase().includes(q.toLowerCase())));
  };

  // Generate a deterministic pastel color per company
  const getColor = (name) => {
    const colors = ['#dbeafe', '#fce7f3', '#dcfce7', '#fef9c3', '#ede9fe', '#ffedd5', '#e0f2fe'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3575E2 100%)' }} className="py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Browse Companies</h1>
          <p className="text-blue-200 mb-8">Explore top companies hiring right now and discover your next opportunity.</p>
          <div className="max-w-xl mx-auto flex items-center gap-2 bg-white rounded-2xl p-2 shadow-lg">
            <FiSearch className="text-gray-400 ml-3 flex-shrink-0"/>
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={handleSearch}
              className="flex-1 py-2.5 px-2 focus:outline-none text-sm text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-5 flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Companies</p>
          </div>
          <div className="border-l border-gray-100"/>
          <div>
            <p className="text-2xl font-bold text-gray-900">{companies.reduce((s, c) => s + c.openJobs, 0)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Open Positions</p>
          </div>
          <div className="border-l border-gray-100"/>
          <div>
            <p className="text-2xl font-bold text-gray-900">{[...new Set(companies.flatMap(c => c.jobs.map(j => j.jobLocation)))].length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Locations</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FiBriefcase className="w-14 h-14 text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-500 font-medium">No companies found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((company) => (
              <div key={company.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group overflow-hidden">
                <div className="p-6">
                  {/* Logo / Initials */}
                  <div className="flex items-center gap-4 mb-4">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100"/>
                    ) : (
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-gray-700 text-lg flex-shrink-0"
                           style={{ background: getColor(company.name) }}>
                        {getInitials(company.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{company.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><FiMapPin className="flex-shrink-0"/> {company.location}</p>
                      {company.reviewsCount > 0 && (
                        <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1 font-medium"><FiStar className="fill-yellow-500"/> {company.avgRating} ({company.reviewsCount} reviews)</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {company.openJobs} open {company.openJobs === 1 ? 'job' : 'jobs'}
                    </span>
                    <Link to={`/?company=${encodeURIComponent(company.name)}`}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors">
                      View jobs <FiExternalLink/>
                    </Link>
                  </div>
                </div>

                {/* Job Titles Preview */}
                {company.jobs.slice(0, 2).map((job, idx) => (
                  <Link to={`/job/${job._id}`} key={idx}
                    className="flex items-center justify-between px-6 py-3 border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <span className="text-xs text-gray-700 font-medium truncate">{job.jobTitle}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{job.employmentType}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
