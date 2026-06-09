import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, GraduationCap, DollarSign, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function Profile({ user, onProfileUpdated }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [educationLevel, setEducationLevel] = useState('12th');
  const [board, setBoard] = useState('');
  const [marks10th, setMarks10th] = useState('');
  const [marks12th, setMarks12th] = useState('');
  const [coursePreferred, setCoursePreferred] = useState('');
  const [budget, setBudget] = useState('');
  const [learningMode, setLearningMode] = useState('On-Campus');
  const [preferredLocation, setPreferredLocation] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name || '');
        setPhone(data.phone || '');
        setBirthDate(data.birth_date || '');
        setState(data.state || '');
        setCity(data.city || '');
        setEducationLevel(data.education_level || '12th');
        setBoard(data.board || '');
        setMarks10th(data.marks_10th !== null ? data.marks_10th.toString() : '');
        setMarks12th(data.marks_12th !== null ? data.marks_12th.toString() : '');
        setCoursePreferred(data.course_preferred || '');
        setBudget(data.budget !== null ? data.budget.toString() : '');
        setLearningMode(data.learning_mode || 'On-Campus');
        setPreferredLocation(data.preferred_location || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Validation Rules
    const parsed10th = parseFloat(marks10th);
    const parsed12th = parseFloat(marks12th);
    const parsedBudget = parseFloat(budget);

    if (marks10th && (isNaN(parsed10th) || parsed10th < 0 || parsed10th > 100)) {
      setErrorMsg('10th Marks percentage must be a number between 0 and 100.');
      setActiveTab('academic');
      return;
    }

    if (marks12th && (isNaN(parsed12th) || parsed12th < 0 || parsed12th > 100)) {
      setErrorMsg('12th Marks percentage must be a number between 0 and 100.');
      setActiveTab('academic');
      return;
    }

    if (budget && (isNaN(parsedBudget) || parsedBudget < 0)) {
      setErrorMsg('Annual budget must be a positive number.');
      setActiveTab('preferences');
      return;
    }

    // Age validation (minimum 17 for nursing)
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      if (age < 17 && (coursePreferred.toLowerCase().includes('nursing') || coursePreferred === 'GNM' || coursePreferred === 'ANM')) {
        setErrorMsg(`Important: Nursing Council rules require a minimum age of 17 years. You registered as ${age} years old.`);
        setActiveTab('personal');
        return;
      }
    }

    setSaving(true);

    try {
      const updates = {
        id: user.id,
        name,
        phone,
        birth_date: birthDate || null,
        state,
        city,
        education_level: educationLevel,
        board,
        marks_10th: marks10th ? parsed10th : null,
        marks_12th: marks12th ? parsed12th : null,
        course_preferred: coursePreferred,
        budget: budget ? parsedBudget : null,
        learning_mode: learningMode,
        preferred_location: preferredLocation,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw error;

      setSuccessMsg('Your profile has been saved successfully!');
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <h2 className="card-title">User Profile Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
        Keep your academic grades and career preferences updated. Our counselor uses this data to filter courses and check college eligibilities.
      </p>

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

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <User size={16} style={{ marginRight: '6px', display: 'inline' }} />
          Personal Info
        </button>
        <button
          className={`tab-btn ${activeTab === 'academic' ? 'active' : ''}`}
          onClick={() => setActiveTab('academic')}
        >
          <GraduationCap size={16} style={{ marginRight: '6px', display: 'inline' }} />
          Academic Record
        </button>
        <button
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <DollarSign size={16} style={{ marginRight: '6px', display: 'inline' }} />
          Preferences & Budget
        </button>
      </div>

      <form onSubmit={handleSave} className="card" style={{ marginTop: '0.5rem' }}>
        {activeTab === 'personal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="p-name">Full Name</label>
              <input
                type="text"
                id="p-name"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="p-phone">Phone Number</label>
                <input
                  type="tel"
                  id="p-phone"
                  className="input-field"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="p-dob">Date of Birth</label>
                <input
                  type="date"
                  id="p-dob"
                  className="input-field"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="p-state">State</label>
                <input
                  type="text"
                  id="p-state"
                  className="input-field"
                  placeholder="e.g. Kerala"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="p-city">City / District</label>
                <input
                  type="text"
                  id="p-city"
                  className="input-field"
                  placeholder="e.g. Kozhikode"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="a-level">Highest Education Level</label>
                <select
                  id="a-level"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                >
                  <option value="10th">10th Grade</option>
                  <option value="12th">12th Grade (10+2)</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="a-board">Education Board / University</label>
                <input
                  type="text"
                  id="a-board"
                  className="input-field"
                  placeholder="e.g. CBSE, HSE Kerala, ICSE"
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="a-marks10">10th Marks Percentage (%)</label>
                <input
                  type="number"
                  id="a-marks10"
                  className="input-field"
                  placeholder="0 - 100"
                  step="0.01"
                  value={marks10th}
                  onChange={(e) => setMarks10th(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="a-marks12">12th Biology/Science Marks (%)</label>
                <input
                  type="number"
                  id="a-marks12"
                  className="input-field"
                  placeholder="0 - 100"
                  step="0.01"
                  value={marks12th}
                  onChange={(e) => setMarks12th(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="pref-course">Preferred Course (Initial choice)</label>
              <select
                id="pref-course"
                value={coursePreferred}
                onChange={(e) => setCoursePreferred(e.target.value)}
              >
                <option value="">-- No preference / Open --</option>
                <option value="B.Sc Nursing">B.Sc Nursing</option>
                <option value="General Nursing and Midwifery (GNM)">GNM</option>
                <option value="Auxiliary Nurse Midwife (ANM)">ANM</option>
                <option value="Bachelor of Physiotherapy (BPT)">BPT – Physiotherapy</option>
                <option value="B.Sc Medical Lab Technology (MLT)">B.Sc MLT</option>
                <option value="Diploma in Medical Lab Technology (DMLT)">DMLT</option>
                <option value="B.Sc Radiology & Imaging Technology">B.Sc Radiology</option>
                <option value="B.Sc Optometry">B.Sc Optometry</option>
                <option value="Bachelor in Audiology and Speech-Language Pathology (BASLP)">BASLP</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pref-budget">Max Budget (Annual Fee in INR)</label>
                <input
                  type="number"
                  id="pref-budget"
                  className="input-field"
                  placeholder="e.g. 100000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pref-mode">Preferred Learning Mode</label>
                <select
                  id="pref-mode"
                  value={learningMode}
                  onChange={(e) => setLearningMode(e.target.value)}
                >
                  <option value="On-Campus">On-Campus (Regular)</option>
                  <option value="Distance">Distance / Hybrid</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pref-loc">Preferred College State / City</label>
              <input
                type="text"
                id="pref-loc"
                className="input-field"
                placeholder="e.g. Karnataka, Delhi, Kerala or 'Willing to relocate'"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <span className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#fff', margin: 0 }}></span>
            ) : (
              <>
                <Save size={18} /> Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
