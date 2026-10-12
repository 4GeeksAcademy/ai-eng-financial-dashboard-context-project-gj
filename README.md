# Financial Metrics Dashboard

<!-- hide -->

By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) at [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_Estas instrucciones están [disponibles en español](./README.es.md)._

**Before you start**: 📗 [Read the instructions](https://4geeks.com/lesson/how-to-start-a-project) on how to start a coding project.

<!-- endhide -->

---

_Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend._

## Recommended steps

1. Fork this repository to your account.
2. Open your fork in GitHub Codespaces or clone it and run it in your local environment.
3. Run your AI agent to inspect both frontend and backend.
4. Document the proposed rules and memory bank in your fork.
5. Refine and validate the rules until they fit the project's real workflow.

## Expected agents directory structure

```text
./.agents
└─ /rules
   └─ <rule-name>.md
└─ /skills
   └─ /<skill-name>
      └─ /SKILL.md
```

## How to run locally

```bash
docker compose up --build
```

In development, the frontend uses the Vite proxy for `/api`, and Compose directs it to the `backend` service; no extra variables are required. To change that destination, set `VITE_API_PROXY_TARGET` in `frontend/.env.local`.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API documentation: http://localhost:8000/docs

## Frontend production image

The default image serves the static build with Nginx on port 80. Its `/api/` proxy targets `http://backend:8000` by default, so the container must share a network with the backend and resolve that name. Override it at runtime with `API_UPSTREAM`.

```bash
docker build -t financial-dashboard-frontend ./frontend
docker run --rm -p 8080:80 --network backend-network -e API_UPSTREAM=http://backend:8000 financial-dashboard-frontend
```

Replace `backend-network` with a Docker network shared with the API service, where the name `backend` resolves.

To have the browser call a public API directly instead of using the Nginx proxy, set `VITE_API_BASE_URL` when building the image; this URL is bundled into the frontend, and the API must allow the frontend origin through CORS.

---

This and many other projects are built by students as part of the [Career Programs](https://4geeksacademy.com/compare-programs) at [4Geeks Academy](https://4geeksacademy.com). By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors). Find out more about [AI Engineering](https://4geeksacademy.com/en/coding-bootcamps/ai-engineering), [Data Science & Machine Learning](https://4geeksacademy.com/en/coding-bootcamps/data-science-ml), [Cybersecurity](https://4geeksacademy.com/en/coding-bootcamps/cybersecurity) and [Full-Stack Software Developer with AI](https://4geeksacademy.com/en/coding-bootcamps/full-stack-developer).
