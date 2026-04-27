# backend/hermes_proxy.py
# Small helpers for calling local agent endpoints (HTTP or WS).
# You may import and use these in server.py if you prefer structured code.

import httpx
import asyncio
import websockets

HERMES_WS = "ws://localhost:5000/ws"
HERMES_HTTP = "http://localhost:5000/chat"

async def stream_from_agent_ws(question: str):
    async with websockets.connect(HERMES_WS) as ws:
        await ws.send(question)
        async for msg in ws:
            yield msg

def call_agent_http(question: str):
    resp = httpx.post(HERMES_HTTP, json={"question": question}, timeout=10.0)
    resp.raise_for_status()
    return resp.text
