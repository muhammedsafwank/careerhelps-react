import React, { useState } from 'react';
import { Stethoscope, ArrowRight, UserCheck } from 'lucide-react';

export default function Landing({ onStartQuiz, user, onNavigate }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="screen">
      <div className="hero">
        <div className="hero-tag">
          <Stethoscope size={14} className="text-gold" />
          Nursing & Allied Health Careers
        </div>
        <h2>
          Find your <em>ideal</em> healthcare career path
        </h2>
        <p>
          Answer a 10-question smart questionnaire about your interests, academic strengths, and constraints.
          Our algorithm will match you to the optimal nursing or allied health courses, explain the choice,
          and link you directly to eligible colleges and application tracking.
        </p>
        
        <div className="pills" style={{ marginBottom: '2.5rem' }}>
          {['ANM', 'GNM', 'B.Sc Nursing', 'BPT', 'B.Sc MLT', 'DMLT', 'B.Sc Radiology', 'B.Sc Optometry', 'BASLP'].map((c) => (
            <span className="pill" key={c}>
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="consent-box">
        <p style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>
          Data Collection Consent (DPDP Act 2023 Compliant)
        </p>
        <p>
          This counseling helper processes your academic marks, location preferences, and questionnaire responses.
          No sensitive credentials or personal files are shared without explicit consent. Your details will only be used
          to recommend matching medical programs and tracks.
        </p>
        <label className="consent-check">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            id="consent-checkbox"
          />
          <span>
            I understand and give consent for my academic profile and answers to be processed for recommendations.
          </span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          onClick={onStartQuiz}
          disabled={!agreed}
          title={!agreed ? "Please agree to the privacy consent to continue" : ""}
        >
          Start the Questionnaire
          <ArrowRight size={16} />
        </button>

        {!user && (
          <button
            className="btn btn-outline"
            onClick={() => onNavigate('auth')}
          >
            <UserCheck size={16} />
            Sign In for Application Tracking
          </button>
        )}
      </div>
    </div>
  );
}
