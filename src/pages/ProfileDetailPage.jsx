import { useParams, Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { CopyButton } from '../components/CopyButton';
import { useAppData } from '../context/AppDataContext';
import { formatLastUpdated } from '../utils/dateFormat';
import './ProfileDetailPage.css';

export function ProfileDetailPage({ kind }) {
  const { id } = useParams();
  const { alumni, students, currentUser } = useAppData();

  const records = kind === 'alumni' ? alumni : students;
  const person = records.find((item) => item.id === id);

  if (!person) {
    return (
      <section className="page-section">
        <PageMeta
          title="Profile Not Found"
          description="The requested University Connect member profile could not be found."
        />
        <div className="container">
          <div className="card">
            <h1>Profile not found</h1>
            <p className="card-muted">
              No {kind === 'alumni' ? 'alumni' : 'student'} record matched that profile address.
            </p>
            <div>
              <Link
                to={kind === 'alumni' ? '/alumni' : '/students'}
                className="btn btn-primary"
              >
                Back to {kind === 'alumni' ? 'Alumni Directory' : 'Students Directory'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <PageMeta
        title={`${person.name} - ${kind === 'alumni' ? 'Alumni Profile' : 'Student Profile'}`}
        description={person.bio}
      />
      <div className="container profile-detail-container">
        <div className="page-header-row no-print">
          <Link
            to={kind === 'alumni' ? '/alumni' : '/students'}
            className="btn btn-outline btn-sm"
          >
            &larr; Back to {kind === 'alumni' ? 'Alumni' : 'Students'}
          </Link>
          {person.id !== currentUser?.id && (
            <Link to={`/messages?to=${person.id}`} className="btn btn-primary btn-sm">
              Message {person.name.split(' ')[0]}
            </Link>
          )}
        </div>

        <article className="card profile-panel">
          <header className="profile-hero-header">
            <img
              src={person.avatar}
              alt={`${person.name} profile portrait`}
              width="96"
              height="96"
              className="profile-detail-avatar"
            />
            <div className="profile-hero-info">
              <span className="tag">{kind === 'alumni' ? `Alumni · Class of ${person.graduationYear}` : person.year}</span>
              <h1 className="profile-detail-name">{person.name}</h1>
              <p className="profile-detail-sub">
                {kind === 'alumni'
                  ? `${person.role} at ${person.company} · ${person.location}`
                  : person.department}
              </p>
              {kind === 'alumni' && <p className="profile-batch">{person.department}</p>}
            </div>
          </header>

          <section aria-labelledby="bio-heading">
            <h2 id="bio-heading" className="section-subheading">
              Overview
            </h2>
            <p className="card-muted">{person.bio}</p>
          </section>

          <section aria-labelledby="skills-heading">
            <h2 id="skills-heading" className="section-subheading">
              Skills &amp; Focus Areas
            </h2>
            <div className="tag-list">
              {person.skills.map((skill) => (
                <span key={skill} className="tag">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {kind === 'alumni' && person.mentorshipTopics && (
            <section aria-labelledby="mentorship-heading">
              <h2 id="mentorship-heading" className="section-subheading">
                Mentorship Topics
              </h2>
              <ul className="detail-list">
                {person.mentorshipTopics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </section>
          )}

          {kind === 'student' && person.interests && (
            <section aria-labelledby="interests-heading">
              <h2 id="interests-heading" className="section-subheading">
                Research &amp; Project Interests
              </h2>
              <ul className="detail-list">
                {person.interests.map((interest) => (
                  <li key={interest}>{interest}</li>
                ))}
              </ul>
            </section>
          )}

          {kind === 'student' && currentUser?.role !== 'alumni' && (
            <section aria-labelledby="hackathon-status-heading">
              <h2 id="hackathon-status-heading" className="section-subheading">
                Hackathon Teammate Compatibility
              </h2>
              <div className="hackathon-status-card">
                <div className="status-info">
                  <span className={`tag ${person.lookingForTeam ? 'badge-success' : 'badge-warning'}`}>
                    {person.lookingForTeam ? '🟢 Looking for Teammates' : '⚪ Team Formed / Inactive'}
                  </span>
                  <p>
                    Target Track:{' '}
                    <strong>{person.preferredTrack || 'Campus Sustainability'}</strong>
                  </p>
                </div>
                <div className="status-actions">
                  <Link to="/hackathons" className="btn btn-primary btn-sm">
                    Open Team Builder with {person.name.split(' ')[0]} →
                  </Link>
                </div>
              </div>
            </section>
          )}

          <section aria-labelledby="links-heading">
            <h2 id="links-heading" className="section-subheading">
              Contact &amp; Verified Links
            </h2>
            <div className="profile-links-stack">
              <div className="link-row">
                <span>
                  Email: <a href={`mailto:${person.email}`}>{person.email}</a>
                </span>
                <CopyButton text={person.email} label="Copy email address" />
              </div>
              <div className="link-row">
                <a href={person.githubUrl} target="_blank" rel="noopener noreferrer">
                  GitHub: {person.githubUrl}
                </a>
                <CopyButton text={person.githubUrl} label="Copy GitHub profile URL" />
              </div>
              <div className="link-row">
                <a href={person.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  Portfolio: {person.portfolioUrl}
                </a>
                <CopyButton text={person.portfolioUrl} label="Copy portfolio URL" />
              </div>
            </div>
          </section>

          <footer className="last-updated">
            Last updated: {formatLastUpdated(person.updatedAt)}
          </footer>
        </article>
      </div>
    </section>
  );
}
