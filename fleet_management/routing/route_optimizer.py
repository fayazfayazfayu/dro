import requests
import json
from datetime import datetime
from typing import List, Dict
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging
from dotenv import load_dotenv
# import polyline

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class RouteOptimizer:
    def __init__(self):
        self.osrm_url = "http://router.project-osrm.org/route/v1/driving"
        self.tomtom_api_key = os.getenv("TOMTOM_API_KEY")
        if not self.tomtom_api_key:
            raise ValueError("TomTom API key not found in environment variables!")
        
        self.tomtom_traffic_url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"

    async def get_osm_route(self, waypoints: List[Dict]) -> Dict:
        """Get route using OSRM"""
        try:
            # Format coordinates for OSRM
            coordinates = ";".join([f"{point['lon']},{point['lat']}" for point in waypoints])
            
            # Make request to OSRM
            url = f"{self.osrm_url}/{coordinates}"
            params = {
                'overview': 'full',
                'geometries': 'geojson',
                'steps': 'true'
            }
            
            logger.debug(f"Requesting route from OSRM with URL: {url}")
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            route_data = response.json()
            
            if 'routes' not in route_data or not route_data['routes']:
                raise ValueError("No route found in OSRM response")
            
            return route_data['routes'][0]
            
        except Exception as e:
            logger.error(f"OSRM route calculation failed: {str(e)}")
            raise

    async def get_traffic_data(self, lat: float, lon: float) -> Dict:
        """Get traffic data from TomTom API for a specific location"""
        try:
            url = f"{self.tomtom_traffic_url}"
            params = {
                'key': self.tomtom_api_key,
                'point': f"{lat},{lon}",
                'unit': 'KMPH'
            }
            
            logger.debug(f"Requesting traffic data for point: {lat},{lon}")
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'flowSegmentData' in data:
                flow_data = data['flowSegmentData']
                current_speed = flow_data.get('currentSpeed', 0)
                free_flow_speed = flow_data.get('freeFlowSpeed', 0)
                
                # Determine congestion level based on current speed
                congestion_level = (
                    "High" if current_speed < 20
                    else "Medium" if current_speed < 40
                    else "Low"
                )
                
                return {
                    "current_speed": current_speed,
                    "free_flow_speed": free_flow_speed,
                    "congestion_level": congestion_level,
                    "timestamp": datetime.now().isoformat(),
                    "coordinates": {
                        "lat": lat,
                        "lon": lon
                    }
                }
            
            # Default return if no flow data
            return {
                "current_speed": 30,
                "free_flow_speed": 40,
                "congestion_level": "Unknown",
                "timestamp": datetime.now().isoformat(),
                "coordinates": {
                    "lat": lat,
                    "lon": lon
                }
            }
            
        except Exception as e:
            logger.error(f"Traffic data fetch failed: {str(e)}")
            return {
                "current_speed": 30,
                "free_flow_speed": 40,
                "congestion_level": "Error",
                "timestamp": datetime.now().isoformat(),
                "coordinates": {
                    "lat": lat,
                    "lon": lon
                }
            }

    async def optimize_route(self, depot: Dict, destinations: List[Dict]) -> Dict:
        """Optimize route using OSM for routing and TomTom for traffic"""
        try:
            logger.debug("Starting route optimization")
            
            # Get route from OSM
            waypoints = [depot] + destinations
            route_data = await self.get_osm_route(waypoints)
            
            if not route_data or 'geometry' not in route_data:
                raise ValueError("No route found in OSM response")

            # Extract coordinates from the route geometry
            coordinates = route_data['geometry']['coordinates']
            total_distance = route_data['distance']  # in meters
            duration = route_data['duration']  # in seconds
            
            # Sample points along the route for traffic data
            num_samples = min(len(coordinates), 10)  # Take up to 10 samples
            sample_indices = [i * (len(coordinates) - 1) // (num_samples - 1) for i in range(num_samples)]
            sample_points = [coordinates[i] for i in sample_indices]
            
            # Get traffic data for sampled points
            traffic_data = []
            distance_covered = 0
            segment_distance = total_distance / (num_samples - 1)
            
            for point in sample_points:
                # Note: OSM returns [lon, lat], but we need [lat, lon] for TomTom
                segment_traffic = await self.get_traffic_data(point[1], point[0])
                
                if segment_traffic:
                    segment_traffic['distance_covered'] = distance_covered
                    traffic_data.append(segment_traffic)
                    distance_covered += segment_distance

            # Create response with combined data
            response = {
                "summary": {
                    "totalDistanceInMeters": total_distance,
                    "totalTimeInSeconds": duration,
                    "departureTime": datetime.now().isoformat(),
                },
                "geometry": route_data['geometry'],
                "traffic_segments": [
                    {
                        "timestamp": data['timestamp'],
                        "distance_covered": data['distance_covered'],
                        "current_speed": data['current_speed'],
                        "free_flow_speed": data['free_flow_speed'],
                        "congestion_level": data['congestion_level'],
                        "coordinates": data['coordinates']
                    }
                    for data in traffic_data
                ]
            }
            
            logger.debug(f"Route optimization completed successfully: {json.dumps(response, indent=2)}")
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
            
            update = {
                "status": "ACTIVE",
                "lastUpdate": datetime.now().isoformat(),
                "currentLocation": current_location,
                "trafficData": traffic_data
            }

            logger.debug(f"Route update for {route_id}: {json.dumps(update, indent=2)}")
            return update
        except Exception as e:
            logger.error(f"Route update failed: {str(e)}")
            return {
                "status": "ERROR",
                "lastUpdate": datetime.now().isoformat(),
                "error": str(e)
            }

    async def check_route_conditions(self, current_route: Dict) -> Dict:
        """Check current route conditions and determine if rerouting is needed"""
        try:
            coordinates = current_route['geometry']['coordinates']
            traffic_alerts = []
            needs_rerouting = False
            
            # Check traffic conditions for upcoming segments
            for coord in coordinates[:5]:  # Check next 5 segments
                traffic = await self.get_traffic_data(coord[1], coord[0])
                
                if traffic['congestion_level'] == 'High':
                    traffic_alerts.append({
                        'coordinates': {'lat': coord[1], 'lon': coord[0]},
                        'severity': 'High',
                        'message': f"Heavy traffic detected: {traffic['current_speed']} km/h"
                    })
                    needs_rerouting = True
            
            return {
                'needs_rerouting': needs_rerouting,
                'traffic_alerts': traffic_alerts,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Route condition check failed: {str(e)}")
            raise

    async def calculate_alternative_route(self, current_route: Dict, 
                                       current_position: Dict,
                                       destination: Dict) -> Dict:
        """Calculate alternative route avoiding congested areas"""
        try:
            # Get congested coordinates from current route
            congested_areas = [
                alert['coordinates'] 
                for alert in (await self.check_route_conditions(current_route))['traffic_alerts']
            ]
            
            # Calculate new route avoiding congested areas
            waypoints = [current_position, destination]
            new_route = await self.get_osm_route(waypoints)
            
            # Verify new route doesn't pass through congested areas
            for area in congested_areas:
                # Add some buffer around congested areas
                buffer_distance = 0.01  # roughly 1km
                if any(
                    abs(coord[1] - area['lat']) < buffer_distance and 
                    abs(coord[0] - area['lon']) < buffer_distance 
                    for coord in new_route['geometry']['coordinates']
                ):
                    continue  # Try another variation if needed
            
            return await self.optimize_route(current_position, [destination])
            
        except Exception as e:
            logger.error(f"Alternative route calculation failed: {str(e)}")
            raise

    async def get_live_updates(self, route_id: str, current_position: Dict) -> Dict:
        """Get live updates including traffic and rerouting suggestions"""
        try:
            logger.info(f"Checking updates at {datetime.now().strftime('%H:%M:%S')} for route {route_id}")
            
            # Get stored route data
            route = routes_store[int(route_id)]
            
            # Get current route conditions
            conditions = await self.check_route_conditions(route)
            
            response = {
                'route_id': route_id,
                'current_position': current_position,
                'traffic_alerts': conditions['traffic_alerts'],
                'needs_rerouting': conditions['needs_rerouting'],
                'timestamp': datetime.now().isoformat()
            }
            
            # Calculate alternative route if needed
            if conditions['needs_rerouting']:
                logger.info(f"Rerouting needed for route {route_id}")
                alternative_route = await self.calculate_alternative_route(
                    route,
                    current_position,
                    route['destinations'][-1]
                )
                response['alternative_route'] = alternative_route
            
            logger.info(f"Update completed for route {route_id}")
            return response
            
        except Exception as e:
            logger.error(f"Live update failed: {str(e)}")
            raise 