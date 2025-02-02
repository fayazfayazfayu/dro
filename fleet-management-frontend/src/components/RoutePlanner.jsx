import React, { useState } from 'react';
import RouteMap from './RouteMap';
import PlaceSearch from './PlaceSearch';
import axios from 'axios';
import styled from 'styled-components';

const PlannerContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  padding: 20px;
`;

const LocationsPanel = styled.div`
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const LocationList = styled.div`
  margin-top: 20px;
`;

const LocationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const CalculateButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 20px;
  cursor: pointer;
  font-weight: bold;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #357abd;
  }
`;

const RoutePlanner = () => {
  const [depot, setDepot] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [routeData, setRouteData] = useState(null);

  const handleDepotSelect = (place) => {
    setDepot({
      lat: place.position.lat,
      lon: place.position.lon,
      name: place.text
    });
  };

  const handleDestinationSelect = (place) => {
    setDestinations([...destinations, {
      lat: place.position.lat,
      lon: place.position.lon,
      name: place.text
    }]);
  };

  const removeDestination = (index) => {
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  const calculateRoute = async () => {
    if (!depot || destinations.length === 0) {
      alert('Please select depot and at least one destination');
      return;
    }

    try {
      const response = await axios.post('/api/calculate-route', {
        depot,
        destinations,
        departure_time: new Date().toISOString()
      });
      setRouteData(response.data);
    } catch (error) {
      console.error('Route calculation failed:', error);
      alert('Failed to calculate route');
    }
  };

  return (
    <PlannerContainer>
      <LocationsPanel>
        <h3>Depot Location</h3>
        <PlaceSearch onPlaceSelect={handleDepotSelect} />
        {depot && (
          <LocationItem>
            <span>{depot.name}</span>
            <button onClick={() => setDepot(null)}>Remove</button>
          </LocationItem>
        )}

        <h3>Delivery Locations</h3>
        <PlaceSearch onPlaceSelect={handleDestinationSelect} />
        <LocationList>
          {destinations.map((dest, index) => (
            <LocationItem key={index}>
              <span>{dest.name}</span>
              <button onClick={() => removeDestination(index)}>Remove</button>
            </LocationItem>
          ))}
        </LocationList>

        <CalculateButton 
          onClick={calculateRoute}
          disabled={!depot || destinations.length === 0}
        >
          Calculate Route
        </CalculateButton>
      </LocationsPanel>

      <RouteMap 
        depot={depot}
        destinations={destinations}
        routeData={routeData}
      />
    </PlannerContainer>
  );
};

export default RoutePlanner; 