import { useState, useRef, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import './CopyButton.css';

export function CopyButton({ text, label = 'Copy link' }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      showToast({
        type: 'success',
        title: 'Link copied',
        message: `${text} copied to clipboard.`,
        duration: 2400,
      });

      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      showToast({
        type: 'error',
        title: 'Copy failed',
        message: 'Unable to access clipboard. Please copy the URL manually from the link.',
      });
    }
  };

  return (
    <button
      type="button"
      className={`copy-btn ${copied ? 'copy-btn-copied' : ''}`}
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : `${label}: ${text}`}
    >
      {copied ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Copied</span>
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
              x="9"
              y="9"
              width="13"
              height="13"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
