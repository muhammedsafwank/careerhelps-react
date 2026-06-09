import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { MOCK_COURSES, MOCK_COLLEGES, MOCK_QUESTIONS } from '../mockData';
import { 
  Users, FileText, Landmark, ShieldAlert, PlusCircle, CheckCircle, 
  AlertCircle, Link, ChevronDown, ChevronUp, Search, Filter, 
  Download, Save, Clock, Award, Phone, MessageCircle, Calendar,
  Trash2, Flame, Sun, Snowflake, Sparkles, CheckCircle2, PieChart
} from 'lucide-react';

export default function AdminDashboard({ user }) {
  const [metrics, setMetrics] = useState({ users: 0, assessments: 0, applications: 0 });
  const [profilesList, setProfilesList] = useState([]);
  const [appsList, setAppsList] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [mappingsList, setMappingsList] = useState([]);
  const [activeTab, setActiveTab] = useState('metrics');
  const [responsesMap, setResponsesMap] = useState({});
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [guestLeadsList, setGuestLeadsList] = useState([]);
  const [followupsList, setFollowupsList] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // CRM Search & Filters States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterQuality, setFilterQuality] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterLeadType, setFilterLeadType] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [editingNotes, setEditingNotes] = useState({});
  const [savingNoteId, setSavingNoteId] = useState(null);

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

      // 4. Fetch user responses
      const { data: allResponses } = await supabase.from('user_responses').select('*');
      const respMap = {};
      if (allResponses) {
        allResponses.forEach(r => {
          if (!respMap[r.user_id]) {
            respMap[r.user_id] = [];
          }
          respMap[r.user_id].push(r);
        });
      }
      setResponsesMap(respMap);

      // 5. Fetch guest leads
      const { data: guestLeads } = await supabase.from('guest_leads').select('*');
      setGuestLeadsList(guestLeads || []);

      // 5b. Fetch followups
      const { data: followups } = await supabase.from('followups').select('*');
      setFollowupsList(followups || []);

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

  const attendees = useMemo(() => {
    return [
      ...profilesList.filter(prof => 
        prof.course_preferred || (responsesMap[prof.id] && responsesMap[prof.id].length > 0)
      ).map(prof => ({
        id: prof.id,
        name: prof.name,
        phone: prof.phone,
        email: prof.email,
        course_preferred: prof.course_preferred,
        is_guest: false,
        created_at: prof.created_at,
        responsesCount: responsesMap[prof.id]?.length || 0,
        lead_status: prof.lead_status || 'New',
        lead_quality: prof.lead_quality || 'New',
        lead_source: prof.lead_source || 'Direct',
        admin_notes: prof.admin_notes || ''
      })),
      ...guestLeadsList.map(lead => ({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: 'Anonymous (Guest)',
        course_preferred: lead.course_preferred,
        is_guest: true,
        created_at: lead.created_at,
        responsesCount: lead.course_preferred ? 10 : 1,
        lead_status: lead.lead_status || 'New',
        lead_quality: lead.lead_quality || 'New',
        lead_source: lead.lead_source || 'Direct',
        admin_notes: lead.admin_notes || ''
      }))
    ];
  }, [profilesList, guestLeadsList, responsesMap]);

  const uniqueCustomSources = useMemo(() => {
    const presets = ['Direct'];
    const custom = new Set();
    attendees.forEach(l => {
      const val = l.lead_source;
      if (val && !presets.includes(val)) {
        custom.add(val);
      }
    });
    return Array.from(custom).sort();
  }, [attendees]);

  // Lead CRM saving handler
  const handleSaveCRMDetails = async (attendeeId, isGuest, newStatus, newQuality, newSource, newNotes) => {
    setSavingNoteId(attendeeId);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = { 
        lead_status: newStatus,
        lead_quality: newQuality,
        lead_source: newSource,
        admin_notes: newNotes
      };
      if (isGuest) {
        const { error } = await supabase
          .from('guest_leads')
          .update(payload)
          .eq('id', attendeeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', attendeeId);
        if (error) throw error;
      }
      setSuccessMsg('Successfully updated CRM lead details!');
      await fetchAdminData();
    } catch (err) {
      console.error('Error updating CRM details:', err);
      setErrorMsg('Failed to save CRM updates. Please try again.');
    } finally {
      setSavingNoteId(null);
    }
  };

  // Follow-up interaction managers
  const handleAddFollowup = async (studentId, details, remarks, nextFollowup) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const { error } = await supabase.from('followups').insert({
        student_id: studentId,
        details,
        remarks,
        next_followup: nextFollowup || null
      });
      if (error) throw error;
      setSuccessMsg('Follow-up log saved successfully!');
      await fetchAdminData();
    } catch (err) {
      console.error('Error adding followup:', err);
      setErrorMsg('Failed to save follow-up log.');
    }
  };

  const handleDeleteFollowup = async (followupId) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const { error } = await supabase.from('followups').delete().eq('id', followupId);
      if (error) throw error;
      setSuccessMsg('Follow-up log deleted successfully!');
      await fetchAdminData();
    } catch (err) {
      console.error('Error deleting followup:', err);
      setErrorMsg('Failed to delete follow-up log.');
    }
  };

  // Bulk Operations Update Handler
  const handleBulkUpdate = async (field, value) => {
    if (selectedLeadIds.length === 0) return;
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = { [field]: value };
      
      const promises = selectedLeadIds.map(async (leadId) => {
        const lead = attendees.find(a => a.id === leadId);
        if (lead) {
          const table = lead.is_guest ? 'guest_leads' : 'profiles';
          return supabase.from(table).update(payload).eq('id', leadId);
        }
      });
      
      await Promise.all(promises);
      setSuccessMsg(`Successfully updated ${selectedLeadIds.length} leads in bulk!`);
      setSelectedLeadIds([]);
      await fetchAdminData();
    } catch (err) {
      console.error('Error in bulk update:', err);
      setErrorMsg('Bulk update failed. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // CSV Lead Export
  const handleExportCSV = (filteredList) => {
    const headers = ['Name', 'Phone', 'Email', 'Type', 'Preferred Course', 'Source', 'Stage', 'Quality', 'Registered/Created Date', 'Notes'];
    
    const rows = filteredList.map(att => [
      att.name || 'Student',
      att.phone || 'Not Provided',
      att.email || '',
      att.is_guest ? 'Guest Lead' : 'Registered User',
      att.course_preferred || 'Quiz Pending',
      att.lead_source,
      att.lead_status,
      att.lead_quality,
      new Date(att.created_at).toLocaleDateString('en-IN'),
      (att.admin_notes || '').replace(/\r?\n|\r/g, ' ').replace(/"/g, '""')
    ]);
    
    const csvString = [
      headers.join(','), 
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `career_helps_crm_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter attendees list
  const filteredAttendees = useMemo(() => {
    return attendees.filter(att => {
      const nameMatch = (att.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const phoneMatch = (att.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = (att.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchSearch = nameMatch || phoneMatch || emailMatch;

      const matchStatus = filterStatus === 'All' || att.lead_status === filterStatus;
      const matchQuality = filterQuality === 'All' || att.lead_quality === filterQuality;
      const matchCourse = filterCourse === 'All' || att.course_preferred === filterCourse;
      const matchSource = filterSource === 'All' || att.lead_source === filterSource;
      
      const matchLeadType = filterLeadType === 'All' 
        || (filterLeadType === 'guest' && att.is_guest) 
        || (filterLeadType === 'registered' && !att.is_guest);

      return matchSearch && matchStatus && matchQuality && matchCourse && matchSource && matchLeadType;
    });
  }, [attendees, searchTerm, filterStatus, filterQuality, filterCourse, filterSource, filterLeadType]);

  // KPI CRM calculations
  const totalLeads = attendees.length;
  const completedLeads = attendees.filter(a => a.course_preferred).length;
  const activePipelineLeads = attendees.filter(a => a.lead_status === 'Contacted' || a.lead_status === 'Follow-up Scheduled').length;
  const admittedLeads = attendees.filter(a => a.lead_status === 'Admitted').length;
  const conversionRate = totalLeads > 0 ? ((completedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  // Lead Quality breakdowns
  const hotLeads = attendees.filter(a => a.lead_quality === 'Hot').length;
  const warmLeads = attendees.filter(a => a.lead_quality === 'Warm').length;
  const coldLeads = attendees.filter(a => a.lead_quality === 'Cold').length;
  const newLeadsQuality = attendees.filter(a => !a.lead_quality || a.lead_quality === 'New').length;

  // Lead Source performance
  const leadSourceStats = useMemo(() => {
    const sourcesMap = {};
    attendees.forEach(lead => {
      const sourceId = lead.lead_source || 'Direct';
      if (!sourcesMap[sourceId]) {
        sourcesMap[sourceId] = { name: sourceId, total: 0, admitted: 0 };
      }
      sourcesMap[sourceId].total += 1;
      if (lead.lead_status === 'Admitted') {
        sourcesMap[sourceId].admitted += 1;
      }
    });
    return Object.values(sourcesMap).sort((a, b) => b.total - a.total);
  }, [attendees]);


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
          className={`tab-btn ${activeTab === 'attendees' ? 'active' : ''}`}
          onClick={() => { setActiveTab('attendees'); setSuccessMsg(''); setErrorMsg(''); }}
        >
          Quiz Attendees ({attendees.length})
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
          <div className="admin-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="metric-card">
              <Users size={32} style={{ color: 'var(--gold-light)', margin: '0 auto 0.5rem' }} />
              <div className="metric-val">{metrics.users}</div>
              <div className="metric-label">Registered Users</div>
            </div>

            <div className="metric-card">
              <FileText size={32} style={{ color: 'var(--gold-light)', margin: '0 auto 0.5rem' }} />
              <div className="metric-val">{attendees.length}</div>
              <div className="metric-label">Total CRM Leads (Quiz Attendees)</div>
            </div>

            <div className="metric-card">
              <CheckCircle size={32} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
              <div className="metric-val">{conversionRate}%</div>
              <div className="metric-label">Assessment Completion Rate</div>
            </div>

            <div className="metric-card">
              <Clock size={32} style={{ color: '#f59e0b', margin: '0 auto 0.5rem' }} />
              <div className="metric-val">{activePipelineLeads}</div>
              <div className="metric-label">Active Pipeline (Follow-up)</div>
            </div>

            <div className="metric-card">
              <Award size={32} style={{ color: 'var(--gold)', margin: '0 auto 0.5rem' }} />
              <div className="metric-val">{admittedLeads}</div>
              <div className="metric-label">Enrolled / Admitted Leads</div>
            </div>

            <div className="metric-card">
              <Landmark size={32} style={{ color: 'var(--gold-light)', margin: '0 auto 0.5rem' }} />
              <div className="metric-val">{metrics.applications}</div>
              <div className="metric-label">Submitted Applications</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Column 1: Lead Quality Analysis */}
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 className="section-head" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={18} style={{ color: 'var(--gold-light)' }} /> Lead Quality Breakdown
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'center' }}>
                {/* Hot Leads */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.88rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 600 }}>
                      <Flame size={14} /> Hot Leads
                    </span>
                    <span style={{ fontWeight: 'bold' }}>{hotLeads}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalLeads > 0 ? (hotLeads/totalLeads)*100 : 0}%`, background: '#ef4444', borderRadius: '3px' }}></div>
                  </div>
                </div>

                {/* Warm Leads */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.88rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 600 }}>
                      <Sun size={14} /> Warm Leads
                    </span>
                    <span style={{ fontWeight: 'bold' }}>{warmLeads}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalLeads > 0 ? (warmLeads/totalLeads)*100 : 0}%`, background: '#f59e0b', borderRadius: '3px' }}></div>
                  </div>
                </div>

                {/* Cold Leads */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.88rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontWeight: 600 }}>
                      <Snowflake size={14} /> Cold Leads
                    </span>
                    <span style={{ fontWeight: 'bold' }}>{coldLeads}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalLeads > 0 ? (coldLeads/totalLeads)*100 : 0}%`, background: '#3b82f6', borderRadius: '3px' }}></div>
                  </div>
                </div>

                {/* New Leads */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.88rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontWeight: 600 }}>
                      <Sparkles size={14} /> New Leads
                    </span>
                    <span style={{ fontWeight: 'bold' }}>{newLeadsQuality}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalLeads > 0 ? (newLeadsQuality/totalLeads)*100 : 0}%`, background: '#718096', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Lead Source Performance */}
            <div className="card" style={{ padding: '1.5rem', maxHeight: '350px', overflowY: 'auto' }}>
              <h3 className="section-head" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} style={{ color: 'var(--gold-light)' }} /> Lead Source Performance
              </h3>
              
              <div className="tracker-table-container">
                <table className="tracker-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px' }}>Source</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Total</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Admitted</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Conv %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadSourceStats.map(src => {
                      const rate = src.total > 0 ? ((src.admitted / src.total) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={src.name}>
                          <td style={{ padding: '8px', fontWeight: 600 }}>{src.name}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>{src.total}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>{src.admitted}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--gold)' }}>{rate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-head">CRM Pipeline Health & counselor guidelines</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
              Always update student lead **Stage** and **Quality** indicators from the Attendees tab to ensure correct follow-up routing. 
              Interactive click-to-WhatsApp and click-to-Call buttons help quick client outreach.
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
                      <td style={{ fontWeight: 600, color: '#fff' }}>{prof.name || 'Student'}</td>
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
                        <div style={{ fontWeight: 600, color: '#fff' }}>
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

      {activeTab === 'attendees' && (
        <div>
          {/* CRM Search & Filters Panel */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)', fontWeight: 600 }}>
                <Filter size={18} /> CRM Filters & Leads Lookup
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => handleExportCSV(filteredAttendees)}
                style={{ padding: '6px 12px', fontSize: '0.8rem', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', height: 'auto' }}
              >
                <Download size={14} /> Export Leads to CSV
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {/* Search Bar */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Search Lead</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Search name, phone, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '2.2rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Pipeline Stage</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.88rem' }}
                >
                  <option value="All">All Pipeline Stages</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                  <option value="Admitted">Admitted</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              {/* Quality Filter */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Lead Quality</label>
                <select
                  value={filterQuality}
                  onChange={(e) => setFilterQuality(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.88rem' }}
                >
                  <option value="All">All Qualities</option>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                  <option value="New">New</option>
                </select>
              </div>

              {/* Course Preferred Filter */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Course Matches</label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.88rem' }}
                >
                  <option value="All">All Course Matches</option>
                  {Array.from(new Set(attendees.map(a => a.course_preferred).filter(Boolean))).map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Lead Source</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.88rem' }}
                >
                  <option value="All">All Sources</option>
                  <option value="Direct">Direct</option>
                  {uniqueCustomSources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              {/* Lead Type Filter */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Lead Registration</label>
                <select
                  value={filterLeadType}
                  onChange={(e) => setFilterLeadType(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.88rem' }}
                >
                  <option value="All">All Leads</option>
                  <option value="registered">Registered Students Only</option>
                  <option value="guest">Guest Leads Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Action Panel */}
          {selectedLeadIds.length > 0 && (
            <div className="card animate-fade-in" style={{ 
              padding: '1rem 1.5rem', 
              marginBottom: '1.5rem', 
              background: 'rgba(201, 168, 76, 0.08)', 
              border: '1.5px dashed var(--gold)',
              borderRadius: 'var(--radius)',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600', color: 'var(--gold-light)', fontSize: '0.92rem' }}>
                  {selectedLeadIds.length} lead{selectedLeadIds.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Bulk Status Update */}
                <select 
                  className="input-field"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem', margin: 0 }}
                  onChange={(e) => { if(e.target.value) handleBulkUpdate('lead_status', e.target.value); e.target.value = ''; }}
                >
                  <option value="">Bulk Update Stage...</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                  <option value="Admitted">Admitted</option>
                  <option value="Not Interested">Not Interested</option>
                </select>

                {/* Bulk Quality Update */}
                <select 
                  className="input-field"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem', margin: 0 }}
                  onChange={(e) => { if(e.target.value) handleBulkUpdate('lead_quality', e.target.value); e.target.value = ''; }}
                >
                  <option value="">Bulk Update Quality...</option>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                  <option value="New">New</option>
                </select>

                {/* Bulk Source Update */}
                <select 
                  className="input-field"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem', margin: 0 }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'ADD_CUSTOM') {
                      const customVal = window.prompt("Enter new custom lead source for selected leads:");
                      if (customVal && customVal.trim() !== '') {
                        handleBulkUpdate('lead_source', customVal.trim());
                      }
                    } else if (val) {
                      handleBulkUpdate('lead_source', val);
                    }
                    e.target.value = '';
                  }}
                >
                  <option value="">Bulk Update Source...</option>
                  <option value="Direct">Direct</option>
                  {uniqueCustomSources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                  <option value="ADD_CUSTOM">+ Add Custom...</option>
                </select>

                <button 
                  onClick={() => setSelectedLeadIds([])} 
                  className="btn btn-outline" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto' }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="tracker-table-container">
              <table className="tracker-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        onChange={() => {
                          const allIds = filteredAttendees.map(a => a.id);
                          const allSelected = allIds.every(id => selectedLeadIds.includes(id));
                          if (allSelected) {
                            setSelectedLeadIds(prev => prev.filter(id => !allIds.includes(id)));
                          } else {
                            setSelectedLeadIds(prev => Array.from(new Set([...prev, ...allIds])));
                          }
                        }} 
                        checked={filteredAttendees.length > 0 && filteredAttendees.map(a => a.id).every(id => selectedLeadIds.includes(id))} 
                        style={{ cursor: 'pointer', width: '15px', height: '15px' }} 
                      />
                    </th>
                    <th>Student Name</th>
                    <th>Phone Number</th>
                    <th>Contact Email</th>
                    <th>Course Match</th>
                    <th>CRM Pipeline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No students match the selected CRM filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map((prof) => {
                      const userResponses = prof.is_guest ? [] : (responsesMap[prof.id] || []);
                      const isExpanded = expandedUserId === prof.id;
                      
                      const studentFollowups = followupsList
                        .filter(f => f.student_id === prof.id)
                        .sort((a, b) => new Date(b.follow_date) - new Date(a.follow_date));

                      const statusStyles = (() => {
                        switch (prof.lead_status) {
                          case 'Admitted':
                            return { background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
                          case 'Not Interested':
                            return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
                          case 'Contacted':
                            return { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
                          case 'Follow-up Scheduled':
                            return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
                          default:
                            return { background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.15)' };
                        }
                      })();

                      const qualityStyles = (() => {
                        switch (prof.lead_quality) {
                          case 'Hot':
                            return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
                          case 'Warm':
                            return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
                          case 'Cold':
                            return { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
                          default:
                            return { background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.15)' };
                        }
                      })();

                      return (
                        <React.Fragment key={prof.id}>
                          <tr>
                            <td style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={selectedLeadIds.includes(prof.id)} 
                                onChange={() => {
                                  setSelectedLeadIds(prev => 
                                    prev.includes(prof.id) ? prev.filter(id => id !== prof.id) : [...prev, prof.id]
                                  );
                                }} 
                                style={{ cursor: 'pointer', width: '15px', height: '15px' }} 
                              />
                            </td>
                            <td style={{ fontWeight: 600, color: '#fff' }}>
                              {prof.name || 'Student'}
                              {prof.is_guest && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px', padding: '1px 4px', border: '1px solid var(--border)', borderRadius: '3px' }}>GUEST</span>}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{prof.phone || 'Not Provided'}</span>
                                {prof.phone && (
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <a href={`tel:${prof.phone}`} className="btn btn-outline" style={{ padding: '2px 6px', display: 'flex', borderRadius: '4px', height: 'auto', border: '1px solid rgba(201,168,76,0.3)', background: 'transparent' }} title="Call">
                                      <Phone size={12} style={{ color: 'var(--gold-light)' }} />
                                    </a>
                                    <a href={`https://wa.me/${prof.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '2px 6px', display: 'flex', borderRadius: '4px', height: 'auto', border: '1px solid rgba(37,211,102,0.3)', background: 'transparent' }} title="WhatsApp">
                                      <MessageCircle size={12} style={{ color: '#25D366' }} />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ color: prof.is_guest ? 'var(--text-muted)' : 'inherit', fontStyle: prof.is_guest ? 'italic' : 'normal' }}>{prof.email}</td>
                            <td style={{ fontWeight: 500, color: 'var(--gold-light)' }}>
                              {prof.course_preferred || 'Calculating...'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span className={`status-badge`} style={{ ...statusStyles, display: 'inline-block', textAlign: 'center', width: 'fit-content' }}>
                                  {prof.lead_status}
                                </span>
                                <span className="status-badge" style={{ ...qualityStyles, display: 'inline-block', fontSize: '0.7rem', padding: '2px 6px', width: 'fit-content', textTransform: 'uppercase' }}>
                                  {prof.lead_quality}
                                </span>
                              </div>
                            </td>
                            <td>
                              <button
                                className="btn btn-outline"
                                onClick={() => setExpandedUserId(isExpanded ? null : prof.id)}
                                style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', height: 'auto', background: 'transparent' }}
                              >
                                View / Edit {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan="7" style={{ background: 'rgba(13, 27, 46, 0.5)', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
                                  {/* Left Side: Questionnaire answers & Profile */}
                                  <div>
                                    <h4 style={{ color: 'var(--gold-light)', fontSize: '0.95rem', marginBottom: '1rem', fontFamily: 'var(--font-head)', fontWeight: 600 }}>
                                      Questionnaire Answers & Info
                                    </h4>
                                    <div style={{ marginBottom: '1rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)' }}>
                                      <span><strong>Lead Source:</strong> {prof.lead_source}</span>
                                      <span><strong>Created On:</strong> {new Date(prof.created_at).toLocaleString('en-IN')}</span>
                                    </div>
                                    {userResponses.length === 0 && prof.is_guest ? (
                                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Guest lead created from the Calculator page (no quiz responses).
                                      </p>
                                    ) : (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto', paddingRight: '8px' }}>
                                        {MOCK_QUESTIONS.map((q) => {
                                          const ans = userResponses.find(r => r.question_id === q.id);
                                          return (
                                            <div key={q.id} style={{ fontSize: '0.8rem', padding: '8px 12px', borderLeft: '3px solid var(--gold)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '0 6px 6px 0' }}>
                                              <div style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)' }}>
                                                Q{q.id}: {q.question}
                                              </div>
                                              <div style={{ color: ans ? '#fff' : 'var(--text-muted)', marginTop: '2px', fontSize: '0.78rem' }}>
                                                {ans ? `Selected: ${ans.answer}` : 'No answer registered'}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>

                                  {/* Right Side: CRM Details & Interaction History */}
                                  <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    
                                    {/* Sub-Section 1: CRM Details Form */}
                                    <div>
                                      <h4 style={{ color: 'var(--gold-light)', fontSize: '0.95rem', marginBottom: '1rem', fontFamily: 'var(--font-head)', fontWeight: 600 }}>
                                        CRM Parameters
                                      </h4>
                                      
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                        {/* Stage */}
                                        <div className="form-group" style={{ margin: 0 }}>
                                          <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Pipeline Stage</label>
                                          <select
                                            value={editingNotes[prof.id]?.status !== undefined ? editingNotes[prof.id].status : prof.lead_status}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setEditingNotes(prev => ({
                                                ...prev,
                                                [prof.id]: {
                                                  ...prev[prof.id],
                                                  status: val
                                                }
                                              }));
                                            }}
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                                          >
                                            <option value="New">New</option>
                                            <option value="Contacted">Contacted</option>
                                            <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                                            <option value="Admitted">Admitted</option>
                                            <option value="Not Interested">Not Interested</option>
                                          </select>
                                        </div>

                                        {/* Quality */}
                                        <div className="form-group" style={{ margin: 0 }}>
                                          <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Lead Quality</label>
                                          <select
                                            value={editingNotes[prof.id]?.quality !== undefined ? editingNotes[prof.id].quality : prof.lead_quality}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setEditingNotes(prev => ({
                                                ...prev,
                                                [prof.id]: {
                                                  ...prev[prof.id],
                                                  quality: val
                                                }
                                              }));
                                            }}
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                                          >
                                            <option value="New">New</option>
                                            <option value="Hot">Hot</option>
                                            <option value="Warm">Warm</option>
                                            <option value="Cold">Cold</option>
                                          </select>
                                        </div>

                                        {/* Source */}
                                        <div className="form-group" style={{ margin: 0 }}>
                                          <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Lead Source</label>
                                          <select
                                            value={editingNotes[prof.id]?.source !== undefined ? editingNotes[prof.id].source : prof.lead_source}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              if (val === 'ADD_CUSTOM') {
                                                const customVal = window.prompt("Enter new custom lead source:");
                                                if (customVal && customVal.trim() !== '') {
                                                  setEditingNotes(prev => ({
                                                    ...prev,
                                                    [prof.id]: {
                                                      ...prev[prof.id],
                                                      source: customVal.trim()
                                                    }
                                                  }));
                                                }
                                              } else {
                                                setEditingNotes(prev => ({
                                                  ...prev,
                                                  [prof.id]: {
                                                    ...prev[prof.id],
                                                    source: val
                                                  }
                                                }));
                                              }
                                            }}
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                                          >
                                            <option value="Direct">Direct</option>
                                            {uniqueCustomSources.map(src => (
                                              <option key={src} value={src}>{src}</option>
                                            ))}
                                            <option value="ADD_CUSTOM">+ Add Custom...</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>General counseling Notes</label>
                                        <textarea
                                          rows="3"
                                          className="input-field"
                                          placeholder="Log student preferences, parent notes, budget details..."
                                          value={editingNotes[prof.id]?.notes !== undefined ? editingNotes[prof.id].notes : prof.admin_notes}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditingNotes(prev => ({
                                              ...prev,
                                              [prof.id]: {
                                                ...prev[prof.id],
                                                notes: val
                                              }
                                            }));
                                          }}
                                          style={{ fontSize: '0.82rem', padding: '0.5rem' }}
                                        ></textarea>
                                      </div>

                                      <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                          const stateVal = editingNotes[prof.id] || {};
                                          const status = stateVal.status !== undefined ? stateVal.status : prof.lead_status;
                                          const quality = stateVal.quality !== undefined ? stateVal.quality : prof.lead_quality;
                                          const source = stateVal.source !== undefined ? stateVal.source : prof.lead_source;
                                          const notes = stateVal.notes !== undefined ? stateVal.notes : prof.admin_notes;
                                          handleSaveCRMDetails(prof.id, prof.is_guest, status, quality, source, notes);
                                        }}
                                        disabled={savingNoteId === prof.id}
                                        style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem', display: 'flex', justifyContent: 'center' }}
                                      >
                                        {savingNoteId === prof.id ? (
                                          <span className="spinner" style={{ width: '14px', height: '14px', margin: 0 }}></span>
                                        ) : (
                                          <>
                                            <Save size={12} /> Save CRM Parameters
                                          </>
                                        )}
                                      </button>
                                    </div>

                                    <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: 0 }} />

                                    {/* Sub-Section 2: Follow-up Log History */}
                                    <div>
                                      <h4 style={{ color: 'var(--gold-light)', fontSize: '0.95rem', marginBottom: '1rem', fontFamily: 'var(--font-head)', fontWeight: 600 }}>
                                        Follow-Up Logs ({studentFollowups.length})
                                      </h4>
                                      
                                      {studentFollowups.length === 0 ? (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>
                                          No follow-up interaction notes recorded.
                                        </p>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '6px' }}>
                                          {studentFollowups.map((fu) => (
                                            <div key={fu.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 10px', fontSize: '0.78rem', position: 'relative' }}>
                                              <button 
                                                onClick={() => { if(window.confirm('Delete this follow-up entry?')) handleDeleteFollowup(fu.id); }}
                                                style={{ position: 'absolute', top: '6px', right: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#fca5a5' }}
                                                title="Delete entry"
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                              <div style={{ color: 'var(--gold-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                                                <Calendar size={10} /> {new Date(fu.follow_date).toLocaleString('en-IN')}
                                              </div>
                                              <div style={{ color: '#fff', marginBottom: '4px' }}>{fu.details}</div>
                                              {fu.remarks && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>Remarks: {fu.remarks}</div>}
                                              {fu.next_followup && (
                                                <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                  <Clock size={10} /> Next: {new Date(fu.next_followup).toLocaleString('en-IN')}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Sub-Section 3: Add Follow-up Form */}
                                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px' }}>
                                        <h5 style={{ fontSize: '0.8rem', color: '#fff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <PlusCircle size={12} /> Log New Interaction Follow-Up
                                        </h5>
                                        <form onSubmit={(e) => {
                                          e.preventDefault();
                                          const form = e.target;
                                          const details = form.details.value;
                                          const remarks = form.remarks.value;
                                          const nextFu = form.nextFollowup.value;
                                          if (!details) return;
                                          handleAddFollowup(prof.id, details, remarks, nextFu);
                                          form.reset();
                                        }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          <textarea 
                                            name="details"
                                            required
                                            rows="2"
                                            className="input-field"
                                            placeholder="What was discussed in this call/chat... *"
                                            style={{ fontSize: '0.78rem', padding: '0.4rem', margin: 0 }}
                                          />
                                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            <input 
                                              type="text"
                                              name="remarks"
                                              className="input-field"
                                              placeholder="General Remarks"
                                              style={{ fontSize: '0.78rem', padding: '0.4rem', margin: 0 }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                              <input 
                                                type="datetime-local"
                                                name="nextFollowup"
                                                className="input-field"
                                                title="Next follow-up date and time"
                                                style={{ fontSize: '0.78rem', padding: '0.4rem', margin: 0 }}
                                              />
                                            </div>
                                          </div>
                                          <button type="submit" className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.4rem', height: 'auto', border: '1px solid var(--gold)', color: 'var(--gold-light)' }}>
                                            Save Follow-up Entry
                                          </button>
                                        </form>
                                      </div>

                                    </div>

                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'colleges' && (
        <div className="admin-grid">
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
              <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--gold-light)' }}>Current Active Mappings ({mappingsList.length})</h4>
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
