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
  const [routeUpdateInterval, setRouteUpdateInterval] = useState(null);

  const getTrafficColor = (currentSpeed, freeFlowSpeed) => {
    if (!currentSpeed || !freeFlowSpeed) return '#4A90E2'; // default blue
    const ratio = currentSpeed / freeFlowSpeed;
    if (ratio > 0.8) return '#4A90E2'; // blue for low traffic
    if (ratio > 0.4) return '#FFA500'; // orange for medium traffic
    return '#FF0000'; // red for high traffic
  };

  useEffect(() => {
    console.log('RouteMap Data:', {
      depot,
      destinations,
      routeData
    });

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
    if (!leafletMap.current || !depot || !destinations.length) return;

    // Clear existing markers
    leafletMap.current.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        leafletMap.current.removeLayer(layer);
      }
    });

    // Add depot marker with custom icon
    const depotIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #1A1B4B; color: white; padding: 5px; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">D</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    L.marker([depot.lat, depot.lon], { icon: depotIcon })
      .bindPopup(`Depot: ${depot.name}`)
      .addTo(leafletMap.current);

    // Add numbered markers for stops
    if (routeData?.stops) {
      routeData.stops.forEach((stop) => {
        const stopIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #4A90E2; color: white; padding: 5px; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">${stop.number}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        L.marker([stop.coordinates.lat, stop.coordinates.lon], { icon: stopIcon })
          .bindPopup(`Stop ${stop.number}: ${stop.name}`)
          .addTo(leafletMap.current);
      });

      // Draw route path if coordinates exist
      if (routeData.geometry?.coordinates) {
        const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        L.polyline(coordinates, {
          color: '#4A90E2',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 10'  // Makes the line dashed
        }).addTo(leafletMap.current);
      }
    }

    // Fit map to show all points
    const allPoints = [
      [depot.lat, depot.lon],
      ...(routeData?.stops 
        ? routeData.stops.map(stop => [stop.coordinates.lat, stop.coordinates.lon])
        : destinations.map(dest => [dest.lat, dest.lon]))
    ];
    
    const bounds = L.latLngBounds(allPoints);
    leafletMap.current.fitBounds(bounds, { padding: [50, 50] });

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

  // Add new useEffect for route updates
  useEffect(() => {
    if (!routeData?.route_id) return;

    const fetchRouteUpdate = async () => {
      try {
        const response = await fetch(`http://localhost:8000/route-update/${routeData.route_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            depot: depot,
            destinations: destinations,
            current_route: routeData
          }),
        });

        const updatedRoute = await response.json();
        
        if (updatedRoute.needs_rerouting) {
          // Update route display with new route
          updateRouteDisplay(updatedRoute.alternative_route);
          
          // Show alert about rerouting
          const alertMessage = updatedRoute.traffic_alerts
            .map(alert => alert.message)
            .join('\n');
          alert(`Route updated due to traffic conditions:\n${alertMessage}`);
        }

        setLastUpdateTime(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Failed to update route:', error);
      }
    };

    // Set up 30-second interval for updates
    const intervalId = setInterval(fetchRouteUpdate, 30000);
    setRouteUpdateInterval(intervalId);

    // Initial fetch
    fetchRouteUpdate();

    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [routeData?.route_id, depot, destinations]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div ref={mapRef} style={{ height: '100%' }} />
      {routeData && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'white',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <h3>Route Details</h3>
          <p>Distance: {((routeData.total_distance || routeData.distance) / 1000).toFixed(2)} km</p>
          <p>Stops: {routeData.stops?.length || 0}</p>
          <p>Last Update: {new Date().toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
};

export default RouteMap;