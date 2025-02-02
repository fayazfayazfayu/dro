import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

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

const RouteList = ({ searchTerm }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/api/routes', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          }, // Include the token in the headers
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

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/routes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        }, // Include the token in the headers
      });
      setRoutes(routes.filter(route => route.id !== id)); // Remove the deleted route from the state
      alert('Route deleted successfully!');
    } catch (err) {
      console.error('Error deleting route:', err);
      alert('Failed to delete route. Please try again.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:5000/api/routes/${id}/status`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        }, // Include the token in the headers
      });
      setRoutes(routes.map(route => (route.id === id ? { ...route, status: newStatus } : route)));
      alert('Route status updated successfully!');
    } catch (err) {
      console.error('Error updating route status:', err);
      alert('Failed to update route status. Please try again.');
    }
  };

  const handleEdit = (id) => {
    // Implement edit functionality (e.g., open a modal or navigate to an edit page)
    alert(`Edit functionality for route ID: ${id} is not implemented yet.`);
  };

  const handleOptimize = (id) => {
    // Implement optimize functionality
    alert(`Optimize functionality for route ID: ${id} is not implemented yet.`);
  };

  const handleAssign = (id) => {
    // Implement assign functionality
    alert(`Assign functionality for route ID: ${id} is not implemented yet.`);
  };

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.endPoint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading routes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Table>
      <thead>
        <tr>
          <TableHeader>Route Name</TableHeader>
          <TableHeader>Start Point</TableHeader>
          <TableHeader>End Point</TableHeader>
          <TableHeader>Distance</TableHeader>
          <TableHeader>Duration</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Actions</TableHeader>
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
              <button onClick={() => handleEdit(route.id)}>Edit</button>
              <button onClick={() => handleDelete(route.id)}>Delete</button>
              <button onClick={() => handleOptimize(route.id)}>Optimize</button>
              <button onClick={() => handleAssign(route.id)}>Assign</button>
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};

export default RouteList; 