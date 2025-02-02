import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin-bottom: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SuggestionItem = styled.li`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background: #f0f0f0;
  }
`;

const PlaceSearch = ({ onPlaceSelect, placeholder }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchPlaces = async () => {
      if (!query) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json`,
          {
            params: {
              key: process.env.REACT_APP_TOMTOM_API_KEY,
              limit: 5
            }
          }
        );

        const results = response.data.results.map(result => ({
          id: result.id,
          text: result.address.freeformAddress,
          position: result.position
        }));

        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlaces, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (place) => {
    setQuery(place.text);
    setSuggestions([]);
    onPlaceSelect(place);
  };

  return (
    <SearchContainer>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || "Search for a place..."}
      />
      {loading && <div>Loading...</div>}
      {suggestions.length > 0 && (
        <SuggestionsList>
          {suggestions.map((place) => (
            <SuggestionItem
              key={place.id}
              onClick={() => handleSelect(place)}
            >
              {place.text}
            </SuggestionItem>
          ))}
        </SuggestionsList>
      )}
    </SearchContainer>
  );
};

export default PlaceSearch; 