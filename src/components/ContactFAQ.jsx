import React, { useState } from 'react';
import { MOCK_FAQS } from '../mockData';
import { HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactFAQ() {
  const [openIdx, setOpenIdx] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const toggleFAQ = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 5000);
    }, 800);
  };

  return (
    <div className="screen">
      <div className="grid-cols-2" style={{ gap: '2.5rem' }}>
        {/* FAQs Accordion */}
        <div>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={22} className="text-gold" />
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Find quick answers regarding healthcare courses, eligibilities, government postings, and data compliance.
          </p>

          <div className="faq-list">
            {MOCK_FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <div className="faq-question" onClick={() => toggleFAQ(idx)}>
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="card-title">Contact & Counselor Help</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Need direct human counseling or facing questions about registration? Send our support helpdesk a message below.
          </p>

          <div className="card" style={{ padding: '1.5rem' }}>
            {submitted && (
              <div className="consent-box" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534', display: 'flex', gap: '8px', alignItems: 'center', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                <CheckCircle size={18} />
                <span style={{ fontSize: '0.85rem' }}>Your query has been sent! A counselor will write back shortly.</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="contact-name">Your Name</label>
                <input
                  type="text"
                  id="contact-name"
                  className="input-field"
                  placeholder="e.g. Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  type="email"
                  id="contact-email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-msg">How can we help you?</label>
                <textarea
                  id="contact-msg"
                  rows="4"
                  placeholder="Ask about admissions, course details, or technical help..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sending}>
                {sending ? (
                  <span className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#fff', margin: 0 }}></span>
                ) : (
                  <>
                    <Send size={16} /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', paddingLeft: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} className="text-gold" />
              <span>careerhelpsweb@gmail.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} className="text-gold" />
              <span>+91 7909222274</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <a href="https://instagram.com/career_helps" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                @career_helps
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} className="text-gold" />
              <span>Kochi Infopark, Kerala, India</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
