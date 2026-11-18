@echo off
title CBIT Resource Hub - Development Launcher
echo ======================================================================
echo    Starting CBIT Resource Hub (Chaitanya Bharathi Institute of Technology)
echo ======================================================================

set ROOT=%~dp0

echo [1/2] Starting FastAPI Backend on http://localhost:8000...
start "CBIT Backend (FastAPI)" cmd /k "cd /d %ROOT% && set PYTHONPATH=backend&& python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Starting Next.js Frontend on http://localhost:3000...
start "CBIT Frontend (Next.js)" cmd /k "cd /d %ROOT%frontend && npm run dev"

echo.
echo ----------------------------------------------------------------------
echo  Portal URLs:
echo    Frontend Application: http://localhost:3000
echo    Backend API Docs:     http://localhost:8000/docs
echo    Cloud Database:       Render (Singapore) - Live & Connected
echo ----------------------------------------------------------------------
echo  Login Credentials:
echo    Admin:   admin@cbit.ac.in   / Admin@Cbit2025!
echo    Faculty: faculty@cbit.ac.in / Faculty@Cbit2025!
echo    Staff:   staff@cbit.ac.in   / Staff@Cbit2025!
echo ======================================================================
pause

