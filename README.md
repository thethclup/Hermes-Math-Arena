### Integration maturity

This repository is a prototype front-end visualization scaffold prepared for Hermes-Agent integration.
- Frontend: animation demo + socket client
- Backend: websocket mock stream (backend/server.py)
- Real Hermes Agent integration (backend/hermes_bridge.py) and robust step parsing (backend/step_parser.py) are scaffolds / placeholders.

Next recommended steps: implement hermes_bridge.solve() to call the real agent API and improve step_parser to map streaming reasoning tokens into fine-grained visual steps.
