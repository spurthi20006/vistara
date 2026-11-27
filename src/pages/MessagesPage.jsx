import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAppData } from '../context/AppDataContext';
import { useToast } from '../hooks/useToast';
import './MessagesPage.css';

export function MessagesPage() {
  const {
    currentUser,
    alumni,
    students,
    messagesByThread,
    sendMessage,
    deleteMessage,
    clearThreadHistory,
  } = useAppData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [draft, setDraft] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const threadEndRef = useRef(null);

  const getThreadKeyForId = (contactId) => {
    if (!currentUser?.id || !contactId) return '';
    return [currentUser.id, contactId].sort().join('__');
  };

  const allContacts = useMemo(() => {
    const alumniContacts = alumni.map((a) => ({ ...a, contactType: 'alumni' }));
    const studentContacts = students.map((s) => ({ ...s, contactType: 'student' }));
    const combined = [...alumniContacts, ...studentContacts].filter(
      (c) => c.id !== currentUser?.id
    );

    // Sort contacts with message history first (most recent thread at top)
    return combined.sort((a, b) => {
      const aThread = (messagesByThread && messagesByThread[getThreadKeyForId(a.id)]) || [];
      const bThread = (messagesByThread && messagesByThread[getThreadKeyForId(b.id)]) || [];
      if (aThread.length === 0 && bThread.length === 0) return 0;
      if (aThread.length === 0) return 1;
      if (bThread.length === 0) return -1;
      const aLast = aThread[aThread.length - 1]?.createdAt || '';
      const bLast = bThread[bThread.length - 1]?.createdAt || '';
      return bLast.localeCompare(aLast);
    });
  }, [alumni, students, currentUser?.id, messagesByThread]);

  const historyCount = useMemo(
    () =>
      allContacts.filter((person) => {
        const thread = (messagesByThread && messagesByThread[getThreadKeyForId(person.id)]) || [];
        return thread.length > 0;
      }).length,
    [allContacts, messagesByThread]
  );

  const contacts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allContacts.filter((person) => {
      const thread = (messagesByThread && messagesByThread[getThreadKeyForId(person.id)]) || [];
      if (roleFilter === 'history' && thread.length === 0) return false;
      if (
        roleFilter !== 'all' &&
        roleFilter !== 'history' &&
        person.contactType !== roleFilter
      ) {
        return false;
      }
      if (!q) return true;
      const roleInfo =
        person.contactType === 'alumni'
          ? `${person.role} ${person.company} ${person.department}`
          : `${person.year} ${person.department}`;
      return `${person.name} ${roleInfo}`.toLowerCase().includes(q);
    });
  }, [allContacts, roleFilter, searchTerm, messagesByThread]);

  const requestedContactId = searchParams.get('to');

  const selectedContact = useMemo(() => {
    if (requestedContactId) {
      const match = allContacts.find((c) => c.id === requestedContactId);
      if (match) return match;
    }
    return contacts[0] || allContacts[0] || null;
  }, [allContacts, contacts, requestedContactId]);

  const activeThreadKey = getThreadKeyForId(selectedContact?.id);
  const activeMessages = useMemo(() => {
    if (!activeThreadKey || !messagesByThread) return [];
    return messagesByThread[activeThreadKey] || [];
  }, [activeThreadKey, messagesByThread]);

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeMessages.length, selectedContact?.id]);

  const handleSelectContact = (contactId) => {
    setSearchParams({ to: contactId });
  };

  const handleSend = (event) => {
    event.preventDefault();
    if (!selectedContact || !currentUser) return;

    const trimmed = draft.trim();
    if (!trimmed) {
      showToast({
        type: 'error',
        title: 'Message is empty',
        message: 'Type a message before sending.',
      });
      return;
    }

    sendMessage({
      recipientId: selectedContact.id,
      text: trimmed,
    });
    setDraft('');
  };

  const handleConfirmClear = () => {
    if (!selectedContact) return;
    clearThreadHistory(selectedContact.id);
    setConfirmClearOpen(false);
    showToast({
      type: 'info',
      title: 'History cleared',
      message: `Cleared message history with ${selectedContact.name}.`,
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend(event);
    }
  };

  return (
    <section className="page-section">
      <PageMeta
        title="Messages"
        description="Direct messaging and conversation history between students and alumni on University Connect."
      />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">
            View your conversation history and message students or alumni mentors directly.
          </p>
        </div>

        <div className="messages-shell">
          <aside className="card messages-sidebar" aria-label="Conversations">
            <div className="messages-sidebar-head">
              <label htmlFor="messages-contact-search" className="sr-only">
                Search students and alumni
              </label>
              <input
                id="messages-contact-search"
                type="search"
                className="form-input"
                placeholder="Search students & alumni..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="messages-role-tabs" role="group" aria-label="Filter conversations">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'history', label: `History (${historyCount})` },
                  { key: 'student', label: 'Students' },
                  { key: 'alumni', label: 'Alumni' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`btn btn-sm messages-role-tab ${
                      roleFilter === tab.key ? 'btn-primary' : 'btn-outline'
                    }`}
                    onClick={() => setRoleFilter(tab.key)}
                    aria-pressed={roleFilter === tab.key}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="messages-contact-list" role="list">
              {contacts.length === 0 ? (
                <p className="card-muted messages-empty-list">
                  {roleFilter === 'history'
                    ? 'No conversation history yet. Select a student or alumnus to send your first message.'
                    : 'No matching contacts found.'}
                </p>
              ) : (
                contacts.map((person) => {
                  const tKey = getThreadKeyForId(person.id);
                  const thread = (messagesByThread && messagesByThread[tKey]) || [];
                  const lastMsg = thread[thread.length - 1];
                  const isActive = selectedContact?.id === person.id;

                  return (
                    <button
                      key={person.id}
                      type="button"
                      role="listitem"
                      className={`messages-contact-item ${isActive ? 'is-active' : ''}`}
                      onClick={() => handleSelectContact(person.id)}
                    >
                      <img
                        src={person.avatar}
                        alt={`${person.name} avatar`}
                        width="44"
                        height="44"
                        loading="lazy"
                        className="messages-contact-avatar"
                      />
                      <div className="messages-contact-meta">
                        <div className="messages-contact-top">
                          <span className="messages-contact-name">{person.name}</span>
                          {thread.length > 0 && (
                            <span className="messages-count-badge">{thread.length}</span>
                          )}
                        </div>
                        <span className="messages-contact-sub">
                          {person.contactType === 'alumni'
                            ? `Alumni · ${person.role} · ${person.company}`
                            : `Student · ${person.year}`}
                        </span>
                        {lastMsg && (
                          <div className="messages-contact-preview-row">
                            <span className="messages-contact-preview">{lastMsg.text}</span>
                            <span className="messages-contact-time">{lastMsg.createdAt}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <div className="card messages-chat-panel">
            {selectedContact ? (
              <>
                <header className="messages-chat-header">
                  <div className="messages-chat-person">
                    <img
                      src={selectedContact.avatar}
                      alt={`${selectedContact.name} portrait`}
                      width="48"
                      height="48"
                      loading="lazy"
                      className="messages-contact-avatar"
                    />
                    <div>
                      <h2 className="messages-chat-name">{selectedContact.name}</h2>
                      <p className="messages-chat-role">
                        {selectedContact.contactType === 'alumni'
                          ? `Alumni · ${selectedContact.role} at ${selectedContact.company}`
                          : `Student · ${selectedContact.year} · ${selectedContact.department}`}
                      </p>
                    </div>
                  </div>
                  <div className="messages-header-actions">
                    {activeMessages.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setConfirmClearOpen(true)}
                      >
                        Clear History
                      </button>
                    )}
                    <Link
                      to={
                        selectedContact.contactType === 'alumni'
                          ? `/alumni/${selectedContact.id}`
                          : `/students/${selectedContact.id}`
                      }
                      className="btn btn-outline btn-sm"
                    >
                      View Profile
                    </Link>
                  </div>
                </header>

                <div className="messages-thread" role="log" aria-live="polite" aria-label="Message history">
                  {activeMessages.length === 0 ? (
                    <div className="messages-empty-thread">
                      <p className="card-muted">
                        No messages yet with <strong>{selectedContact.name}</strong>. Say hello and
                        start a conversation!
                      </p>
                    </div>
                  ) : (
                    activeMessages.map((msg) => {
                      const isMine = msg.senderId === currentUser?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`message-bubble-row ${isMine ? 'is-mine' : 'is-theirs'}`}
                        >
                          <div className={`message-bubble ${isMine ? 'is-mine' : 'is-theirs'}`}>
                            <div className="message-meta">
                              <span className="message-sender">{isMine ? 'You' : msg.senderName}</span>
                              <div className="message-meta-right">
                                <span className="message-time">{msg.createdAt}</span>
                                {isMine && (
                                  <button
                                    type="button"
                                    className="message-delete-btn"
                                    onClick={() => deleteMessage(selectedContact.id, msg.id)}
                                    aria-label="Delete message"
                                    title="Delete message"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="message-text">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={threadEndRef} />
                </div>

                <form className="messages-composer" onSubmit={handleSend}>
                  <label htmlFor="message-draft-input" className="sr-only">
                    Message to {selectedContact.name}
                  </label>
                  <textarea
                    id="message-draft-input"
                    className="form-textarea messages-textarea"
                    rows={2}
                    placeholder={`Write a message to ${selectedContact.name}...`}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button type="submit" className="btn btn-primary messages-send-btn">
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="messages-empty-thread">
                <p className="card-muted">Select a student or alumnus to start messaging.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Clear message history?"
        message={
          selectedContact
            ? `This will remove all messages in your conversation with ${selectedContact.name}.`
            : ''
        }
        confirmLabel="Clear History"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmClear}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </section>
  );
}
