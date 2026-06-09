import React, { useState } from 'react';
import { MOCK_QUESTIONS } from '../mockData';
import { supabase } from '../supabaseClient';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function Questionnaire({ user, onQuizComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(new Array(10).fill(null));
  const [saving, setSaving] = useState(false);

  const currentQuestion = MOCK_QUESTIONS[currentIdx];

  const handleSelectOption = (optIdx) => {
    const updated = [...answers];
    updated[currentIdx] = optIdx;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (answers[currentIdx] === null) return;
    if (currentIdx < MOCK_QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const calculateResult = () => {
    // Port of the scoring logic from PDF / career_helps_app.html
    const scores = { nursing: 0, lab: 0, physio: 0, radiology: 0, any_stream: 0, open_dur: 0 };
    const a = answers;

    // Q1 - Healthcare setting
    if (a[0] === 0) scores.nursing += 3;
    if (a[0] === 1) scores.lab += 3;
    if (a[0] === 2) scores.physio += 3;
    if (a[0] === 3) scores.radiology += 3;

    // Q2 - Night shifts
    if (a[1] === 0) scores.nursing += 2;
    if (a[1] === 1 || a[1] === 2) { scores.lab += 1; scores.radiology += 1; }

    // Q3 - Fav subject
    if (a[2] === 0) { scores.nursing += 1; scores.physio += 1; }
    if (a[2] === 1) scores.lab += 2;
    if (a[2] === 2) scores.radiology += 2;

    // Q4 - Anxious patient
    if (a[3] === 0) scores.nursing += 2;
    if (a[3] === 1) scores.lab += 2;
    if (a[3] === 2) scores.physio += 2;
    if (a[3] === 3) scores.radiology += 2;

    // Q5 - Work environment
    if (a[4] === 0) scores.nursing += 2;
    if (a[4] === 1) scores.lab += 2;
    if (a[4] === 2) scores.physio += 2;
    if (a[4] === 3) scores.radiology += 2;

    // Q6 - Technical equipment
    if (a[5] === 0) scores.nursing += 1;
    if (a[5] === 1) scores.lab += 2;
    if (a[5] === 3) scores.radiology += 2;

    // Q7 - Stream background
    if (a[6] === 2) scores.any_stream = 1; // Arts/Commerce -> GNM/ANM only

    // Q8 - Duration
    if (a[7] === 0) scores.open_dur = -1; // 2 years diploma preferred
    if (a[7] === 2 || a[7] === 3) scores.open_dur = 1; // 4 years degree preferred

    // Q9 - Career goal
    if (a[8] === 0) scores.nursing += 3;
    if (a[8] === 1) scores.lab += 3;
    if (a[8] === 2) scores.physio += 3;
    if (a[8] === 3) scores.radiology += 3;

    // Q10 - Government job
    if (a[9] === 0 || a[9] === 3) { scores.nursing += 1; scores.lab += 1; }

    // Find highest score
    let best = 'nursing';
    let bestScore = scores.nursing;
    if (scores.lab > bestScore) { best = 'lab'; bestScore = scores.lab; }
    if (scores.physio > bestScore) { best = 'physio'; bestScore = scores.physio; }
    if (scores.radiology > bestScore) { best = 'radiology'; bestScore = scores.radiology; }

    const isNonScience = a[6] === 2; // Arts/Commerce

    if (best === 'nursing') {
      if (isNonScience) return 'Auxiliary Nurse Midwife (ANM)';
      if (scores.open_dur < 0) return 'General Nursing and Midwifery (GNM)';
      return 'B.Sc Nursing';
    }
    if (best === 'lab') {
      if (scores.open_dur < 0) return 'Diploma in Medical Lab Technology (DMLT)';
      return 'B.Sc Medical Lab Technology (MLT)';
    }
    if (best === 'physio') {
      return 'Bachelor of Physiotherapy (BPT)';
    }
    if (best === 'radiology') {
      return 'B.Sc Radiology & Imaging Technology';
    }
    return 'B.Sc Nursing'; // Default fallback
  };

  const handleFinish = async () => {
    if (answers[currentIdx] === null) return;
    setSaving(true);

    const matchedCourse = calculateResult();

    try {
      // If user is authenticated, save answers to database
      if (user) {
        // Prepare list of answers for upserting
        const responseData = MOCK_QUESTIONS.map((q, idx) => ({
          user_id: user.id,
          question_id: q.id,
          answer: q.options[answers[idx]].text
        }));

        await supabase.from('user_responses').upsert(responseData);

        // Update preferred course in profiles table
        await supabase
          .from('profiles')
          .update({ course_preferred: matchedCourse })
          .eq('id', user.id);
      }

      // Trigger callback to parent
      onQuizComplete(matchedCourse);
    } catch (err) {
      console.error('Error saving answers:', err);
      // Still complete the quiz locally even if database fails
      onQuizComplete(matchedCourse);
    } finally {
      setSaving(false);
    }
  };

  const progressPercent = Math.round(((currentIdx + 1) / MOCK_QUESTIONS.length) * 100);

  return (
    <div className="screen">
      <div className="quiz-progress">
        <div className="progress-info">
          <span>Career Counseling Assessment</span>
          <span>Question {currentIdx + 1} of {MOCK_QUESTIONS.length} ({progressPercent}%)</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="card">
        <span className="q-num">Question {currentQuestion.id}</span>
        <h3 className="q-text">{currentQuestion.question}</h3>

        <div className="options-grid">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = answers[currentIdx] === idx;
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            return (
              <div
                key={idx}
                className={`option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectOption(idx)}
              >
                <div className="option-badge">{letter}</div>
                <div className="option-text">{opt.text}</div>
              </div>
            );
          })}
        </div>

        <div className="button-row">
          <button
            className="btn btn-outline"
            onClick={handleBack}
            disabled={currentIdx === 0}
            style={{ visibility: currentIdx === 0 ? 'hidden' : 'visible' }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {currentIdx < MOCK_QUESTIONS.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={answers[currentIdx] === null}
            >
              Next Question <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-gold"
              onClick={handleFinish}
              disabled={answers[currentIdx] === null || saving}
            >
              {saving ? (
                <span className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#0d1b2e', margin: 0 }}></span>
              ) : (
                <>
                  <Check size={18} /> Finish and Recommend
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
