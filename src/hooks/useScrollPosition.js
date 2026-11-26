import { useState, useEffect } from 'react';

export function useScrollPosition() {
  const [scrollState, setScrollState] = useState({
    scrollY: 0,
    scrollProgress: 0,
  });

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollProgress =
        docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;

      setScrollState({ scrollY, scrollProgress });
      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    updateScroll();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  return scrollState;
}
