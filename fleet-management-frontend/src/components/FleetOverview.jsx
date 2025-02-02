import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const OverviewContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: #eaeaea;
  border-radius: 5px;
`;

const Title = styled.h2``;

const Metrics = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Metric = styled.div`
  padding: 10px;
  background-color: #1A1B4B;
  color: white;
  border-radius: 5px;
`;

const FleetOverview = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      const token = localStorage.getItem('adminToken'); // Retrieve the admin token
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles', {
          headers: {
            Authorization: `Bearer ${token}`, // Correctly include the token in the headers
          },
        });
        setVehicles(response.data); // Store vehicles in state
      } catch (err) {
        setError(err.response ? err.response.data.message : 'Error fetching vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  if (loading) return <p>Loading fleet overview...</p>;
  if (error) return <p>{error}</p>;

  const totalVehicles = vehicles.length;
  const assignedVehicles = vehicles.filter(vehicle => vehicle.userId !== null).length;
  const unassignedVehicles = totalVehicles - assignedVehicles;

  return (
    <OverviewContainer>
      <Title>Fleet Overview</Title>
      <Metrics>
        <Metric>Total Vehicles: {totalVehicles}</Metric>
        <Metric>Assigned Vehicles: {assignedVehicles}</Metric>
        <Metric>Unassigned Vehicles: {unassignedVehicles}</Metric>
      </Metrics>
    </OverviewContainer>
  );
};

export default FleetOverview;
