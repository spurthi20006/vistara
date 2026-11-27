import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  INITIAL_ALUMNI,
  INITIAL_STUDENTS,
  INITIAL_COMMUNITIES,
  INITIAL_PROJECTS,
  INITIAL_QUESTIONS,
  INITIAL_HACKATHONS,
  INITIAL_HACKATHON_APPLICATIONS,
} from '../data/mockData';

const AppDataContext = createContext(null);

const INITIAL_PEERS_BY_USER = {
  'stu-kabir-sharma': {
    'stu-devansh-verma': 'connected',
    'alm-aarav-mehta': 'connected',
  },
  'alm-aarav-mehta': {
    'stu-kabir-sharma': 'connected',
  },
  'coord-dr-kavita-rao': {
    'stu-kabir-sharma': 'connected',
  },
};

const INITIAL_MESSAGES_BY_THREAD = {
  'alm-aarav-mehta__stu-kabir-sharma': [
    {
      id: 'msg-101',
      senderId: 'stu-kabir-sharma',
      senderName: 'Kabir Sharma',
      senderRole: 'student',
      text: 'Hi Aarav! I am working on our campus transit API and wanted your advice on structuring WebSocket updates cleanly.',
      createdAt: '2026-11-26 17:40',
    },
    {
      id: 'msg-102',
      senderId: 'alm-aarav-mehta',
      senderName: 'Aarav Mehta',
      senderRole: 'alumni',
      text: 'Hey Kabir! Happy to help. Keep your WebSocket fan-out decoupled from DB writes using a lightweight pub/sub channel—let me know when you want a quick architecture review.',
      createdAt: '2026-11-26 18:05',
    },
  ],
};

const DEFAULT_MEMBER_PROFILES = {
  student: {
    id: 'stu-kabir-sharma',
    name: 'Kabir Sharma',
    email: 'kabir.sharma@universityconnect.edu.in',
    role: 'student',
    roleLabel: 'Student',
    usn: '1IP22CS042',
    department: 'Computer Science & Engineering',
    yearOrBatch: '4th Year B.Tech',
    githubUrl: 'https://github.com/kabir-sharma-dev',
    portfolioUrl: 'https://kabirsharma.dev',
    skills: ['React', 'Node.js', 'WebSockets', 'Docker'],
    interests: ['Developer Tooling', 'Campus Transit Systems', 'Hackathons'],
    lookingForTeam: true,
    preferredTrack: 'Campus Sustainability',
    bio: 'Building real-time campus shuttle telemetry and organizing weekly peer code reviews for first-year students.',
    updatedAt: '2026-11-18',
  },
  alumni: {
    id: 'alm-aarav-mehta',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@universityconnect.edu.in',
    role: 'alumni',
    roleLabel: 'Alumni Mentor',
    jobRole: 'Senior Backend Engineer',
    company: 'Razorpay',
    usn: '1IP16CS014',
    department: 'Computer Science & Engineering',
    yearOrBatch: 'Class of 2020',
    githubUrl: 'https://github.com/aarav-mehta-uc',
    portfolioUrl: 'https://aaravmehta.dev',
    skills: ['Distributed Systems', 'Go', 'PostgreSQL', 'Kubernetes'],
    bio: 'Designs high-throughput payment settlement pipelines and mentors final-year undergraduates on system design interviews.',
    updatedAt: '2026-11-18',
  },
};

export function AppDataProvider({ children }) {
  const [currentUser, setCurrentUser] = useLocalStorage('uc-current-user', null);
  const [alumni, setAlumni] = useState(INITIAL_ALUMNI);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [communities, setCommunities] = useState(INITIAL_COMMUNITIES);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [hackathons] = useState(INITIAL_HACKATHONS);
  const [applications, setApplications] = useState(INITIAL_HACKATHON_APPLICATIONS);
  const [peersByUser, setPeersByUser] = useLocalStorage('uc-peers-by-user', INITIAL_PEERS_BY_USER);
  const [messagesByThread, setMessagesByThread] = useLocalStorage(
    'uc-messages-by-thread',
    INITIAL_MESSAGES_BY_THREAD
  );

  const loginAsRole = useCallback(
    (roleKey, customEmail) => {
      const safeRole = roleKey === 'alumni' ? 'alumni' : 'student';
      const preset = DEFAULT_MEMBER_PROFILES[safeRole] || DEFAULT_MEMBER_PROFILES.student;
      const loggedUser = {
        ...preset,
        email: customEmail ? customEmail.trim() : preset.email,
      };
      setCurrentUser(loggedUser);
      return loggedUser;
    },
    [setCurrentUser]
  );

  const registerUser = useCallback(
    (payload) => {
      const roleKey = payload.role === 'alumni' ? 'alumni' : 'student';
      const newUser = {
        id: `usr-${Date.now()}`,
        name: payload.name.trim(),
        email: payload.email.trim(),
        role: roleKey,
        roleLabel: roleKey === 'alumni' ? 'Alumni Mentor' : 'Student',
        usn: payload.usn ? payload.usn.trim().toUpperCase() : '',
        department: payload.department,
        yearOrBatch: payload.graduationYear,
        githubUrl: 'https://github.com/university-connect',
        portfolioUrl: 'https://universityconnect.edu.in',
        skills: ['Campus Member'],
        bio: 'New University Connect community member.',
        utm: payload.utm,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setCurrentUser(newUser);
      return newUser;
    },
    [setCurrentUser]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  const updateCurrentUserProfile = useCallback(
    (updates) => {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          ...updates,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        // Also update matching student record if current user is student
        setStudents((sList) =>
          sList.map((s) => (s.id === prev.id ? { ...s, ...updated } : s))
        );
        // Also update matching alumni record if current user is alumni
        setAlumni((aList) =>
          aList.map((a) =>
            a.id === prev.id
              ? {
                ...a,
                ...updated,
                role: updates.jobRole || a.role,
                company: updates.company || a.company,
              }
              : a
          )
        );
        return updated;
      });
    },
    [setCurrentUser]
  );

  const toggleTeammateStatus = useCallback((studentId) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, lookingForTeam: !s.lookingForTeam } : s
      )
    );
    setCurrentUser((prev) => {
      if (prev && prev.id === studentId) {
        return { ...prev, lookingForTeam: !prev.lookingForTeam };
      }
      return prev;
    });
  }, [setCurrentUser]);

  const joinCommunity = useCallback((communityId) => {
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === communityId && !c.joined
          ? { ...c, joined: true, membersCount: c.membersCount + 1 }
          : c
      )
    );
  }, []);

  const leaveCommunity = useCallback((communityId) => {
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === communityId && c.joined
          ? { ...c, joined: false, membersCount: Math.max(0, c.membersCount - 1) }
          : c
      )
    );
  }, []);

  const addProject = useCallback(
    (projectInput) => {
      const newProject = {
        id: `proj-${Date.now()}`,
        title: projectInput.title.trim(),
        domain: projectInput.domain,
        thumbnail: '/images/project-campus-pulse.webp',
        summary: projectInput.summary.trim(),
        description: projectInput.description.trim(),
        techStack: projectInput.techStack
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        team: [currentUser ? currentUser.name : 'Campus Contributor'],
        githubUrl: projectInput.githubUrl.trim(),
        deploymentUrl: projectInput.deploymentUrl.trim(),
        ownerId: currentUser ? currentUser.id : 'guest',
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    },
    [currentUser]
  );

  const deleteProject = useCallback(
    (projectId) => {
      setProjects((prev) => {
        const target = prev.find((p) => p.id === projectId);
        if (target && target.ownerId && currentUser && target.ownerId !== currentUser.id) {
          return prev;
        }
        return prev.filter((p) => p.id !== projectId);
      });
    },
    [currentUser]
  );

  const addQuestion = useCallback(
    (questionInput) => {
      const newQuestion = {
        id: `q-${Date.now()}`,
        title: questionInput.title.trim(),
        body: questionInput.body.trim(),
        tag: questionInput.tag,
        author: currentUser ? currentUser.name : 'Campus Visitor',
        authorRole: currentUser ? currentUser.roleLabel : 'Guest',
        createdAt: new Date().toISOString().slice(0, 10),
        upvotes: 1,
        answers: [],
      };
      setQuestions((prev) => [newQuestion, ...prev]);
      return newQuestion;
    },
    [currentUser]
  );

  const upvoteQuestion = useCallback((questionId) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q))
    );
  }, []);

  const addAnswer = useCallback(
    (questionId, answerText) => {
      const newAnswer = {
        id: `ans-${Date.now()}`,
        author: currentUser ? currentUser.name : 'Campus Member',
        authorRole: currentUser ? currentUser.roleLabel : 'Student',
        body: answerText.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q
        )
      );
      return newAnswer;
    },
    [currentUser]
  );

  const submitHackathonApplication = useCallback((appInput) => {
    const newApp = {
      id: `app-${Date.now()}`,
      hackathonId: appInput.hackathonId,
      hackathonTitle: appInput.hackathonTitle,
      teamName: appInput.teamName.trim(),
      leadName: appInput.leadName.trim(),
      leadEmail: appInput.leadEmail.trim(),
      track: appInput.track,
      memberCount: Number(appInput.memberCount),
      pitch: appInput.pitch.trim(),
      status: 'Pending',
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    setApplications((prev) => [newApp, ...prev]);
    return newApp;
  }, []);

  const updateApplicationStatus = useCallback((applicationId, nextStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status: nextStatus } : app))
    );
  }, []);

  const peers = useMemo(() => {
    if (!currentUser?.id || !peersByUser || typeof peersByUser !== 'object') {
      return {};
    }
    return peersByUser[currentUser.id] || {};
  }, [peersByUser, currentUser]);

  const sendPeerRequest = useCallback(
    (targetId) => {
      if (!currentUser?.id || !targetId || currentUser.id === targetId) return false;
      let sent = false;
      setPeersByUser((prev) => {
        const safePrev = prev && typeof prev === 'object' ? { ...prev } : {};
        const userPeers = safePrev[currentUser.id] ? { ...safePrev[currentUser.id] } : {};
        if (userPeers[targetId]) return safePrev;

        userPeers[targetId] = 'pending';
        safePrev[currentUser.id] = userPeers;

        const targetPeers = safePrev[targetId] ? { ...safePrev[targetId] } : {};
        targetPeers[currentUser.id] = 'incoming';
        safePrev[targetId] = targetPeers;

        sent = true;
        return safePrev;
      });
      return sent;
    },
    [currentUser, setPeersByUser]
  );

  const acceptConnectionRequest = useCallback(
    (targetId) => {
      if (!currentUser?.id || !targetId) return;
      setPeersByUser((prev) => {
        const safePrev = prev && typeof prev === 'object' ? { ...prev } : {};
        const userPeers = safePrev[currentUser.id] ? { ...safePrev[currentUser.id] } : {};
        const targetPeers = safePrev[targetId] ? { ...safePrev[targetId] } : {};

        userPeers[targetId] = 'connected';
        targetPeers[currentUser.id] = 'connected';

        safePrev[currentUser.id] = userPeers;
        safePrev[targetId] = targetPeers;
        return safePrev;
      });
    },
    [currentUser, setPeersByUser]
  );

  const removePeer = useCallback(
    (targetId) => {
      if (!currentUser?.id || !targetId) return;
      setPeersByUser((prev) => {
        const safePrev = prev && typeof prev === 'object' ? { ...prev } : {};
        const userPeers = safePrev[currentUser.id] ? { ...safePrev[currentUser.id] } : {};
        const targetPeers = safePrev[targetId] ? { ...safePrev[targetId] } : {};

        delete userPeers[targetId];
        delete targetPeers[currentUser.id];

        safePrev[currentUser.id] = userPeers;
        safePrev[targetId] = targetPeers;
        return safePrev;
      });
    },
    [currentUser, setPeersByUser]
  );

  const sendMessage = useCallback(
    ({ recipientId, studentId, alumniId, text }) => {
      const targetId = recipientId || (currentUser?.id === studentId ? alumniId : studentId);
      if (!currentUser?.id || !targetId) return null;
      const trimmed = text.trim();
      if (!trimmed) return null;

      const threadKey = [currentUser.id, targetId].sort().join('__');
      const now = new Date();
      const timestamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        text: trimmed,
        createdAt: timestamp,
      };

      setMessagesByThread((prev) => {
        const safePrev = prev && typeof prev === 'object' ? prev : {};
        const existing = Array.isArray(safePrev[threadKey]) ? safePrev[threadKey] : [];
        return {
          ...safePrev,
          [threadKey]: [...existing, newMessage],
        };
      });

      return newMessage;
    },
    [currentUser, setMessagesByThread]
  );

  const deleteMessage = useCallback(
    (recipientId, messageId) => {
      if (!currentUser?.id || !recipientId || !messageId) return;
      const threadKey = [currentUser.id, recipientId].sort().join('__');
      setMessagesByThread((prev) => {
        const safePrev = prev && typeof prev === 'object' ? prev : {};
        const existing = Array.isArray(safePrev[threadKey]) ? safePrev[threadKey] : [];
        const nextThread = existing.filter((m) => m.id !== messageId);
        return {
          ...safePrev,
          [threadKey]: nextThread,
        };
      });
    },
    [currentUser, setMessagesByThread]
  );

  const clearThreadHistory = useCallback(
    (recipientId) => {
      if (!currentUser?.id || !recipientId) return;
      const threadKey = [currentUser.id, recipientId].sort().join('__');
      setMessagesByThread((prev) => {
        const safePrev = prev && typeof prev === 'object' ? prev : {};
        if (!safePrev[threadKey]) return safePrev;
        const next = { ...safePrev };
        delete next[threadKey];
        return next;
      });
    },
    [currentUser, setMessagesByThread]
  );

  const value = useMemo(
    () => ({
      currentUser,
      loginAsRole,
      registerUser,
      logout,
      updateCurrentUserProfile,
      alumni,
      students,
      communities,
      joinCommunity,
      leaveCommunity,
      projects,
      addProject,
      deleteProject,
      questions,
      addQuestion,
      upvoteQuestion,
      addAnswer,
      hackathons,
      applications,
      submitHackathonApplication,
      updateApplicationStatus,
      toggleTeammateStatus,
      peers,
      sendPeerRequest,
      sendConnectionRequest: sendPeerRequest,
      acceptConnectionRequest,
      rejectConnectionRequest: removePeer,
      cancelConnectionRequest: removePeer,
      removePeer,
      messagesByThread,
      sendMessage,
      deleteMessage,
      clearThreadHistory,
    }),
    [
      currentUser,
      loginAsRole,
      registerUser,
      logout,
      updateCurrentUserProfile,
      alumni,
      students,
      communities,
      joinCommunity,
      leaveCommunity,
      projects,
      addProject,
      deleteProject,
      questions,
      addQuestion,
      upvoteQuestion,
      addAnswer,
      hackathons,
      applications,
      submitHackathonApplication,
      updateApplicationStatus,
      toggleTeammateStatus,
      peers,
      sendPeerRequest,
      acceptConnectionRequest,
      removePeer,
      messagesByThread,
      sendMessage,
      deleteMessage,
      clearThreadHistory,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return ctx;
}
