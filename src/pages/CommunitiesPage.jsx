import { useState, useEffect, useMemo } from 'react';
import { PageMeta } from '../components/PageMeta';
import { SkeletonCard } from '../components/Skeleton';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';

export function CommunitiesPage() {
  const { communities, joinCommunity, leaveCommunity } = useAppData();
  const { showToast } = useToast();
  const [category, setCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingLeave, setPendingLeave] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 360);
    return () => window.clearTimeout(timer);
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(communities.map((c) => c.category)))],
    [communities]
  );

  const visibleCommunities = useMemo(() => {
    if (category === 'All') return communities;
    return communities.filter((c) => c.category === category);
  }, [communities, category]);

  const handleJoin = (community) => {
    joinCommunity(community.id);
    showToast({
      type: 'success',
      title: 'Community joined',
      message: `You are now a member of ${community.name}.`,
    });
  };

  const handleConfirmLeave = () => {
    if (!pendingLeave) return;
    leaveCommunity(pendingLeave.id);
    showToast({
      type: 'info',
      title: 'Left community',
      message: `You left ${pendingLeave.name}. You can rejoin anytime.`,
    });
    setPendingLeave(null);
  };

  return (
    <section className="page-section">
      <PageMeta
        title="Campus Communities"
        description="Join engineering guilds, research circles, design studios, and robotics labs across University Connect."
      />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Campus Communities</h1>
          <p className="page-subtitle">
            Student-run societies and alumni-advised technical guilds hosting weekly campus
            sessions.
          </p>
        </div>

        <div className="filter-bar" role="group" aria-label="Filter communities by category">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="card-grid" role="status" aria-label="Loading communities">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="card-grid">
            {visibleCommunities.map((community) => (
              <article key={community.id} className="card card-interactive">
                <div className="community-card-top">
                  <span className="tag">{community.category}</span>
                  <span className="card-meta-count">{community.membersCount} members</span>
                </div>
                <h2 className="card-heading">{community.name}</h2>
                <p className="card-muted">{community.description}</p>
                <p className="community-schedule">
                  Lead: {community.lead}
                  <br />
                  {community.meetingSchedule}
                </p>
                <div className="card-actions-row">
                  {community.joined ? (
                    <>
                      <span className="tag badge-success">Joined</span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setPendingLeave(community)}
                      >
                        Leave Community
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleJoin(community)}
                    >
                      Join Community
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingLeave)}
        title="Leave community?"
        message={
          pendingLeave
            ? `Are you sure you want to leave "${pendingLeave.name}"? You will stop receiving weekly meeting reminders.`
            : ''
        }
        confirmLabel="Leave Community"
        cancelLabel="Stay in Community"
        variant="danger"
        onConfirm={handleConfirmLeave}
        onCancel={() => setPendingLeave(null)}
      />
    </section>
  );
}
