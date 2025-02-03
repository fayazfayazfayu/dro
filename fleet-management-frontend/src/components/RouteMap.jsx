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

    // Initialize map only once
    leafletMap.current = L.map(mapRef.current).setView([51.505, -0.09], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(leafletMap.current);

    return () => {
      // Cleanup map on unmount
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMap.current || !depot || destinations.length === 0) return;

    // Clean up previous routing control if it exists
    if (routingControl.current && leafletMap.current) {
      try {
        if (leafletMap.current && routingControl.current) {
          leafletMap.current.removeControl(routingControl.current);
        }
      } catch (error) {
        console.error('Error removing routing control:', error);
      }
      routingControl.current = null; // Reset routing control to avoid conflict
    }

    // Clear previous markers and lines from the map
    if (leafletMap.current) {
      leafletMap.current.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          leafletMap.current.removeLayer(layer);
        }
      });
    }

    // Create waypoints array
    const waypoints = [
      L.latLng(depot.lat, depot.lon),
      ...destinations.map(dest => L.latLng(dest.lat, dest.lon)),
    ];

    // Add depot marker
    const depotMarker = L.marker([depot.lat, depot.lon])
      .bindPopup(`Depot: ${depot.name}`)
      .addTo(leafletMap.current);

    // Add destination markers
    destinations.forEach((dest, index) => {
      L.marker([dest.lat, dest.lon])
        .bindPopup(`Destination ${index + 1}: ${dest.name}`)
        .addTo(leafletMap.current);
    });

    // Initialize routing control if not already initialized
    if (!routingControl.current) {
      routingControl.current = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        showAlternatives: true,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: '#4A90E2', weight: 6 }],
        },
      }).addTo(leafletMap.current);
    }

    // Fit map bounds
    const bounds = L.latLngBounds(waypoints);
    leafletMap.current.fitBounds(bounds, { padding: [50, 50] });

    // Cleanup routing control when component unmounts or dependencies change
    return () => {
      if (leafletMap.current && routingControl.current) {
        try {
          leafletMap.current.removeControl(routingControl.current);
        } catch (error) {
          console.error('Error during cleanup of routing control:', error);
        }
        routingControl.current = null; // Reset to avoid conflicts
      }

      // Cleanup all layers on unmount
      if (leafletMap.current) {
        leafletMap.current.eachLayer(layer => {
          if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            leafletMap.current.removeLayer(layer);
          }
        });
      }
    };
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