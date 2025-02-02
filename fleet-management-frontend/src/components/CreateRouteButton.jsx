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

const CreateRouteButton = () => {
  const [formData, setFormData] = useState({
    name: '',
    startPoint: '',
    endPoint: '',
    distance: '',
    duration: '',
    userId: '',
    vehicleId: '',
  });

  const handleChange = (e) => {
    console.log(`Changing field: ${e.target.name}, New Value: ${e.target.value}`);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);

    const token = localStorage.getItem('adminToken');
    if (!token) {
      console.error('No admin token found in localStorage');
      alert('Authentication token missing. Please log in again.');
      return;
    }

    // Ensure distance and duration are numbers
    const formattedData = {
      ...formData,
      distance: parseFloat(formData.distance),
      duration: parseFloat(formData.duration),
    };

    console.log('Formatted data:', formattedData);

    try {
      const response = await axios.post('http://localhost:5000/api/routes', formattedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Route created successfully:', response.data);
      alert('Route created successfully!');
      setFormData({
        name: '',
        startPoint: '',
        endPoint: '',
        distance: '',
        duration: '',
        userId: '',
        vehicleId: '',
      });
    } catch (error) {
      console.error('Error creating route:', error.response ? error.response.data : error.message);
      alert('Failed to create route. Check console for details.');
    }
  };

  return (
    <FormContainer>
      <h3>Create New Route</h3>
      <form onSubmit={handleSubmit}>
        <Input type="text" name="name" placeholder="Route Name" value={formData.name} onChange={handleChange} required />
        <Input type="text" name="startPoint" placeholder="Start Point" value={formData.startPoint} onChange={handleChange} required />
        <Input type="text" name="endPoint" placeholder="End Point" value={formData.endPoint} onChange={handleChange} required />
        <Input type="number" name="distance" placeholder="Distance (in km)" value={formData.distance} onChange={handleChange} required />
        <Input type="number" name="duration" placeholder="Duration (in minutes)" value={formData.duration} onChange={handleChange} required />
        <Input type="text" name="userId" placeholder="User ID" value={formData.userId} onChange={handleChange} required />
        <Input type="text" name="vehicleId" placeholder="Vehicle ID" value={formData.vehicleId} onChange={handleChange} required />
        <Button type="submit">Create Route</Button>
      </form>
    </FormContainer>
  );
};

export default CreateRouteButton;