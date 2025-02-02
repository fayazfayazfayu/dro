import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Button = styled.button`
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

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;
`;

const Input = styled.input`
  margin: 10px 0;
  padding: 10px;
`;

const CreateUserButton = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    licenseNumber: '',
    phoneNumber: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async () => {
    const token = localStorage.getItem('adminToken'); // Retrieve the admin token

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      });
      alert('User created successfully!');
      console.log(response.data); // Log the response data
      // Optionally, reset the form or redirect the user
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  return (
    <FormContainer>
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
      <Input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleChange}
        required
      />
      <Input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        required
      />
      <Input
        type="text"
        name="licenseNumber"
        placeholder="License Number"
        value={formData.licenseNumber}
        onChange={handleChange}
        required
      />
      <Input
        type="text"
        name="phoneNumber"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={handleChange}
        required
      />
      <Button onClick={handleCreateUser}>Create User</Button>
    </FormContainer>
  );
};

export default CreateUserButton; 