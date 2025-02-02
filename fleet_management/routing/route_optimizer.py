import requests
import json
from datetime import datetime
from typing import List, Dict
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RouteOptimizer:
    def __init__(self):
        self.osrm_url = "http://router.project-osrm.org/route/v1/driving"
        self.tomtom_api_key = os.getenv("TOMTOM_API_KEY")
        if not self.tomtom_api_key:
            logger.error("TomTom API key not found in environment variables!")
        else:
            logger.info("TomTom API key loaded successfully")
        
        self.tomtom_routing_url = "https://api.tomtom.com/routing/1/calculateRoute"
        self.tomtom_traffic_url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"

    async def get_traffic_data(self, lat: float, lon: float) -> Dict:
        """Get traffic data from TomTom API for a specific location"""
        try:
            url = f"{self.tomtom_traffic_url}"
            params = {
                'key': self.tomtom_api_key,
                'point': f"{lat},{lon}"
            }
            logger.info(f"Requesting traffic data for point: {lat},{lon}")
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            traffic_data = response.json()
            logger.info(f"Received traffic data: {json.dumps(traffic_data, indent=2)}")
            return traffic_data
            
        except Exception as e:
            logger.error(f"Traffic data fetch failed: {str(e)}")
            return None

    async def get_tomtom_route(self, waypoints: List[Dict]) -> Dict:
        """Get route using TomTom Routing API"""
        try:
            # Format waypoints for TomTom API
            waypoint_string = ":".join([
                f"{point['lat']},{point['lon']}"
                for point in waypoints
            ])
            
            url = f"{self.tomtom_routing_url}/{waypoint_string}/json"
            
            params = {
                'key': self.tomtom_api_key,
                'traffic': 'true',
                'travelMode': 'truck',
                'routeType': 'fastest'
            }
            
            logger.info(f"Requesting route from TomTom API: {url}")
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            route_data = response.json()
            logger.info(f"Received route data from TomTom")
            return route_data
            
        except Exception as e:
            logger.error(f"TomTom route calculation failed: {str(e)}")
            raise

    def calculate_traffic_delay(self, traffic_data: List[Dict]) -> float:
        """Calculate delay factor based on traffic data"""
        if not traffic_data:
            return 1.0

        total_delay = 0
        for data in traffic_data:
            if 'flowSegmentData' in data.get('traffic', {}):
                current_speed = data['traffic']['flowSegmentData'].get('currentSpeed', 0)
                free_flow_speed = data['traffic']['flowSegmentData'].get('freeFlowSpeed', current_speed)
                if free_flow_speed > 0:
                    delay = free_flow_speed / current_speed if current_speed > 0 else 2.0
                    total_delay += delay

        return max(1.0, total_delay / len(traffic_data))

    async def optimize_route(self, depot: Dict, destinations: List[Dict]) -> Dict:
        """Optimize route considering traffic conditions"""
        try:
            logger.info("Starting route optimization")
            logger.info(f"Depot: {depot}")
            logger.info(f"Destinations: {destinations}")

            # Get route from TomTom
            waypoints = [depot] + destinations + [depot]  # Include return to depot
            route_data = await self.get_tomtom_route(waypoints)
            
            if not route_data or 'routes' not in route_data:
                raise ValueError("No route found in TomTom response")

            route = route_data['routes'][0]
            
            # Get traffic data for key points
            traffic_data = []
            for point in waypoints:
                traffic = await self.get_traffic_data(point['lat'], point['lon'])
                if traffic:
                    traffic_data.append(traffic)

            # Create response with combined data
            response = {
                "summary": {
                    "totalDistanceInMeters": route.get('summary', {}).get('lengthInMeters', 0),
                    "totalTimeInSeconds": route.get('summary', {}).get('travelTimeInSeconds', 0),
                    "trafficDelayInSeconds": route.get('summary', {}).get('trafficDelayInSeconds', 0),
                    "departureTime": datetime.now().isoformat(),
                },
                "legs": route.get('legs', []),
                "traffic_data": traffic_data
            }
            
            logger.info("Route optimization completed successfully")
            return response
            
        except Exception as e:
            logger.error(f"Route optimization failed: {str(e)}")
            raise

    async def get_route_update(self, route_id: str) -> Dict:
        """Get real-time route and traffic updates"""
        try:
            current_location = {
                "lat": 51.5074,
                "lon": -0.1278
            }
            
            traffic_data = await self.get_traffic_data(
                current_location["lat"], 
                current_location["lon"]
            )
            
            return {
                "status": "ACTIVE",
                "lastUpdate": datetime.now().isoformat(),
                "currentLocation": current_location,
                "trafficData": traffic_data
            }
        except Exception as e:
            logger.error(f"Route update failed: {str(e)}")
            return {
                "status": "ERROR",
                "lastUpdate": datetime.now().isoformat(),
                "error": str(e)
            } 