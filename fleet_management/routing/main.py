from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import requests
from datetime import datetime

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Location(BaseModel):
    lat: float
    lon: float
    name: Optional[str] = None

class RouteRequest(BaseModel):
    depot: Location
    destinations: List[Location]
    departure_time: Optional[str] = None

class RouteOptimizer:
    @staticmethod
    async def get_route(start: Location, end: Location) -> dict:
        """Get route between two points using OSRM"""
        try:
            # Using OSRM demo server - for production, set up your own OSRM server
            url = f"http://router.project-osrm.org/route/v1/driving/{start.lon},{start.lat};{end.lon},{end.lat}"
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
                "distance": route["distance"],  # in meters
                "duration": route["duration"],  # in seconds
                "geometry": route["geometry"],
                "steps": route["legs"][0]["steps"]
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

@app.post("/calculate-route")
async def calculate_route(route_request: RouteRequest):
    try:
        optimizer = RouteOptimizer()
        routes = []
        current_point = route_request.depot
        
        # Calculate routes between each point
        for destination in route_request.destinations:
            route = await optimizer.get_route(current_point, destination)
            routes.append(route)
            current_point = destination
        
        # Calculate route back to depot if needed
        final_route = await optimizer.get_route(current_point, route_request.depot)
        routes.append(final_route)
        
        # Combine route information
        total_distance = sum(route["distance"] for route in routes)
        total_duration = sum(route["duration"] for route in routes)
        
        return {
            "summary": {
                "totalDistanceInMeters": total_distance,
                "totalTimeInSeconds": total_duration,
                "departureTime": route_request.departure_time or datetime.now().isoformat(),
            },
            "routes": routes
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.websocket("/route-updates/{route_id}")
async def route_updates(websocket: WebSocket, route_id: str):
    await websocket.accept()
    try:
        while True:
            # Simulate real-time updates
            await websocket.send_json({
                "status": "ACTIVE",
                "lastUpdate": datetime.now().isoformat(),
                "currentLocation": {
                    "lat": 51.5074,
                    "lon": -0.1278
                }
            })
            await asyncio.sleep(30)  # Update every 30 seconds
    except WebSocketDisconnect:
        print(f"Client disconnected from route {route_id}") 