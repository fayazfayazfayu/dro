// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import CSPLanding from './pages/ClientSide/CSPLanding';
import RoleSelection from './pages/RoleSelection';
import UserLogin from './pages/UserLogin';
import UserRegistration from './pages/UserRegistration';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard'; // Import AdminDashboard
import UserManagement from './pages/UserManagement';
import VehicleManagement from './pages/VehicleManagement'; // Import VehicleManagement
import RouteManagement from './pages/RouteManagement'; // Import RouteManagement
// Import other components as needed

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {/* <Route path="/" element={<CSPLanding />} /> */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/registration" element={<UserRegistration />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* Admin Dashboard Route */}
        <Route path="/admin/users" element={<UserManagement />} /> {/* User Management Route */}
        <Route path="/admin/vehicles" element={<VehicleManagement />} /> {/* Vehicle Management Route */}
        <Route path="/admin/routes" element={<RouteManagement />} /> {/* Route Management Route */}
        
        {/* Add other routes here as needed */}
        
        {/* Admin Routes */}
        {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
        
        {/* Client Routes */}
        {/* <Route path="/member/login" element={<MemberLogin />} /> */}
        {/* <Route path="/member/register" element={<MemberRegister />} /> */}
        
        {/* Trainer Routes */}
        {/* <Route path="/trainer/login" element={<TrainerLogin />} /> */}
        {/* <Route path="/trainer/register" element={<TrainerRegister />} /> */}
      </Routes>
    </Router>
  );
}

export default App;