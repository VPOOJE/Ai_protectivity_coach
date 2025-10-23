import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProfileForm from "./pages/ProfileForm";
import MoodEntry from "./pages/MoodEntry";

// Simple authentication wrapper
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// Simple test component to verify React is working
function TestComponent() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>React is Working! 🎉</h1>
      <p style={{ color: '#666' }}>If you can see this, React is rendering properly.</p>
      <button 
        onClick={() => window.location.href = '/login'}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Go to Login
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/test" element={<TestComponent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileForm />
          </ProtectedRoute>
        } />
        <Route path="/mood" element={
          <ProtectedRoute>
            <MoodEntry />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
// ...existing code...