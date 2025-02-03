from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import logging
from .route_optimizer import RouteOptimizer  # Assuming RouteOptimizer is defined elsewhere
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define models
class Location(BaseModel):
    lat: float
    lon: float
    name: Optional[str] = None

class RouteRequest(BaseModel):
    depot: Location
    destinations: List[Location]
    departure_time: Optional[str] = None

routes_store = []  # Temporary in-memory storage for routes

# POST: Set route
@app.post("/set-route")
async def set_route(route_request: RouteRequest):
    try:
        logger.info(f"Received route request: {route_request}")
        route_id = len(routes_store)
        routes_store.append(route_request)
        # Return both route_id and initial route data
        return {
            "route_id": route_id,
            "message": "Route stored successfully",
            "initial_route": route_request.dict()
        }
    except Exception as e:
        logger.error(f"Failed to store route: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# GET: Calculate and return optimized route
@app.get("/optimized-route/{route_id}")
async def get_optimized_route(route_id: int):
    try:
        if route_id >= len(routes_store):
            raise HTTPException(status_code=404, detail="Route not found")
        
        route_request = routes_store[route_id]
        optimizer = RouteOptimizer()  
        optimized_route = await optimizer.optimize_route(
            depot=route_request.depot.dict(),
            destinations=[dest.dict() for dest in route_request.destinations]
        )
        
        logger.info(f"Optimized route calculated for route_id {route_id}")
        return {"route_id": route_id, "optimized_route": optimized_route}
    except Exception as e:
        logger.error(f"Route optimization failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# GET: Live route updates
@app.get("/route-updates/{route_id}")
async def get_route_updates(
    route_id: int,
    current_lat: float,
    current_lon: float
):
    try:
        logger.info(f"Received update request at {datetime.now().strftime('%H:%M:%S')} for route {route_id}")
        
        if route_id >= len(routes_store):
            raise HTTPException(status_code=404, detail="Route not found")
        
        current_position = {
            "lat": current_lat,
            "lon": current_lon
        }
        
        optimizer = RouteOptimizer()
        updates = await optimizer.get_live_updates(
            str(route_id),
            current_position
        )
        
        logger.info(f"Route updates retrieved for route_id {route_id}")
        return updates
        
    except Exception as e:
        logger.error(f"Failed to get route updates: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))