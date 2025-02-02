import React, { useState } from 'react';
import styled from 'styled-components';
import UserList from '../components/UserList';
import SearchBar from '../components/SearchBar';
import CreateUserButton from '../components/CreateUserButton';
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

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <PageContainer>
      <Sidebar />
      <ContentContainer>
        <Title>User Management</Title>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <CreateUserButton />
        <UserList searchTerm={searchTerm} />
      </ContentContainer>
    </PageContainer>
  );
};

export default UserManagement; 