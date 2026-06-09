import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ClipboardList, Upload, Eye, FileText, CheckCircle } from 'lucide-react';

export default function Tracker({ user, onNavigate }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_on,
          notes,
          colleges (
            id,
            name,
            city,
            state
          ),
          courses (
            id,
            name,
            type,
            duration
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const simulateUpdateStatus = async (appId, currentStatus) => {
    // Simulate updating application status for testing & demo purposes
    const statuses = ['Submitted', 'Interview', 'Accepted'];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];

    setUpdatingId(appId);

    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: nextStatus })
        .eq('id', appId);

      if (error) throw error;
      
      // Refresh local state
      setApplications(applications.map(app => 
        app.id === appId ? { ...app, status: nextStatus } : app
      ));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
          <ClipboardList size={48} style={{ color: 'var(--gold)', margin: '0 auto 1rem' }} />
          <h2 className="card-title">Application Tracker</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.92rem' }}>
            Sign in to track your college applications, manage interview invites, and view your admission statuses in real time.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate('auth')}>
            Sign In or Register
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Retrieving your application history...</p>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Not Started': return 'status-not-started';
      case 'Submitted': return 'status-submitted';
      case 'Interview': return 'status-interview';
      case 'Accepted': return 'status-accepted';
      default: return 'status-not-started';
    }
  };

  return (
    <div className="screen">
      <h2 className="card-title">My Application Tracker</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
        Track your admission applications. Click on "Update Status" to simulate the college admissions office changing your status from Submitted → Interview → Accepted.
      </p>

      {applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.5rem' }}>No applications submitted yet.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Go through our recommendations list, select a college, and click "Apply" to start tracking your path.
          </p>
          <button className="btn btn-outline" onClick={() => onNavigate('recommendations')}>
            View Course Recommendations
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="tracker-table-container">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>College Name</th>
                  <th>Course Track</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions (Demo Tool)</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                        {app.colleges ? app.colleges.name : 'Unknown College'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {app.colleges ? `${app.colleges.city}, ${app.colleges.state}` : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {app.courses ? app.courses.name : 'Unknown Course'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {app.courses ? `${app.courses.type} • ${app.courses.duration}` : ''}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {new Date(app.applied_on).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => simulateUpdateStatus(app.id, app.status)}
                          disabled={updatingId === app.id}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          title="Simulate admissions office updates"
                        >
                          {updatingId === app.id ? 'Updating...' : 'Cycle Status'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
