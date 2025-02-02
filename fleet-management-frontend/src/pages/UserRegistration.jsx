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

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await axios.post('/api/user/register', formData); // Adjust the URL as needed
  };

  return (
    <PageContainer>
      <Title>User Registration</Title>
      <form onSubmit={handleRegister}>
        <Input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Button type="submit">Register</Button>
      </form>
    </PageContainer>
  );
};

export default UserRegistration;