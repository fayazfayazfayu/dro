import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MLService from '../services/MLService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const InsightsContainer = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 10px 0;
  color: #666;
`;

const DataStats = styled.div`
  margin: 10px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;

  h4 {
    margin-bottom: 10px;
    color: #333;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin: 5px 0;
    color: #666;
  }
`;

const InsightCard = styled.div`
  margin: 10px 0;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: ${props => props.highlight ? '#f8f9ff' : 'white'};
`;

const PredictionCard = styled.div`
  margin: 15px 0;
  padding: 20px;
  background: #f8f9ff;
  border-radius: 8px;
  border: 1px solid #e0e4ff;

  h4 {
    color: #2c3e50;
    margin-bottom: 15px;
  }

  .prediction-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eef2ff;
  }

  .label {
    color: #666;
  }

  .value {
    color: #2c3e50;
    font-weight: 500;
  }
`;

const MLInsights = ({ route }) => {
  const [dataAvailability, setDataAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    console.log('MLInsights mounted', { route });
    checkDataAvailability();
    if (route) {
      getPredictions();
    }
  }, [route]);

  const checkDataAvailability = async () => {
    console.log('Checking ML data availability...');
    try {
      setLoading(true);
      const availability = await MLService.checkDataAvailability();
      console.log('Data availability response:', availability);
      setDataAvailability(availability);
    } catch (err) {
      console.error('ML data check error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPredictions = async () => {
    try {
      const routeFeatures = {
        routeDistance: route.distance,
        numberOfStops: route.waypoints ? JSON.parse(route.waypoints).length : 1,
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
      };
      const prediction = await MLService.predictRoute(routeFeatures);
      setPredictions(prediction.prediction);
    } catch (err) {
      console.error('Prediction error:', err);
    }
  };

  console.log('MLInsights rendering state:', { loading, error, dataAvailability });

  return (
    <InsightsContainer>
      <h3>ML Route Insights</h3>
      {loading && <div>Loading ML insights...</div>}
      
      {error && (
        <NoDataMessage>
          <h4>Error Loading ML Data</h4>
          <p>{error}</p>
        </NoDataMessage>
      )}

      {!loading && !error && (
        <>
          <DataStats>
            <h4>ML Data Statistics</h4>
            {dataAvailability ? (
              <ul>
                <li>Routes: {dataAvailability.routeCount || 0}</li>
                <li>Route History: {dataAvailability.routeHistoryCount || 0}</li>
                <li>Traffic Data Points: {dataAvailability.trafficDataCount || 0}</li>
                <li>Delivery Outcomes: {dataAvailability.deliveryOutcomeCount || 0}</li>
              </ul>
            ) : (
              <p>No ML data available yet</p>
            )}
          </DataStats>

          {predictions && (
            <PredictionCard>
              <h4>Route Predictions</h4>
              <div className="prediction-item">
                <span className="label">Predicted Duration:</span>
                <span className="value">{predictions.predictedDuration.toFixed(1)} minutes</span>
              </div>
              <div className="prediction-item">
                <span className="label">Predicted Distance:</span>
                <span className="value">{predictions.predictedDistance.toFixed(2)} km</span>
              </div>
              <div className="prediction-item">
                <span className="label">Delivery Success Probability:</span>
                <span className="value">{(predictions.deliverySuccessProbability * 100).toFixed(1)}%</span>
              </div>
              <div className="prediction-item">
                <span className="label">On-Time Delivery Probability:</span>
                <span className="value">{(predictions.onTimeDeliveryProbability * 100).toFixed(1)}%</span>
              </div>
            </PredictionCard>
          )}
        </>
      )}
    </InsightsContainer>
  );
};

export default MLInsights; 