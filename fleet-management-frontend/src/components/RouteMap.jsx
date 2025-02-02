import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 500px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const RouteInfo = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
`;

const RouteMap = ({ depot, destinations, routeData }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const routingControl = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    leafletMap.current = L.map(mapRef.current).setView([51.505, -0.09], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMap.current);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMap.current || !depot || !destinations.length) return;

    // Clear existing routing control
    if (routingControl.current) {
      leafletMap.current.removeControl(routingControl.current);
    }

    // Create waypoints array
    const waypoints = [
      L.latLng(depot.lat, depot.lon),
      ...destinations.map(dest => L.latLng(dest.lat, dest.lon))
    ];

    // Add markers
    const bounds = L.latLngBounds(waypoints);
    
    // Add depot marker
    L.marker([depot.lat, depot.lon])
      .bindPopup(`Depot: ${depot.name}`)
      .addTo(leafletMap.current);

    // Add destination markers
    destinations.forEach((dest, index) => {
      L.marker([dest.lat, dest.lon])
        .bindPopup(`Destination ${index + 1}: ${dest.name}`)
        .addTo(leafletMap.current);
    });

    // Add routing
    routingControl.current = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: true,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#4A90E2', weight: 6 }]
      }
    }).addTo(leafletMap.current);

    // Fit bounds with padding
    leafletMap.current.fitBounds(bounds, { padding: [50, 50] });

  }, [depot, destinations]);

  return (
    <MapContainer ref={mapRef}>
      {routeData && (
        <RouteInfo>
          <h3>Route Details</h3>
          <p>Distance: {(routeData.summary?.lengthInMeters / 1000).toFixed(2)} km</p>
          <p>Duration: {Math.round(routeData.summary?.travelTimeInSeconds / 60)} mins</p>
        </RouteInfo>
      )}
    </MapContainer>
  );
};

export default RouteMap; 