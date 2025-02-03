from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging
from .route_optimizer import RouteOptimizer
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

class MultiPointRequest(BaseModel):
    user_id: str
    routes: List[Dict]

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

# POST: Optimize multi-point delivery
@app.post("/optimize-multi-point")
async def optimize_multi_point(request: MultiPointRequest):
    try:
        logger.info(f"Received multi-point optimization request for user {request.user_id}")
        optimizer = RouteOptimizer()
        optimized_route = await optimizer.optimize_multi_point_delivery(
            request.user_id,
            request.routes
        )
        
        # Store the optimized route
        route_id = len(routes_store)
        routes_store.append(optimized_route)
        
        logger.info(f"Multi-point route optimized for user {request.user_id}")
        return {
            "route_id": route_id,
            "optimized_route": optimized_route
        }
    except Exception as e:
        logger.error(f"Multi-point optimization failed: {str(e)}")
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

# POST: Route update
@app.post("/route-update/{route_id}")
async def update_route(route_id: str, current_route: Dict):
    try:
        logger.info(f"Received route update request for route {route_id}")
        
        # Validate the current_route data
        if not current_route:
            raise HTTPException(status_code=400, detail="Missing route data")
            
        optimizer = RouteOptimizer()
        updated_route = await optimizer.optimize_route(
            depot=current_route.get('depot', {}),
            destinations=current_route.get('destinations', [])
        )
        
        return {
            "route_id": route_id,
            "optimized_route": updated_route
        }
        
    except Exception as e:
        logger.error(f"Route update failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))