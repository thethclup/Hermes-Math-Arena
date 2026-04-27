## Local integration with user's Hermes Agent

This bridge expects the user to run a local Hermes Agent that exposes either:
- a websocket at ws://localhost:5000/ws (preferred, streaming), or
- an HTTP chat endpoint at http://localhost:5000/chat

Start bridge:
```bash
# optional: create & activate venv
python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
uvicorn backend.server:app --reload
