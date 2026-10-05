import { useEffect, useState } from "react";
import Banner from "../../components/Banner";
import Card from "../../components/Card";
import Jobs from "./Jobs";
import Newsletter from "../../components/Newsletter";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiMapPin, FiBriefcase, FiClock, FiAward, FiDollarSign, FiCalendar, FiBookmark, FiPieChart, FiStar, FiTrendingUp } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── filter data ──────────────────────────────────────────────────────────────
const now = new Date();
const dAgo = (ms) => new Date(now - ms).toISOString().slice(0, 10);

const LOCATIONS = ['Remote', 'Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];
const EMPLOYMENT = ['Full-Time', 'Part-Time', 'Temporary'];
const EXPERIENCE = ['Internship', 'Entry Level', 'Intermediate', 'Senior'];
const POSTING_DATES = [
  { label: 'Last 24 Hours', value: dAgo(24 * 60 * 60 * 1000) },
  { label: 'Last 7 Days', value: dAgo(7 * 24 * 60 * 60 * 1000) },
  { label: 'Last Month', value: dAgo(30 * 24 * 60 * 60 * 1000) },
];
const SALARY_TYPES = ['Hourly', 'Monthly', 'Yearly'];
const SALARY_MAX = [
  { label: 'Up to $30k/year', value: 30 },
  { label: 'Up to $50k/year', value: 50 },
  { label: 'Up to $80k/year', value: 80 },
  { label: 'Up to $100k/year', value: 100 },
];

// ── Pill chip selector ────────────────────────────────────────────────────────
const PillGroup = ({ options, selected, onSelect, getLabel, getValue }) => (
  <div className="flex flex-wrap gap-2 pt-1">
    <button
      type="button"
      onClick={() => onSelect('')}
      style={!selected
        ? { background: '#2563eb', color: '#ffffff', border: '1px solid #2563eb' }
        : { background: '#ffffff', color: '#374151', border: '1px solid #d1d5db' }}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
    >
      All
    </button>
    {options.map((opt) => {
      const val = getValue ? getValue(opt) : opt;
      const label = getLabel ? getLabel(opt) : opt;
      const active = selected === String(val);
      return (
        <button
          type="button"
          key={val}
          onClick={() => onSelect(active ? '' : String(val))}
          style={active
            ? { background: '#2563eb', color: '#ffffff', border: '1px solid #2563eb' }
            : { background: '#ffffff', color: '#374151', border: '1px solid #d1d5db' }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
        >
          {label}
        </button>
      );
    })}
  </div>
);

// ── Collapsible section ───────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'transparent', color: '#1f2937' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {Icon && <Icon style={{ width: 16, height: 16, color: '#3b82f6', flexShrink: 0 }} />}
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1f2937' }}>{title}</span>
        </div>
        {open
          ? <FiChevronUp style={{ width: 16, height: 16, color: '#9ca3af', flexShrink: 0 }} />
          : <FiChevronDown style={{ width: 16, height: 16, color: '#9ca3af', flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid #f3f4f6' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ── Home ─────────────────────────────────────────────────────────────────────
const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // banner search
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeLocation, setActiveLocation] = useState("");

  // sidebar filters
  const [selLocation, setSelLocation] = useState("");
  const [selEmployment, setSelEmployment] = useState("");
  const [selExperience, setSelExperience] = useState("");
  const [selPostingDate, setSelPostingDate] = useState("");
  const [selSalaryType, setSelSalaryType] = useState("");
  const [selSalaryMax, setSelSalaryMax] = useState("");

  // mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/all-jobs`)
      .then(r => r.json())
      .then(data => { setJobs(Array.isArray(data) ? data : []); setIsLoading(false); })
      .catch(() => {
        fetch('/jobs.json')
          .then(r => r.json())
          .then(d => { setJobs(Array.isArray(d) ? d : []); setIsLoading(false); })
          .catch(() => { setJobs([]); setIsLoading(false); });
      });
  }, []);

  const handleSearch = () => {
    setActiveQuery(query);
    setActiveLocation(locationQuery);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelLocation(''); setSelEmployment(''); setSelExperience('');
    setSelPostingDate(''); setSelSalaryType(''); setSelSalaryMax('');
    setActiveQuery(''); setActiveLocation('');
    setQuery(''); setLocationQuery('');
    setCurrentPage(1);
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const applyFilters = (allJobs) => {
    let r = Array.isArray(allJobs) ? [...allJobs] : [];
    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      r = r.filter(j =>
        (j.jobTitle || '').toLowerCase().includes(q) ||
        (j.description || '').toLowerCase().includes(q) ||
        (j.companyName || '').toLowerCase().includes(q)
      );
    }
    const locFilter = activeLocation || selLocation;
    if (locFilter) r = r.filter(j => (j.jobLocation || '').toLowerCase().includes(locFilter.toLowerCase()));
    if (selEmployment) r = r.filter(j => (j.employmentType || '').toLowerCase() === selEmployment.toLowerCase());
    if (selExperience) r = r.filter(j => (j.experienceLevel || '').toLowerCase().includes(selExperience.toLowerCase()));
    if (selPostingDate) r = r.filter(j => (j.postingDate || '') >= selPostingDate);
    if (selSalaryType) r = r.filter(j => (j.salaryType || '').toLowerCase() === selSalaryType.toLowerCase());
    if (selSalaryMax) r = r.filter(j => parseInt(j.maxPrice || 0) <= parseInt(selSalaryMax));
    return r;
  };

  const filtered = applyFilters(jobs);
  const featuredJobs = jobs.filter(j => j.featured).slice(0, 6);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(start, start + itemsPerPage);
  const result = currentItems.map((data, i) => <Card key={i} data={data} />);

  const setFilter = (setter) => (val) => { setter(val); setCurrentPage(1); };

  const activeFilterCount = [selLocation, selEmployment, selExperience, selPostingDate, selSalaryType, selSalaryMax].filter(Boolean).length;
  const hasActiveSearch = activeQuery || activeLocation;

  // ── Filter Panel ─────────────────────────────────────────────────────────
  const FilterPanel = ({ onDone }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div>
          <p style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Filters</p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0 0 0' }}>Narrow down your job search</p>
        </div>
        {activeFilterCount > 0 && (
          <button type="button" onClick={clearAllFilters}
            style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Location */}
      <Section title="Location" icon={FiMapPin}>
        <PillGroup
          options={LOCATIONS}
          selected={selLocation}
          onSelect={setFilter(setSelLocation)}
        />
      </Section>

      {/* Job Type */}
      <Section title="Job Type" icon={FiBriefcase}>
        <PillGroup
          options={EMPLOYMENT}
          selected={selEmployment}
          onSelect={setFilter(setSelEmployment)}
        />
      </Section>

      {/* Experience */}
      <Section title="Experience Level" icon={FiAward}>
        <PillGroup
          options={EXPERIENCE}
          selected={selExperience}
          onSelect={setFilter(setSelExperience)}
        />
      </Section>

      {/* Date Posted */}
      <Section title="Date Posted" icon={FiCalendar} defaultOpen={false}>
        <PillGroup
          options={POSTING_DATES}
          selected={selPostingDate}
          onSelect={setFilter(setSelPostingDate)}
          getLabel={o => o.label}
          getValue={o => o.value}
        />
      </Section>

      {/* Salary Type */}
      <Section title="Salary Type" icon={FiDollarSign} defaultOpen={false}>
        <PillGroup
          options={SALARY_TYPES}
          selected={selSalaryType}
          onSelect={setFilter(setSelSalaryType)}
        />
      </Section>

      {/* Max Salary */}
      <Section title="Max Salary" icon={FiDollarSign} defaultOpen={false}>
        <PillGroup
          options={SALARY_MAX}
          selected={selSalaryMax}
          onSelect={setFilter(setSelSalaryMax)}
          getLabel={o => o.label}
          getValue={o => o.value}
        />
      </Section>

      {onDone && (
        <button type="button" onClick={onDone}
          style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '0.95rem', borderRadius: 16, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.35)', marginTop: 8 }}>
          Show {filtered.length} Jobs
        </button>
      )}
    </div>
  );

  return (
    <div>
      <Banner
        query={query}
        handleInputChange={e => setQuery(e.target.value)}
        locationQuery={locationQuery}
        handleLocationChange={e => setLocationQuery(e.target.value)}
        handleSearch={handleSearch}
      />

      {/* Featured Jobs Strip */}
      {!isLoading && featuredJobs.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-y border-yellow-100 py-8">
          <div className="max-w-7xl mx-auto px-4 xl:px-24">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">⭐</span>
              <h2 className="text-lg font-bold text-gray-900">Featured Jobs</h2>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200">Sponsored</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 snap-x" style={{ scrollbarWidth: 'none' }}>
              {featuredJobs.map((job, idx) => (
                <div key={idx} className="min-w-[300px] max-w-[300px] snap-start shrink-0">
                  <Card data={job} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile sticky filter bar ── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        className="lg:hidden sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1f2937' }}>
            {isLoading ? 'Loading jobs…' : `${filtered.length} jobs found`}
          </p>
          {(activeQuery || activeLocation) && (
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }} className="truncate max-w-[160px]">
              {[activeQuery, activeLocation].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb', color: '#ffffff', padding: '10px 16px', borderRadius: 12, fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
        >
          <FiFilter style={{ width: 16, height: 16, color: '#ffffff', flexShrink: 0 }} />
          <span style={{ color: '#ffffff' }}>Filters</span>
          {activeFilterCount > 0 && (
            <span style={{ background: '#ffffff', color: '#2563eb', fontSize: '0.7rem', fontWeight: 700, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div style={{ position: 'relative', marginLeft: 'auto', width: '100%', maxWidth: 360, background: '#f3f4f6', height: '100%', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Filter Jobs</h2>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0 0 0' }}>Select filters to narrow results</p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{ width: 36, height: 36, borderRadius: 10, background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}
              >
                <FiX style={{ width: 18, height: 18, color: '#374151' }} />
              </button>
            </div>
            {/* Scrollable filter content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              <FilterPanel onDone={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="bg-[#f3f4f8] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 xl:px-12 py-8 lg:grid lg:grid-cols-12 lg:gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 self-start lg:sticky lg:top-6">
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <FilterPanel />
            </div>
          </aside>

          {/* Jobs area */}
          <main className="lg:col-span-6 xl:col-span-5">

            {/* Active filter chips */}
            {(hasActiveSearch || activeFilterCount > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeQuery && (
                  <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    🔍 {activeQuery}
                    <button onClick={() => { setQuery(''); setActiveQuery(''); }} className="ml-0.5 hover:text-red-500 transition-colors"><FiX className="w-3 h-3" /></button>
                  </span>
                )}
                {activeLocation && (
                  <span className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    📍 {activeLocation}
                    <button onClick={() => { setLocationQuery(''); setActiveLocation(''); }} className="ml-0.5 hover:text-red-500 transition-colors"><FiX className="w-3 h-3" /></button>
                  </span>
                )}
                {selLocation && (
                  <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200">
                    📍 {selLocation}
                    <button onClick={() => setFilter(setSelLocation)('')} className="ml-0.5 hover:text-red-500 transition-colors"><FiX className="w-3 h-3" /></button>
                  </span>
                )}
                {selEmployment && (
                  <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200">
                    💼 {selEmployment}
                    <button onClick={() => setFilter(setSelEmployment)('')} className="ml-0.5 hover:text-red-500 transition-colors"><FiX className="w-3 h-3" /></button>
                  </span>
                )}
                {selExperience && (
                  <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200">
                    🏅 {selExperience}
                    <button onClick={() => setFilter(setSelExperience)('')} className="ml-0.5 hover:text-red-500 transition-colors"><FiX className="w-3 h-3" /></button>
                  </span>
                )}
                {selSalaryType && (
                  <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200">
                    💰 {selSalaryType}
                    <button onClick={() => setFilter(setSelSalaryType)('')} className="ml-0.5 hover:text-red-500 transition-colors"><FiX className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Results count (desktop) */}
            {!isLoading && (
              <div className="hidden lg:flex items-center justify-between mb-5">
                <p className="text-sm font-semibold text-gray-600">
                  Showing <span className="text-blue-600 font-bold">{currentItems.length}</span> of <span className="text-blue-600 font-bold">{filtered.length}</span> jobs
                </p>
                {(hasActiveSearch || activeFilterCount > 0) && (
                  <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-600 font-semibold hover:underline transition-colors">
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                        <div className="h-4 bg-gray-100 rounded w-2/3" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : result.length > 0 ? (
              <Jobs result={result} />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center shadow-sm">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="font-bold text-gray-800 text-lg">No jobs found</p>
                <p className="text-sm text-gray-400 mt-1 mb-5">Try different keywords or adjust your filters</p>
                <button onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-5 py-2.5 text-sm font-bold border-2 border-gray-200 rounded-xl disabled:opacity-40 hover:border-blue-400 hover:text-blue-600 transition-colors bg-white">
                  ← Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors
                          ${currentPage === page ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'}`}>
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-gray-400 px-1">…</span>}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-5 py-2.5 text-sm font-bold border-2 border-gray-200 rounded-xl disabled:opacity-40 hover:border-blue-400 hover:text-blue-600 transition-colors bg-white">
                  Next →
                </button>
              </div>
            )}
          </main>

          {/* Newsletter - desktop sticky */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-4 self-start lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <Newsletter />
            </div>
          </aside>
        </div>

        {/* Newsletter - mobile/tablet only (below job list) */}
        <div className="lg:hidden px-4 pb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <Newsletter />
          </div>
        </div>
      </div>

      {/* ── Advanced Features Section ── */}
      <div className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 xl:px-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Everything you need to land your next <span className="text-blue-600">tech role</span></h2>
            <p className="text-lg text-gray-500">JobJunction is not just a job board. It's a complete career platform designed to give you the ultimate edge in your job search.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <FiBookmark className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Save Jobs for Later</h3>
              <p className="text-gray-500 leading-relaxed text-sm">Found a great opportunity but don't have time to apply? Bookmark jobs instantly and manage them in your personal Wishlist.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                <FiPieChart className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-gray-500 leading-relaxed text-sm">Access deep insights into hiring trends, top locations, and most demanded skills with our interactive data dashboard.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors">
                <FiStar className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Company Reviews</h3>
              <p className="text-gray-500 leading-relaxed text-sm">Make informed decisions. Read and write anonymous reviews about companies to understand their culture and work environment.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors">
                <FiTrendingUp className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Applicant Tracking</h3>
              <p className="text-gray-500 leading-relaxed text-sm">Track your applications through every stage of the hiring pipeline, from submission to interview to getting hired.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
