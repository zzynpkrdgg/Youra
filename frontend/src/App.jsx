import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar   from './components/Navbar';
import Landing  from './pages/Landing';
import Login    from './pages/Login';
import Register from './pages/Register';
import Wardrobe from './pages/Wardrobe';
import Outfit   from './pages/Outfit';
import Profile  from './pages/Profile';
import StyleOnboarding from './pages/StyleOnboarding';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-wrapper" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><div className="spinner" style={{ width:40, height:40, borderWidth:3 }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Public route — giriş yapmışsa wardrobe'a yönlendir
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/wardrobe" replace />;
  return children;
}


function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <button 
      onClick={toggleTheme} 
      style={{
        position: 'fixed',
        right: '0px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 9999,
        background: 'var(--color-text)',
        color: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        padding: '10px 15px',
        borderTopLeftRadius: '12px',
        borderBottomLeftRadius: '12px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        borderRight: 'none',
        opacity: 0.8,
        transition: 'opacity 0.2s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
      title="Temayı Değiştir"
    >
      {theme === 'light' ? '☾' : '☼'}
    </button>
  );
}

function AppRoutes() {
  return (
    <>
      <ThemeToggle />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />

        <Route path="/onboarding" element={
          <ProtectedRoute><StyleOnboarding /></ProtectedRoute>
        } />

        <Route path="/wardrobe" element={
          <ProtectedRoute><Wardrobe /></ProtectedRoute>
        } />

        <Route path="/outfit" element={
          <ProtectedRoute><Outfit /></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
