# © 2025 Jeff. All rights reserved.
# Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import uuid
import subprocess
import json
import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Plan Parser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {
    'jpg', 'jpeg', 'png', 'pdf', 'dwg', 'dxf', 'rvt', 'ifc',
    'pln', 'zip', 'csv', 'xlsx', 'txt'
}

ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/png', 'application/pdf',
    'application/acad', 'application/x-acad', 'image/vnd.dwg',
    'image/vnd.dxf', 'application/dxf', 'application/dwg',
    'application/vnd.autodesk.revit', 'model/vnd.ifc',
    'application/octet-stream', 'application/x-twinmotion',
    'application/zip', 'application/x-zip-compressed',
    'text/plain', 'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

def validate_file_type(filename: str, content_type: str) -> bool:
    """Validate file against allowed extensions and MIME types"""
    if not filename:
        return False
    
    file_ext = filename.split('.')[-1].lower() if '.' in filename else ''
    
    # Check extension
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    # Check MIME type
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        return False
    
    return True

@app.post("/api/plan/upload")
async def parse_plan(file: UploadFile = File(...)):
    # Validate file type
    print(f"📁 Received file: {file.filename}, Content-Type: {file.content_type}")
    if not validate_file_type(file.filename, file.content_type):
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file type"
        )
    
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"

    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        # 🔍 DEBUG: Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="File save failed")

        # 🚀 Run your Python parser
        result = subprocess.run(
            ["python", "parser.py", str(file_path)],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=os.path.dirname(os.path.abspath(__file__))
        )

        # Clean up file
        os.remove(file_path)

        # Handle subprocess result
        if result.returncode != 0:
            print(f"❌ Parser failed with return code {result.returncode}")
            print(f"STDERR: {result.stderr}")
            print(f"STDOUT: {result.stdout}")
            raise HTTPException(
                status_code=500,
                detail=f"Parser script error: {result.stderr[:200]}"
            )

        # Try to parse JSON
        output = result.stdout.strip()
        print(f"📄 Parser output: {output}")

        try:
            parsed_data = json.loads(output)
            return parsed_data
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON from parser: {e}")
            print(f"Raw output: >>>{output}<<<")
            raise HTTPException(
                status_code=500,
                detail=f"Parser returned invalid JSON: {str(e)}"
            )

    except Exception as e:
        # Make sure file is cleaned up
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"🧹 Cleaned up broken file: {file_path}")
            except:
                pass

        print(f"💥 Unexpected error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")