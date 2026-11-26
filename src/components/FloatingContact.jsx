import { useState, useEffect, useRef } from 'react';
import { UNIVERSITY_CONTACT } from '../data/mockData';
import './FloatingContact.css';

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="floating-contact" ref={wrapperRef}>
      {isOpen && (
        <section
          id="floating-contact-panel"
          className="floating-contact-panel"
          aria-label="Campus helpdesk contact options"
        >
          <div className="floating-contact-header">
            <h2>Need Campus Help?</h2>
            <button
              type="button"
              className="floating-contact-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close contact panel"
            >
              &times;
            </button>
          </div>
          <p className="floating-contact-hours">{UNIVERSITY_CONTACT.supportHours}</p>
          <div className="floating-contact-links">
            <a href={UNIVERSITY_CONTACT.phoneHref} className="floating-contact-link">
              <span aria-hidden="true">&#128222;</span>
              <span>Call {UNIVERSITY_CONTACT.phoneDisplay}</span>
            </a>
            <a href={`mailto:${UNIVERSITY_CONTACT.email}`} className="floating-contact-link">
              <span aria-hidden="true">&#9993;</span>
              <span>{UNIVERSITY_CONTACT.email}</span>
            </a>
          </div>
        </section>
      )}
      <button
        type="button"
        className="floating-contact-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="floating-contact-panel"
        aria-label={isOpen ? 'Close campus contact panel' : 'Open campus contact panel'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="floating-contact-label">Contact</span>
      </button>
    </div>
  );
}
