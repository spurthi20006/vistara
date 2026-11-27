import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import './HackathonTeamMatcher.css';

// Core essential skill pillars for successful hackathon projects
const ESSENTIAL_HACKATHON_PILLARS = [
  { id: 'frontend', name: 'Frontend / UI', keywords: ['react', 'vue', 'angular', 'html', 'css', 'ui', 'ux', 'tailwind', 'javascript', 'next'] },
  { id: 'backend', name: 'Backend / API', keywords: ['node', 'express', 'python', 'fastapi', 'django', 'go', 'golang', 'java', 'spring', 'api', 'graphql'] },
  { id: 'database', name: 'Database & Cloud', keywords: ['sql', 'postgres', 'postgresql', 'mongodb', 'docker', 'kubernetes', 'aws', 'redis', 'firebase', 'cloud'] },
  { id: 'design', name: 'UI/UX Design', keywords: ['design', 'figma', 'prototyping', 'usability', 'wireframe', 'css architecture'] },
  { id: 'specialty', name: 'AI / ML / IoT', keywords: ['python', 'pytorch', 'tensorflow', 'machine learning', 'ai', 'vector', 'esp32', 'iot', 'mqtt', 'hardware', 'pcb', 'robotics'] },
];

export function HackathonTeamMatcher({ onAddMemberToApplication }) {
  const { students, currentUser } = useAppData();
  const { showToast } = useToast();

  // Team roster starting with current student (if student) or empty
  const [selectedMembers, setSelectedMembers] = useState(() => {
    if (currentUser && currentUser.role === 'student') {
      const match = students.find((s) => s.id === currentUser.id);
      return match ? [match] : [currentUser];
    }
    return [];
  });

  const [activeTrack, setActiveTrack] = useState('All');
  const [invitedStudentIds, setInvitedStudentIds] = useState([]);

  // Available students who are actively looking for teammates
  const candidatePool = useMemo(() => {
    return students.filter(
      (s) => !selectedMembers.some((m) => m.id === s.id)
    );
  }, [students, selectedMembers]);

  // Filter candidates by preferred track if selected
  const filteredCandidates = useMemo(() => {
    if (activeTrack === 'All') return candidatePool;
    return candidatePool.filter(
      (s) => s.preferredTrack === activeTrack || s.interests?.some((i) => i.toLowerCase().includes(activeTrack.toLowerCase()))
    );
  }, [candidatePool, activeTrack]);

  // Aggregate all skills of the currently selected team
  const teamSkills = useMemo(() => {
    const set = new Set();
    selectedMembers.forEach((m) => {
      if (Array.isArray(m.skills)) {
        m.skills.forEach((s) => set.add(s.toLowerCase()));
      }
    });
    return set;
  }, [selectedMembers]);

  // Skill coverage calculation
  const pillarStatus = useMemo(() => {
    return ESSENTIAL_HACKATHON_PILLARS.map((pillar) => {
      const isCovered = pillar.keywords.some((kw) =>
        Array.from(teamSkills).some((ts) => ts.includes(kw))
      );
      return {
        ...pillar,
        covered: isCovered,
      };
    });
  }, [teamSkills]);

  const coveredCount = pillarStatus.filter((p) => p.covered).length;
  const missingPillars = pillarStatus.filter((p) => !p.covered);
  const readinessPercentage = Math.round((coveredCount / ESSENTIAL_HACKATHON_PILLARS.length) * 100);

  // Add a member to team builder
  const handleAddMember = (student) => {
    if (selectedMembers.length >= 4) {
      showToast({
        type: 'error',
        title: 'Team Limit Reached',
        message: 'Hackathon teams have a maximum size of 4 members.',
      });
      return;
    }
    setSelectedMembers((prev) => [...prev, student]);
    if (onAddMemberToApplication) {
      onAddMemberToApplication(student);
    }
    showToast({
      type: 'success',
      title: 'Teammate Added',
      message: `${student.name} was added to your hackathon roster.`,
    });
  };

  // Remove a member from team builder
  const handleRemoveMember = (studentId) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== studentId));
    showToast({
      type: 'info',
      title: 'Member Removed',
      message: 'Teammate removed from active roster.',
    });
  };

  // Send invitation
  const handleInvite = (student) => {
    if (invitedStudentIds.includes(student.id)) return;
    setInvitedStudentIds((prev) => [...prev, student.id]);
    showToast({
      type: 'success',
      title: 'Team Invite Sent!',
      message: `Invited ${student.name} to join your hackathon team.`,
    });
  };

  return (
    <div className="card hackathon-team-matcher" aria-labelledby="team-matcher-heading">
      <div className="team-matcher-header">
        <div>
          <span className="tag badge-success">Collaborative Team Builder</span>
          <h2 id="team-matcher-heading" className="matcher-title">
            Teammate Finder &amp; Skill Gap Analyzer
          </h2>
          <p className="matcher-subtitle">
            Assemble a balanced team of 2 to 4 members. We analyze your combined skills and pinpoint
            missing competencies required to build a winning hackathon prototype.
          </p>
        </div>
      </div>

      {/* SECTION 1: Active Team Roster & Readiness */}
      <div className="team-roster-summary">
        <div className="roster-metrics">
          <div className="metric-box">
            <span className="metric-label">Team Members</span>
            <strong className="metric-value">{selectedMembers.length} / 4</strong>
            <span className="metric-hint">
              {selectedMembers.length < 2 ? 'Need at least 2 members' : 'Valid team size'}
            </span>
          </div>

          <div className="metric-box">
            <span className="metric-label">Skill Coverage</span>
            <strong className="metric-value">{readinessPercentage}%</strong>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${readinessPercentage}%`,
                  backgroundColor:
                    readinessPercentage >= 80 ? 'var(--success-border)' : 'var(--indigo-800)',
                }}
              />
            </div>
          </div>

          <div className="metric-box missing-box">
            <span className="metric-label">Missing Pillars ({missingPillars.length})</span>
            {missingPillars.length === 0 ? (
              <span className="all-covered-tag">All Pillars Covered! 🎯</span>
            ) : (
              <div className="missing-tags">
                {missingPillars.map((p) => (
                  <span key={p.id} className="tag badge-warning">
                    Need {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Members Cards */}
        <div className="selected-members-strip">
          <h3 className="section-label">Your Current Team Roster:</h3>
          {selectedMembers.length === 0 ? (
            <p className="empty-roster-msg">
              No members in your team yet. Add yourself or invite available candidates below!
            </p>
          ) : (
            <div className="selected-cards-grid">
              {selectedMembers.map((member) => (
                <div key={member.id} className="selected-member-pill">
                  <img
                    src={member.avatar || '/images/avatar-5.webp'}
                    alt={member.name}
                    width="44"
                    height="44"
                    className="member-mini-avatar"
                  />
                  <div className="member-info">
                    <strong>{member.name}</strong>
                    <span className="member-dept">{member.department}</span>
                    <div className="member-skills-row">
                      {member.skills?.slice(0, 3).map((s) => (
                        <span key={s} className="tag tag-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  {member.id !== currentUser?.id && (
                    <button
                      type="button"
                      className="btn-remove-member"
                      onClick={() => handleRemoveMember(member.id)}
                      aria-label={`Remove ${member.name} from team`}
                      title="Remove member"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Competency Breakdown Grid */}
      <div className="pillar-breakdown-section">
        <h3 className="section-label">Pillar Breakdown &amp; Missing Skills Check:</h3>
        <div className="pillars-grid">
          {pillarStatus.map((p) => (
            <div
              key={p.id}
              className={`pillar-card ${p.covered ? 'is-covered' : 'is-missing'}`}
            >
              <div className="pillar-header">
                <span className="pillar-indicator" aria-hidden="true">
                  {p.covered ? '✅' : '⚠️'}
                </span>
                <strong>{p.name}</strong>
              </div>
              <span className="pillar-status-text">
                {p.covered ? 'Covered by team' : 'Skill Missing — seek teammate'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Compatible Student Teammates Pool */}
      <div className="candidates-section">
        <div className="candidates-filter-row">
          <div>
            <h3 className="section-label">Compatible Teammates Available:</h3>
            <p className="candidates-sub">
              Filtered peers actively looking for a hackathon squad and possessing complementary skills.
            </p>
          </div>
          <div className="track-filter-btns" role="group" aria-label="Filter candidates by track">
            {['All', 'Campus Sustainability', 'Accessible EdTech', 'Smart Hardware'].map((tr) => (
              <button
                key={tr}
                type="button"
                className={`btn btn-sm ${activeTrack === tr ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTrack(tr)}
              >
                {tr}
              </button>
            ))}
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <p className="card-muted">No additional available students matching this track.</p>
        ) : (
          <div className="candidates-grid">
            {filteredCandidates.map((student) => {
              // Calculate how many missing pillars this candidate fills
              const candidateSkills = (student.skills || []).map((s) => s.toLowerCase());
              const fillsMissing = missingPillars.filter((mp) =>
                mp.keywords.some((kw) => candidateSkills.some((cs) => cs.includes(kw)))
              );
              const isInvited = invitedStudentIds.includes(student.id);

              return (
                <div key={student.id} className="candidate-card">
                  <div className="candidate-head">
                    <img
                      src={student.avatar || '/images/avatar-5.webp'}
                      alt={`${student.name} profile portrait`}
                      width="50"
                      height="50"
                      className="candidate-avatar"
                    />
                    <div className="candidate-meta">
                      <Link to={`/students/${student.id}`} className="candidate-name">
                        {student.name}
                      </Link>
                      <span className="candidate-year-dept">
                        {student.year} · {student.department}
                      </span>
                    </div>
                  </div>

                  {student.lookingForTeam && (
                    <span className="tag badge-success status-badge">
                      🟢 Looking for Team
                    </span>
                  )}

                  {fillsMissing.length > 0 && (
                    <div className="gap-filler-notice">
                      ✨ Fills gap:{' '}
                      <strong>{fillsMissing.map((f) => f.name).join(', ')}</strong>
                    </div>
                  )}

                  <div className="candidate-skills-list">
                    {student.skills?.map((skill) => (
                      <span key={skill} className="tag tag-sm">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="candidate-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddMember(student)}
                      disabled={selectedMembers.length >= 4}
                    >
                      + Add to Team
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${isInvited ? 'btn-secondary' : 'btn-outline'}`}
                      onClick={() => handleInvite(student)}
                    >
                      {isInvited ? 'Invited ✓' : 'Send Invite'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
