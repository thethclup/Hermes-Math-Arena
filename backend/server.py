from fastapi import FastAPI, WebSocket
import json
import asyncio

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()

    while True:
        # receive a question from the frontend
        question = await ws.receive_text()

        # NOTE: this is a demo/mock stream. Replace with real Hermes Agent + step_parser integration later.
        steps = [
            {
                "visualType": "triangle_build",
                "data": {"base": 4, "height": 3}
            },
            {
                "visualType": "highlight_angles",
                "data": {"angles": [60, 60, 60]}
            },
            {
                "visualType": "show_result",
                "data": {"text": "180 degrees"}
            }
        ]

        for step in steps:
            await ws.send_text(json.dumps(step))
            await asyncio.sleep(2)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)