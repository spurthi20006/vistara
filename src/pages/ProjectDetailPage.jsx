import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { CopyButton } from '../components/CopyButton';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import { formatLastUpdated } from '../utils/dateFormat';
import './ProfileDetailPage.css';
import './ProjectsPage.css';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, projects, deleteProject } = useAppData();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const project = projects.find((item) => item.id === id);

  if (!project) {
    return (
      <section className="page-section">
        <PageMeta
          title="Project Not Found"
          description="The requested student project could not be located."
        />
        <div className="container">
          <div className="card">
            <h1>Project not found</h1>
            <p className="card-muted">
              This project may have been removed or the URL is incorrect.
            </p>
            <div>
              <Link to="/projects" className="btn btn-primary">
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isOwner = Boolean(currentUser && project.ownerId && currentUser.id === project.ownerId);

  const handleConfirmDelete = () => {
    if (!isOwner) {
      showToast({
        type: 'error',
        title: 'Action not allowed',
        message: 'Only the project creator can delete this project.',
      });
      setConfirmOpen(false);
      return;
    }
    deleteProject(project.id);
    setConfirmOpen(false);
    showToast({
      type: 'info',
      title: 'Project deleted',
      message: `"${project.title}" has been removed.`,
    });
    navigate('/projects');
  };

  return (
    <section className="page-section">
      <PageMeta title={project.title} description={project.summary} />
      <div className="container profile-detail-container">
        <div className="page-header-row no-print">
          <Link to="/projects" className="btn btn-outline btn-sm">
            &larr; Back to Projects
          </Link>
          {isOwner && (
            <div className="card-actions-row">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setConfirmOpen(true)}
              >
                Delete Project
              </button>
            </div>
          )}
        </div>

        <article className="card profile-panel project-detail-card">
          <span className="tag">{project.domain}</span>
          <h1 className="profile-detail-name">{project.title}</h1>
          <p className="profile-detail-sub">{project.summary}</p>

          <img
            src={project.thumbnail}
            alt={`${project.title} architecture visual`}
            width="640"
            height="400"
            className="project-detail-hero-img"
          />

          <section aria-labelledby="proj-overview-heading">
            <h2 id="proj-overview-heading" className="section-subheading">
              Project Overview
            </h2>
            <p className="card-muted">{project.description}</p>
          </section>

          <section aria-labelledby="proj-team-heading">
            <h2 id="proj-team-heading" className="section-subheading">
              Contributors
            </h2>
            <div className="tag-list">
              {project.team.map((member) => (
                <span key={member} className="tag">
                  {member}
                </span>
              ))}
            </div>
          </section>

          <section aria-labelledby="proj-stack-heading">
            <h2 id="proj-stack-heading" className="section-subheading">
              Technology Stack
            </h2>
            <div className="tag-list">
              {project.techStack.map((tech) => (
                <span key={tech} className="tag">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section aria-labelledby="proj-urls-heading">
            <h2 id="proj-urls-heading" className="section-subheading">
              Source &amp; Deployment Links
            </h2>
            <div className="profile-links-stack">
              <div className="link-row">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  GitHub: {project.githubUrl}
                </a>
                <CopyButton text={project.githubUrl} label="Copy GitHub URL" />
              </div>
              <div className="link-row">
                <a href={project.deploymentUrl} target="_blank" rel="noopener noreferrer">
                  Deployment: {project.deploymentUrl}
                </a>
                <CopyButton text={project.deploymentUrl} label="Copy deployment URL" />
              </div>
            </div>
          </section>

          <footer className="last-updated">
            Last updated: {formatLastUpdated(project.updatedAt)}
          </footer>
        </article>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete this project?"
        message={`Deleting "${project.title}" removes it permanently from the student project directory.`}
        confirmLabel="Delete Project"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
