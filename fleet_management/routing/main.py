from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio
from datetime import datetime
import os
from dotenv import load_dotenv
from .route_optimizer import RouteOptimizer
import logging

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

@app.post("/calculate-route")
async def calculate_route(route_request: RouteRequest):
    try:
        logger.info(f"Received route request: {route_request}")
        optimizer = RouteOptimizer()
        route_data = await optimizer.optimize_route(
            depot=route_request.depot.dict(),
            destinations=[dest.dict() for dest in route_request.destinations]
        )
        logger.info("Route calculation successful")
        return route_data
    except Exception as e:
        logger.error(f"Route calculation failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.websocket("/route-updates/{route_id}")
async def route_updates(websocket: WebSocket, route_id: str):
    await websocket.accept()
    optimizer = RouteOptimizer()
    logger.info(f"WebSocket connection established for route {route_id}")
    
    try:
        while True:
            update = await optimizer.get_route_update(route_id)
            await websocket.send_json(update)
            await asyncio.sleep(30)
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from route {route_id}") 