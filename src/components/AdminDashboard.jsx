import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MOCK_COURSES, MOCK_COLLEGES } from '../mockData';
import { Users, FileText, Landmark, ShieldAlert, PlusCircle, CheckCircle, AlertCircle, Link } from 'lucide-react';

export default function AdminDashboard({ user }) {
  const [metrics, setMetrics] = useState({ users: 0, assessments: 0, applications: 0 });
  const [profilesList, setProfilesList] = useState([]);
  const [appsList, setAppsList] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [mappingsList, setMappingsList] = useState([]);
  const [activeTab, setActiveTab] = useState('metrics');

  // Form states for adding colleges
  const [colName, setColName] = useState('');
  const [colState, setColState] = useState('');
  const [colCity, setColCity] = useState('');
  const [colFee, setColFee] = useState('');
  const [colType, setColType] = useState('gov');
  const [colAcc, setColAcc] = useState('INC Approved');
  const [colDesc, setColDesc] = useState('');

  // Form states for adding courses
  const [courseName, setCourseName] = useState('');
  const [courseShort, setCourseShort] = useState('');
  const [courseField, setCourseField] = useState('Nursing');
  const [courseType, setCourseType] = useState('Degree');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseEligibility, setCourseEligibility] = useState('');
  const [courseMinMarks, setCourseMinMarks] = useState('');
  const [courseOutcome, setCourseOutcome] = useState('');
  const [courseSalary, setCourseSalary] = useState('');
  const [courseGovt, setCourseGovt] = useState(true);
  const [courseDesc, setCourseDesc] = useState('');

  // Form states for mapping courses to colleges
  const [mapCollegeId, setMapCollegeId] = useState('');
  const [mapCourseId, setMapCourseId] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // 1. Fetch profiles
      const { data: profiles } = await supabase.from('profiles').select('*');

      // 2. Fetch applications
      const { data: apps } = await supabase.from('applications').select(`
        id,
        status,
        applied_on,
        profiles ( name, email ),
        colleges ( name ),
        courses ( name )
      `);

      // 3. Fetch courses, colleges, and mappings for dropdowns
      const { data: courses } = await supabase.from('courses').select('*');
      const { data: colleges } = await supabase.from('colleges').select('*');
      const { data: mappings } = await supabase.from('college_courses').select('*');

      const allCourses = courses || MOCK_COURSES;
      const allColleges = colleges || MOCK_COLLEGES;

      setProfilesList(profiles || []);
      setAppsList(apps || []);
      setCoursesList(allCourses);
      setCollegesList(allColleges);
      setMappingsList(mappings || []);

      // Calculate metrics
      setMetrics({
        users: profiles ? profiles.length : 3,
        assessments: profiles ? profiles.filter(p => p.course_preferred).length : 2,
        applications: apps ? apps.length : 1
      });

      // Initialize default selections
      if (allColleges.length > 0 && !mapCollegeId) setMapCollegeId(allColleges[0].id.toString());
      if (allCourses.length > 0 && !mapCourseId) setMapCourseId(allCourses[0].id.toString());

    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const handleAddCollege = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!colName || !colState || !colCity || !colFee) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const newCollege = {
        name: colName,
        state: colState,
        city: colCity,
        avg_fee: parseFloat(colFee),
        type: colType,
        accreditation: colAcc,
        description: colDesc,
        address: `${colCity}, ${colState}`
      };

      const { error } = await supabase.from('colleges').insert(newCollege);
      if (error) throw error;

      setSuccessMsg(`College "${colName}" has been successfully added!`);
      setColName('');
      setColState('');
      setColCity('');
      setColFee('');
      setColDesc('');
      
      await fetchAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add college.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!courseName || !courseDuration || !courseEligibility) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const newCourse = {
        name: courseName,
        short_name: courseShort || courseName.substring(0, 8),
        field: courseField,
        type: courseType,
        duration: courseDuration,
        eligibility: courseEligibility,
        min_marks: courseMinMarks ? parseFloat(courseMinMarks) : 0,
        outcome: courseOutcome,
        salary: courseSalary || '₹2–4L/yr',
        govt_job_eligibility: courseGovt,
        description: courseDesc
      };

      const { error } = await supabase.from('courses').insert(newCourse);
      if (error) throw error;

      setSuccessMsg(`Course "${courseName}" has been successfully added!`);
      setCourseName('');
      setCourseShort('');
      setCourseDuration('');
      setCourseEligibility('');
      setCourseMinMarks('');
      setCourseOutcome('');
      setCourseSalary('');
      setCourseDesc('');

      await fetchAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add course.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkCourse = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!mapCollegeId || !mapCourseId) {
      setErrorMsg('Please select both college and course.');
      return;
    }

    setSubmitting(true);
    try {
      const mapping = {
        college_id: parseInt(mapCollegeId),
        course_id: parseInt(mapCourseId)
      };

      const { error } = await supabase.from('college_courses').insert(mapping);
      if (error) {
        if (error.message.includes('unique_constraint') || error.code === '23505') {
          throw new Error('This college is already linked to this course.');
        }
        throw error;
      }

      const college = collegesList.find(c => c.id == mapCollegeId);
      const course = coursesList.find(c => c.id == mapCourseId);
      setSuccessMsg(`Successfully linked ${course.name} to ${college.name}!`);

      await fetchAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to map course.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <ShieldAlert size={26} className="text-gold" />
        <h2 className="card-title" style={{ margin: 0 }}>Admin Dashboard</h2>
      </div>

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => { setActiveTab('metrics'); setSuccessMsg(''); setErrorMsg(''); }}
        >
          Metrics & Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); setSuccessMsg(''); setErrorMsg(''); }}
        >
          Registered Users ({profilesList.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => { setActiveTab('applications'); setSuccessMsg(''); setErrorMsg(''); }}
        >
          Applications ({appsList.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'colleges' ? 'active' : ''}`}
          onClick={() => { setActiveTab('colleges'); setSuccessMsg(''); setErrorMsg(''); }}
        >
          Add & Link College
        </button>
        <button
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => { setActiveTab('courses'); setSuccessMsg(''); setErrorMsg(''); }}
        >
          Add Course
        </button>
      </div>

      {successMsg && (
        <div className="consent-box" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534', display: 'flex', gap: '8px', alignItems: 'center', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
          <CheckCircle size={18} />
          <span style={{ fontSize: '0.85rem' }}>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="consent-box" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', display: 'flex', gap: '8px', alignItems: 'center', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.85rem' }}>{errorMsg}</span>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div>
          {/* Admin Metrics Grid */}
          <div className="admin-metrics">
            <div className="metric-card">
              <Users size={32} style={{ color: 'var(--navy)', margin: '0 auto 0.5rem' }} />
              <div className="metric-val">{metrics.users}</div>
              <div className="metric-label">Total Registered Students</div>
            </div>

            <div className="metric-card">
              <FileText size={32} style={{ color: 'var(--navy)', margin: '0 auto 0.5rem' }} />
              <div className="metric-val">{metrics.assessments}</div>
              <div className="metric-label">Completed Assessments</div>
            </div>

            <div className="metric-card">
              <Landmark size={32} style={{ color: 'var(--navy)', margin: '0 auto 0.5rem' }} />
              <div className="metric-val">{metrics.applications}</div>
              <div className="metric-label">Applications Submitted</div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-head">System Status</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              All database schemas are online and active. Counseling algorithm weights are currently configured for **Rule+Scoring (Phase 1)**.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="tracker-table-container">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Contact Email</th>
                  <th>12th Marks (%)</th>
                  <th>Preferred Course Match</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {profilesList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No students registered in the database yet.
                    </td>
                  </tr>
                ) : (
                  profilesList.map((prof) => (
                    <tr key={prof.id}>
                      <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{prof.name || 'Student'}</td>
                      <td>{prof.email}</td>
                      <td>{prof.marks_12th !== null ? `${prof.marks_12th}%` : 'Not Set'}</td>
                      <td style={{ fontWeight: 500, color: 'var(--gold)' }}>
                        {prof.course_preferred || 'Quiz Pending'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(prof.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="tracker-table-container">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>College Applied To</th>
                  <th>Course Track</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appsList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No applications submitted yet.
                    </td>
                  </tr>
                ) : (
                  appsList.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                          {app.profiles ? app.profiles.name : 'Unknown User'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {app.profiles ? app.profiles.email : ''}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {app.colleges ? app.colleges.name : 'Unknown College'}
                      </td>
                      <td>{app.courses ? app.courses.name : 'Unknown Course'}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(app.applied_on).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <span className={`status-badge status-submitted`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'colleges' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          {/* Add College Form */}
          <div className="card">
            <h3 className="section-head" style={{ marginBottom: '1.5rem' }}>Add New College</h3>
            
            <form onSubmit={handleAddCollege} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="col-name-input">College Name</label>
                <input
                  type="text"
                  id="col-name-input"
                  className="input-field"
                  placeholder="e.g. Kozhikode Medical College"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="col-state-input">State</label>
                  <input
                    type="text"
                    id="col-state-input"
                    className="input-field"
                    placeholder="e.g. Kerala"
                    value={colState}
                    onChange={(e) => setColState(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="col-city-input">City</label>
                  <input
                    type="text"
                    id="col-city-input"
                    className="input-field"
                    placeholder="e.g. Kozhikode"
                    value={colCity}
                    onChange={(e) => setColCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="col-fee-input">Annual Fees (INR)</label>
                  <input
                    type="number"
                    id="col-fee-input"
                    className="input-field"
                    placeholder="e.g. 15000"
                    value={colFee}
                    onChange={(e) => setColFee(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="col-type-input">College Sector</label>
                  <select
                    id="col-type-input"
                    value={colType}
                    onChange={(e) => setColType(e.target.value)}
                  >
                    <option value="gov">Government (Public)</option>
                    <option value="pvt">Private (Self-Financing)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="col-acc-input">Accreditation / Approval</label>
                <input
                  type="text"
                  id="col-acc-input"
                  className="input-field"
                  value={colAcc}
                  onChange={(e) => setColAcc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="col-desc-input">Short Description</label>
                <textarea
                  id="col-desc-input"
                  rows="2"
                  placeholder="Details about infrastructure, clinical attachments..."
                  value={colDesc}
                  onChange={(e) => setColDesc(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Add College'}
              </button>
            </form>
          </div>

          {/* Link Courses Form */}
          <div>
            <div className="card">
              <h3 className="section-head" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link size={16} /> Link Course & Fees Structure
              </h3>
              
              <form onSubmit={handleLinkCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label htmlFor="map-college-select">Select College</label>
                  <select
                    id="map-college-select"
                    value={mapCollegeId}
                    onChange={(e) => setMapCollegeId(e.target.value)}
                  >
                    {collegesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="map-course-select">Select Course Track</label>
                  <select
                    id="map-course-select"
                    value={mapCourseId}
                    onChange={(e) => setMapCourseId(e.target.value)}
                  >
                    {coursesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                    ))}
                  </select>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Linking a course maps it to the selected college and assigns it the college's tuition structure in the recommendation results page.
                </p>

                <button type="submit" className="btn btn-gold" style={{ alignSelf: 'flex-end' }} disabled={submitting}>
                  {submitting ? 'Linking...' : 'Map Course to College'}
                </button>
              </form>
            </div>

            <div className="card" style={{ padding: '1.25rem', maxHeight: '250px', overflowY: 'auto' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--navy)' }}>Current Active Mappings ({mappingsList.length})</h4>
              <ul style={{ fontSize: '0.82rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {mappingsList.map((m, idx) => {
                  const college = collegesList.find(c => c.id == m.college_id);
                  const course = coursesList.find(c => c.id == m.course_id);
                  return (
                    <li key={idx}>
                      <strong>{college ? college.name : `Col #${m.college_id}`}</strong> offers <span>{course ? course.name : `Course #${m.course_id}`}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="card" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h3 className="section-head" style={{ marginBottom: '1.5rem' }}>Add New Educational Program / Course</h3>
          
          <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="course-name-input">Course Name</label>
                <input
                  type="text"
                  id="course-name-input"
                  className="input-field"
                  placeholder="e.g. B.Sc Optometry"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="course-short-input">Abbreviation</label>
                <input
                  type="text"
                  id="course-short-input"
                  className="input-field"
                  placeholder="e.g. Optometry"
                  value={courseShort}
                  onChange={(e) => setCourseShort(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="course-field-select">Subject Category</label>
                <select
                  id="course-field-select"
                  value={courseField}
                  onChange={(e) => setCourseField(e.target.value)}
                >
                  <option value="Nursing">Nursing Track</option>
                  <option value="Physiotherapy">Physiotherapy Track</option>
                  <option value="Allied Health">Allied Health (Tech)</option>
                  <option value="Diagnostics">Diagnostics Lab</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="course-type-select">Degree Level</label>
                <select
                  id="course-type-select"
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value)}
                >
                  <option value="Degree">Bachelor Degree (3-4 yrs)</option>
                  <option value="Diploma">Diploma (2-3 yrs)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="course-dur-input">Course Duration</label>
                <input
                  type="text"
                  id="course-dur-input"
                  className="input-field"
                  placeholder="e.g. 3 years"
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="course-elig-input">Class 12 Eligibility Requirement</label>
                <input
                  type="text"
                  id="course-elig-input"
                  className="input-field"
                  placeholder="e.g. 10+2 PCB >=45%"
                  value={courseEligibility}
                  onChange={(e) => setCourseEligibility(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="course-min-input">Minimum Cutoff Percentage (%)</label>
                <input
                  type="number"
                  id="course-min-input"
                  className="input-field"
                  placeholder="e.g. 45"
                  value={courseMinMarks}
                  onChange={(e) => setCourseMinMarks(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="course-sal-input">Avg Starting Salary (Annual)</label>
                <input
                  type="text"
                  id="course-sal-input"
                  className="input-field"
                  placeholder="e.g. ₹2.5–4L/yr"
                  value={courseSalary}
                  onChange={(e) => setCourseSalary(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="course-out-input">Career Outcome Title</label>
              <input
                type="text"
                id="course-out-input"
                className="input-field"
                placeholder="e.g. Optometrist"
                value={courseOutcome}
                onChange={(e) => setCourseOutcome(e.target.value)}
              />
            </div>

            <label className="consent-check" style={{ marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                checked={courseGovt}
                onChange={(e) => setCourseGovt(e.target.checked)}
              />
              <span>Eligible for state & central Government job appointments</span>
            </label>

            <div className="form-group">
              <label htmlFor="course-desc-input">Program Description</label>
              <textarea
                id="course-desc-input"
                rows="3"
                placeholder="Detailed curriculum overview and clinical practices..."
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Add Course Track'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
