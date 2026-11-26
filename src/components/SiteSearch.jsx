import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import './SiteSearch.css';

export function SiteSearch({ onNavigate }) {
  const { alumni, students, communities, projects, questions } = useAppData();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const matches = [];

    alumni.forEach((item) => {
      const haystack = `${item.name} ${item.company} ${item.role} ${item.department} ${item.skills.join(' ')}`.toLowerCase();
      if (haystack.includes(trimmed)) {
        matches.push({
          id: item.id,
          category: 'Alumni',
          title: item.name,
          subtitle: `${item.role} at ${item.company}`,
          to: `/alumni/${item.id}`,
        });
      }
    });

    students.forEach((item) => {
      const haystack = `${item.name} ${item.year} ${item.department} ${item.skills.join(' ')}`.toLowerCase();
      if (haystack.includes(trimmed)) {
        matches.push({
          id: item.id,
          category: 'Student',
          title: item.name,
          subtitle: `${item.year} · ${item.department}`,
          to: `/students/${item.id}`,
        });
      }
    });

    communities.forEach((item) => {
      const haystack = `${item.name} ${item.category} ${item.description}`.toLowerCase();
      if (haystack.includes(trimmed)) {
        matches.push({
          id: item.id,
          category: 'Community',
          title: item.name,
          subtitle: `${item.category} · ${item.membersCount} members`,
          to: '/communities',
        });
      }
    });

    projects.forEach((item) => {
      const haystack = `${item.title} ${item.domain} ${item.summary} ${item.techStack.join(' ')}`.toLowerCase();
      if (haystack.includes(trimmed)) {
        matches.push({
          id: item.id,
          category: 'Project',
          title: item.title,
          subtitle: `${item.domain} · ${item.techStack.slice(0, 3).join(', ')}`,
          to: `/projects/${item.id}`,
        });
      }
    });

    questions.forEach((item) => {
      const haystack = `${item.title} ${item.body} ${item.tag} ${item.author}`.toLowerCase();
      if (haystack.includes(trimmed)) {
        matches.push({
          id: item.id,
          category: 'Question',
          title: item.title,
          subtitle: `${item.tag} · Asked by ${item.author}`,
          to: '/questions',
        });
      }
    });

    return matches.slice(0, 10);
  }, [query, alumni, students, communities, projects, questions]);

  const handleSelectItem = useCallback(
    (index) => {
      const selected = results[index];
      if (!selected) return;
      setIsOpen(false);
      setQuery('');
      navigate(selected.to);
      if (onNavigate) onNavigate();
    },
    [results, navigate, onNavigate]
  );

  const { activeIndex, setActiveIndex, handleKeyDown } = useKeyboardNav({
    itemCount: results.length,
    isOpen: isOpen && query.trim().length > 0,
    onSelect: handleSelectItem,
    onClose: () => setIsOpen(false),
  });

  useEffect(() => {
    const handleOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const showDropdown = isOpen && query.trim().length > 0;
  const activeOptionId =
    activeIndex >= 0 && results[activeIndex] ? `search-option-${results[activeIndex].id}` : undefined;

  return (
    <div className="site-search" ref={wrapperRef}>
      <label htmlFor="global-site-search" className="sr-only">
        Search alumni, students, communities, projects, and questions
      </label>
      <div className="site-search-input-wrap">
        <svg
          className="site-search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          id="global-site-search"
          type="search"
          className="site-search-input"
          placeholder="Search people, clubs, projects, Q&A..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="site-search-results"
          aria-activedescendant={activeOptionId}
        />
      </div>

      {showDropdown && (
        <div id="site-search-results" className="site-search-dropdown" role="listbox">
          {results.length === 0 ? (
            <div className="site-search-empty" role="status">
              No results found for &ldquo;{query.trim()}&rdquo;
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={`${item.category}-${item.id}`}
                  id={`search-option-${item.id}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`site-search-option ${isSelected ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelectItem(idx)}
                >
                  <span className="site-search-badge">{item.category}</span>
                  <span className="site-search-text">
                    <span className="site-search-title">{item.title}</span>
                    <span className="site-search-subtitle">{item.subtitle}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
