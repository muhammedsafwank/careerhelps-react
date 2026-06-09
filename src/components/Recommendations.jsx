import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MOCK_COURSES, MOCK_COLLEGES, MOCK_COLLEGE_COURSES } from '../mockData';
import CollegeDetail from './CollegeDetail';
import { Search, MapPin, DollarSign, Award, GraduationCap, ChevronRight, Check } from 'lucide-react';

const WHY_RECOMMENDED = {
  "B.Sc Nursing": "Your answers show a strong inclination for direct patient care, hospital environments, and long-term career growth in nursing. B.Sc Nursing gives you the depth and recognition for government jobs, further education, and leadership roles.",
  "General Nursing and Midwifery (GNM)": "You enjoy patient care but prefer a slightly shorter route to a nursing career. GNM equips you as a fully registered nurse and midwife, opening doors in government hospitals and PHCs across India.",
  "Auxiliary Nurse Midwife (ANM)": "Your background or preferences point toward community and primary healthcare. ANM is a perfect entry into public health nursing, especially for PHC and government health schemes.",
  "Bachelor of Physiotherapy (BPT)": "Your interest in helping patients recover through movement, your comfort with a clinic environment, and your science background make physiotherapy an excellent fit.",
  "B.Sc Medical Lab Technology (MLT)": "You gravitate toward lab work, technology, and analytical tasks. B.Sc MLT puts you at the heart of diagnostics — a field that is critical and in high demand.",
  "Diploma in Medical Lab Technology (DMLT)": "You want to enter the workforce quickly in a lab role. DMLT gives you a strong foundation as a lab technician in diagnostic centres and hospitals.",
  "B.Sc Radiology & Imaging Technology": "Your comfort with equipment, interest in technology, and preference for specialised roles make radiology and imaging technology an ideal match.",
  "B.Sc Optometry": "Your comfort with equipment and focus on vision diagnostics match you to optometry. It offers stable clinic-based hours and opportunities to work in eye care hospitals.",
  "Bachelor in Audiology and Speech-Language Pathology (BASLP)": "Your interests align with advanced diagnostics, speech therapy, and communication disorders. BASLP is a highly specialized degree with strong opportunities in rehabilitation centers."
};

export default function Recommendations({ matchedCourse, user, onApplySuccess }) {
  const [courses, setCourses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [collegeCourses, setCollegeCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [stateFilter, setStateFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // 'Degree' or 'Diploma'
  const [sortBy, setSortBy] = useState('fee'); // 'fee' or 'name'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: coursesData } = await supabase.from('courses').select('*');
      const { data: collegesData } = await supabase.from('colleges').select('*');
      const { data: mappingsData } = await supabase.from('college_courses').select('*');

      setCourses(coursesData || MOCK_COURSES);
      setColleges(collegesData || MOCK_COLLEGES);
      setCollegeCourses(mappingsData || MOCK_COLLEGE_COURSES);

      // Pre-select the recommended course
      const initialCourse = (coursesData || MOCK_COURSES).find(
        (c) => c.name === matchedCourse
      ) || (coursesData || MOCK_COURSES)[0];
      setSelectedCourse(initialCourse);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !selectedCourse) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Calculating matches and fetching colleges...</p>
      </div>
    );
  }

  // Find unique states for filter dropdown
  const states = [...new Set(colleges.map((c) => c.state))];

  // Helper to check if a college offers the selected course
  const collegeOffersCourse = (collegeId, courseId) => {
    return collegeCourses.some(
      (cc) => cc.college_id === collegeId && cc.course_id === courseId
    );
  };

  // Filter & Sort Colleges offering the selected course
  let filteredColleges = colleges.filter((c) => {
    const offers = collegeOffersCourse(c.id, selectedCourse.id);
    if (!offers) return false;

    if (stateFilter && c.state !== stateFilter) return false;
    if (typeFilter && c.type !== typeFilter) return false;
    
    if (budgetFilter) {
      const budgetMax = parseFloat(budgetFilter);
      if (c.avg_fee > budgetMax) return false;
    }

    return true;
  });

  // Sort
  filteredColleges.sort((a, b) => {
    if (sortBy === 'fee') {
      return a.avg_fee - b.avg_fee;
    }
    return a.name.localeCompare(b.name);
  });

  const justification = WHY_RECOMMENDED[selectedCourse.name] || 
    "This allied health track matches your scientific interests and clinical preferences, providing high employability and career growth.";

  return (
    <div className="screen">
      <div className="results-container">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <h3>Filter Colleges</h3>
          
          <div className="filter-group">
            <label htmlFor="state-filter">Select State</label>
            <select
              id="state-filter"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              style={{ marginTop: '0.4rem' }}
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="budget-filter">Max Annual Fee (INR)</label>
            <select
              id="budget-filter"
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              style={{ marginTop: '0.4rem' }}
            >
              <option value="">Any Budget</option>
              <option value="15000">Under ₹15,000 (Govt)</option>
              <option value="50000">Under ₹50,000</option>
              <option value="100000">Under ₹1,000,000</option>
              <option value="200000">Under ₹2,000,000</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="type-filter">College Type</label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ marginTop: '0.4rem' }}
            >
              <option value="">Govt & Private</option>
              <option value="gov">Government Only</option>
              <option value="pvt">Private Only</option>
            </select>
          </div>
        </aside>

        {/* Recommendations Panel */}
        <main>
          {/* Best Match Banner */}
          <section className="best-match-banner">
            <span className="match-status">Recommended Match</span>
            <h2 className="match-title">{selectedCourse.name}</h2>
            <div className="match-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GraduationCap size={14} /> {selectedCourse.type}
              </span>
              <span>•</span>
              <span>{selectedCourse.duration}</span>
              <span>•</span>
              <span className="text-gold-light" style={{ fontWeight: 600 }}>{selectedCourse.salary} average salary</span>
            </div>
            <div className="why-match">
              <p>{justification}</p>
            </div>
          </section>

          {/* Alternative Recommendations Carousel / Grid */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 className="section-head">All Paramedical & Nursing Tracks</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              We analyzed all courses. Click on any track below to view details and check eligible colleges.
            </p>
            <div className="courses-grid">
              {courses.map((c) => {
                const isMatch = c.name === selectedCourse.name;
                const isInitialRecommendation = c.name === matchedCourse;
                return (
                  <div
                    key={c.id}
                    className={`course-item-card ${isMatch ? 'is-best' : ''}`}
                    onClick={() => setSelectedCourse(c)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 className="course-item-name">{c.name}</h4>
                      {isInitialRecommendation && (
                        <span className="badge badge-gov" style={{ fontSize: '9px', padding: '1px 6px' }}>Recommended</span>
                      )}
                    </div>
                    <div className="course-item-details">
                      <span className={`badge ${c.type === 'Degree' ? 'badge-degree' : 'badge-diploma'}`}>
                        {c.type}
                      </span>
                      <span>{c.duration}</span>
                    </div>
                    <p className="course-item-outcome">
                      <strong>Role:</strong> {c.outcome}
                    </p>
                    <div className="course-item-footer">
                      <span className="course-salary-tag">{c.salary}</span>
                      <ChevronRight size={16} className="text-muted" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colleges list offering this course */}
          <div>
            <div className="results-header">
              <h3 className="section-head" style={{ margin: 0 }}>Colleges Offering {selectedCourse.name}</h3>
              <div className="sort-container">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="fee">Lowest Fees First</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>

            {filteredColleges.length === 0 ? (
              <div className="consent-box" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontWeight: 600, color: '#fff' }}>No matching colleges found.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Try expanding your filters on the sidebar (e.g. check "All States" or increase your budget range).</p>
              </div>
            ) : (
              <div className="college-grid">
                {filteredColleges.map((col) => (
                  <div key={col.id} className="college-item-card">
                    <div className="college-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="college-name">{col.name}</span>
                        <span className={`badge ${col.type === 'gov' ? 'badge-gov' : 'badge-pvt'}`}>
                          {col.type === 'gov' ? 'Government' : 'Private'}
                        </span>
                      </div>
                      <span className="college-loc">
                        <MapPin size={12} /> {col.city}, {col.state}
                      </span>
                      {col.accreditation && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Accredited: <strong>{col.accreditation}</strong>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div className="college-fees">
                        <span className="college-fee-amount">
                          ₹{col.avg_fee.toLocaleString('en-IN')}
                          <small>annual fee</small>
                        </span>
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedCollege(col)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      >
                        Details & Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* College Detail Modal */}
      {selectedCollege && (
        <CollegeDetail
          college={selectedCollege}
          course={selectedCourse}
          user={user}
          onClose={() => setSelectedCollege(null)}
          onApplySuccess={onApplySuccess}
        />
      )}
    </div>
  );
}
