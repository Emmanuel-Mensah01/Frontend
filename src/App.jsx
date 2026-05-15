import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import OfferingPage from './pages/OfferingPage';
import SubmissionPage from './pages/SubmissionPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InterpretationPage from './pages/InterpretationPage';
import FindInterpretationPage from './pages/FindInterpretationPage';
import TeachingsPage from './pages/TeachingsPage';

const PastorRoute = ({ children }) => {
  const token = localStorage.getItem('pastor_token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0B1020',
            color: '#C8A96B',
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '16px',
            border: '1px solid rgba(200,169,107,0.2)',
          },
        }}
      />
      <Routes>
      <Route path="/" element={<LandingPage />} />
<Route path="/offering" element={<OfferingPage />} />
<Route path="/submission" element={<SubmissionPage />} />
<Route path="/confirmation" element={<ConfirmationPage />} />
<Route path="/check/:reference" element={<InterpretationPage />} />
<Route path="/find" element={<FindInterpretationPage />} />
<Route path="/teachings" element={<TeachingsPage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/dashboard" element={
  <PastorRoute><DashboardPage /></PastorRoute>
} />
      </Routes>
    </BrowserRouter>
  );
}