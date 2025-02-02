import React, { useState } from 'react';
import styled from 'styled-components';
import RouteList from '../components/RouteList';
import SearchBar from '../components/SearchBar';
import CreateRouteButton from '../components/CreateRouteButton';
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

const RouteManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <PageContainer>
      <Sidebar />
      <ContentContainer>
        <Title>Route Management</Title>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <CreateRouteButton />
        <RouteList searchTerm={searchTerm} />
      </ContentContainer>
    </PageContainer>
  );
};

export default RouteManagement; 