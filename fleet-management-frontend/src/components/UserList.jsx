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

const UserList = ({ searchTerm }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`, // Correctly include the token in the headers
          },
        });
        setUsers(response.data); // Assuming the response data is an array of users
      } catch (err) {
        setError(err.response ? err.response.data.message : 'Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Convert 'Active' to true and 'Inactive' to false
      const isActive = newStatus === 'Active'; 
  
      await axios.patch(`http://localhost:5000/api/users/${id}/status`, { isActive }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`, // Correctly include the token in the headers
        },
      });
      setUsers(users.map(user => (user.id === id ? { ...user, isActive } : user)));
      alert('User status updated successfully!');
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status. Please try again.');
    }
  };
  

  const filteredUsers = users.filter(user =>
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Table>
      <thead>
        <tr>
          <TableHeader>Name</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Phone Number</TableHeader>
          <TableHeader>License Number</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Actions</TableHeader>
        </tr>
      </thead>
      <tbody>
        {filteredUsers.map(user => (
          <TableRow key={user.id}>
            <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.phoneNumber}</TableCell>
            <TableCell>{user.licenseNumber}</TableCell>
            <TableCell>
              <select
                value={user.isActive ? 'Active' : 'Inactive'}
                onChange={(e) => handleStatusChange(user.id, e.target.value === 'Active')}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </TableCell>
            <TableCell>
              <button>Edit</button>
              <button>Delete</button>
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
};

export default UserList; 