import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { SkeletonCard } from '../components/Skeleton';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import './DirectoryPages.css';

export function StudentsPage() {
  const { students, currentUser, peers, sendPeerRequest, removePeer } = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [yearFilter, setYearFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRemove, setPendingRemove] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 380);
    return () => window.clearTimeout(timer);
  }, []);

  const years = useMemo(
    () => ['All', ...Array.from(new Set(students.map((s) => s.year)))],
    [students]
  );

  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const matchesYear = yearFilter === 'All' || student.year === yearFilter;
      const matchesQuery =
        !q ||
        `${student.name} ${student.department} ${student.skills.join(' ')} ${student.interests.join(' ')}`
          .toLowerCase()
          .includes(q);
      return matchesYear && matchesQuery;
    });
  }, [students, yearFilter, searchTerm]);

  const handlePeerClick = (student) => {
    if (!currentUser) {
      showToast({
        type: 'info',
        title: 'Sign in required',
        message: 'Please sign in to connect with campus peers.',
      });
      navigate('/login');
      return;
    }

    const peerStatus = peers[student.id];
    if (peerStatus === 'connected') {
      setPendingRemove(student);
      return;
    }

    if (peerStatus === 'pending') {
      return;
    }

    sendPeerRequest(student.id);
    showToast({
      type: 'success',
      title: 'Peer request sent',
      message: `Peer request sent to ${student.name}.`,
    });
  };

  const handleConfirmRemove = () => {
    if (!pendingRemove) return;
    removePeer(pendingRemove.id);
    showToast({
      type: 'info',
      title: 'Peer removed',
      message: `${pendingRemove.name} was removed from your peers.`,
    });
    setPendingRemove(null);
  };

  return (
    <section className="page-section">
      <PageMeta
        title="Student Profiles"
        description="Meet active University Connect students collaborating across software engineering, AI research, embedded hardware, and product design."
      />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Student Profiles</h1>
          <p className="page-subtitle">
            Find teammates for hackathons, capstone projects, and peer study groups across campus
            departments.
          </p>
        </div>

        <div className="filter-bar">
          <div className="filter-control">
            <label htmlFor="students-filter-search" className="form-label">
              Filter by name, skill, or interest
            </label>
            <input
              id="students-filter-search"
              type="search"
              className="form-input"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-control">
            <label htmlFor="students-filter-year" className="form-label">
              Academic Year
            </label>
            <select
              id="students-filter-year"
              className="form-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="card-grid" role="status" aria-label="Loading student profiles">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="card">
            <h2>No matching students found</h2>
            <p className="card-muted">Adjust your search query or academic year filter.</p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setYearFilter('All');
                setSearchTerm('');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {filteredStudents.map((student) => {
              const peerStatus = peers[student.id];
              const isPending = peerStatus === 'pending';
              const isConnected = peerStatus === 'connected';

              return (
                <article key={student.id} className="card card-interactive">
                  <div className="profile-card-head">
                    <img
                      src={student.avatar}
                      alt={`${student.name} portrait`}
                      width="64"
                      height="64"
                      loading="lazy"
                      className="avatar-thumb"
                    />
                    <div className="profile-card-meta">
                      <h2 className="card-heading">
                        <Link to={`/students/${student.id}`}>{student.name}</Link>
                      </h2>
                      <p className="profile-role">{student.year}</p>
                      <p className="profile-batch">{student.department}</p>
                    </div>
                  </div>
                  <p className="card-muted">{student.bio}</p>
                  <div className="tag-list">
                    {student.skills.map((skill) => (
                      <span key={skill} className="tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="card-actions-row">
                    <Link to={`/students/${student.id}`} className="btn btn-primary btn-sm">
                      Open Student Profile
                    </Link>
                    {student.id !== currentUser?.id && (
                      <Link to={`/messages?to=${student.id}`} className="btn btn-outline btn-sm">
                        Message
                      </Link>
                    )}
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        isConnected
                          ? 'btn-peer-connected'
                          : isPending
                          ? 'btn-secondary btn-peer-requested'
                          : 'btn-primary'
                      }`}
                      disabled={isPending}
                      onClick={() => handlePeerClick(student)}
                      aria-label={
                        isConnected
                          ? `Connected peer ${student.name}, click to remove`
                          : isPending
                          ? `Peer request sent to ${student.name}`
                          : `Add ${student.name} as peer`
                      }
                    >
                      {isConnected ? 'Peers ✓' : isPending ? 'Request Sent' : 'Add Peer'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingRemove)}
        title="Remove peer?"
        message={
          pendingRemove
            ? `Are you sure you want to remove ${pendingRemove.name} from your connected peers?`
            : ''
        }
        confirmLabel="Remove Peer"
        cancelLabel="Keep Peer"
        variant="danger"
        onConfirm={handleConfirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </section>
  );
}
