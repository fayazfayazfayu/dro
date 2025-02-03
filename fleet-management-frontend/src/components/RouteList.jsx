import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import RouteModal from './RouteModal';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background-color: #1A1B4B;
  color: white;
  padding: 10px;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f1f1f1;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  background-color: #1A1B4B;
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #2C2D5B;
  }
`;

const RouteList = ({ searchTerm }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optimizedRoutes, setOptimizedRoutes] = useState({});
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/routes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        });
        setRoutes(response.data);
      } catch (err) {
        setError(err.response ? err.response.data.message : 'Error fetching routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/routes/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
  
      setRoutes(routes.map(route => (route.id === id ? { ...route, status: newStatus } : route)));
  
      if (newStatus === "IN_PROGRESS") {
        const route = routes.find(r => r.id === id);
        if (route) {
          const [startLat, startLon] = route.startPoint.split(" ").map(coord => parseFloat(coord));
          const [endLat, endLon] = route.endPoint.split(" ").map(coord => parseFloat(coord));
  
          const requestBody = {
            depot: { lat: startLat, lon: startLon, name: route.name },
            destinations: [{ lat: endLat, lon: endLon, name: route.name }]
          };
  
          // Set route and get route_id
          const setRouteResponse = await axios.post('http://localhost:8000/set-route', requestBody);
          const routeId = setRouteResponse.data.route_id;
  
          // Get optimized route using the route_id
          const optimizedResponse = await axios.get(`http://localhost:8000/optimized-route/${routeId}`);
          setOptimizedRoutes(prev => ({ ...prev, [id]: optimizedResponse.data.optimized_route }));
          
          alert(`Route optimized successfully! Route ID: ${routeId}`);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update route status.');
    }
  };

  const handleOptimize = async (id) => {
    try {
      const route = routes.find(r => r.id === id);
      if (route) {
        // Check if user has multiple routes
        const userRoutes = routes.filter(r => r.userId === route.userId);
        
        if (userRoutes.length > 1) {
          // Multi-point optimization (existing code)
          const response = await axios.post(
            'http://localhost:8000/optimize-multi-point',
            {
              user_id: route.userId,
              routes: userRoutes
            }
          );

          const optimizedRoute = {
            ...response.data.optimized_route,
            route_id: response.data.route_id
          };
          
          setOptimizedRoutes(prev => ({ ...prev, [id]: optimizedRoute }));
          setSelectedRoute({ ...route, isMultiPoint: true });
          setIsModalOpen(true);
        } else {
          // Single route optimization
          const [startLat, startLon] = route.startPoint.split(" ").map(coord => parseFloat(coord));
          const [endLat, endLon] = route.endPoint.split(" ").map(coord => parseFloat(coord));

          const requestBody = {
            depot: { 
              lat: startLat, 
              lon: startLon, 
              name: `Start: ${route.name}` 
            },
            destinations: [{
              lat: endLat,
              lon: endLon,
              name: `End: ${route.name}`,
              route_id: route.id,
              stop_number: 1
            }]
          };

          const setRouteResponse = await axios.post('http://localhost:8000/set-route', requestBody);
          const routeId = setRouteResponse.data.route_id;

          const optimizedResponse = await axios.get(`http://localhost:8000/optimized-route/${routeId}`);
          
          // Format single route response to match multi-point structure
          const optimizedRoute = {
            ...optimizedResponse.data.optimized_route,
            route_id: routeId,
            stops: [{
              number: 1,
              name: `End: ${route.name}`,
              route_id: route.id,
              coordinates: {
                lat: endLat,
                lon: endLon
              }
            }],
            // Ensure distance is properly set from the response
            total_distance: optimizedResponse.data.optimized_route.distance,
            distance: optimizedResponse.data.optimized_route.distance,
            geometry: optimizedResponse.data.optimized_route.geometry,
            traffic_segments: optimizedResponse.data.optimized_route.traffic_segments || []
          };
          
          console.log('Optimized route data:', optimizedRoute); // Debug log
          
          setOptimizedRoutes(prev => ({ ...prev, [id]: optimizedRoute }));
          setSelectedRoute({ ...route, isMultiPoint: false });
          setIsModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Error fetching optimized route:', err);
      alert('Failed to retrieve optimized route.');
    }
  };

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.endPoint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading routes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <Table>
        <thead>
          <tr>
            <TableHeader>Route Name</TableHeader>
            <TableHeader>Start Point</TableHeader>
            <TableHeader>End Point</TableHeader>
            <TableHeader>Distance</TableHeader>
            <TableHeader>Duration</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Optimized Route</TableHeader>
          </tr>
        </thead>
        <tbody>
          {filteredRoutes.map(route => (
            <TableRow key={route.id}>
              <TableCell>{route.name}</TableCell>
              <TableCell>{route.startPoint}</TableCell>
              <TableCell>{route.endPoint}</TableCell>
              <TableCell>{route.distance} km</TableCell>
              <TableCell>{route.duration} min</TableCell>
              <TableCell>
                <select
                  value={route.status}
                  onChange={(e) => handleStatusChange(route.id, e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleOptimize(route.id)}>Route</Button>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>

      <RouteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        route={selectedRoute}
        optimizedRoute={selectedRoute ? optimizedRoutes[selectedRoute.id] : null}
      />
    </>
  );
};

export default RouteList;