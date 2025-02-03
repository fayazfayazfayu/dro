import React from 'react';
import styled from 'styled-components';
import RouteMap from './RouteMap';
import TrafficTable from './TrafficTable';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  height: 80%;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
  &:hover {
    color: #666;
  }
`;

const ContentLayout = styled.div`
  display: flex;
  height: 100%;
  gap: 20px;
  margin-top: 20px;
`;

const MapContainer = styled.div`
  flex: 1;
  height: 70vh;
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
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <h2>Route Details: {route.name}</h2>
        <ContentLayout>
          <MapContainer>
            <RouteMap
              depot={depot}
              destinations={destinations}
              routeData={optimizedRoute}
            />
          </MapContainer>
          <TrafficTable trafficData={optimizedRoute} />
        </ContentLayout>
      </ModalContent>
    </ModalOverlay>
  );
};

export default RouteModal;