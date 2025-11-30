
# FundIt — Frontend (UI)

  This folder contains the frontend application for the FundIt crowdfunding platform (original design in Figma).

## Overview

- `index.html` — main HTML entry
- `package.json` — dependencies & scripts
- `vite.config.ts` — Vite configuration (includes `/api` proxy)
- `src/` — source files (components, context, api, styles, types)

## Quick start

  Install dependencies and start the dev server:

  ```bash
  cd uun-crowdfunding-frontend
  npm install
  npm run dev
  ```

  The dev server runs at `http://localhost:3000` by default. Vite is configured to proxy `/api` requests to `http://localhost:4000` (see `vite.config.ts`).

### Build for production

  ```bash
  npm run build
  # optional: serve the build locally
  npm install -g serve
  serve -s dist
  ```

## Environment & backend proxy

  The frontend expects the backend API to be available at `http://localhost:4000`. If your backend runs on a different host or port, update the proxy in `vite.config.ts` or change `src/api/client.ts` accordingly.

## Authentication

- The app uses cookie-based session authentication (a `session` cookie set as `httpOnly`).
- All API calls use `axios` with `withCredentials: true` so cookies are sent with requests.

  Key endpoints used by the UI:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/users/me`

## Development notes & troubleshooting

- If cookies are not persisted across requests, check your backend cookie options (`secure`, `sameSite`) and whether HTTPS is required in your environment.
- Inspect network requests in your browser DevTools (Network tab) to verify cookies and API responses.
- If Vite fails to start on port `3000`, change `server.port` in `vite.config.ts` or stop the process using that port.
- Make sure you use a compatible Node.js version and your package manager (npm/yarn) is up to date.

## Tips

- Use Postman or curl to validate backend endpoints and inspect cookie behavior when debugging.
- For production deployments, ensure TLS is enabled and cookies are set with the `secure` flag.

## License

  This folder follows the parent project's licensing.
  