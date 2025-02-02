import React, { useState } from 'react';
import styled from 'styled-components';
import VehicleList from '../components/VehicleList';
import SearchBar from '../components/SearchBar';
import CreateVehicleButton from '../components/CreateVehicleButton';
import Sidebar from '../components/Sidebar';

const PageContainer = styled.div`
  display: flex;
`;

const ContentContainer = styled.div`
  padding: 20px;
  flex: 1;
  margin-left: 250px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;


const VehicleManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <PageContainer>
      <Sidebar />
      <ContentContainer>
        <Title>Vehicle Management</Title>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <CreateVehicleButton />
        <VehicleList searchTerm={searchTerm} />
      </ContentContainer>
    </PageContainer>
  );
};

export default VehicleManagement; 