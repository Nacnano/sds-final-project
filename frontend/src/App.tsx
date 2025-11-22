import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Shrines from './pages/Shrines';
import MyJourney from './pages/MyJourney';
import Discover from './pages/Discover';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected routes with Navbar */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/shrines" element={<Shrines />} />
                    <Route path="/shrines/:id" element={<Shrines />} />
                    <Route path="/my-journey" element={<MyJourney />} />
                    <Route path="/discover" element={<Discover />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
