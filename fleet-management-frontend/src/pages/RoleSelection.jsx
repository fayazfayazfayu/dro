import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url('path/to/your/background-image.jpg') no-repeat center center fixed;
  background-size: cover;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const RoleButton = styled.button`
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #1A1B4B;
  color: white;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #141A4B;
  }
`;

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin/login');
        break;
      case 'user':
        navigate('/user/login');
        break;
      default:
        break;
    }
  };

  return (
    <PageContainer>
      <Title>Select Your Role</Title>
      <RoleButton onClick={() => handleRoleSelect('admin')}>Admin</RoleButton>
      <RoleButton onClick={() => handleRoleSelect('user')}>User</RoleButton>
    </PageContainer>
  );
};

export default RoleSelection;