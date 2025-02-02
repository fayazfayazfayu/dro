import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url('path/to/your/background-image.jpg') no-repeat center center fixed;
  background-size: cover;
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const Input = styled.input`
  margin: 10px;
  padding: 10px;
  width: 200px;
`;

const Button = styled.button`
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

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    await axios.post('/api/user/login', { email, password }); // Adjust the URL as needed
  };

  return (
    <PageContainer>
      <Title>User Login</Title>
      <form onSubmit={handleLogin}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">Login</Button>
      </form>
      <p>New user? <a href="/user-registration">Register here</a></p>
    </PageContainer>
  );
};

export default UserLogin;
