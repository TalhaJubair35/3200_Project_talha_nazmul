import React, { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import { Link } from 'react-router-dom';
import { FiX, FiBriefcase, FiMapPin, FiExternalLink, FiBookOpen } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const SalaryPage = () => {
  const [searchText, setSearchText] = useState("");
  const [salaryData, setSalaryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'jobs' | 'skills' | null
  const [selectedRole, setSelectedRole] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    fetch("salary.json")
      .then(res => res.json())
      .then(data => {
        setSalaryData(data);
        setFilteredData(data);
      });
  }, []);

  const handleSearch = () => {
    if (!searchText.trim()) {
      setFilteredData(salaryData);
      return;
    }
    const filtered = salaryData.filter(job =>
      job.title.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const openJobsModal = async (role) => {
    setSelectedRole(role);
    setActiveModal('jobs');
    setIsLoadingJobs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/all-jobs`);
      const allJobs = await res.json();
      const matches = allJobs.filter(job =>
        job.jobTitle.toLowerCase().includes(role.title.toLowerCase())
      );
      setRelatedJobs(matches);
    } catch {
      setRelatedJobs([]);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const openSkillsModal = (role) => {
    setSelectedRole(role);
    setActiveModal('skills');
  };

  return (
    <div className='container px-4 pb-12 mx-auto max-w-screen xl:px-24'>
      <PageHeader title={"Market Insights & Salaries"} path={"Salary Insights"} />

      <div className="max-w-2xl mx-auto mt-8 text-center">
        <h2 className="mb-3 text-3xl font-bold text-gray-900">Discover Your Earning Potential</h2>
        <p className="mb-8 text-gray-600">
          Explore industry-standard salaries, discover matching job openings, and see exactly what skills you need to land your dream role.
        </p>
        <div className="flex gap-2 p-2 bg-white border border-gray-200 shadow-sm rounded-2xl">
          <input
            type="text"
            placeholder="Search job titles (e.g. Software Engineer)..."
            className="flex-1 px-4 py-3 focus:outline-none rounded-xl"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="bg-blue text-white font-semibold px-8 py-3 rounded-xl transition-transform hover:scale-[1.02]">
            Search
          </button>
        </div>
      </div>

      {/* Salary Display Cards */}
      <div className="grid grid-cols-1 gap-6 my-16 lg:grid-cols-3 sm:grid-cols-2">
        {filteredData.map((data) => {
          const demandColor =
            data.demand === 'Extremely High' ? { bg: '#faf5ff', text: '#7c3aed', dot: '#7c3aed' } :
              data.demand === 'Very High' ? { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' } :
                data.demand === 'High' ? { bg: '#eff6ff', text: '#2563eb', dot: '#2563eb' } :
                  { bg: '#f9fafb', text: '#6b7280', dot: '#9ca3af' };
          return (
            <div key={data.id} className='flex flex-col transition-all bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-lg p-7'>
              <div className="flex items-start justify-between mb-3">
                <h4 className="pr-2 text-lg font-extrabold leading-snug text-gray-900">{data.title}</h4>
                {data.growth && (
                  <span className="flex-shrink-0 text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                    {data.growth} YoY
                  </span>
                )}
              </div>
              <p className="mb-1 text-2xl font-bold text-blue">{data.salary}</p>
              {data.demand && (
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full" style={{ background: demandColor.dot }}></div>
                  <span className="text-xs font-semibold" style={{ color: demandColor.text }}>Demand: {data.demand}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-auto">
                <button onClick={() => openJobsModal(data)} className="flex-1 py-2.5 text-sm font-semibold bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
                  View Openings
                </button>
                <button onClick={() => openSkillsModal(data)} className="flex-1 py-2.5 text-sm font-semibold bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
                  Required Skills
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeModal === 'jobs' ? `Openings for ${selectedRole?.title}` : `Skills for ${selectedRole?.title}`}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {activeModal === 'jobs' ? 'Live jobs currently hiring' : 'Top industry skills to master'}
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="flex items-center justify-center w-8 h-8 transition-colors bg-white border border-gray-200 rounded-full hover:bg-gray-100"
              >
                <FiX className="text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeModal === 'jobs' ? (
                // JOBS VIEW
                isLoadingJobs ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-b-2 rounded-full animate-spin border-blue"></div>
                  </div>
                ) : relatedJobs.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50">
                      <FiBriefcase className="w-8 h-8 text-blue-300" />
                    </div>
                    <p className="text-lg font-medium text-gray-500">No live openings right now.</p>
                    <p className="mt-1 text-sm text-gray-400">Check back later or expand your search.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {relatedJobs.map(job => (
                      <Link key={job._id} to={`/job/${job._id}`} onClick={() => setActiveModal(null)}
                        className="block p-5 transition-all bg-white border border-gray-100 rounded-xl hover:border-blue hover:shadow-md group">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue">{job.jobTitle}</h3>
                            <p className="text-sm text-gray-500">{job.companyName}</p>
                          </div>
                          <FiExternalLink className="text-gray-300 group-hover:text-blue" />
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><FiMapPin /> {job.jobLocation}</span>
                          <span className="px-2 py-1 rounded-md bg-gray-50">${job.minPrice} - ${job.maxPrice} per year</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                // SKILLS VIEW
                <div className="space-y-6">
                  <div className="p-5 border border-indigo-100 bg-indigo-50 rounded-xl">
                    <h4 className="flex items-center gap-2 mb-3 font-semibold text-indigo-900">
                      <FiBookOpen className="text-indigo-600" /> Why these skills matter
                    </h4>
                    <p className="text-sm leading-relaxed text-indigo-800/80">
                      Mastering these core competencies will significantly increase your chances of landing a {selectedRole?.title} position and negotiating a higher salary bracket.
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-4 font-semibold text-gray-900">Core Competencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRole?.skills ? (
                        selectedRole.skills.split(',').map((skill, idx) => (
                          <span key={idx} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg bg-gray-50">
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        ['Problem Solving', 'Communication', 'Agile/Scrum', 'Leadership', 'Technical Design'].map((skill, idx) => (
                          <span key={idx} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg bg-gray-50">
                            {skill}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="mb-4 font-semibold text-gray-900">Recommended Certifications</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 p-3 text-sm text-gray-600 bg-white border border-gray-100 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div> Industry Standard Professional Certificate
                      </li>
                      <li className="flex items-center gap-3 p-3 text-sm text-gray-600 bg-white border border-gray-100 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Advanced Specialization Bootcamp
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalaryPage