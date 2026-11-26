import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './context/ToastContext';
import { AppDataProvider } from './context/AppDataContext';
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

export function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <AppDataProvider>
          <BrowserRouter>
            <RouteEffects />
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/alumni" element={<AlumniPage />} />
                <Route path="/alumni/:id" element={<ProfileDetailPage kind="alumni" />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/students/:id" element={<ProfileDetailPage kind="student" />} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/questions" element={<QuestionsPage />} />
                <Route path="/hackathons" element={<HackathonsPage />} />
                <Route path="/profile" element={<MyProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
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
