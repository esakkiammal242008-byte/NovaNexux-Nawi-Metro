# NovaNexus API

Standalone Express/SQLite backend for the NovaNexus prototype.

```powershell
npm install
npm start
```

The API listens on `http://localhost:4000`. Demo accounts are seeded on first start. Evaluation is OIML R76-based configurable evaluation and is not legal certification.

## Render

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Health URL: `https://YOUR-SERVICE.onrender.com/api/health`

The root URL returns a pointer to the health endpoint. The API binds to `0.0.0.0` and uses Render's `PORT` environment variable.
