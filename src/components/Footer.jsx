import { Link } from 'react-router-dom';
import { UNIVERSITY_CONTACT } from '../data/mockData';
import { useAppData } from '../context/AppDataContext';
import './Footer.css';

export function Footer() {
  const { currentUser } = useAppData();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo-link" aria-label="University Connect home">
            <span className="brand-mark" aria-hidden="true">
              UC
            </span>
            <span className="footer-brand-name">University Connect</span>
          </Link>
          <p className="footer-tagline">
            Bridging students, alumni mentors, campus communities, and student-led innovation
            across {UNIVERSITY_CONTACT.campusName}.
          </p>
        </div>

        <nav className="footer-col" aria-label="Explore platform">
          <h2 className="footer-heading">Platform</h2>
          <ul className="footer-links">
            <li>
              <Link to="/alumni">Alumni Directory</Link>
            </li>
            <li>
              <Link to="/students">Student Profiles</Link>
            </li>
            <li>
              <Link to="/communities">Campus Communities</Link>
            </li>
            <li>
              <Link to="/projects">Student Projects</Link>
            </li>
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Campus participation">
          <h2 className="footer-heading">Participate</h2>
          <ul className="footer-links">
            <li>
              <Link to="/questions">Campus Q&amp;A</Link>
            </li>
            <li>
              <Link to="/hackathons">Hackathons</Link>
            </li>
            {currentUser ? (
              <li>
                <Link to="/profile">My Profile</Link>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login">Member Login</Link>
                </li>
                <li>
                  <Link to="/register">Join Network</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="footer-col">
          <h2 className="footer-heading">Campus Office</h2>
          <address className="footer-address">
            <p>{UNIVERSITY_CONTACT.address}</p>
            <p>
              Mobile:{' '}
              <a href={UNIVERSITY_CONTACT.phoneHref}>{UNIVERSITY_CONTACT.phoneDisplay}</a>
            </p>
            <p>
              Desk:{' '}
              <a href={UNIVERSITY_CONTACT.officePhoneHref}>
                {UNIVERSITY_CONTACT.officePhoneDisplay}
              </a>
            </p>
            <p>
              Email:{' '}
              <a href={`mailto:${UNIVERSITY_CONTACT.email}`}>{UNIVERSITY_CONTACT.email}</a>
            </p>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            &copy; {currentYear} {UNIVERSITY_CONTACT.brandName}. Built for student and alumni
            collaboration.
          </p>
          <p className="footer-hours">{UNIVERSITY_CONTACT.supportHours}</p>
        </div>
      </div>
    </footer>
  );
}
