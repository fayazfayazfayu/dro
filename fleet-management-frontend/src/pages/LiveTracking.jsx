import React, { useState } from 'react';
import styled from 'styled-components';
import RouteMap from '../components/RouteMap';

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
`;

const TrackingContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 40px);
  max-width: 1400px;
  margin: 0 auto;
`;

const InfoPanel = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: fit-content;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'ACTIVE': return '#4CAF50';
      case 'PAUSED': return '#FFC107';
      case 'COMPLETED': return '#2196F3';
      default: return '#757575';
    }
  }};
  color: white;
`;

const MapContainer = styled.div`
  height: calc(100vh - 40px);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const LiveTracking = () => {
  const [currentRoute] = useState({
    depot: {
      lat: 51.5074,
      lon: -0.1278,
      name: "London Central Depot"
    },
    destinations: [
      {
        lat: 51.5225,
        lon: -0.1539,
        name: "Baker Street"
      },
      {
        lat: 51.4975,
        lon: -0.1357,
        name: "Westminster"
      },
      {
        lat: 51.5007,
        lon: -0.1246,
        name: "Covent Garden"
      }
    ],
    status: 'ACTIVE'
  });

  return (
    <PageContainer>
      <TrackingContainer>
        <InfoPanel>
          <h2>Live Route Tracking</h2>
          <div>
            <h3>Current Route</h3>
            <p><strong>Start:</strong> {currentRoute.depot.name}</p>
            <p>
              <strong>Status:</strong>{' '}
              <StatusBadge status={currentRoute.status}>
                {currentRoute.status}
              </StatusBadge>
            </p>
            <h4>Destinations:</h4>
            <ul>
              {currentRoute.destinations.map((dest, index) => (
                <li key={index}>{dest.name}</li>
              ))}
            </ul>
          </div>
        </InfoPanel>
        
        <MapContainer>
          <RouteMap 
            depot={currentRoute.depot}
            destinations={currentRoute.destinations}
          />
        </MapContainer>
      </TrackingContainer>
    </PageContainer>
  );
};

export default LiveTracking; 