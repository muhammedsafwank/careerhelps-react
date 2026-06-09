import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function Auth({ onAuthSuccess, onNavigate }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(localStorage.getItem('student_name') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignUp && !name) {
      setError('Please provide your name.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              consent_given: true
            }
          }
        });
        if (signUpError) throw signUpError;

        // Copy guest phone number to profile
        try {
          const guestPhone = localStorage.getItem('student_phone');
          if (guestPhone) {
            await supabase.from('profiles').update({ phone: guestPhone }).eq('id', data.user.id);
          }
        } catch (dbErr) {
          console.error("Failed to copy guest phone to profile:", dbErr);
        }

        setSuccess('Signup successful! Welcome to Career Helps.');
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 1000);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        setSuccess('Logged in successfully!');
        setTimeout(() => {
          onAuthSuccess(data.user);
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        <h2 className="card-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>
          {isSignUp ? 'Sign up to track your applications and college match results' : 'Sign in to access your dashboard'}
        </p>

        {error && (
          <div className="consent-box" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', display: 'flex', gap: '8px', alignItems: 'center', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}

        {success && (
          <div className="consent-box" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem' }}>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="name-input">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  id="name-input"
                  className="input-field"
                  placeholder="e.g. Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email-input">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                id="email-input"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                id="password-input"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? (
              <span className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#fff', margin: 0 }}></span>
            ) : isSignUp ? (
              <>
                <UserPlus size={18} /> Register Account
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.88rem' }}>
          <button
            type="button"
            className="tab-btn"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
            }}
            style={{ borderBottom: 'none', padding: 0 }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
