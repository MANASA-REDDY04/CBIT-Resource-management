# ==============================================================================
# CBIT Resource Hub - Optimal Local Development Launcher
# Starts FastAPI Backend (Port 8000) and Next.js Frontend (Port 3000)
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   Starting CBIT Resource Hub (Chaitanya Bharathi Institute of Technology)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Start FastAPI Backend in new window
Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; `$env:PYTHONPATH='backend'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -PassThru

# 2. Start Next.js Frontend in new window
Write-Host "[2/2] Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev" -PassThru

Write-Host "----------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host " Portal URLs:" -ForegroundColor Yellow
Write-Host "   Frontend Application: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API Docs:     http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Cloud Database:       Render (Singapore) - Connected" -ForegroundColor White
Write-Host "----------------------------------------------------------------------" -ForegroundColor Yellow
Write-Host " Login Credentials for Evaluation:" -ForegroundColor Yellow
Write-Host "   Admin:   admin@cbit.ac.in   / Admin@Cbit2025!" -ForegroundColor White
Write-Host "   Faculty: faculty@cbit.ac.in / Faculty@Cbit2025!" -ForegroundColor White
Write-Host "   Staff:   staff@cbit.ac.in   / Staff@Cbit2025!" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

