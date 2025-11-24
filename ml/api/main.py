"""
FastAPI endpoint untuk prediksi gagal panen.
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import predict as pred_module
import json
import os
import pandas as pd

app = FastAPI(
    title="Harvest Failure Prediction API",
    description="API untuk prediksi gagal panen menggunakan model GRU",
    version="1.0.0"
)

class PredictionRequest(BaseModel):
    region: str
    start_date: Optional[str] = None
    use_csv: bool = True
    planting_month: Optional[int] = None  # Bulan penanaman (1-12) untuk prediksi 3 bulan ke depan

class PredictionResponse(BaseModel):
    region: str
    probability: float
    threshold: float
    prediction: str
    risk_level: str
    confidence: str
    reasons: list = []
    mitigation_recommendations: list = []
    weather_forecast: dict = {}
    web_summary: dict = {}  # Tambahkan web_summary untuk frontend

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Coba load model untuk memastikan semuanya berfungsi
        model, scaler, config = pred_module.load_model_and_artifacts()
        return {
            "status": "healthy",
            "model_loaded": True
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.post("/predict", response_model=PredictionResponse)
async def predict_harvest_failure(request: PredictionRequest):
    """
    Memprediksi kemungkinan gagal panen untuk suatu wilayah.
    
    Args:
        request: PredictionRequest dengan region, start_date (opsional), dan use_csv
    
    Returns:
        PredictionResponse dengan hasil prediksi
    """
    try:
        # Validasi planting_month jika diberikan
        if request.planting_month is not None:
            if not (1 <= request.planting_month <= 12):
                raise HTTPException(
                    status_code=400,
                    detail="planting_month harus antara 1-12"
                )
        
        result = pred_module.predict_harvest_failure(
            region_name=request.region,
            start_date=request.start_date,
            use_csv=request.use_csv,
            planting_month=request.planting_month
        )
        
        # Jika ada error dalam result
        if 'error' in result:
            raise HTTPException(status_code=404, detail=result['error'])
        
        # Pastikan web_summary ada di result
        if 'web_summary' not in result:
            result['web_summary'] = {}
        
        return PredictionResponse(**result)
    
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Model tidak ditemukan. Pastikan model sudah dilatih terlebih dahulu. Error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saat melakukan prediksi: {str(e)}"
        )

@app.post("/predict/batch")
async def predict_batch(regions: list[str], use_csv: bool = True):
    """
    Memprediksi untuk beberapa wilayah sekaligus.
    
    Args:
        regions: List nama kabupaten/kota
        use_csv: Jika True, gunakan data CSV lokal
    
    Returns:
        List hasil prediksi untuk setiap wilayah
    """
    try:
        results = pred_module.predict_batch(regions, use_csv=use_csv)
        return {
            "results": results,
            "total": len(results)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saat melakukan batch prediction: {str(e)}"
        )

@app.get("/regions")
async def get_available_regions():
    """
    Mendapatkan daftar wilayah yang tersedia dalam data.
    """
    try:
        # Baca langsung data kabupaten/kota dari Excel di folder data
        # __file__ adalah ml/api/main.py, jadi naik 2 level ke root ml/
        current_file = os.path.abspath(__file__)
        base_dir = os.path.dirname(os.path.dirname(current_file))  # root ml/
        panen_path = os.path.join(base_dir, "data", "sample_data_panen.xlsx")
        
        # Pastikan file exists
        if not os.path.exists(panen_path):
            raise FileNotFoundError(f"File data tidak ditemukan: {panen_path}")

        df_harvest = pd.read_excel(panen_path)

        # Pastikan kolom yang dibutuhkan ada
        prov_col = None
        for col in df_harvest.columns:
            if str(col).lower().strip() in ["provinsi", "province"]:
                prov_col = col
                break

        kab_col = None
        for col in df_harvest.columns:
            if "kab" in str(col).lower() or "kota" in str(col).lower():
                kab_col = col
                break

        if kab_col is None:
            raise ValueError("Kolom kabupaten/kota tidak ditemukan dalam file Excel panen")

        # Filter hanya Jawa Barat jika kolom provinsi tersedia
        if prov_col is not None:
            df_harvest = df_harvest[df_harvest[prov_col].astype(str).str.contains("Jawa Barat", case=False, na=False)]

        regions_series = df_harvest[kab_col].astype(str).dropna()
        regions = sorted(regions_series.unique().tolist(), key=lambda x: x.lower())
        return {
            "regions": regions,
            "total": len(regions)
        }
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"File data tidak ditemukan: {str(e)}"
        )
    except ImportError as e:
        if 'openpyxl' in str(e).lower():
            raise HTTPException(
                status_code=500,
                detail="Modul openpyxl tidak ditemukan. Install dengan: pip install openpyxl"
            )
        raise HTTPException(
            status_code=500,
            detail=f"Error import: {str(e)}"
        )
    except Exception as e:
        import traceback
        error_detail = f"Error saat mengambil daftar wilayah: {str(e)}\nTraceback: {traceback.format_exc()}"
        raise HTTPException(
            status_code=500,
            detail=error_detail
        )

# Serve static files
static_dir = os.path.join(os.path.dirname(__file__), 'static')
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def serve_index():
    """Serve the main HTML page."""
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    index_path = os.path.join(static_dir, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Harvest Failure Prediction API", "status": "running", "version": "1.0.0", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)

