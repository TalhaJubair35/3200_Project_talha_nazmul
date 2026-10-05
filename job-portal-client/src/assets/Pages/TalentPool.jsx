import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiExternalLink, FiUser, FiMail, FiPhone, FiLinkedin, FiBriefcase, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const TalentPool = () => {
  const { user, isAdmin } = useAuth();
  const [talents, setTalents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin || !user?.email) return;
    
    setIsLoading(true);
    fetch(`${API_BASE_URL}/talent-pool?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        const talentList = Array.isArray(data) ? data : [];
        setTalents(talentList);
        setFiltered(talentList);
      })
      .catch(() => {
        setTalents([]);
        setFiltered([]);
      })
      .finally(() => setIsLoading(false));
  }, [isAdmin, user]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    if (!q.trim()) { setFiltered(talents); return; }
    
    const query = q.toLowerCase();
    setFiltered(talents.filter(t => 
      (t.displayName || '').toLowerCase().includes(query) ||
      (t.headline || '').toLowerCase().includes(query) ||
      (t.bio || '').toLowerCase().includes(query)
    ));
  };

  const handleDeleteUser = async (talent) => {
    const confirm = await Swal.fire({
      title: 'Remove from Talent Pool?',
      text: `This will remove ${talent.displayName || talent.email} from the talent pool. Their account will not be deleted.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE_URL}/talent-pool/${encodeURIComponent(talent.email)}?email=${encodeURIComponent(user.email)}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          const updated = talents.filter(t => t.email !== talent.email);
          setTalents(updated);
          setFiltered(updated.filter(t =>
            !search || (t.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
            (t.headline || '').toLowerCase().includes(search.toLowerCase())
          ));
          Swal.fire('Removed!', 'User removed from the talent pool.', 'success');
        } else {
          Swal.fire('Error', 'Failed to remove user.', 'error');
        }
      } catch {
        Swal.fire('Error', 'Network error. Please try again.', 'error');
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3575E2 100%)' }} className="py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-1">Talent Pool</h1>
            <p className="text-blue-200 text-sm">Browse all candidates who have submitted their resumes.</p>
          </div>
          <div className="w-full md:w-96 bg-white rounded-xl flex items-center px-3 py-2 shadow-sm">
            <FiSearch className="text-gray-400 mr-2 flex-shrink-0"/>
            <input 
              type="text" 
              placeholder="Search by name, headline, or skills..." 
              value={search}
              onChange={handleSearch}
              className="w-full focus:outline-none text-sm text-gray-700 bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-500 font-medium">No candidates found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((talent, idx) => (
              <div key={talent._id || idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  {talent.photoURL ? (
                    <img src={talent.photoURL} alt={talent.displayName} className="w-14 h-14 rounded-full object-cover border border-gray-100 flex-shrink-0"/>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {(talent.displayName || talent.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{talent.displayName || 'Unknown Name'}</h3>
                    <p className="text-sm text-gray-500 truncate">{talent.headline || 'No headline provided'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(talent)}
                    className="flex-shrink-0 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from Talent Pool"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                  {talent.bio || 'No bio provided.'}
                </p>

                <div className="space-y-2 mb-5">
                  <p className="text-xs text-gray-500 flex items-center gap-2 truncate">
                    <FiMail className="text-gray-400 flex-shrink-0"/> {talent.email}
                  </p>
                  {talent.phone && (
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <FiPhone className="text-gray-400 flex-shrink-0"/> {talent.phone}
                    </p>
                  )}
                  {talent.linkedinUrl && (
                    <a href={talent.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-2 w-fit">
                      <FiLinkedin className="text-gray-400 flex-shrink-0"/> LinkedIn Profile
                    </a>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50">
                  <a href={talent.resumeLink} target="_blank" rel="noopener noreferrer"
                     className="w-full py-2.5 bg-[#3575E2] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    View Resume <FiExternalLink/>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentPool;
