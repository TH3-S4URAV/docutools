import os
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import BASE_DIR, HOST, PORT
from app.core.cleanup import cleanup_old_files
from app.routers import tools, health

async def periodic_cleanup_task():
    """Background loop to scavenge stale temporary files every 10 minutes."""
    while True:
        try:
            await asyncio.sleep(600)
            cleaned = cleanup_old_files()
            if cleaned > 0:
                print(f"[DocuTools Scavenger] Purged {cleaned} stale temporary files.")
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[DocuTools Scavenger Error] {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    cleanup_task = asyncio.create_task(periodic_cleanup_task())
    print("[DocuTools] Application started. Background cleanup scavenger active.")
    yield
    # Shutdown
    cleanup_task.cancel()
    print("[DocuTools] Application shut down cleanly.")

app = FastAPI(
    title="DocuTools API",
    description="Production-grade, end-to-end document & PDF processing API.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler to catch unexpected exceptions safely
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred while processing your document. Please verify the file format and try again."}
    )

# Include API Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(tools.router, prefix="/api")

# Static frontend serving
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        target = FRONTEND_DIST / full_path
        if target.is_file():
            return FileResponse(str(target))
        return FileResponse(str(FRONTEND_DIST / "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
