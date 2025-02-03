import React from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  width: 25%;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-height: 70vh;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
`;

const Th = styled.th`
  background-color: #1A1B4B;
  color: white;
  padding: 8px;
  text-align: left;
  position: sticky;
  top: 0;
`;

const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid #ddd;
`;

const CongestionCell = styled(Td)`
  color: ${props => {
    switch (props.level.toLowerCase()) {
      case 'high':
        return '#FF0000';
      case 'medium':
        return '#FFA500';
      default:
        return '#4A90E2';
    }
  }};
  font-weight: bold;
`;

const TrafficTable = ({ trafficData }) => {
  if (!trafficData?.traffic_segments) return null;

  const getCongestionLevel = (currentSpeed, freeFlowSpeed) => {
    if (!currentSpeed || !freeFlowSpeed) return 'Low';
    const ratio = currentSpeed / freeFlowSpeed;
    if (ratio > 0.8) return 'Low';
    if (ratio > 0.4) return 'Medium';
    return 'High';
  };

  return (
    <TableContainer>
      <h3>Traffic Information</h3>
      <Table>
        <thead>
          <tr>
            <Th>Time</Th>
            <Th>Distance (km)</Th>
            <Th>Speed (km/h)</Th>
            <Th>Congestion</Th>
          </tr>
        </thead>
        <tbody>
          {trafficData.traffic_segments.map((segment, index) => {
            const congestionLevel = getCongestionLevel(
              segment.current_speed,
              segment.free_flow_speed
            );
            
            return (
              <tr key={index}>
                <Td>{new Date(segment.timestamp).toLocaleTimeString()}</Td>
                <Td>{(segment.distance_covered / 1000).toFixed(2)}</Td>
                <Td>{segment.current_speed}</Td>
                <CongestionCell level={congestionLevel}>
                  {congestionLevel}
                </CongestionCell>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default TrafficTable;