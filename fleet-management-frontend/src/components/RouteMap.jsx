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

const UpdateIndicator = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
`;

const getCongestionStyle = (level) => {
  switch (level) {
    case 'High':
      return { color: '#ff4444', text: 'High' };
    case 'Medium':
      return { color: '#ffa700', text: 'Medium' };
    case 'Low':
      return { color: '#44b700', text: 'Low' };
    default:
      return { color: '#44b700', text: 'Low' };
  }
};

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

    // Clear previous layers
    leafletMap.current.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        leafletMap.current.removeLayer(layer);
      }
    });

    // Add depot marker
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
    }

    // Draw route with arrows
    if (routeData?.geometry?.coordinates) {
      const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      
      // Draw main route line
      const routeLine = L.polyline(coordinates, {
        color: '#4A90E2',
        weight: 4,
        opacity: 0.8
      }).addTo(leafletMap.current);

      // Add arrows at regular intervals
      const totalDistance = routeData.distance;
      const arrowCount = 5; // Reduced number of arrows
      const distanceInterval = totalDistance / (arrowCount + 1);
      
      let distanceCovered = distanceInterval;
      let lastPoint = coordinates[0];
      
      for (let i = 1; i < coordinates.length && distanceCovered < totalDistance; i++) {
        const point = coordinates[i];
        const segmentDistance = L.latLng(lastPoint).distanceTo(L.latLng(point));
        
        if (segmentDistance > 0) {
          const angle = Math.atan2(point[1] - lastPoint[1], point[0] - lastPoint[0]) * 180 / Math.PI;
          
          // Create arrow marker
          const arrowIcon = L.divIcon({
            html: `<div style="transform: rotate(${angle}deg);">➤</div>`,
            className: 'arrow-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          
          L.marker([lastPoint[0], lastPoint[1]], {
            icon: arrowIcon
          }).addTo(leafletMap.current);
          
          distanceCovered += distanceInterval;
        }
        
        lastPoint = point;
      }
    }

    // Fit map bounds
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

  // Update the fetchRouteUpdate function with better logging
  const fetchRouteUpdate = async () => {
    try {
      console.log('Fetching route update...', new Date().toLocaleTimeString());
      
      if (!routeData || !routeData.route_id) {
        console.error('No route data available for update');
        return;
      }

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Route update received:', {
        timestamp: new Date().toLocaleTimeString(),
        trafficSegments: data.optimized_route.traffic_segments?.length,
        trafficConditions: data.optimized_route.traffic_conditions
      });
      
      if (data.optimized_route) {
        updateRouteDisplay(data.optimized_route);
        setLastUpdateTime(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to update route:', error);
    }
  };

  // Update the useEffect for route updates with immediate first update
  useEffect(() => {
    if (!routeData?.route_id || !depot || !destinations.length) {
      console.log('Missing required data for updates');
      return;
    }

    console.log('Setting up route updates...');
    
    // Initial fetch
    fetchRouteUpdate();

    // Set up interval for updates - every 10 seconds
    const intervalId = setInterval(fetchRouteUpdate, 10000);
    console.log('Update interval set:', intervalId);

    // Cleanup interval on unmount
    return () => {
      console.log('Cleaning up update interval:', intervalId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [routeData?.route_id, depot, destinations]);

  // Update the traffic information table
  const TrafficTable = ({ segments }) => (
    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, background: '#1A1B4B', color: 'white' }}>
          <tr>
            <th>Time</th>
            <th>Distance (km)</th>
            <th>Speed (km/h)</th>
            <th>Congestion</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((segment, index) => {
            const style = getCongestionStyle(segment.congestion_level);
            return (
              <tr key={index}>
                <td>{new Date(segment.timestamp).toLocaleTimeString()}</td>
                <td>{(segment.distance_covered / 1000).toFixed(2)}</td>
                <td>{segment.current_speed}</td>
                <td style={{ color: style.color, fontWeight: 'bold' }}>
                  {style.text}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div ref={mapRef} style={{ height: '100%' }} />
      {routeData && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1000,
          maxWidth: '400px'
        }}>
          <h3 style={{ marginTop: 0 }}>Route Details</h3>
          <p>Distance: {(routeData.distance / 1000).toFixed(2)} km</p>
          <p>Stops: {routeData.stops?.length || 0}</p>
          <p>ETA: {new Date(routeData.eta).toLocaleTimeString()}</p>
          <p>Traffic Conditions: {routeData.traffic_conditions?.summary}</p>
          {routeData.traffic_conditions?.delay_minutes > 0 && (
            <p style={{ color: '#ff4444' }}>
              Delay: {routeData.traffic_conditions.delay_minutes} minutes
            </p>
          )}
          <h4>Traffic Information</h4>
          {routeData.traffic_segments && (
            <TrafficTable segments={routeData.traffic_segments} />
          )}
        </div>
      )}
      {lastUpdateTime && (
        <UpdateIndicator>
          Last Update: {lastUpdateTime}
        </UpdateIndicator>
      )}
    </div>
  );
};

export default RouteMap;