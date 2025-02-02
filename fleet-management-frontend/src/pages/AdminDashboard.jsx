import React from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import RouteOverview from '../components/RouteOverview';
import FleetOverview from '../components/FleetOverview';
import UserOverview from '../components/UserOverview';
import RecentActivities from '../components/RecentActivities';

const DashboardContainer = styled.div`
  display: flex;
`;

const MainContent = styled.div`
  padding: 20px;
  flex: 1;
  margin-left: 250px;
`;


const AdminDashboard = () => {
  return (
    <DashboardContainer>
      <Sidebar />
      <MainContent>
        <Header title="Admin Dashboard" />
        <RouteOverview />
        <FleetOverview />
        <UserOverview />
        <RecentActivities />
      </MainContent>
    </DashboardContainer>
  );
};

export default AdminDashboard; 