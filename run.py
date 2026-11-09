import sys
from pathlib import Path
import uvicorn

if __name__ == "__main__":
    # Ensure backend directory is in python path
    backend_path = Path(__file__).resolve().parent / "backend"
    sys.path.insert(0, str(backend_path))

    # Support optional custom port argument (e.g. python run.py 3000 or 8000)
    port = 8000
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])

    print("=" * 72)
    print("🏥 SEVASAAR AI (सेवाસાર) • PATIENT INTAKE & TRIAGE PORTAL")
    print("=" * 72)
    print("• Backend:  FastAPI / Uvicorn / SQLAlchemy / LangChain / Gemma AI")
    print("• Frontend: Pure HTML5 / CSS3 / Vanilla JavaScript / Web Speech API")
    print("• Database: SQLite (database/dev.db)")
    print(f"• Web Application URL: http://localhost:{port}")
    print(f"• API Documentation:  http://localhost:{port}/docs")
    print("=" * 72)

    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True, app_dir=str(backend_path))
