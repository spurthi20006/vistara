import { useScrollPosition } from '../hooks/useScrollPosition';
import './BackToTop.css';

export function BackToTop() {
  const { scrollY } = useScrollPosition();
  const isVisible = scrollY > 300;

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={handleScrollTop}
      aria-label="Back to top"
      title="Back to top"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
