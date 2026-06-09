import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Calculator, School, Award, Info, Percent, RefreshCw, Trash2, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';

export default function LbsCalculator({ user, profile }) {
  const [detailsSubmitted, setDetailsSubmitted] = useState(
    !!(profile?.name || localStorage.getItem('student_name'))
  );
  const [studentName, setStudentName] = useState(profile?.name || localStorage.getItem('student_name') || '');
  const [studentPhone, setStudentPhone] = useState(profile?.phone || localStorage.getItem('student_phone') || '');
  const [detailsError, setDetailsError] = useState('');

  const [activeTab, setActiveTab] = useState('lbs');

  // Tab 1: LBS Index States
  const [maxMarks, setMaxMarks] = useState('120');
  const [phy, setPhy] = useState('');
  const [chem, setChem] = useState('');
  const [bio, setBio] = useState('');
  const [alt, setAlt] = useState('');
  const [eng, setEng] = useState('');
  const [lbsResults, setLbsResults] = useState(null);

  // Tab 2: Plus Two % States
  const [totalObtained, setTotalObtained] = useState('');
  const [totalMax, setTotalMax] = useState('1200');
  const [percentageResult, setPercentageResult] = useState(null);

  // Tab 3: Standardiser States
  const [singleObtained, setSingleObtained] = useState('');
  const [singleMax, setSingleMax] = useState('');
  const [standardisedResult, setStandardisedResult] = useState(null);

  // Name and Phone details submit
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setDetailsError('');

    if (!studentName.trim()) {
      setDetailsError('Please enter your name.');
      return;
    }

    const phoneClean = studentPhone.trim().replace(/\D/g, ''); // strip non-digits
    if (phoneClean.length !== 10) {
      setDetailsError('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      if (user) {
        // Update user profile in Supabase/Mock database
        const { error } = await supabase
          .from('profiles')
          .update({ name: studentName.trim(), phone: phoneClean })
          .eq('id', user.id);
        if (error) throw error;
      } else {
        // Create an anonymous guest lead in the guest_leads table
        const { data, error } = await supabase
          .from('guest_leads')
          .insert({ name: studentName.trim(), phone: phoneClean })
          .select()
          .single();
        
        if (error) {
          console.warn('Insert with select failed, trying insert without select:', error);
          // Try inserting without select (in case select policy is missing)
          const { error: insertOnlyError } = await supabase
            .from('guest_leads')
            .insert({ name: studentName.trim(), phone: phoneClean });
          if (insertOnlyError) throw insertOnlyError;
        } else if (data && data.id) {
          localStorage.setItem('guest_lead_id', data.id);
        }
      }
      
      // Save locally to localStorage so that other components can pull it
      localStorage.setItem('student_name', studentName.trim());
      localStorage.setItem('student_phone', phoneClean);

      setDetailsSubmitted(true);
    } catch (err) {
      console.error('Error saving student details:', err);
      // Fallback: save to localStorage anyway and let the student proceed!
      localStorage.setItem('student_name', studentName.trim());
      localStorage.setItem('student_phone', phoneClean);
      setDetailsSubmitted(true);
    }
  };

  // Normalization logic
  const norm = (val, maxVal) => {
    if (val === '' || isNaN(val)) return null;
    const numVal = parseFloat(val);
    const numMax = parseFloat(maxVal);
    if (numMax <= 0 || isNaN(numMax)) return null;
    return (numVal / numMax) * 100;
  };

  // Tab 1 Calculations
  const calculateIndex = () => {
    const max = parseFloat(maxMarks);
    if (!max || max <= 0 || isNaN(max)) {
      alert('Enter a valid maximum mark.');
      return;
    }

    const p = norm(phy, max);
    const c = norm(chem, max);
    const b = norm(bio, max);
    const a = norm(alt, max);
    const e = norm(eng, max);

    // Rank 1: Nursing/Paramedical (P + C + B)
    const rank1 = (p !== null && c !== null && b !== null) ? p + c + b : null;
    // Rank 2: B.Sc. SLP (P + C + (B or Alt))
    const third = b !== null ? b : a;
    const rank2 = (p !== null && c !== null && third !== null) ? p + c + third : null;
    // Rank 3: Extended Index (P + C + B + E)
    const rank3 = (p !== null && c !== null && b !== null && e !== null) ? p + c + b + e : null;

    setLbsResults({ rank1, rank2, rank3 });
  };

  const resetLBS = () => {
    setPhy('');
    setChem('');
    setBio('');
    setAlt('');
    setEng('');
    setLbsResults(null);
  };

  // Tab 2 Calculations
  const calculatePercentage = () => {
    const obt = parseFloat(totalObtained);
    const max = parseFloat(totalMax);
    if (isNaN(obt) || isNaN(max) || max <= 0) {
      alert('Enter valid total marks.');
      return;
    }
    const percent = (obt / max) * 100;
    setPercentageResult(percent);
  };

  const resetPercentage = () => {
    setTotalObtained('');
    setPercentageResult(null);
  };

  // Tab 3 Calculations
  const calculateStandard = () => {
    const obt = parseFloat(singleObtained);
    const max = parseFloat(singleMax);
    if (isNaN(obt) || isNaN(max) || max <= 0) {
      alert('Enter valid marks.');
      return;
    }
    const stdVal = (obt / max) * 100;
    setStandardisedResult(stdVal);
  };

  const resetStandard = () => {
    setSingleObtained('');
    setSingleMax('');
    setStandardisedResult(null);
  };

  if (!detailsSubmitted) {
    return (
      <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
          <h2 className="card-title" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.6rem' }}>
            Introduce Yourself
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Please enter your name and phone number to access the LBS index calculators.
          </p>

          {detailsError && (
            <div className="consent-box" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', display: 'flex', gap: '8px', alignItems: 'center', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '0.85rem' }}>{detailsError}</span>
            </div>
          )}

          <form onSubmit={handleDetailsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="student-name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  id="student-name"
                  className="input-field"
                  placeholder="e.g. Rahul Kumar"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="student-phone">Phone Number (10 digits)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  id="student-phone"
                  className="input-field"
                  placeholder="e.g. 7909222274"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}>
              Access Calculators <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <Calculator size={26} className="text-gold" />
        <h2 className="card-title" style={{ margin: 0 }}>LBS Index Mark Calculator</h2>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Calculate and estimate your index marks for Nursing & Paramedical admissions in Kerala under the LBS parameters.
      </p>

      {/* DISCLAIMER BADGE */}
      <div className="consent-box" style={{ padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <Info size={16} style={{ color: 'var(--gold)', marginTop: '2px', flexShrink: 0 }} />
        <p style={{ fontSize: '0.82rem', margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
          For estimation purposes only. Verify official ranks and final eligibility requirements from the current LBS prospectus.&nbsp;
          <span style={{
            display: 'inline-block',
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '1px 5px',
            border: '1.2px solid var(--gold)',
            color: 'var(--gold)',
            borderRadius: '3px',
            marginLeft: '4px',
            verticalAlign: 'middle'
          }}>
            UNOFFICIAL
          </span>
        </p>
      </div>

      {/* TABS CONTAINER */}
      <div className="tabs-container" style={{ marginBottom: '2rem' }}>
        <button
          className={`tab-btn ${activeTab === 'lbs' ? 'active' : ''}`}
          onClick={() => setActiveTab('lbs')}
        >
          <Calculator size={14} style={{ marginRight: '6px', verticalAlign: '-1px' }} />
          LBS Index
        </button>
        <button
          className={`tab-btn ${activeTab === 'perc' ? 'active' : ''}`}
          onClick={() => setActiveTab('perc')}
        >
          <Percent size={14} style={{ marginRight: '6px', verticalAlign: '-1px' }} />
          Plus Two %
        </button>
        <button
          className={`tab-btn ${activeTab === 'std' ? 'active' : ''}`}
          onClick={() => setActiveTab('std')}
        >
          <RefreshCw size={14} style={{ marginRight: '6px', verticalAlign: '-1px' }} />
          Standardiser
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="card" style={{ padding: '2rem' }}>
        
        {/* TAB 1: LBS Index Calculator */}
        {activeTab === 'lbs' && (
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)', marginBottom: '1.5rem', fontSize: '1.25rem', fontFamily: 'var(--font-head)' }}>
              <Calculator size={18} className="text-gold" /> LBS Index Mark Calculation
            </h3>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Maximum Marks per Subject</label>
              <input
                type="number"
                className="input-field"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                min="1"
                placeholder="e.g. 120"
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                Usually 120 for DHSE Kerala (Plus One + Plus Two combined), 100 for CBSE.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0' }}></div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Physics Marks</label>
                <input
                  type="number"
                  className="input-field"
                  value={phy}
                  onChange={(e) => setPhy(e.target.value)}
                  placeholder="Enter marks"
                />
              </div>

              <div className="form-group">
                <label>Chemistry Marks</label>
                <input
                  type="number"
                  className="input-field"
                  value={chem}
                  onChange={(e) => setChem(e.target.value)}
                  placeholder="Enter marks"
                />
              </div>

              <div className="form-group">
                <label>Biology Marks</label>
                <input
                  type="number"
                  className="input-field"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter marks"
                />
              </div>

              <div className="form-group">
                <label>Mathematics / Computer Science (Optional)</label>
                <input
                  type="number"
                  className="input-field"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Optional marks"
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                  Only for B.Sc. SLP (Rank List 2) if Biology is not taken.
                </p>
              </div>

              <div className="form-group">
                <label>English Marks</label>
                <input
                  type="number"
                  className="input-field"
                  value={eng}
                  onChange={(e) => setEng(e.target.value)}
                  placeholder="Enter marks"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
              <button className="btn btn-primary" onClick={calculateIndex} style={{ flex: 1 }}>
                <Calculator size={16} /> Calculate Index
              </button>
              <button className="btn btn-outline" onClick={resetLBS} style={{ padding: '0.85rem 1.25rem' }}>
                <Trash2 size={16} />
              </button>
            </div>

            {lbsResults && (
              <div style={{ marginTop: '2.5rem', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius)', overflow: 'hidden', animation: 'fadeUp 0.3s ease' }}>
                <div style={{ background: 'linear-gradient(90deg, var(--navy-light), var(--navy))', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-gold)' }}>
                  <Award size={16} style={{ color: 'var(--gold)' }} />
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-light)', fontWeight: 600 }}>Calculated Index Marks</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201, 168, 76, 0.1)', background: 'rgba(255, 255, 255, 0.01)' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Rank List 1 — Nursing / Paramedical</div>
                    {lbsResults.rank1 !== null ? (
                      <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                        {lbsResults.rank1.toFixed(2)}
                        <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '4px' }}>/ 300</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'rgba(248, 113, 113, 0.8)', fontStyle: 'italic' }}>Required marks not entered</div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Physics + Chemistry + Biology (out of 300)</div>
                  </div>

                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201, 168, 76, 0.1)', background: 'rgba(255, 255, 255, 0.01)' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Rank List 2 — B.Sc. SLP (Speech Language Pathology)</div>
                    {lbsResults.rank2 !== null ? (
                      <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                        {lbsResults.rank2.toFixed(2)}
                        <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '4px' }}>/ 300</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'rgba(248, 113, 113, 0.8)', fontStyle: 'italic' }}>Required marks not entered</div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Physics + Chemistry + (Biology or Mathematics) (out of 300)</div>
                  </div>

                  <div style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.01)' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Rank List 3 — Extended Index</div>
                    {lbsResults.rank3 !== null ? (
                      <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                        {lbsResults.rank3.toFixed(2)}
                        <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '4px' }}>/ 400</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'rgba(248, 113, 113, 0.8)', fontStyle: 'italic' }}>Required marks not entered</div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Physics + Chemistry + Biology + English (out of 400)</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(201, 168, 76, 0.05)', padding: '10px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(201, 168, 76, 0.1)', lineHeight: 1.5 }}>
                  * All subject marks are standardised to base 100 based on their individual maximum mark limits before compilation.
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Plus Two Percentage */}
        {activeTab === 'perc' && (
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)', marginBottom: '1.5rem', fontSize: '1.25rem', fontFamily: 'var(--font-head)' }}>
              <School size={18} className="text-gold" /> Plus Two Percentage Calculator
            </h3>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Total Marks Obtained</label>
              <input
                type="number"
                className="input-field"
                value={totalObtained}
                onChange={(e) => setTotalObtained(e.target.value)}
                placeholder="e.g. 1050"
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                Sum of marks obtained across all subjects.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Total Maximum Marks</label>
              <input
                type="number"
                className="input-field"
                value={totalMax}
                onChange={(e) => setTotalMax(e.target.value)}
                min="1"
                placeholder="e.g. 1200"
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                Kerala DHSE: 1200 (combined Plus One + Plus Two), CBSE: 500 (usually).
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
              <button className="btn btn-primary" onClick={calculatePercentage} style={{ flex: 1 }}>
                <Percent size={16} /> Calculate Percentage
              </button>
              <button className="btn btn-outline" onClick={resetPercentage} style={{ padding: '0.85rem 1.25rem' }}>
                <Trash2 size={16} />
              </button>
            </div>

            {percentageResult !== null && (
              <div style={{ marginTop: '2.5rem', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius)', overflow: 'hidden', animation: 'fadeUp 0.3s ease' }}>
                <div style={{ background: 'linear-gradient(90deg, var(--navy-light), var(--navy))', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-gold)' }}>
                  <Award size={16} style={{ color: 'var(--gold)' }} />
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-light)', fontWeight: 600 }}>Overall Result</span>
                </div>
                <div style={{ padding: '24px 16px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Overall Percentage</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--gold-light)', lineHeight: 1.1 }}>
                    {percentageResult.toFixed(2)}
                    <span style={{ fontSize: '1.5rem', fontWeight: 400, marginLeft: '2px' }}>%</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(201, 168, 76, 0.05)', padding: '10px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(201, 168, 76, 0.1)', textAlign: 'center' }}>
                  Formula: (Marks Obtained ÷ Maximum Marks) × 100
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Standardiser */}
        {activeTab === 'std' && (
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)', marginBottom: '1.5rem', fontSize: '1.25rem', fontFamily: 'var(--font-head)' }}>
              <RefreshCw size={18} className="text-gold" /> Subject Standardiser
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Convert any individual subject score to the LBS standard score out of 100.
            </p>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Marks Obtained</label>
              <input
                type="number"
                className="input-field"
                value={singleObtained}
                onChange={(e) => setSingleObtained(e.target.value)}
                placeholder="e.g. 55"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Maximum Marks for this Subject</label>
              <input
                type="number"
                className="input-field"
                value={singleMax}
                onChange={(e) => setSingleMax(e.target.value)}
                placeholder="e.g. 60"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
              <button className="btn btn-primary" onClick={calculateStandard} style={{ flex: 1 }}>
                <RefreshCw size={16} /> Standardise Score
              </button>
              <button className="btn btn-outline" onClick={resetStandard} style={{ padding: '0.85rem 1.25rem' }}>
                <Trash2 size={16} />
              </button>
            </div>

            {standardisedResult !== null && (
              <div style={{ marginTop: '2.5rem', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius)', overflow: 'hidden', animation: 'fadeUp 0.3s ease' }}>
                <div style={{ background: 'linear-gradient(90deg, var(--navy-light), var(--navy))', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-gold)' }}>
                  <Award size={16} style={{ color: 'var(--gold)' }} />
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-light)', fontWeight: 600 }}>Standardisation Result</span>
                </div>
                <div style={{ padding: '24px 16px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Standardised Score (out of 100)</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--gold-light)', lineHeight: 1.1 }}>
                    {standardisedResult.toFixed(2)}
                    <span style={{ fontSize: '1.25rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '4px' }}>/ 100</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(201, 168, 76, 0.05)', padding: '10px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(201, 168, 76, 0.1)', textAlign: 'center' }}>
                  Formula: (Marks Obtained ÷ Maximum Marks) × 100
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
