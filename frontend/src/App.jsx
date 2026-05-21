import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar   from './components/Navbar';
import Landing  from './pages/Landing';
import Login    from './pages/Login';
import Register from './pages/Register';
import Wardrobe from './pages/Wardrobe';
import Outfit   from './pages/Outfit';
import Profile  from './pages/Profile';

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

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
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
