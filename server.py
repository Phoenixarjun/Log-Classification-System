import pandas as pd
from fastapi import FastAPI, UploadFile, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from classify import classify
import os

# Initialize FastAPI app
app = FastAPI()

# Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development only)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Set up paths
BASE_DIR = Path(__file__).parent
FRONTEND_DIR = BASE_DIR / "frontend"

# Serve static files directly from frontend directory
app.mount("/static", StaticFiles(directory=FRONTEND_DIR / "static"), name="static")


# Set up templates
templates = Jinja2Templates(directory=str(FRONTEND_DIR))

@app.get("/", response_class=HTMLResponse)
async def serve_frontend(request: Request):
    """Serve the frontend HTML page"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/classify/")
async def classify_logs(file: UploadFile):
    """Handle log classification from uploaded CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV.")
    
    try:
        # Read the uploaded CSV
        df = pd.read_csv(file.file)
        if "source" not in df.columns or "log_message" not in df.columns:
            raise HTTPException(
                status_code=400,
                detail="CSV must contain 'source' and 'log_message' columns."
            )

        # Perform classification
        df["target_label"] = classify(list(zip(df["source"], df["log_message"])))

        # Save the modified file
        output_file = "resources/output.csv"
        df.to_csv(output_file, index=False)
        
        return FileResponse(
            output_file,
            media_type='text/csv',
            filename="classified_logs.csv"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        file.file.close()

# For development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)