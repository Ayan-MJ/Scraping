from fastapi import APIRouter, Depends, HTTPException, Request
from sse_starlette.sse import EventSourceResponse # Using sse-starlette
import aioredis
import json
import asyncio # Required for asyncio.sleep

# Assuming settings are accessible, e.g., from app.core.config import settings
# For this example, let's define a placeholder if direct import isn't set up in this context
# In a real app, ensure settings.REDIS_URL is correctly imported and configured.
class SettingsPlaceholder:
    REDIS_URL = "redis://localhost"

settings = SettingsPlaceholder() # Replace with actual settings import

router = APIRouter()

@router.get("/runs/{run_id}/stream")
async def stream_run_events(run_id: int, request: Request): # Added Request to check client connection
    """Streams events for a given scrape run_id using Server-Sent Events."""
    
    # Initialize Redis connection within the endpoint handler
    # This ensures a fresh connection for each client, or use a shared pool
    try:
        redis = await aioredis.from_url(settings.REDIS_URL)
        pubsub = redis.pubsub()
        await pubsub.subscribe(f"run:{run_id}")
    except Exception as e:
        # Log this error appropriately
        raise HTTPException(status_code=503, detail=f"Could not connect to Redis: {e}")

    async def event_generator():
        try:
            while True:
                # Check if client is still connected
                if await request.is_disconnected():
                    print(f"Client for run {run_id} disconnected.")
                    break

                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=5.0) # 5 second timeout
                if message and message.get("type") == "message":
                    try:
                        # The message['data'] is expected to be a JSON string from the worker
                        payload_str = message["data"].decode("utf-8") if isinstance(message["data"], bytes) else message["data"]
                        # No need to json.loads here if worker sends already formatted JSON string for SSE data field
                        # The EventSourceResponse will handle correct formatting if we yield dicts.
                        # However, the original request asked for f"data: {json.dumps(payload)}\n\n"
                        # Let's assume the worker sends a JSON string that IS the payload for SSE's `data` field.
                        # If worker sends a JSON string representing the *event object* {"type": ..., "data": ...}, then parse and reformat.
                        
                        # Based on worker: {"type": event_type, "data": data_dict}
                        # We should send this entire structure as the event data for the client to parse.
                        event_data_to_send = json.loads(payload_str) # Parse the JSON string from Redis
                        
                        yield {"event": event_data_to_send.get("type", "message"), "data": json.dumps(event_data_to_send.get("data"))}
                        # Example: yield {"event": "record", "data": json.dumps(record_data)}
                        # Example: yield {"event": "status", "data": json.dumps(status_data)}

                    except json.JSONDecodeError:
                        print(f"Could not decode JSON from Redis message: {message['data']}")
                        yield {"event": "error", "data": json.dumps({"detail": "Malformed event data from worker."})}
                    except Exception as e:
                        print(f"Error processing message for run {run_id}: {e}")
                        yield {"event": "error", "data": json.dumps({"detail": "Error processing event."})}
                else:
                    # Send a comment to keep the connection alive if no message
                    yield {"event": "ping", "data": json.dumps({"timestamp": datetime.utcnow().isoformat()})}
                
                await asyncio.sleep(0.1) # Small delay to prevent tight loop if Redis connection is problematic

        except asyncio.CancelledError:
            print(f"Event generator for run {run_id} cancelled (client disconnected).")
        except Exception as e:
            print(f"Error in event generator for run {run_id}: {e}")
            # Consider how to signal this to the client if possible before closing
        finally:
            print(f"Unsubscribing and closing Redis for run {run_id}")
            await pubsub.unsubscribe(f"run:{run_id}")
            await redis.close() # Close the specific Redis connection
            # If using a connection pool, pubsub.close() and release connection instead.

    # Use EventSourceResponse from sse-starlette
    return EventSourceResponse(event_generator(), media_type="text/event-stream")

# Need to import datetime for the ping event
from datetime import datetime 