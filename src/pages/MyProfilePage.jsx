import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { CopyButton } from '../components/CopyButton';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import { formatLastUpdated } from '../utils/dateFormat';
import './ProfileDetailPage.css';

export function MyProfilePage() {
  const { currentUser, updateCurrentUserProfile } = useAppData();
  const { showToast } = useToast();

  const [formState, setFormState] = useState(() => ({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phoneDisplay: currentUser?.phoneDisplay || '',
    department: currentUser?.department || '',
    githubUrl: currentUser?.githubUrl || '',
    portfolioUrl: currentUser?.portfolioUrl || '',
    skillsText: currentUser?.skills ? currentUser.skills.join(', ') : '',
    bio: currentUser?.bio || '',
  }));
  const [errors, setErrors] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const refs = {
    name: useRef(null),
    email: useRef(null),
    phoneDisplay: useRef(null),
    githubUrl: useRef(null),
    portfolioUrl: useRef(null),
    bio: useRef(null),
  };

  if (!currentUser) {
    return (
      <section className="page-section">
        <PageMeta
          title="Sign In Required"
          description="Sign in to view and edit your University Connect member profile."
        />
        <div className="container profile-detail-container">
          <div className="card">
            <h1>Sign in to view your profile</h1>
            <p className="card-muted">
              Sign in with your student or alumni account to update your skills, bio, and portfolio links.
            </p>
            <div className="card-actions-row">
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
              <Link to="/register" className="btn btn-outline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const validateProfile = () => {
    const nextErrors = {};
    if (formState.name.trim().length < 2) {
      nextErrors.name = 'Enter your full name (at least 2 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!/^\+?[\d\s-]{8,18}$/.test(formState.phoneDisplay.trim())) {
      nextErrors.phoneDisplay = 'Enter a valid phone number including country code (e.g. +91 98204 51730).';
    }
    if (!/^https?:\/\/.+/i.test(formState.githubUrl.trim())) {
      nextErrors.githubUrl = 'Enter a valid GitHub URL starting with https:// or http://.';
    }
    if (!/^https?:\/\/.+/i.test(formState.portfolioUrl.trim())) {
      nextErrors.portfolioUrl = 'Enter a valid portfolio URL starting with https:// or http://.';
    }
    if (formState.bio.trim().length < 15) {
      nextErrors.bio = 'Write a short bio of at least 15 characters.';
    }
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateProfile();
    setErrors(validationErrors);

    const keys = Object.keys(validationErrors);
    if (keys.length > 0) {
      const firstKey = keys[0];
      if (refs[firstKey]?.current) {
        refs[firstKey].current.focus();
      }
      showToast({
        type: 'error',
        title: 'Profile not saved',
        message: 'Correct the highlighted fields before saving changes.',
      });
      return;
    }

    updateCurrentUserProfile({
      name: formState.name.trim(),
      email: formState.email.trim(),
      phoneDisplay: formState.phoneDisplay.trim(),
      department: formState.department.trim(),
      githubUrl: formState.githubUrl.trim(),
      portfolioUrl: formState.portfolioUrl.trim(),
      skills: formState.skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      bio: formState.bio.trim(),
    });

    setSavedSuccess(true);
    setErrors({});
    showToast({
      type: 'success',
      title: 'Profile saved',
      message: 'Your University Connect profile details have been updated.',
    });
  };

  const errorEntries = Object.entries(errors);

  return (
    <section className="page-section">
      <PageMeta
        title="My Profile"
        description="Manage your University Connect campus profile, contact details, skills, and verified external links."
      />
      <div className="container profile-detail-container">
        <div className="page-header-row">
          <div className="page-header">
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">
              Signed in as <strong>{currentUser.name}</strong> ({currentUser.roleLabel})
            </p>
          </div>
        </div>

        <article className="card profile-panel">
          <div className="profile-links-stack">
            <div className="link-row">
              <span>
                Email: <a href={`mailto:${currentUser.email}`}>{currentUser.email}</a>
              </span>
              <CopyButton text={currentUser.email} label="Copy email" />
            </div>
            <div className="link-row">
              <span>
                Phone: <a href={currentUser.phoneHref}>{currentUser.phoneDisplay}</a>
              </span>
              <CopyButton text={currentUser.phoneDisplay} label="Copy phone number" />
            </div>
            <div className="link-row">
              <a href={currentUser.githubUrl} target="_blank" rel="noopener noreferrer">
                GitHub: {currentUser.githubUrl}
              </a>
              <CopyButton text={currentUser.githubUrl} label="Copy GitHub link" />
            </div>
            <div className="link-row">
              <a href={currentUser.portfolioUrl} target="_blank" rel="noopener noreferrer">
                Portfolio: {currentUser.portfolioUrl}
              </a>
              <CopyButton text={currentUser.portfolioUrl} label="Copy portfolio link" />
            </div>
          </div>

          {savedSuccess ? (
            <div className="form-success-card" role="status">
              <h2>Profile Saved</h2>
              <p>
                Your updated bio, contact links, and skills are live for students and alumni
                across the platform.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSavedSuccess(false)}
              >
                Continue Editing
              </button>
            </div>
          ) : (
            <form className="form-stack no-print" onSubmit={handleSubmit} noValidate>
              {errorEntries.length > 0 && (
                <div className="error-summary" role="alert">
                  <h3>Please fix {errorEntries.length} error(s):</h3>
                  <ul>
                    {errorEntries.map(([field, msg]) => (
                      <li key={field}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="two-col-grid">
                <div className="form-field">
                  <label htmlFor="prof-name" className="form-label">
                    Full Name
                  </label>
                  <input
                    ref={refs.name}
                    id="prof-name"
                    type="text"
                    className={`form-input ${errors.name ? 'input-invalid' : ''}`}
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'prof-name-err' : undefined}
                  />
                  {errors.name && (
                    <span id="prof-name-err" className="field-error">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="prof-email" className="form-label">
                    University Email
                  </label>
                  <input
                    ref={refs.email}
                    id="prof-email"
                    type="email"
                    className={`form-input ${errors.email ? 'input-invalid' : ''}`}
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'prof-email-err' : undefined}
                  />
                  {errors.email && (
                    <span id="prof-email-err" className="field-error">
                      {errors.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="two-col-grid">
                <div className="form-field">
                  <label htmlFor="prof-phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    ref={refs.phoneDisplay}
                    id="prof-phone"
                    type="tel"
                    className={`form-input ${errors.phoneDisplay ? 'input-invalid' : ''}`}
                    value={formState.phoneDisplay}
                    onChange={(e) => setFormState({ ...formState, phoneDisplay: e.target.value })}
                    aria-invalid={Boolean(errors.phoneDisplay)}
                    aria-describedby={errors.phoneDisplay ? 'prof-phone-err' : undefined}
                  />
                  {errors.phoneDisplay && (
                    <span id="prof-phone-err" className="field-error">
                      {errors.phoneDisplay}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="prof-dept" className="form-label">
                    Department
                  </label>
                  <input
                    id="prof-dept"
                    type="text"
                    className="form-input"
                    value={formState.department}
                    onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="two-col-grid">
                <div className="form-field">
                  <label htmlFor="prof-github" className="form-label">
                    GitHub URL
                  </label>
                  <input
                    ref={refs.githubUrl}
                    id="prof-github"
                    type="url"
                    className={`form-input ${errors.githubUrl ? 'input-invalid' : ''}`}
                    value={formState.githubUrl}
                    onChange={(e) => setFormState({ ...formState, githubUrl: e.target.value })}
                    aria-invalid={Boolean(errors.githubUrl)}
                    aria-describedby={errors.githubUrl ? 'prof-github-err' : undefined}
                  />
                  {errors.githubUrl && (
                    <span id="prof-github-err" className="field-error">
                      {errors.githubUrl}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="prof-portfolio" className="form-label">
                    Portfolio URL
                  </label>
                  <input
                    ref={refs.portfolioUrl}
                    id="prof-portfolio"
                    type="url"
                    className={`form-input ${errors.portfolioUrl ? 'input-invalid' : ''}`}
                    value={formState.portfolioUrl}
                    onChange={(e) => setFormState({ ...formState, portfolioUrl: e.target.value })}
                    aria-invalid={Boolean(errors.portfolioUrl)}
                    aria-describedby={errors.portfolioUrl ? 'prof-port-err' : undefined}
                  />
                  {errors.portfolioUrl && (
                    <span id="prof-port-err" className="field-error">
                      {errors.portfolioUrl}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="prof-skills" className="form-label">
                  Skills (comma-separated)
                </label>
                <input
                  id="prof-skills"
                  type="text"
                  className="form-input"
                  value={formState.skillsText}
                  onChange={(e) => setFormState({ ...formState, skillsText: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="prof-bio" className="form-label">
                  Bio
                </label>
                <textarea
                  ref={refs.bio}
                  id="prof-bio"
                  className={`form-textarea ${errors.bio ? 'input-invalid' : ''}`}
                  value={formState.bio}
                  onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                  aria-invalid={Boolean(errors.bio)}
                  aria-describedby={errors.bio ? 'prof-bio-err' : undefined}
                />
                {errors.bio && (
                  <span id="prof-bio-err" className="field-error">
                    {errors.bio}
                  </span>
                )}
              </div>

              <div>
                <button type="submit" className="btn btn-primary">
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          <footer className="last-updated">
            Last updated: {formatLastUpdated(currentUser.updatedAt)}
          </footer>
        </article>
      </div>
    </section>
  );
}
