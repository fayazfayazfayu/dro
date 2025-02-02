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

const UserOverview = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`, // Make sure to include the token
          },
        });

        setUsers(response.data); // Store the users in the state
      } catch (err) {
        setError('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Calculate total, active, and inactive user counts
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <OverviewContainer>
      <Title>User Overview</Title>
      <Metrics>
        <Metric>Total Users: {totalUsers}</Metric>
        <Metric>Active Users: {activeUsers}</Metric>
        <Metric>Inactive Users: {inactiveUsers}</Metric>
      </Metrics>
    </OverviewContainer>
  );
};

export default UserOverview;
