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
  background-color: #1a1b4b;
  color: white;
  border-radius: 5px;
`;

const RouteOverview = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/routes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`, // Include token if necessary
          },
        });

        setRoutes(response.data); // Store routes data
      } catch (err) {
        setError('Error fetching routes data');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Calculate route statuses
  const totalRoutes = routes.length;
  const inProgressRoutes = routes.filter(route => route.status === 'IN_PROGRESS').length;
  const completedRoutes = routes.filter(route => route.status === 'COMPLETED').length;
  const pendingRoutes = routes.filter(route => route.status === 'PENDING').length;

  return (
    <OverviewContainer>
      <Title>Route Overview</Title>
      <Metrics>
        <Metric>Total Routes: {totalRoutes}</Metric>
        <Metric>In Progress: {inProgressRoutes}</Metric>
        <Metric>Completed: {completedRoutes}</Metric>
        <Metric>Pending: {pendingRoutes}</Metric>
      </Metrics>
    </OverviewContainer>
  );
};

export default RouteOverview;
