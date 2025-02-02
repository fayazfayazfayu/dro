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

const VehicleList = ({ searchTerm }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      const token = localStorage.getItem('adminToken'); // Retrieve the admin token
      try {
        const response = await axios.get('http://localhost:5000/api/vehicles', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`, // Correctly include the token in the headers
          },
        });
        setVehicles(response.data); // Assuming the response data is an array of vehicles
      } catch (err) {
        setError(err.response ? err.response.data.message : 'Error fetching vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Table>
      <thead>
        <tr>
          <TableHeader>Registration Number</TableHeader>
          <TableHeader>Model</TableHeader>
          <TableHeader>Capacity</TableHeader>
          <TableHeader>Fuel Type</TableHeader>
          <TableHeader>Actions</TableHeader>
        </tr>
      </thead>
      <tbody>
        {filteredVehicles.map(vehicle => (
          <TableRow key={vehicle.id}>
            <TableCell>{vehicle.registrationNumber}</TableCell>
            <TableCell>{vehicle.model}</TableCell>
            <TableCell>{vehicle.capacity}</TableCell>
            <TableCell>{vehicle.fuelType}</TableCell>
            <TableCell>
              <button>Edit</button>
              <button>Delete</button>
              <button>Assign</button>
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};

export default VehicleList;
