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
  },
  'alm-aarav-mehta': {
    'stu-kabir-sharma': 'connected',
  },
  'coord-dr-kavita-rao': {
    'stu-kabir-sharma': 'connected',
  },
};

const DEFAULT_MEMBER_PROFILES = {
  student: {
    id: 'stu-kabir-sharma',
    name: 'Kabir Sharma',
    email: 'kabir.sharma@universityconnect.edu.in',
    role: 'student',
    roleLabel: 'Student',
    department: 'Computer Science & Engineering',
    yearOrBatch: '4th Year B.Tech',
    phoneDisplay: '+91 99104 38219',
    phoneHref: 'tel:+919910438219',
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
    department: 'Computer Science & Engineering',
    yearOrBatch: 'Class of 2020',
    phoneDisplay: '+91 98204 51731',
    phoneHref: 'tel:+919820451731',
    githubUrl: 'https://github.com/aarav-mehta-uc',
    portfolioUrl: 'https://aaravmehta.dev',
    skills: ['Distributed Systems', 'Go', 'PostgreSQL', 'Kubernetes'],
    bio: 'Designs high-throughput payment settlement pipelines and mentors final-year undergraduates on system design interviews.',
    updatedAt: '2026-11-18',
  },
  coordinator: {
    id: 'coord-dr-kavita-rao',
    name: 'Dr. Kavita Rao',
    email: 'kavita.rao@universityconnect.edu.in',
    role: 'coordinator',
    roleLabel: 'Campus Coordinator',
    department: 'Student Innovation & Placement Cell',
    yearOrBatch: 'Faculty Coordinator',
    phoneDisplay: '+91 98102 64910',
    phoneHref: 'tel:+919810264910',
    githubUrl: 'https://github.com/university-connect',
    portfolioUrl: 'https://universityconnect.edu.in/innovation',
    skills: ['Hackathon Operations', 'Industry Partnerships', 'Research Grants'],
    bio: 'Coordinates annual campus hackathons, alumni mentoring cohorts, and interdisciplinary student capstone showcase grants.',
    updatedAt: '2026-11-20',
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

  const loginAsRole = useCallback(
    (roleKey, customEmail) => {
      const preset = DEFAULT_MEMBER_PROFILES[roleKey] || DEFAULT_MEMBER_PROFILES.student;
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
        department: payload.department,
        yearOrBatch: payload.graduationYear,
        phoneDisplay: '+91 98204 51730',
        phoneHref: 'tel:+919820451730',
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
        const cleanDigits = (updates.phoneDisplay || prev.phoneDisplay || '').replace(/[^\d+]/g, '');
        const updated = {
          ...prev,
          ...updates,
          phoneHref: cleanDigits ? `tel:${cleanDigits}` : prev.phoneHref,
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
    (studentId) => {
      if (!currentUser?.id || !studentId) return;
      setPeersByUser((prev) => {
        const safePrev = prev && typeof prev === 'object' ? prev : {};
        const userPeers = safePrev[currentUser.id] || {};
        if (userPeers[studentId]) return safePrev;
        return {
          ...safePrev,
          [currentUser.id]: {
            ...userPeers,
            [studentId]: 'pending',
          },
        };
      });
    },
    [currentUser, setPeersByUser]
  );

  const removePeer = useCallback(
    (studentId) => {
      if (!currentUser?.id || !studentId) return;
      setPeersByUser((prev) => {
        const safePrev = prev && typeof prev === 'object' ? prev : {};
        const userPeers = safePrev[currentUser.id];
        if (!userPeers || !userPeers[studentId]) return safePrev;
        const nextUserPeers = { ...userPeers };
        delete nextUserPeers[studentId];
        return {
          ...safePrev,
          [currentUser.id]: nextUserPeers,
        };
      });
    },
    [currentUser, setPeersByUser]
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
      removePeer,
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
      removePeer,
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
