import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const DashboardContainer = styled.div`
  padding: 20px;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const DashboardCard = styled(Link)`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const UserDashboard = () => {
  return (
    <DashboardContainer>
      <h1>Driver Dashboard</h1>
      <DashboardGrid>
        <DashboardCard to="/user/tracking">
          <h3>Live Route Tracking</h3>
          <p>View and track your current route</p>
        </DashboardCard>
        
        <DashboardCard to="/user/routes">
          <h3>My Routes</h3>
          <p>View your assigned routes</p>
        </DashboardCard>

        <DashboardCard to="/user/profile">
          <h3>Profile</h3>
          <p>View and edit your profile</p>
        </DashboardCard>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default UserDashboard; 