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
  border-radius: 5px;
  border: 1px solid #ccc;
`;

const CreateVehicleButton = () => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    model: '',
    capacity: '',
    fuelType: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`); // Debugging statement

    // If the field is 'capacity', convert it to a float before updating the formData
    if (name === 'capacity') {
      const capacityValue = parseFloat(value) || ''; // Parse to float, or reset to empty string if invalid
      console.log(`Parsed capacity value: ${capacityValue}`); // Debugging statement
      setFormData({ ...formData, [name]: capacityValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCreateVehicle = async () => {
    console.log('Attempting to create vehicle with the following data:', formData); // Debugging statement
    const token = localStorage.getItem('adminToken'); // Retrieve the admin token
    console.log('Admin token:', token); // Debugging statement

    try {
      const response = await axios.post('http://localhost:5000/api/vehicles', formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Correctly include the token in the headers
        },
      });

      console.log('Vehicle creation response:', response); // Debugging statement
      alert('Vehicle created successfully!');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Failed to create vehicle. Please try again.');
    }
  };

  return (
    <FormContainer>
      <Input
        type="text"
        name="registrationNumber"
        placeholder="Registration Number"
        value={formData.registrationNumber}
        onChange={handleChange}
        required
      />
      <Input
        type="text"
        name="model"
        placeholder="Model"
        value={formData.model}
        onChange={handleChange}
        required
      />
      <Input
        type="number"
        name="capacity"
        placeholder="Capacity"
        value={formData.capacity}
        onChange={handleChange}
        required
      />
      <Input
        type="text"
        name="fuelType"
        placeholder="Fuel Type"
        value={formData.fuelType}
        onChange={handleChange}
        required
      />
      <Button onClick={handleCreateVehicle}>Create Vehicle</Button>
    </FormContainer>
  );
};

export default CreateVehicleButton;
