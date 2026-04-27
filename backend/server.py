# backend/server.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import json
import asyncio
import logging

# outgoing websocket client lib
import websockets

from backend.step_parser import parse_step

app = FastAPI()
logger = logging.getLogger("uvicorn.error")

# Expect user's local Hermes agent to expose a websocket or HTTP endpoint.
# These are local-only defaults; users run their own agent on port 5000.
HERMES_WS = "ws://localhost:5000/ws"
HERMES_HTTP = "http://localhost:5000/chat"

@app.websocket("/ws")
async def websocket_endpoint(client_ws: WebSocket):
    """
    Bridge endpoint: receives questions from browser client, proxies to local Hermes agent,
    parses agent output into visual steps and forwards them to the browser client.

    Behavior:
    - Try websocket to agent first (preferred, streaming).
    - If websocket fails, fallback to HTTP call and sentence-splitting.
    - Only connects to localhost agent (security: local-only).
    """
    await client_ws.accept()
    try:
        while True:
            question = await client_ws.receive_text()
            logger.info("Received question from client: %s", question)

            # Try websocket streaming to agent
            try:
                async with websockets.connect(HERMES_WS) as hermes_ws:
                    await hermes_ws.send(question)
                    async for message in hermes_ws:
                        try:
                            step = parse_step(message)
                        except Exception as e:
                            logger.exception("parse_step failed: %s", e)
                            step = {"visualType": "generic_text", "data": {"text": message}}
                        await client_ws.send_text(json.dumps(step))
            except Exception as ws_err:
                logger.warning("Hermes websocket connection failed: %s. Trying HTTP fallback.", ws_err)
                # HTTP fallback (non-streaming)
                try:
                    import httpx
                    resp = httpx.post(HERMES_HTTP, json={"question": question}, timeout=10.0)
                    if resp.status_code == 200:
                        body = resp.text
                        for sentence in _split_sentences(body):
                            step = parse_step(sentence)
                            await client_ws.send_text(json.dumps(step))
                    else:
                        await client_ws.send_text(json.dumps({
                            "visualType": "error",
                            "data": {"message": f"Hermes HTTP returned {resp.status_code}"}
                        }))
                except Exception as http_err:
                    logger.exception("Hermes HTTP fallback also failed: %s", http_err)
                    await client_ws.send_text(json.dumps({
                        "visualType": "error",
                        "data": {"message": "Unable to reach local Hermes agent"}
                    }))

    except WebSocketDisconnect:
        logger.info("Client websocket disconnected")
    except Exception as e:
        logger.exception("Unexpected error in websocket_endpoint: %s", e)
    finally:
        try:
            await client_ws.close()
        except:
            pass

def _split_sentences(text: str):
    import re
    if not text:
        return []
    parts = re.split(r'(?<=[.!?])\s+', text.strip())
    return [p.strip() for p in parts if p.strip()]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.server:app", host="127.0.0.1", port=8000, reload=True)
