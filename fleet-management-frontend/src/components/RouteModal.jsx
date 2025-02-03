import React from 'react';
import styled from 'styled-components';
import RouteMap from './RouteMap';
import TrafficTable from './TrafficTable';
import MLInsights from './MLInsights';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  width: 95%;
  height: 90vh;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #eef0f5;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    color: #1a1a1a;
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  height: calc(100% - 70px);
  overflow: hidden;
`;

const MainPanel = styled.div`
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const MapContainer = styled.div`
  height: 550px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const RouteDetails = styled.div`
  background: #f8f9fc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eef0f5;

  h3 {
    margin: 0 0 16px 0;
    color: #2c3e50;
  }

  p {
    margin: 8px 0;
    color: #4a5568;
  }
`;

const Delay = styled.p`
  color: #e53e3e;
  font-weight: 500;
`;

const MLPanel = styled.div`
  background: #f8f9fc;
  border-left: 1px solid #eef0f5;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  height: 100%;
`;

const TrafficContainer = styled.div`
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eef0f5;
  overflow: hidden;
`;

const RouteModal = ({ isOpen, onClose, route, optimizedRoute }) => {
  if (!isOpen) return null;

  const [startLat, startLon] = route.startPoint.split(" ").map(coord => parseFloat(coord));
  const [endLat, endLon] = route.endPoint.split(" ").map(coord => parseFloat(coord));

  const depot = {
    lat: startLat,
    lon: startLon,
    name: `Start: ${route.name}`
  };

  const destinations = [{
    lat: endLat,
    lon: endLon,
    name: `End: ${route.name}`
  }];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>Route Details: {route.name}</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <ContentGrid>
          <MainPanel>
            <MapContainer>
              <RouteMap
                depot={depot}
                destinations={destinations}
                routeData={optimizedRoute}
              />
            </MapContainer>

            <RouteDetails>
              <h3>Route Information</h3>
              <p><strong>Distance:</strong> {route.distance} km</p>
              <p><strong>Stops:</strong> {route.stops || 1}</p>
              <p><strong>ETA:</strong> {route.eta}</p>
              <p><strong>Traffic Conditions:</strong> {route.trafficConditions}</p>
              {route.delay && <Delay>Delay: {route.delay}</Delay>}
            </RouteDetails>
          </MainPanel>

          <SidePanel>
            <MLPanel>
              <MLInsights route={route} />
            </MLPanel>
            
            <TrafficContainer>
              {/* <h3>Traffic Information</h3>
              <TrafficTable trafficData={optimizedRoute} /> */}
            </TrafficContainer>
          </SidePanel>
        </ContentGrid>
      </ModalContent>
    </ModalOverlay>
  );
};

export default RouteModal;