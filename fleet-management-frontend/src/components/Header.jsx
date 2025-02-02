import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f5f5f5;
`;

const Title = styled.h1`
  margin: 0;
`;

const LogoutButton = styled.button`
  padding: 10px 20px;
  background-color: #1A1B4B;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #141A4B;
  }
`;

const Header = ({ title }) => {
  const navigate = useNavigate();
  return (
    <HeaderContainer>
      <Title>{title}</Title>
      <LogoutButton onClick={() => navigate('/admin/login')}>Logout</LogoutButton>
    </HeaderContainer>
  );
};

export default Header; 