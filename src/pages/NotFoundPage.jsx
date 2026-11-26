import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import './NotFoundPage.css';

export function NotFoundPage() {
  return (
    <section className="page-section">
      <PageMeta
        title="Page Not Found"
        description="The requested University Connect page does not exist. Return to the home page to explore alumni, students, projects, and communities."
      />
      <div className="container not-found-container">
        <div className="card not-found-card">
          <span className="not-found-code" aria-hidden="true">
            404
          </span>
          <h1>Page not found</h1>
          <p className="card-muted">
            The route you entered is not part of University Connect. Return to the campus home page
            or use the search bar above to find alumni, students, communities, or projects.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">
              Back to Home Page
            </Link>
            <Link to="/projects" className="btn btn-outline">
              Browse Projects
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
