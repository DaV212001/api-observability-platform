# Docker Operations

This folder is reserved for operational Docker notes and future environment-specific overrides.

Current local stack:

- `api`: Express service exposing `/health`, `/users`, `/posts`, and `/metrics`
- `prometheus`: scrapes the API every 5 seconds and loads alert simulation rules
- `grafana`: auto-provisions the dark monitoring dashboard on port `3001`

Run from the project root:

```bash
docker compose up --build
```
