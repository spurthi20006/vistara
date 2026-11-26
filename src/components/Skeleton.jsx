import './Skeleton.css';

export function SkeletonCard({ hasImage = false }) {
  return (
    <div className="skeleton-card" aria-hidden="true">
      {hasImage && <div className="skeleton-box skeleton-image" />}
      <div className="skeleton-row">
        <div className="skeleton-box skeleton-avatar" />
        <div className="skeleton-col">
          <div className="skeleton-box skeleton-line skeleton-line-md" />
          <div className="skeleton-box skeleton-line skeleton-line-sm" />
        </div>
      </div>
      <div className="skeleton-box skeleton-line" />
      <div className="skeleton-box skeleton-line skeleton-line-lg" />
      <div className="skeleton-tags">
        <div className="skeleton-box skeleton-pill" />
        <div className="skeleton-box skeleton-pill" />
        <div className="skeleton-box skeleton-pill" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="skeleton-list" role="status" aria-label="Loading content">
      <span className="sr-only">Loading items, please wait...</span>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-list-item" aria-hidden="true">
          <div className="skeleton-box skeleton-line skeleton-line-md" />
          <div className="skeleton-box skeleton-line" />
          <div className="skeleton-box skeleton-line skeleton-line-sm" />
        </div>
      ))}
    </div>
  );
}
