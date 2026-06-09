import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, MapPin, Mail, Phone, Award, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CollegeDetail({ college, course, user, onClose, onApplySuccess }) {
  const [applying, setApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState(''); // '', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleApply = async () => {
    if (!user) {
      setApplyStatus('error');
      setErrorMsg('You must sign in to apply and track your applications.');
      return;
    }

    setApplying(true);
    setApplyStatus('');
    setErrorMsg('');

    try {
      const { data, error } = await supabase.from('applications').insert({
        user_id: user.id,
        college_id: college.id,
        course_id: course.id,
        status: 'Submitted'
      });

      if (error) {
        if (error.message.includes('unique_constraint') || error.code === '23505') {
          throw new Error('You have already applied for this course at this college.');
        }
        throw error;
      }

      setApplyStatus('success');
      if (onApplySuccess) {
        onApplySuccess();
      }
    } catch (err) {
      setApplyStatus('error');
      setErrorMsg(err.message || 'An error occurred while submitting your application.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{college.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {applyStatus === 'success' && (
            <div className="consent-box" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--success)' }} />
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Application Submitted!</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                You have successfully applied for <strong>{course.name}</strong>. Go to the <strong>Tracker</strong> tab in your navigation bar to follow its progress.
              </p>
            </div>
          )}

          {applyStatus === 'error' && (
            <div className="consent-box" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', padding: '1rem', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1.5rem' }}>
              <AlertCircle size={24} style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Application Failed</p>
                <p style={{ fontSize: '0.8rem' }}>{errorMsg}</p>
              </div>
            </div>
          )}

          <div className="grid-cols-2">
            <div className="detail-section">
              <h3>College Overview</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>
                {college.description || 'No description available for this college.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <MapPin size={16} className="text-muted" style={{ marginTop: '3px' }} />
                  <span>{college.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={16} className="text-muted" />
                  <span>{college.contact_email || 'admissions@college.edu.in'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={16} className="text-muted" />
                  <span>{college.contact_phone || '9999-0000-11'}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Program Details & Fees</h3>
              <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '6px' }}>
                  Course Selected: <strong>{course.name}</strong> ({course.type})
                </p>
                <p style={{ fontSize: '0.9rem', marginBottom: '6px' }}>
                  Duration: <strong>{course.duration}</strong>
                </p>
                <p style={{ fontSize: '0.9rem', marginBottom: '6px' }}>
                  Accreditation: <strong className="text-gold" style={{ fontSize: '0.85rem' }}>{college.accreditation || 'State Board'}</strong>
                </p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px' }}>
                  Annual Tuition: <span className="text-gold">₹{college.avg_fee.toLocaleString('en-IN')}</span>
                </p>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <p style={{ fontWeight: 600, color: 'var(--gold-light)', marginBottom: '4px' }}>Admission Eligibility:</p>
                <ul style={{ paddingLeft: '1.25rem' }}>
                  <li>{course.eligibility}</li>
                  <li>Must possess valid 10th & 12th grade passing transcripts.</li>
                  {course.name.toLowerCase().includes('nursing') && (
                    <li>Nursing Council age rule: Candidates must be at least 17 years of age.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifySelf: 'end', gap: '12px', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', width: '100%' }}>
            <button className="btn btn-outline" onClick={onClose}>
              Close Window
            </button>
            {applyStatus !== 'success' && (
              <button
                className="btn btn-primary"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? (
                  <span className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#fff', margin: 0 }}></span>
                ) : (
                  <>Apply for Admission</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
