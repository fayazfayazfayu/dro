import React from 'react';
import styled from 'styled-components';

const ActivitiesContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: #eaeaea;
  border-radius: 5px;
`;

const Title = styled.h2``;

const Activity = styled.div`
  margin: 5px 0;
`;

const RecentActivities = () => {
  return (
    <ActivitiesContainer>
      <Title>Recent Activities</Title>
      <Activity>Updated Route 1</Activity>
      <Activity>Assigned Vehicle 5</Activity>
      <Activity>Added User John Doe</Activity>
    </ActivitiesContainer>
  );
};

export default RecentActivities; 