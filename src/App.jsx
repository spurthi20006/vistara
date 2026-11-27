import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './context/ToastContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import { Layout } from './components/Layout';
import { captureUtmParams } from './utils/utm';
import { HomePage } from './pages/HomePage';
import { AlumniPage } from './pages/AlumniPage';
import { StudentsPage } from './pages/StudentsPage';
import { ProfileDetailPage } from './pages/ProfileDetailPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { HackathonsPage } from './pages/HackathonsPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

function RouteEffects() {
  const location = useLocation();

  useEffect(() => {
    captureUtmParams(location.search);
  }, [location.search]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

function ProtectedRoute({ children, disallowedRoles = [] }) {
  const { currentUser } = useAppData();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (disallowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <AppDataProvider>
          <BrowserRouter>
            <RouteEffects />
            <Layout>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/alumni" element={<ProtectedRoute><AlumniPage /></ProtectedRoute>} />
                <Route path="/alumni/:id" element={<ProtectedRoute><ProfileDetailPage kind="alumni" /></ProtectedRoute>} />
                <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
                <Route path="/students/:id" element={<ProtectedRoute><ProfileDetailPage kind="student" /></ProtectedRoute>} />
                <Route path="/communities" element={<ProtectedRoute disallowedRoles={['alumni']}><CommunitiesPage /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
                <Route path="/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />
                <Route path="/hackathons" element={<ProtectedRoute disallowedRoles={['alumni']}><HackathonsPage /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AppDataProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;
