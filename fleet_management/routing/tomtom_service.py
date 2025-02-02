import requests
from typing import Dict, List
import logging

class TomTomService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.search_url = "https://api.tomtom.com/search/2/search"
        self.autocomplete_url = "https://api.tomtom.com/search/2/autocomplete"
        self.routing_url = "https://api.tomtom.com/routing/1/calculateRoute"

    async def search_place(self, query: str, country: str = None) -> List[Dict]:
        """Search for places using TomTom Search API"""
        try:
            params = {
                'key': self.api_key,
                'query': query,
                'limit': 10,
                'countrySet': country if country else None,
                'idxSet': 'POI,PAD,Addr'
            }

            response = requests.get(self.search_url, params=params)
            response.raise_for_status()
            
            results = response.json().get('results', [])
            return [{
                'id': result['id'],
                'name': result.get('poi', {}).get('name', result['address'].get('freeformAddress')),
                'address': result['address'].get('freeformAddress'),
                'position': result['position'],
                'type': result.get('poi', {}).get('categorySet', [{}])[0].get('name', 'Address')
            } for result in results]

        except Exception as e:
            logging.error(f"Place search failed: {str(e)}")
            raise

    async def get_route(self, 
                       depot: Dict[str, float],
                       destinations: List[Dict[str, float]],
                       departure_time: str = None) -> Dict:
        """Calculate route using TomTom Routing API"""
        try:
            # Format waypoints
            waypoints = [depot] + destinations
            waypoints_param = ":".join([
                f"{point['lat']},{point['lon']}"
                for point in waypoints
            ])

            params = {
                'key': self.api_key,
                'traffic': 'true',
                'travelMode': 'truck',
                'routeType': 'fastest',
                'departAt': departure_time
            }

            response = requests.get(
                f"{self.routing_url}/{waypoints_param}/json",
                params=params
            )
            response.raise_for_status()
            
            return response.json()

        except Exception as e:
            logging.error(f"Route calculation failed: {str(e)}")
            raise

    async def get_route_update(self, route_id: str) -> Dict:
        """Get real-time updates for a route"""
        # Implement real-time route updates logic here
        pass 