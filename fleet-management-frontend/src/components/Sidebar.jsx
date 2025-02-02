import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: #1A1B4B;
  color: white;
  height: 100vh;
  position: fixed;
`;

const MenuItem = styled.div`
  padding: 15px;
  cursor: pointer;

  &:hover {
    background-color: #141A4B;
  }
`;

const Sidebar = () => {
  return (
    <SidebarContainer>
      <MenuItem>
        <Link to="/admin/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
      </MenuItem>
      <MenuItem>
        <Link to="/admin/users" style={{ color: 'white', textDecoration: 'none' }}>Users</Link>
      </MenuItem>
      <MenuItem>
        <Link to="/admin/vehicles" style={{ color: 'white', textDecoration: 'none' }}>Vehicles</Link>
      </MenuItem>
      <MenuItem>
        <Link to="/admin/routes" style={{ color: 'white', textDecoration: 'none' }}>Routes</Link>
      </MenuItem>
      <MenuItem>
        <Link to="/admin/reports" style={{ color: 'white', textDecoration: 'none' }}>Reports</Link>
      </MenuItem>
      <MenuItem>
        <Link to="/admin/settings" style={{ color: 'white', textDecoration: 'none' }}>Settings</Link>
      </MenuItem>
    </SidebarContainer>
  );
};

export default Sidebar; 