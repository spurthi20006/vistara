import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { ConfirmModal } from '../components/ConfirmModal';
import { HackathonTeamMatcher } from '../components/HackathonTeamMatcher';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import './HackathonsPage.css';

export function HackathonsPage() {
  const {
    hackathons,
    applications,
    submitHackathonApplication,
    updateApplicationStatus,
    currentUser,
  } = useAppData();
  const { showToast } = useToast();

  const [selectedHackathonId, setSelectedHackathonId] = useState(hackathons[0].id);
  const [teamName, setTeamName] = useState('');
  const [leadName, setLeadName] = useState(currentUser ? currentUser.name : '');
  const [leadEmail, setLeadEmail] = useState(currentUser ? currentUser.email : '');
  const [track, setTrack] = useState(hackathons[0].tracks[0]);
  const [memberCount, setMemberCount] = useState('3');
  const [pitch, setPitch] = useState('');
  const [errors, setErrors] = useState({});
  const [submittedApp, setSubmittedApp] = useState(null);
  const [pendingRejectApp, setPendingRejectApp] = useState(null);

  const refs = {
    teamName: useRef(null),
    leadName: useRef(null),
    leadEmail: useRef(null),
    memberCount: useRef(null),
    pitch: useRef(null),
  };

  const selectedHackathon =
    hackathons.find((h) => h.id === selectedHackathonId) || hackathons[0];

  const handleSelectHackathon = (hackathon) => {
    setSelectedHackathonId(hackathon.id);
    setTrack(hackathon.tracks[0]);
    setSubmittedApp(null);
  };

  const validateApplication = () => {
    const nextErrors = {};
    if (teamName.trim().length < 2) {
      nextErrors.teamName = 'Enter a team name (at least 2 characters).';
    }
    if (leadName.trim().length < 2) {
      nextErrors.leadName = 'Enter the team lead full name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail.trim())) {
      nextErrors.leadEmail = 'Enter a valid university or team contact email address.';
    }
    const countNum = Number(memberCount);
    if (Number.isNaN(countNum) || countNum < 2 || countNum > 4) {
      nextErrors.memberCount = 'Teams must have between 2 and 4 members.';
    }
    if (pitch.trim().length < 20) {
      nextErrors.pitch = 'Describe your idea pitch in at least 20 characters.';
    }
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateApplication();
    setErrors(validationErrors);

    const keys = Object.keys(validationErrors);
    if (keys.length > 0) {
      const firstKey = keys[0];
      if (refs[firstKey]?.current) {
        refs[firstKey].current.focus();
      }
      showToast({
        type: 'error',
        title: 'Application needs corrections',
        message: 'Fix the highlighted fields to submit your hackathon team.',
      });
      return;
    }

    const created = submitHackathonApplication({
      hackathonId: selectedHackathon.id,
      hackathonTitle: selectedHackathon.title,
      teamName,
      leadName,
      leadEmail,
      track,
      memberCount,
      pitch,
    });

    setSubmittedApp(created);
    setTeamName('');
    setPitch('');
    setErrors({});
    showToast({
      type: 'success',
      title: 'Team application sent',
      message: `${created.teamName} applied for ${selectedHackathon.title}.`,
    });
  };

  const handleAccept = (app) => {
    updateApplicationStatus(app.id, 'Accepted');
    showToast({
      type: 'success',
      title: 'Application accepted',
      message: `Team "${app.teamName}" is confirmed for ${app.hackathonTitle}.`,
    });
  };

  const handleConfirmReject = () => {
    if (!pendingRejectApp) return;
    updateApplicationStatus(pendingRejectApp.id, 'Rejected');
    showToast({
      type: 'info',
      title: 'Application rejected',
      message: `Application from "${pendingRejectApp.teamName}" was marked as rejected.`,
    });
    setPendingRejectApp(null);
  };

  const isCoordinator = currentUser?.role === 'coordinator';
  const errorEntries = Object.entries(errors);

  return (
    <section className="page-section">
      <PageMeta
        title="Campus Hackathons"
        description="Apply with your student team to upcoming University Connect hackathons and review coordinator application statuses."
      />
      <div className="container hackathons-layout">
        <div className="page-header">
          <h1 className="page-title">Campus Hackathons</h1>
          <p className="page-subtitle">
            Collaborate in 48-hour sprints mentored by alumni engineers and designers.
          </p>
        </div>

        <div className="card-grid">
          {hackathons.map((hack) => {
            const isSelected = hack.id === selectedHackathonId;
            return (
              <article
                key={hack.id}
                className={`card card-interactive ${isSelected ? 'hackathon-selected' : ''}`}
              >
                <span className="tag">{hack.date}</span>
                <h2 className="card-heading">{hack.title}</h2>
                <p className="card-muted">{hack.description}</p>
                <p className="hackathon-meta">
                  <strong>Venue:</strong> {hack.mode}
                  <br />
                  <strong>Awards:</strong> {hack.prizePool}
                </p>
                <div className="tag-list">
                  {hack.tracks.map((item) => (
                    <span key={item} className="tag">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="card-actions-row">
                  <button
                    type="button"
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleSelectHackathon(hack)}
                  >
                    {isSelected ? 'Selected for Application' : 'Apply to This Track'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Dynamic Hackathon Team Matcher & Skill Gap Analyzer */}
        <HackathonTeamMatcher
          onAddMemberToApplication={(student) => {
            setMemberCount((prev) => String(Math.min(4, Number(prev || 1) + 1)));
          }}
        />

        <section className="card hackathon-form-card" aria-labelledby="apply-hackathon-heading">
          <h2 id="apply-hackathon-heading">
            Team Application: {selectedHackathon.title}
          </h2>
          {submittedApp ? (
            <div className="form-success-card" role="status">
              <h3>Team Application Received</h3>
              <p>
                Team <strong>{submittedApp.teamName}</strong> ({submittedApp.memberCount} members)
                has been registered under track <strong>{submittedApp.track}</strong>.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSubmittedApp(null)}
              >
                Submit Another Team
              </button>
            </div>
          ) : (
            <form className="form-stack" onSubmit={handleSubmit} noValidate>
              {errorEntries.length > 0 && (
                <div className="error-summary" role="alert">
                  <h3>Fix {errorEntries.length} validation error(s) before submitting:</h3>
                  <ul>
                    {errorEntries.map(([field, msg]) => (
                      <li key={field}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="two-col-grid">
                <div className="form-field">
                  <label htmlFor="hack-team-name" className="form-label">
                    Team Name
                  </label>
                  <input
                    ref={refs.teamName}
                    id="hack-team-name"
                    type="text"
                    className={`form-input ${errors.teamName ? 'input-invalid' : ''}`}
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    aria-invalid={Boolean(errors.teamName)}
                    aria-describedby={errors.teamName ? 'hack-team-err' : undefined}
                    placeholder="Indigo Builders"
                  />
                  {errors.teamName && (
                    <span id="hack-team-err" className="field-error">
                      {errors.teamName}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="hack-track" className="form-label">
                    Selected Track
                  </label>
                  <select
                    id="hack-track"
                    className="form-select"
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                  >
                    {selectedHackathon.tracks.map((tr) => (
                      <option key={tr} value={tr}>
                        {tr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="two-col-grid">
                <div className="form-field">
                  <label htmlFor="hack-lead-name" className="form-label">
                    Team Lead Full Name
                  </label>
                  <input
                    ref={refs.leadName}
                    id="hack-lead-name"
                    type="text"
                    className={`form-input ${errors.leadName ? 'input-invalid' : ''}`}
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    aria-invalid={Boolean(errors.leadName)}
                    aria-describedby={errors.leadName ? 'hack-lead-err' : undefined}
                    placeholder="Kabir Sharma"
                  />
                  {errors.leadName && (
                    <span id="hack-lead-err" className="field-error">
                      {errors.leadName}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="hack-lead-email" className="form-label">
                    Team Lead Email
                  </label>
                  <input
                    ref={refs.leadEmail}
                    id="hack-lead-email"
                    type="email"
                    className={`form-input ${errors.leadEmail ? 'input-invalid' : ''}`}
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    aria-invalid={Boolean(errors.leadEmail)}
                    aria-describedby={errors.leadEmail ? 'hack-email-err' : undefined}
                    placeholder="kabir.sharma@universityconnect.edu.in"
                  />
                  {errors.leadEmail && (
                    <span id="hack-email-err" className="field-error">
                      {errors.leadEmail}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="hack-members" className="form-label">
                  Team Size (2 to 4 members)
                </label>
                <input
                  ref={refs.memberCount}
                  id="hack-members"
                  type="number"
                  min="2"
                  max="4"
                  className={`form-input ${errors.memberCount ? 'input-invalid' : ''}`}
                  value={memberCount}
                  onChange={(e) => setMemberCount(e.target.value)}
                  aria-invalid={Boolean(errors.memberCount)}
                  aria-describedby={errors.memberCount ? 'hack-count-err' : undefined}
                />
                {errors.memberCount && (
                  <span id="hack-count-err" className="field-error">
                    {errors.memberCount}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="hack-pitch" className="form-label">
                  Project Pitch
                </label>
                <textarea
                  ref={refs.pitch}
                  id="hack-pitch"
                  className={`form-textarea ${errors.pitch ? 'input-invalid' : ''}`}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  aria-invalid={Boolean(errors.pitch)}
                  aria-describedby={errors.pitch ? 'hack-pitch-err' : undefined}
                  placeholder="Outline the campus problem, technical approach, and expected impact..."
                />
                {errors.pitch && (
                  <span id="hack-pitch-err" className="field-error">
                    {errors.pitch}
                  </span>
                )}
              </div>

              <div>
                <button type="submit" className="btn btn-primary">
                  Submit Team Application
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="applications-section" aria-labelledby="applications-review-heading">
          <div className="page-header-row">
            <div>
              <h2 id="applications-review-heading">Submitted Hackathon Applications</h2>
              <p className="page-subtitle">
                {isCoordinator
                  ? 'Coordinator review controls enabled: approve or reject pending team submissions.'
                  : 'Track submission status below.'}
              </p>
            </div>
          </div>

          <div className="card-grid">
            {applications.map((app) => (
              <article key={app.id} className="card">
                <div className="community-card-top">
                  <span className="tag">{app.track}</span>
                  <span
                    className={`tag ${
                      app.status === 'Accepted'
                        ? 'badge-success'
                        : app.status === 'Rejected'
                        ? 'badge-error'
                        : 'badge-warning'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
                <h3 className="card-heading">{app.teamName}</h3>
                <p className="profile-batch">{app.hackathonTitle}</p>
                <p className="card-muted">{app.pitch}</p>
                <p className="application-lead">
                  Lead: {app.leadName} ({app.memberCount} members)
                  <br />
                  <a href={`mailto:${app.leadEmail}`}>{app.leadEmail}</a>
                </p>
                {isCoordinator && (
                  <div className="card-actions-row">
                    {app.status !== 'Accepted' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAccept(app)}
                      >
                        Accept
                      </button>
                    )}
                    {app.status !== 'Rejected' && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => setPendingRejectApp(app)}
                      >
                        Reject Application
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingRejectApp)}
        title="Reject hackathon application?"
        message={
          pendingRejectApp
            ? `Reject team "${pendingRejectApp.teamName}" from ${pendingRejectApp.hackathonTitle}? The team lead will see the Rejected status.`
            : ''
        }
        confirmLabel="Reject Application"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmReject}
        onCancel={() => setPendingRejectApp(null)}
      />
    </section>
  );
}
