import { useState, useEffect, useMemo, useRef } from 'react';
import { PageMeta } from '../components/PageMeta';
import { SkeletonList } from '../components/Skeleton';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import './QuestionsPage.css';

export function QuestionsPage() {
  const { questions, addQuestion, upvoteQuestion, addAnswer } = useAppData();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');
  const [formData, setFormData] = useState({ title: '', tag: 'Internships', body: '' });
  const [formErrors, setFormErrors] = useState({});
  const [questionPosted, setQuestionPosted] = useState(null);
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [answerErrors, setAnswerErrors] = useState({});

  const titleRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 360);
    return () => window.clearTimeout(timer);
  }, []);

  const tags = useMemo(
    () => ['All', ...Array.from(new Set(questions.map((q) => q.tag)))],
    [questions]
  );

  const visibleQuestions = useMemo(() => {
    if (selectedTag === 'All') return questions;
    return questions.filter((q) => q.tag === selectedTag);
  }, [questions, selectedTag]);

  const handleQuestionSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (formData.title.trim().length < 10) {
      nextErrors.title = 'Question title must be at least 10 characters.';
    }
    if (formData.body.trim().length < 20) {
      nextErrors.body = 'Provide context for your question (at least 20 characters).';
    }
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.title && titleRef.current) {
        titleRef.current.focus();
      } else if (nextErrors.body && bodyRef.current) {
        bodyRef.current.focus();
      }
      showToast({
        type: 'error',
        title: 'Cannot post question',
        message: 'Check the required question fields and try again.',
      });
      return;
    }

    const created = addQuestion(formData);
    setQuestionPosted(created);
    setFormData({ title: '', tag: 'Internships', body: '' });
    setFormErrors({});
    showToast({
      type: 'success',
      title: 'Question posted',
      message: 'Your question is now visible to campus peers and alumni mentors.',
    });
  };

  const handleAnswerSubmit = (event, questionId) => {
    event.preventDefault();
    const draft = (answerDrafts[questionId] || '').trim();
    if (draft.length < 10) {
      setAnswerErrors((prev) => ({
        ...prev,
        [questionId]: 'Write at least 10 characters before submitting an answer.',
      }));
      showToast({
        type: 'error',
        title: 'Answer too short',
        message: 'Include a helpful explanation of at least 10 characters.',
      });
      return;
    }

    addAnswer(questionId, draft);
    setAnswerDrafts((prev) => ({ ...prev, [questionId]: '' }));
    setAnswerErrors((prev) => ({ ...prev, [questionId]: '' }));
    showToast({
      type: 'success',
      title: 'Answer posted',
      message: 'Your response has been added to the thread.',
    });
  };

  const errorEntries = Object.entries(formErrors);

  return (
    <section className="page-section">
      <PageMeta
        title="Campus Q&A Forum"
        description="Ask career, internship, research, and technical questions answered by University Connect alumni and senior students."
      />
      <div className="container questions-layout">
        <div className="page-header">
          <h1 className="page-title">Campus Q&amp;A Forum</h1>
          <p className="page-subtitle">
            Get practical advice on internships, accessibility, research capstones, and campus
            projects.
          </p>
        </div>

        <section className="card ask-question-card" aria-labelledby="ask-question-heading">
          <h2 id="ask-question-heading">Ask the Community</h2>
          {questionPosted ? (
            <div className="form-success-card" role="status">
              <h3>Question Published</h3>
              <p>
                &ldquo;{questionPosted.title}&rdquo; is now open for student and alumni replies.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setQuestionPosted(null)}
              >
                Ask Another Question
              </button>
            </div>
          ) : (
            <form className="form-stack" onSubmit={handleQuestionSubmit} noValidate>
              {errorEntries.length > 0 && (
                <div className="error-summary" role="alert">
                  <h3>Please resolve {errorEntries.length} error(s):</h3>
                  <ul>
                    {errorEntries.map(([key, msg]) => (
                      <li key={key}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="two-col-grid">
                <div className="form-field">
                  <label htmlFor="q-title" className="form-label">
                    Question Title
                  </label>
                  <input
                    ref={titleRef}
                    id="q-title"
                    type="text"
                    className={`form-input ${formErrors.title ? 'input-invalid' : ''}`}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    aria-invalid={Boolean(formErrors.title)}
                    aria-describedby={formErrors.title ? 'q-title-err' : undefined}
                    placeholder="How do alumni evaluate open-source contributions?"
                  />
                  {formErrors.title && (
                    <span id="q-title-err" className="field-error">
                      {formErrors.title}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="q-tag" className="form-label">
                    Topic Tag
                  </label>
                  <select
                    id="q-tag"
                    className="form-select"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  >
                    <option value="Internships">Internships</option>
                    <option value="Accessibility">Accessibility</option>
                    <option value="Research">Research</option>
                    <option value="Campus Life">Campus Life</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="q-body" className="form-label">
                  Details &amp; Context
                </label>
                <textarea
                  ref={bodyRef}
                  id="q-body"
                  className={`form-textarea ${formErrors.body ? 'input-invalid' : ''}`}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  aria-invalid={Boolean(formErrors.body)}
                  aria-describedby={formErrors.body ? 'q-body-err' : undefined}
                  placeholder="Share what you have already tried or the course/project context..."
                />
                {formErrors.body && (
                  <span id="q-body-err" className="field-error">
                    {formErrors.body}
                  </span>
                )}
              </div>

              <div>
                <button type="submit" className="btn btn-primary">
                  Post Question
                </button>
              </div>
            </form>
          )}
        </section>

        <div className="filter-bar" role="group" aria-label="Filter questions by topic">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`btn btn-sm ${selectedTag === tag ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedTag(tag)}
              aria-pressed={selectedTag === tag}
            >
              {tag}
            </button>
          ))}
        </div>

        {isLoading ? (
          <SkeletonList count={3} />
        ) : (
          <div className="questions-stack">
            {visibleQuestions.map((question) => {
              const draftErr = answerErrors[question.id];
              return (
                <article key={question.id} className="card question-card">
                  <div className="question-header">
                    <span className="tag">{question.tag}</span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        upvoteQuestion(question.id);
                        showToast({
                          type: 'success',
                          title: 'Upvoted question',
                          message: `Added your vote to "${question.title}".`,
                          duration: 2400,
                        });
                      }}
                    >
                      Upvote ({question.upvotes})
                    </button>
                  </div>
                  <h2 className="card-heading">{question.title}</h2>
                  <p className="card-muted">{question.body}</p>
                  <p className="question-meta">
                    Asked by {question.author} ({question.authorRole}) · {question.createdAt}
                  </p>

                  <div className="answers-box">
                    <h3>Answers ({question.answers.length})</h3>
                    {question.answers.length === 0 ? (
                      <p className="card-muted">No replies yet. Share the first answer below.</p>
                    ) : (
                      <ul className="answers-list">
                        {question.answers.map((ans) => (
                          <li key={ans.id} className="answer-item">
                            <p className="answer-body">{ans.body}</p>
                            <span className="answer-author">
                              {ans.author} · {ans.authorRole} · {ans.createdAt}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form
                      className="answer-form"
                      onSubmit={(e) => handleAnswerSubmit(e, question.id)}
                      noValidate
                    >
                      <label htmlFor={`reply-${question.id}`} className="form-label">
                        Add an answer
                      </label>
                      <textarea
                        id={`reply-${question.id}`}
                        className={`form-textarea ${draftErr ? 'input-invalid' : ''}`}
                        value={answerDrafts[question.id] || ''}
                        onChange={(e) =>
                          setAnswerDrafts((prev) => ({ ...prev, [question.id]: e.target.value }))
                        }
                        aria-invalid={Boolean(draftErr)}
                        aria-describedby={draftErr ? `reply-err-${question.id}` : undefined}
                        placeholder="Write a concise, actionable answer..."
                      />
                      {draftErr && (
                        <span id={`reply-err-${question.id}`} className="field-error">
                          {draftErr}
                        </span>
                      )}
                      <div>
                        <button type="submit" className="btn btn-secondary btn-sm">
                          Submit Answer
                        </button>
                      </div>
                    </form>
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
