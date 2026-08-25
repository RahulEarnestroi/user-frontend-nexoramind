import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import CertificationsPage from './pages/public/CertificationsPage';
import CertificationDetailPage from './pages/public/CertificationDetailPage';
import InternshipsPage from './pages/public/InternshipsPage';
import InternshipDetailPage from './pages/public/InternshipDetailPage';
import VerifyPage from './pages/public/VerifyPage';
import CertificateVerifyPage from './pages/public/CertificateVerifyPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import TermsAndConditions from './pages/public/TermsAndConditions';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import NotFoundPage from './pages/public/NotFoundPage';
import OfferLettersPage from './pages/public/OfferLettersPage';
import PublicCertificatesPage from './pages/public/PublicCertificatesPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/DashboardPage';
import AdminCertificates from './pages/admin/CertificatesPage';
import IssueCertificate from './pages/admin/IssueCertificatePage';
import AdminStudents from './pages/admin/StudentsPage';
import AdminCertifications from './pages/admin/CertificationsPage';
import AdminTemplates from './pages/admin/TemplatesPage';
import AdminVerification from './pages/admin/VerificationPage';
import AdminAnalytics from './pages/admin/AnalyticsPage';
import AdminSettings from './pages/admin/SettingsPage';

// Student Pages
import StudentDashboard from './pages/student/DashboardPage';
import StudentCertificates from './pages/student/CertificatesPage';
import StudentCertificateDetail from './pages/student/CertificateDetailPage';

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
       
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/certifications/:slug" element={<CertificationDetailPage />} />
            <Route path="/internships" element={<InternshipsPage />} />
            <Route path="/internships/:roleId/:duration" element={<InternshipDetailPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/verify/:certificateId" element={<CertificateVerifyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/offer-letters" element={<OfferLettersPage />} />
            <Route path="/certificates-list" element={<PublicCertificatesPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          {/* <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/certificates" element={<AdminCertificates />} />
            <Route path="/admin/certificates/issue" element={<IssueCertificate />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/certifications" element={<AdminCertifications />} />
            <Route path="/admin/templates" element={<AdminTemplates />} />
            <Route path="/admin/verification" element={<AdminVerification />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route> */}

          {/* Student Routes */}
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/certificates" element={<StudentCertificates />} />
            <Route path="/student/certificates/:id" element={<StudentCertificateDetail />} />
          </Route>

          {/* Legal Pages */}
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Catch All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
    </AuthProvider>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover
      theme="colored"
    />
    </ThemeProvider>
  );
}
