from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
app = FastAPI(title="Acme Corp Event Management API", version="1.0.0")

@app.get("/health", tags=["Healths"], summary="Check API and database status")
async def health_check(db: AsyncSession = Depends(get_db)):
    await db.execute(text("SELECT 1"))
    return({"status": "ok", "database": "connected"})
