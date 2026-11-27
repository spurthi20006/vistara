import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { SkeletonCard } from '../components/Skeleton';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import './DirectoryPages.css';

export function AlumniPage() {
  const { alumni, currentUser } = useAppData();
  const { showToast } = useToast();
  const [department, setDepartment] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [requestedIds, setRequestedIds] = useState([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 380);
    return () => window.clearTimeout(timer);
  }, []);

  const departments = useMemo(
    () => ['All', ...Array.from(new Set(alumni.map((a) => a.department)))],
    [alumni]
  );

  const filteredAlumni = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return alumni.filter((person) => {
      const matchesDept = department === 'All' || person.department === department;
      const matchesQuery =
        !q ||
        `${person.name} ${person.company} ${person.role} ${person.skills.join(' ')}`
          .toLowerCase()
          .includes(q);
      return matchesDept && matchesQuery;
    });
  }, [alumni, department, searchTerm]);

  const handleRequestMentorship = (person) => {
    if (currentUser?.role === 'alumni') {
      return;
    }
    if (requestedIds.includes(person.id)) {
      showToast({
        type: 'info',
        title: 'Request already sent',
        message: `You already requested a mentoring slot with ${person.name}.`,
      });
      return;
    }
    setRequestedIds((prev) => [...prev, person.id]);
    showToast({
      type: 'success',
      title: 'Mentorship request sent',
      message: `${person.name} (${person.company}) received your mentoring request.`,
    });
  };

  return (
    <section className="page-section">
      <PageMeta
        title="Alumni Directory"
        description="Connect with University Connect alumni working across engineering, VLSI, product design, and machine learning research."
      />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Alumni Directory</h1>
          <p className="page-subtitle">
            Browse verified graduates offering system design reviews, portfolio critiques, and
            internship advice.
          </p>
        </div>

        <div className="filter-bar">
          <div className="filter-control">
            <label htmlFor="alumni-filter-search" className="form-label">
              Filter by name, company, or skill
            </label>
            <input
              id="alumni-filter-search"
              type="search"
              className="form-input"
              placeholder="Search alumni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-control">
            <label htmlFor="alumni-filter-dept" className="form-label">
              Department
            </label>
            <select
              id="alumni-filter-dept"
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="card-grid" role="status" aria-label="Loading alumni directory">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="card">
            <h2>No matching alumni found</h2>
            <p className="card-muted">
              Try clearing your department filter or searching with another skill keyword.
            </p>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setDepartment('All');
                setSearchTerm('');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {filteredAlumni.map((person) => {
              const requested = requestedIds.includes(person.id);
              return (
                <article key={person.id} className="card card-interactive">
                  <div className="profile-card-head">
                    <img
                      src={person.avatar}
                      alt={`${person.name} portrait`}
                      width="64"
                      height="64"
                      loading="lazy"
                      className="avatar-thumb"
                    />
                    <div className="profile-card-meta">
                      <h2 className="card-heading">
                        <Link to={`/alumni/${person.id}`}>{person.name}</Link>
                      </h2>
                      <p className="profile-role">
                        {person.role} · {person.company}
                      </p>
                      <p className="profile-batch">
                        Class of {person.graduationYear} · {person.location}
                      </p>
                    </div>
                  </div>
                  <p className="card-muted">{person.bio}</p>
                  <div className="tag-list">
                    {person.skills.map((skill) => (
                      <span key={skill} className="tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="card-actions-row">
                    <Link to={`/alumni/${person.id}`} className="btn btn-outline btn-sm">
                      View Profile
                    </Link>
                    {person.id !== currentUser?.id && (
                      <Link to={`/messages?to=${person.id}`} className="btn btn-outline btn-sm">
                        Message
                      </Link>
                    )}
                    {currentUser?.role !== 'alumni' && (
                      <button
                        type="button"
                        className={`btn btn-sm ${requested ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleRequestMentorship(person)}
                      >
                        {requested ? 'Mentorship Requested' : 'Request Mentorship'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
