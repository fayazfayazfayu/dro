import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MLInsights from './MLInsights';
import MLService from '../services/MLService';

const OptimizerContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  padding: 20px;
`;

const RouteOptimizer = ({ route, onUpdateRoute }) => {
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const optimizeRoute = async () => {
    try {
      setLoading(true);
      
      // Get ML predictions
      const routeFeatures = {
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        routeDistance: route.distance,
        numberOfStops: route.waypoints?.length || 0,
        vehicleCapacity: route.vehicle?.capacity || 0
      };

      const predictions = await MLService.predictRoute(routeFeatures);
      
      // Use predictions to optimize route
      const optimized = {
        ...route,
        expectedDuration: predictions.prediction.predictedDuration,
        expectedDistance: predictions.prediction.predictedDistance,
        riskLevel: predictions.prediction.onTimeDeliveryProbability < 0.7 ? 'high' : 'low',
        recommendations: []
      };

      if (predictions.prediction.onTimeDeliveryProbability < 0.7) {
        optimized.recommendations.push('Consider rescheduling to off-peak hours');
      }

      if (predictions.prediction.deliverySuccessProbability < 0.8) {
        optimized.recommendations.push('Review delivery constraints');
      }

      setOptimizedRoute(optimized);
      onUpdateRoute(optimized);
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route) {
      optimizeRoute();
    }
  }, [route]);

  if (loading) return <div>Optimizing route...</div>;

  return (
    <OptimizerContainer>
      <div>
        {/* Existing route display */}
        {optimizedRoute && (
          <div>
            <h3>Optimized Route Details</h3>
            <p>Expected Duration: {optimizedRoute.expectedDuration} minutes</p>
            <p>Expected Distance: {optimizedRoute.expectedDistance} km</p>
            <p>Risk Level: {optimizedRoute.riskLevel}</p>
            {optimizedRoute.recommendations.length > 0 && (
              <div>
                <h4>Recommendations:</h4>
                <ul>
                  {optimizedRoute.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* ML Insights Panel */}
      <MLInsights route={optimizedRoute || route} />
    </OptimizerContainer>
  );
};

export default RouteOptimizer; 