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
import RoutePlanner from './components/RoutePlanner';
import UserDashboard from './pages/UserDashboard'; // You'll need to create this
import LiveTracking from './pages/LiveTracking'; // You'll need to create this
// Import other components as needed

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {/* <Route path="/" element={<CSPLanding />} /> */}
        <Route path="/" element={<RoleSelection />} />
        
        {/* User Routes */}
        <Route path="/user">
          <Route path="login" element={<UserLogin />} />
          <Route path="registration" element={<UserRegistration />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="tracking" element={<LiveTracking />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="login" element={<AdminLogin />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="vehicles" element={<VehicleManagement />} />
          <Route path="routes" element={<RouteManagement />} />
          <Route path="route-planner" element={<RoutePlanner />} />
        </Route>

        {/* Add a catch-all route for 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;