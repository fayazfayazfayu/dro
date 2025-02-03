import requests
import json
from datetime import datetime
from typing import List, Dict
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging
from dotenv import load_dotenv
from itertools import permutations
import numpy as np
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
        """Optimize a single route"""
        try:
            logger.info("Starting route optimization")
            
            # Format waypoints for OSRM
            waypoints = [depot] + destinations
            
            # Get route from OSRM
            route_data = await self.get_osm_route(waypoints)
            
            # Get traffic data for route segments
            traffic_segments = []
            coordinates = route_data['geometry']['coordinates']
            
            # Sample points along the route for traffic data
            num_samples = min(len(coordinates), 10)  # Take up to 10 sample points
            sample_indices = np.linspace(0, len(coordinates)-1, num_samples, dtype=int)
            
            for idx in sample_indices:
                coord = coordinates[idx]
                traffic = await self.get_traffic_data(coord[1], coord[0])
                
                # Calculate distance from start for this segment
                distance_covered = route_data['distance'] * (idx / len(coordinates))
                
                traffic_segments.append({
                    'timestamp': datetime.now().isoformat(),
                    'distance_covered': distance_covered,
                    'current_speed': traffic['current_speed'],
                    'congestion_level': traffic['congestion_level']
                })
            
            # Prepare response
            optimized_route = {
                'geometry': route_data['geometry'],
                'distance': route_data['distance'],  # Total distance in meters
                'duration': route_data['duration'],  # Total duration in seconds
                'traffic_segments': traffic_segments,
                'stops': [
                    {
                        'number': i + 1,
                        'name': dest.get('name', f'Stop {i+1}'),
                        'coordinates': {
                            'lat': dest['lat'],
                            'lon': dest['lon']
                        }
                    }
                    for i, dest in enumerate(destinations)
                ]
            }
            
            logger.info("Route optimization completed")
            return optimized_route
            
        except Exception as e:
            logger.error(f"Route optimization failed: {str(e)}")
            raise

    async def get_route_update(self, route_id: str, current_route: Dict) -> Dict:
        """Get updated route based on current traffic conditions"""
        try:
            # Check current traffic conditions
            conditions = await self.check_route_conditions(current_route)
            
            response = {
                'needs_rerouting': conditions['needs_rerouting'],
                'traffic_alerts': conditions['traffic_alerts'],
                'timestamp': datetime.now().isoformat()
            }

            # If heavy traffic detected, calculate alternative route
            if conditions['needs_rerouting']:
                current_position = current_route['geometry']['coordinates'][0]
                destination = current_route['geometry']['coordinates'][-1]
                
                alternative_route = await self.calculate_alternative_route(
                    current_route,
                    {'lat': current_position[1], 'lon': current_position[0]},
                    {'lat': destination[1], 'lon': destination[0]}
                )
                
                response['alternative_route'] = alternative_route

            logger.info(f"Route update completed for route {route_id}")
            return response

        except Exception as e:
            logger.error(f"Route update failed: {str(e)}")
            raise

    async def check_route_conditions(self, current_route: Dict) -> Dict:
        """Enhanced check for current route conditions"""
        try:
            coordinates = current_route['geometry']['coordinates']
            traffic_alerts = []
            needs_rerouting = False
            
            # Check traffic conditions for route segments
            for coord in coordinates[::len(coordinates)//10]:  # Sample 10 points along route
                traffic = await self.get_traffic_data(coord[1], coord[0])
                
                if traffic['congestion_level'] == 'High':
                    traffic_alerts.append({
                        'coordinates': {'lat': coord[1], 'lon': coord[0]},
                        'severity': 'High',
                        'message': f"Heavy traffic detected: {traffic['current_speed']} km/h"
                    })
                    needs_rerouting = True
                elif traffic['congestion_level'] == 'Medium':
                    traffic_alerts.append({
                        'coordinates': {'lat': coord[1], 'lon': coord[0]},
                        'severity': 'Medium',
                        'message': f"Moderate traffic: {traffic['current_speed']} km/h"
                    })
            
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

    async def optimize_multi_point_delivery(self, user_id: str, routes: List[Dict]) -> Dict:
        """Optimize multiple deliveries for the same user using TSP"""
        try:
            logger.info(f"Starting multi-point optimization for user {user_id}")
            
            # Extract all points (depot and destinations)
            all_points = []
            depot = None
            
            # Get first route's start point as depot
            if routes:
                first_route = routes[0]
                depot = {
                    'lat': float(first_route['startPoint'].split()[0]),
                    'lon': float(first_route['startPoint'].split()[1]),
                    'name': 'Depot'
                }
                all_points.append(depot)
            
            # Add all destinations with route information
            for i, route in enumerate(routes, 1):
                end_lat, end_lon = map(float, route['endPoint'].split())
                all_points.append({
                    'lat': end_lat,
                    'lon': end_lon,
                    'name': f'Stop {i}: {route.get("name", "")}',
                    'route_id': route['id'],
                    'stop_number': i
                })

            # Calculate distance matrix
            n = len(all_points)
            distance_matrix = np.zeros((n, n))
            
            for i in range(n):
                for j in range(n):
                    if i != j:
                        route_data = await self.get_osm_route([all_points[i], all_points[j]])
                        distance_matrix[i][j] = route_data['distance']

            # Solve TSP
            best_distance = float('inf')
            best_order = None
            
            for perm in permutations(range(1, n)):
                order = (0,) + perm  # Add depot (0) as first point
                distance = sum(distance_matrix[order[i]][order[i+1]] for i in range(n-1))
                distance += distance_matrix[order[-1]][0]  # Return to depot
                
                if distance < best_distance:
                    best_distance = distance
                    best_order = order

            # Get optimized route with traffic data
            optimized_points = [all_points[i] for i in best_order]
            optimized_route = await self.optimize_route(depot, optimized_points[1:])
            
            # Add stop information to the response
            optimized_route['stops'] = [
                {
                    'number': point.get('stop_number'),
                    'name': point.get('name'),
                    'route_id': point.get('route_id'),
                    'coordinates': {
                        'lat': point['lat'],
                        'lon': point['lon']
                    }
                }
                for point in optimized_points[1:]  # Skip depot
            ]
            
            # Add metadata
            optimized_route['user_id'] = user_id
            optimized_route['total_distance'] = best_distance
            optimized_route['route_order'] = [
                all_points[i].get('route_id') for i in best_order[1:]
            ]
            
            logger.info(f"Multi-point optimization completed for user {user_id}")
            return optimized_route
            
        except Exception as e:
            logger.error(f"Multi-point delivery optimization failed: {str(e)}")
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