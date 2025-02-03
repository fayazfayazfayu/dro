import React, { useEffect, useRef, useState } from 'react';
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

const AlertIcon = styled.div`
    .traffic-alert-icon {
        width: 30px;
        height: 30px;
    }
    
    .alert-icon {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid white;
    }
    
    .alert-icon.high {
        background-color: #FF0000;
        animation: pulse 1s infinite;
    }
    
    .alert-icon.medium {
        background-color: #FFA500;
    }
    
    .alert-icon.low {
        background-color: #4A90E2;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
`;

const RouteMap = ({ depot, destinations, routeData }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const routingControl = useRef(null);

  const [liveUpdates, setLiveUpdates] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const getTrafficColor = (currentSpeed, freeFlowSpeed) => {
    if (!currentSpeed || !freeFlowSpeed) return '#4A90E2'; // default blue
    const ratio = currentSpeed / freeFlowSpeed;
    if (ratio > 0.8) return '#4A90E2'; // blue for low traffic
    if (ratio > 0.4) return '#FFA500'; // orange for medium traffic
    return '#FF0000'; // red for high traffic
  };

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

    if (routeData && routeData.legs) {
      routeData.legs.forEach((leg, legIndex) => {
        const coordinates = leg.points.map(point => [point.latitude, point.longitude]);
        const trafficData = routeData.traffic_data?.[legIndex]?.traffic?.flowSegmentData;
        
        const color = getTrafficColor(
          trafficData?.currentSpeed,
          trafficData?.freeFlowSpeed
        );

        L.polyline(coordinates, {
          color: color,
          weight: 6,
          opacity: 0.8
        }).addTo(leafletMap.current);
      });
    }

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
  }, [depot, destinations, routeData]);

  // Simulate current position updates (replace with real GPS data in production)
  useEffect(() => {
    if (!routeData?.route_id) return;
    
    const updatePosition = () => {
      // Simulate movement along the route
      if (routeData.geometry?.coordinates?.length > 0) {
        const nextPoint = routeData.geometry.coordinates[0];
        setCurrentPosition({
          lat: nextPoint[1],
          lon: nextPoint[0]
        });
      }
    };
    
    const positionInterval = setInterval(updatePosition, 10000); // Update every 10s
    return () => clearInterval(positionInterval);
  }, [routeData]);
  
  // Fetch live updates
  useEffect(() => {
    if (!routeData?.route_id || !currentPosition) return;
    
    const fetchUpdates = async () => {
      try {
        setLastUpdateTime(new Date().toLocaleTimeString());
        console.log(`Checking for updates at: ${new Date().toLocaleTimeString()}`);
        
        const response = await fetch(
          `/route-updates/${routeData.route_id}?` +
          `current_lat=${currentPosition.lat}&` +
          `current_lon=${currentPosition.lon}`
        );
        const updates = await response.json();
        console.log('Update received:', updates);
        
        setLiveUpdates(updates);
        
        // Handle rerouting if needed
        if (updates.needs_rerouting && updates.alternative_route) {
          updateRouteDisplay(updates.alternative_route);
        }
        
        // Display traffic alerts
        updates.traffic_alerts.forEach(alert => {
          showTrafficAlert(alert);
        });
        
      } catch (error) {
        console.error('Failed to fetch route updates:', error);
      }
    };
    
    const updateInterval = setInterval(fetchUpdates, 30000); // Update every 30s
    return () => clearInterval(updateInterval);
  }, [routeData, currentPosition]);
  
  const showTrafficAlert = (alert) => {
    if (!leafletMap.current) return;
    
    // Add traffic alert marker
    L.marker([alert.coordinates.lat, alert.coordinates.lon], {
      icon: L.divIcon({
        className: 'traffic-alert-icon',
        html: `<div class="alert-icon ${alert.severity.toLowerCase()}"></div>`
      })
    })
    .bindPopup(alert.message)
    .addTo(leafletMap.current);
  };
  
  const updateRouteDisplay = (newRoute) => {
    if (!leafletMap.current) return;
    
    // Clear existing route
    leafletMap.current.eachLayer(layer => {
      if (layer instanceof L.Polyline) {
        leafletMap.current.removeLayer(layer);
      }
    });
    
    // Draw new route
    if (newRoute.geometry?.coordinates) {
      const coordinates = newRoute.geometry.coordinates.map(
        coord => [coord[1], coord[0]]
      );
      
      L.polyline(coordinates, {
        color: '#4A90E2',
        weight: 6,
        opacity: 0.8
      }).addTo(leafletMap.current);
    }
  };

  return (
    <>
      <MapContainer ref={mapRef}>
        {routeData && (
          <RouteInfo>
            <h3>Route Details</h3>
            <p>Distance: {(routeData.summary?.totalDistanceInMeters / 1000).toFixed(2)} km</p>
            <p>Duration: {Math.round(routeData.summary?.totalTimeInSeconds / 60)} mins</p>
            {lastUpdateTime && (
              <p>Last Update: {lastUpdateTime}</p>
            )}
          </RouteInfo>
        )}
      </MapContainer>
    </>
  );
};

export default RouteMap;