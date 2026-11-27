import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { CopyButton } from '../components/CopyButton';
import { useAppData } from '../context/AppDataContext';
import { UNIVERSITY_CONTACT } from '../data/mockData';
import './HomePage.css';

export function HomePage() {
  const { alumni, students, communities, projects, currentUser } = useAppData();

  return (
    <div>
      <PageMeta
        title="Campus & Alumni Network"
        description="University Connect unites students, alumni mentors, campus communities, student projects, and hackathons in one accessible portal."
      />

      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="hero-eyebrow">{UNIVERSITY_CONTACT.campusName}</span>
            <h1 className="hero-title">
              Where Campus Ambition Meets Alumni Mentorship
            </h1>
            <p className="hero-subtitle">
              Discover verified alumni mentors, collaborate inside student communities, publish
              capstone builds, and join campus hackathons across every engineering and design
              cohort.
            </p>
            <div className="hero-actions">
              <Link to="/projects" className="btn hero-btn-primary">
                Explore Student Projects
              </Link>
              <Link to={currentUser ? '/profile' : '/register'} className="btn hero-btn-secondary">
                {currentUser ? 'Open My Profile' : 'Create Campus Account'}
              </Link>
            </div>
            <dl className="hero-stats">
              <div className="hero-stat-item">
                <dt>Alumni Mentors</dt>
                <dd>{alumni.length}+</dd>
              </div>
              <div className="hero-stat-item">
                <dt>Active Students</dt>
                <dd>{students.length}+</dd>
              </div>
              {currentUser?.role !== 'alumni' && (
                <div className="hero-stat-item">
                  <dt>Campus Guilds</dt>
                  <dd>{communities.length}</dd>
                </div>
              )}
              <div className="hero-stat-item">
                <dt>Live Projects</dt>
                <dd>{projects.length}</dd>
              </div>
            </dl>
          </div>

          <figure className="hero-figure">
            <img
              src="/images/hero-campus.webp"
              alt="Geometric illustration of university campus buildings connected by glowing network nodes"
              width="960"
              height="600"
              className="hero-image"
            />
          </figure>
        </div>
      </section>

      <section className="page-section" aria-labelledby="featured-projects-heading">
        <div className="container">
          <div className="page-header-row">
            <div className="page-header">
              <h2 id="featured-projects-heading" className="page-title">
                Featured Student Builds
              </h2>
              <p className="page-subtitle">
                Recent open-source tools and campus utilities built by undergraduate teams with
                alumni technical reviews.
              </p>
            </div>
            <Link to="/projects" className="btn btn-outline">
              View All Projects
            </Link>
          </div>

          <div className="card-grid">
            {projects.slice(0, 3).map((project) => (
              <article key={project.id} className="card card-interactive">
                <img
                  src={project.thumbnail}
                  alt={`${project.title} preview graphic`}
                  width="640"
                  height="400"
                  loading="lazy"
                  className="project-card-thumb"
                />
                <span className="tag">{project.domain}</span>
                <h3 className="card-heading">
                  <Link to={`/projects/${project.id}`}>{project.title}</Link>
                </h3>
                <p className="card-muted">{project.summary}</p>
                <div className="link-row">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Repository
                  </a>
                  <CopyButton text={project.githubUrl} label="Copy GitHub URL" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {currentUser?.role !== 'alumni' && (
        <section className="page-section home-band-alt" aria-labelledby="communities-preview-heading">
          <div className="container">
            <div className="page-header-row">
              <div className="page-header">
                <h2 id="communities-preview-heading" className="page-title">
                  Active Campus Communities
                </h2>
                <p className="page-subtitle">
                  Join weekly study circles, hardware labs, and peer design critiques across campus.
                </p>
              </div>
              <Link to="/communities" className="btn btn-outline">
                Browse Communities
              </Link>
            </div>

            <div className="card-grid">
              {communities.slice(0, 3).map((community) => (
                <article key={community.id} className="card card-interactive">
                  <div className="community-card-top">
                    <span className="tag">{community.category}</span>
                    <span className="card-meta-count">{community.membersCount} members</span>
                  </div>
                  <h3 className="card-heading">{community.name}</h3>
                  <p className="card-muted">{community.description}</p>
                  <p className="community-schedule">{community.meetingSchedule}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="page-section home-cta-band" aria-labelledby="campus-help-heading">
        <div className="container home-cta-card">
          <div>
            <h2 id="campus-help-heading">Questions for the Campus Coordinator Desk?</h2>
            <p>
              Reach our student innovation office directly at{' '}
              <a href={UNIVERSITY_CONTACT.phoneHref}>{UNIVERSITY_CONTACT.phoneDisplay}</a> or email{' '}
              <a href={`mailto:${UNIVERSITY_CONTACT.email}`}>{UNIVERSITY_CONTACT.email}</a>.
            </p>
          </div>
          <div className="home-cta-actions">
            <Link to="/questions" className="btn btn-primary">
              Ask in Q&amp;A Forum
            </Link>
            {currentUser?.role !== 'alumni' && (
              <Link to="/hackathons" className="btn btn-outline">
                Explore Hackathons
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
