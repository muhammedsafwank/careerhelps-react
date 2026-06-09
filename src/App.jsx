import React, { useState, useEffect } from 'react';
import { supabase, isMocked } from './supabaseClient';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Questionnaire from './components/Questionnaire';
import Recommendations from './components/Recommendations';
import Tracker from './components/Tracker';
import ContactFAQ from './components/ContactFAQ';
import AdminDashboard from './components/AdminDashboard';
import { ClipboardList, Award, User, HelpCircle, LogIn, LogOut, LayoutDashboard, Shield } from 'lucide-react';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [matchedCourse, setMatchedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appRefresh, setAppRefresh] = useState(0);

  // Monitor auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setMatchedCourse(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      if (data && data.course_preferred) {
        setMatchedCourse(data.course_preferred);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (authUser) => {
    setUser(authUser);
    fetchProfile(authUser.id);
    setCurrentScreen('landing');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentScreen('landing');
  };

  const handleQuizComplete = (courseName) => {
    setMatchedCourse(courseName);
    setCurrentScreen('recommendations');
  };

  const handleApplySuccess = () => {
    setAppRefresh(prev => prev + 1);
  };

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return (
          <Landing
            onStartQuiz={() => setCurrentScreen('quiz')}
            user={user}
            onNavigate={handleNavigate}
          />
        );
      case 'quiz':
        return (
          <Questionnaire
            user={user}
            profile={profile}
            onQuizComplete={handleQuizComplete}
          />
        );
      case 'recommendations':
        return (
          <Recommendations
            matchedCourse={matchedCourse}
            user={user}
            onApplySuccess={handleApplySuccess}
          />
        );
      case 'profile':
        return (
          <Profile
            user={user}
            onProfileUpdated={() => fetchProfile(user.id)}
          />
        );
      case 'tracker':
        return (
          <Tracker
            user={user}
            onNavigate={handleNavigate}
            key={appRefresh} // Re-render tracker on changes
          />
        );
      case 'contact':
        return <ContactFAQ />;
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'auth':
        return (
          <Auth
            onAuthSuccess={handleAuthSuccess}
            onNavigate={handleNavigate}
          />
        );
      default:
        return (
          <Landing
            onStartQuiz={() => setCurrentScreen('quiz')}
            user={user}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="app">
      {/* Header bar */}
      <header className="header">
        <div className="header-brand" onClick={() => setCurrentScreen('landing')}>
          <div className="logo-mark">C</div>
          <div className="brand-text">
            <h1>Career Helps</h1>
            <p>Happy to mould your future</p>
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-link ${currentScreen === 'landing' || currentScreen === 'quiz' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('landing')}
          >
            Quiz Assessment
          </button>
          
          {matchedCourse && (
            <button
              className={`nav-link ${currentScreen === 'recommendations' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('recommendations')}
            >
              <Award size={14} /> Matches
            </button>
          )}

          <button
            className={`nav-link ${currentScreen === 'tracker' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('tracker')}
          >
            <ClipboardList size={14} /> Tracker
          </button>

          <button
            className={`nav-link ${currentScreen === 'contact' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('contact')}
          >
            <HelpCircle size={14} /> Contact & FAQs
          </button>

          {profile && (
            <button
              className={`nav-link ${currentScreen === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('profile')}
            >
              <User size={14} /> Profile
            </button>
          )}

          {profile && profile.is_admin && (
            <button
              className={`nav-link ${currentScreen === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('admin')}
              style={{ color: 'var(--gold-light)' }}
            >
              <Shield size={14} /> Admin
            </button>
          )}

          {user ? (
            <button className="nav-link" onClick={handleSignOut} style={{ color: '#fda4af' }}>
              <LogOut size={14} /> Sign Out
            </button>
          ) : (
            <button
              className={`nav-link ${currentScreen === 'auth' ? 'active' : ''}`}
              onClick={() => setCurrentScreen('auth')}
            >
              <LogIn size={14} /> Sign In
            </button>
          )}
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div className="spinner-container" style={{ margin: 'auto' }}>
            <div className="spinner"></div>
            <p>Verifying authentication...</p>
          </div>
        ) : (
          renderScreen()
        )}
      </main>

      {/* Footer info */}
      <footer className="footer">
        <p>© 2026 Career Helps AI. All Rights Reserved.</p>
        <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
          Compliance: IT Act 2000, 2011 SPDI Rules, DPDP Act 2023. Data processed locally with consent.
        </p>
        {isMocked && (
          <p style={{ fontSize: '11px', color: 'var(--gold-light)', marginTop: '0.4rem', fontStyle: 'italic' }}>
            Running in Local Storage Sandbox (plug in VITE_SUPABASE_URL env keys to switch to cloud Postgres).
          </p>
        )}
        <div className="footer-links">
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Privacy Policy: All profile marks and location data are processed strictly for calculating eligibility parameters."); }}>Privacy Policy</a>
          <span>|</span>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Terms of Use: This is an advice helper tool. Course details are matching Government of India norms."); }}>Terms of Use</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
