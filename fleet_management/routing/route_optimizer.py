import requests
import json
from datetime import datetime
from typing import List, Dict

class RouteOptimizer:
    def __init__(self):
        self.base_url = "http://router.project-osrm.org/route/v1/driving"

    async def optimize_route(self, depot: Dict, destinations: List[Dict]) -> Dict:
        """Optimize route for given depot and destinations"""
        try:
            # Create waypoints string
            waypoints = [depot] + destinations + [depot]  # Return to depot
            waypoints_str = ";".join(f"{point['lon']},{point['lat']}" for point in waypoints)
            
            # Get route from OSRM
            url = f"{self.base_url}/{waypoints_str}"
            params = {
                "overview": "full",
                "geometries": "geojson",
                "steps": "true"
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            route_data = response.json()
            
            if "routes" not in route_data or not route_data["routes"]:
                raise ValueError("No route found")
            
            route = route_data["routes"][0]
            
            return {
                "summary": {
                    "totalDistanceInMeters": route["distance"],
                    "totalTimeInSeconds": route["duration"],
                    "departureTime": datetime.now().isoformat(),
                },
                "geometry": route["geometry"],
                "legs": route["legs"]
            }
            
        except Exception as e:
            raise Exception(f"Route optimization failed: {str(e)}")

    async def get_route_update(self, route_id: str) -> Dict:
        """Get real-time updates for a route"""
        # Simulate real-time updates
        return {
            "status": "ACTIVE",
            "lastUpdate": datetime.now().isoformat(),
            "currentLocation": {
                "lat": 51.5074,
                "lon": -0.1278
            }
        } 