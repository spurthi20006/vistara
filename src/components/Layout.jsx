import { ScrollProgress } from './ScrollProgress';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BackToTop } from './BackToTop';
import { FloatingContact } from './FloatingContact';
import { CookieBanner } from './CookieBanner';
import { ToastContainer } from './ToastContainer';

export function Layout({ children }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <BackToTop />
      <FloatingContact />
      <CookieBanner />
      <ToastContainer />
    </>
  );
}
