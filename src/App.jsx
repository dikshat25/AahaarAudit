import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const [booting, setBooting] = useState(true);

  return (
    <>
      {booting && <LoadingSpinner onFinish={() => setBooting(false)} duration={3200} />}
      <div className={booting ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}