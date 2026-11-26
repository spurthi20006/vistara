import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { SkeletonCard } from '../components/Skeleton';
import { CopyButton } from '../components/CopyButton';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import './ProjectsPage.css';

const EMPTY_PROJECT_FORM = {
  title: '',
  domain: 'Campus Utility',
  summary: '',
  description: '',
  techStack: '',
  githubUrl: '',
  deploymentUrl: '',
};

export function ProjectsPage() {
  const { projects, addProject, deleteProject } = useAppData();
  const { showToast } = useToast();
  const [domainFilter, setDomainFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_PROJECT_FORM);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const fieldRefs = {
    title: useRef(null),
    summary: useRef(null),
    description: useRef(null),
    techStack: useRef(null),
    githubUrl: useRef(null),
    deploymentUrl: useRef(null),
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 380);
    return () => window.clearTimeout(timer);
  }, []);

  const domains = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((p) => p.domain)))],
    [projects]
  );

  const visibleProjects = useMemo(() => {
    if (domainFilter === 'All') return projects;
    return projects.filter((p) => p.domain === domainFilter);
  }, [projects, domainFilter]);

  const validateForm = () => {
    const nextErrors = {};
    if (formData.title.trim().length < 3) {
      nextErrors.title = 'Enter a project title with at least 3 characters.';
    }
    if (formData.summary.trim().length < 12) {
      nextErrors.summary = 'Provide a one-sentence summary (at least 12 characters).';
    }
    if (formData.description.trim().length < 20) {
      nextErrors.description = 'Describe what your project solves (at least 20 characters).';
    }
    if (!formData.techStack.trim()) {
      nextErrors.techStack = 'List at least one technology (comma-separated).';
    }
    if (!/^https?:\/\/.+/i.test(formData.githubUrl.trim())) {
      nextErrors.githubUrl = 'Enter a valid GitHub URL starting with https:// or http://.';
    }
    if (!/^https?:\/\/.+/i.test(formData.deploymentUrl.trim())) {
      nextErrors.deploymentUrl = 'Enter a valid deployment URL starting with https:// or http://.';
    }
    return nextErrors;
  };

  const handlePublishSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      if (fieldRefs[firstKey]?.current) {
        fieldRefs[firstKey].current.focus();
      }
      showToast({
        type: 'error',
        title: 'Project submission incomplete',
        message: 'Review the highlighted fields before publishing.',
      });
      return;
    }

    const created = addProject(formData);
    setSubmitSuccess(created);
    setFormData(EMPTY_PROJECT_FORM);
    setErrors({});
    showToast({
      type: 'success',
      title: 'Project published',
      message: `"${created.title}" is now live in the campus showcase.`,
    });
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteProject(pendingDelete.id);
    showToast({
      type: 'info',
      title: 'Project deleted',
      message: `"${pendingDelete.title}" was removed from the showcase.`,
    });
    setPendingDelete(null);
  };

  const errorEntries = Object.entries(errors);

  return (
    <section className="page-section">
      <PageMeta
        title="Student Projects"
        description="Explore student-built campus software, IoT hardware, and AI tools with source repositories and live deployments."
      />
      <div className="container">
        <div className="page-header-row">
          <div className="page-header">
            <h1 className="page-title">Student Projects</h1>
            <p className="page-subtitle">
              Open-source builds, hardware prototypes, and live campus utilities created by student
              teams.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setShowPublishForm((prev) => !prev);
              setSubmitSuccess(null);
            }}
          >
            {showPublishForm ? 'Close Publish Form' : 'Publish a Project'}
          </button>
        </div>

        {showPublishForm && (
          <section className="card publish-panel" aria-labelledby="publish-project-heading">
            <h2 id="publish-project-heading">Publish New Campus Project</h2>
            {submitSuccess ? (
              <div className="form-success-card" role="status">
                <h3>Project Published Successfully</h3>
                <p>
                  <strong>{submitSuccess.title}</strong> has been added to the showcase under{' '}
                  {submitSuccess.domain}.
                </p>
                <div className="card-actions-row">
                  <Link to={`/projects/${submitSuccess.id}`} className="btn btn-primary">
                    View Project Page
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setSubmitSuccess(null);
                      setShowPublishForm(false);
                    }}
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            ) : (
              <form className="form-stack" onSubmit={handlePublishSubmit} noValidate>
                {errorEntries.length > 0 && (
                  <div className="error-summary" role="alert">
                    <h3>Please fix {errorEntries.length} form error(s):</h3>
                    <ul>
                      {errorEntries.map(([field, msg]) => (
                        <li key={field}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="two-col-grid">
                  <div className="form-field">
                    <label htmlFor="proj-title" className="form-label">
                      Project Title
                    </label>
                    <input
                      ref={fieldRefs.title}
                      id="proj-title"
                      type="text"
                      className={`form-input ${errors.title ? 'input-invalid' : ''}`}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      aria-invalid={Boolean(errors.title)}
                      aria-describedby={errors.title ? 'proj-title-err' : undefined}
                      placeholder="Campus Library Seat Tracker"
                    />
                    {errors.title && (
                      <span id="proj-title-err" className="field-error">
                        {errors.title}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="proj-domain" className="form-label">
                      Domain
                    </label>
                    <select
                      id="proj-domain"
                      className="form-select"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    >
                      <option value="Campus Utility">Campus Utility</option>
                      <option value="IoT & Hardware">IoT &amp; Hardware</option>
                      <option value="EdTech & AI">EdTech &amp; AI</option>
                      <option value="Sustainability">Sustainability</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="proj-summary" className="form-label">
                    Short Summary
                  </label>
                  <input
                    ref={fieldRefs.summary}
                    id="proj-summary"
                    type="text"
                    className={`form-input ${errors.summary ? 'input-invalid' : ''}`}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    aria-invalid={Boolean(errors.summary)}
                    aria-describedby={errors.summary ? 'proj-summary-err' : undefined}
                    placeholder="Live occupancy counters for quiet reading rooms."
                  />
                  {errors.summary && (
                    <span id="proj-summary-err" className="field-error">
                      {errors.summary}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="proj-description" className="form-label">
                    Detailed Description
                  </label>
                  <textarea
                    ref={fieldRefs.description}
                    id="proj-description"
                    className={`form-textarea ${errors.description ? 'input-invalid' : ''}`}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={errors.description ? 'proj-desc-err' : undefined}
                    placeholder="Explain the campus problem, architecture, and outcomes..."
                  />
                  {errors.description && (
                    <span id="proj-desc-err" className="field-error">
                      {errors.description}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="proj-stack" className="form-label">
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    ref={fieldRefs.techStack}
                    id="proj-stack"
                    type="text"
                    className={`form-input ${errors.techStack ? 'input-invalid' : ''}`}
                    value={formData.techStack}
                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                    aria-invalid={Boolean(errors.techStack)}
                    aria-describedby={errors.techStack ? 'proj-stack-err' : undefined}
                    placeholder="React, Node.js, PostgreSQL"
                  />
                  {errors.techStack && (
                    <span id="proj-stack-err" className="field-error">
                      {errors.techStack}
                    </span>
                  )}
                </div>

                <div className="two-col-grid">
                  <div className="form-field">
                    <label htmlFor="proj-github" className="form-label">
                      GitHub Repository URL
                    </label>
                    <input
                      ref={fieldRefs.githubUrl}
                      id="proj-github"
                      type="url"
                      className={`form-input ${errors.githubUrl ? 'input-invalid' : ''}`}
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      aria-invalid={Boolean(errors.githubUrl)}
                      aria-describedby={errors.githubUrl ? 'proj-github-err' : undefined}
                      placeholder="https://github.com/university-connect/library-seats"
                    />
                    {errors.githubUrl && (
                      <span id="proj-github-err" className="field-error">
                        {errors.githubUrl}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="proj-deploy" className="form-label">
                      Live Deployment URL
                    </label>
                    <input
                      ref={fieldRefs.deploymentUrl}
                      id="proj-deploy"
                      type="url"
                      className={`form-input ${errors.deploymentUrl ? 'input-invalid' : ''}`}
                      value={formData.deploymentUrl}
                      onChange={(e) => setFormData({ ...formData, deploymentUrl: e.target.value })}
                      aria-invalid={Boolean(errors.deploymentUrl)}
                      aria-describedby={errors.deploymentUrl ? 'proj-deploy-err' : undefined}
                      placeholder="https://seats.universityconnect.edu.in"
                    />
                    {errors.deploymentUrl && (
                      <span id="proj-deploy-err" className="field-error">
                        {errors.deploymentUrl}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <button type="submit" className="btn btn-primary">
                    Publish Project
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        <div className="filter-bar" role="group" aria-label="Filter projects by domain">
          {domains.map((domain) => (
            <button
              key={domain}
              type="button"
              className={`btn btn-sm ${domainFilter === domain ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setDomainFilter(domain)}
              aria-pressed={domainFilter === domain}
            >
              {domain}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="card-grid" role="status" aria-label="Loading projects">
            <SkeletonCard hasImage />
            <SkeletonCard hasImage />
            <SkeletonCard hasImage />
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="card">
            <h2>No projects in this category yet</h2>
            <p className="card-muted">
              Select All domains above or publish a new project using the button at the top.
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {visibleProjects.map((project) => (
              <article key={project.id} className="card card-interactive">
                <img
                  src={project.thumbnail}
                  alt={`${project.title} preview`}
                  width="640"
                  height="400"
                  loading="lazy"
                  className="project-card-thumb"
                />
                <span className="tag">{project.domain}</span>
                <h2 className="card-heading">
                  <Link to={`/projects/${project.id}`}>{project.title}</Link>
                </h2>
                <p className="card-muted">{project.summary}</p>
                <div className="tag-list">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="tag">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="project-links-compact">
                  <div className="link-row">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      GitHub Repo
                    </a>
                    <CopyButton text={project.githubUrl} label="Copy GitHub URL" />
                  </div>
                  <div className="link-row">
                    <a href={project.deploymentUrl} target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </a>
                    <CopyButton text={project.deploymentUrl} label="Copy deployment URL" />
                  </div>
                </div>
                <div className="card-actions-row">
                  <Link to={`/projects/${project.id}`} className="btn btn-primary btn-sm">
                    Inspect Project
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setPendingDelete(project)}
                  >
                    Delete Project
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Delete project?"
        message={
          pendingDelete
            ? `Permanently delete "${pendingDelete.title}" from the University Connect showcase? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Project"
        cancelLabel="Keep Project"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
