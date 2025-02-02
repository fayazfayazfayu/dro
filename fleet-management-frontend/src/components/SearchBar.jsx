import React from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  width: 300px;
`;

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <SearchContainer>
      <Input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </SearchContainer>
  );
};

export default SearchBar; 