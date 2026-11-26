import { useScrollPosition } from '../hooks/useScrollPosition';
import './ScrollProgress.css';

export function ScrollProgress() {
  const { scrollProgress } = useScrollPosition();

  return (
    <div
      className="scroll-progress"
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(scrollProgress)}
    >
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
