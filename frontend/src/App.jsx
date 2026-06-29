import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/home/HomePage';
import GroupPage from './pages/groups/GroupPage';
import AddFundPage from './pages/groups/AddFundPage';
import NewRequestPage from './pages/groups/NewRequestPage';
import ManageRequestsPage from './pages/groups/ManageRequestsPage';
import RequestDetailPage from './pages/requests/RequestDetailPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ProfilePage from './pages/profile/ProfilePage';
import MyRequestsPage from './pages/profile/MyRequestsPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <NotifProvider>
      <SocketProvider>
        {children}
      </SocketProvider>
    </NotifProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          
          <Route path="/groups/:id" element={<ProtectedRoute><GroupPage /></ProtectedRoute>} />
          <Route path="/groups/:id/add-fund" element={<ProtectedRoute><AddFundPage /></ProtectedRoute>} />
          <Route path="/groups/:id/new-request" element={<ProtectedRoute><NewRequestPage /></ProtectedRoute>} />
          <Route path="/groups/:id/requests" element={<ProtectedRoute><ManageRequestsPage /></ProtectedRoute>} />
          
          <Route path="/requests/:id" element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />
          
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/requests" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster 
          position="top-center" 
          toastOptions={{ 
            style: { background: '#1E1B4B', color: '#fff', borderRadius: '12px', fontSize: '14px', fontWeight: '500' }
          }} 
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
