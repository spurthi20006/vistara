import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../hooks/useToast';
import './CookieBanner.css';

export function CookieBanner() {
  const [consent, setConsent] = useLocalStorage('uc-cookie-consent', null);
  const { showToast } = useToast();

  if (consent === 'accepted' || consent === 'declined') {
    return null;
  }

  const handleChoice = (choice) => {
    setConsent(choice);
    showToast({
      type: 'info',
      title: 'Cookie preference saved',
      message:
        choice === 'accepted'
          ? 'Essential and analytics preferences accepted.'
          : 'Only essential local storage will be used.',
    });
  };

  return (
    <aside
      className="cookie-banner"
      role="region"
      aria-label="Cookie preferences"
    >
      <div className="container cookie-banner-inner">
        <p className="cookie-banner-text">
          University Connect uses local storage for your theme preference, session state, and
          campus portal usability. Choose whether to accept optional analytics cookies.
        </p>
        <div className="cookie-banner-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleChoice('declined')}
          >
            Decline
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleChoice('accepted')}
          >
            Accept
          </button>
        </div>
      </div>
    </aside>
  );
}
