// Vercel serverless entry point. Vercel auto-detects files in /api as
// serverless functions; we re-export the Express app as the handler.
import app from '../server.js'

export default app
