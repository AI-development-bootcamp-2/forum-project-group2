import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

// Placeholder components for P2/P3 - these will be replaced during integration
const PostList = () => <div className="placeholder">System Dashboard: Post Infrastructure Ready</div>;
const PostDetail = () => <div className="placeholder">Post Detail Infrastructure Ready</div>;
const PostForm = () => <div className="placeholder">Post Provisioning Interface Ready</div>;

/**
 * Enterprise Forum Application Core.
 * Orchestrates global routing and component provisioning.
 */
function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="content">
        <Routes>
          {/* Public Infrastructure */}
          <Route path="/" element={<PostList />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Secure Infrastructure */}
          <Route element={<PrivateRoute />}>
            <Route path="/posts/new" element={<PostForm />} />
            <Route path="/posts/:id/edit" element={<PostForm />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div>Error 404: Resource Not Found in Infrastructure</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
