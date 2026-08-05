@echo off
title Enterprise Sales Platform - Starting...
setlocal enabledelayedexpansion

set "PORT=5173"
set "URL=http://localhost:%PORT%"

echo ============================================
echo   Enterprise Sales Platform - One-Click Start
echo ============================================
echo.

REM --- Check if the server is already running ---
curl -s -o NUL --connect-timeout 2 "http://localhost:%PORT%"
if %errorlevel%==0 (
    echo Server is already running. Opening browser...
    start "" "%URL%"
    goto :done
)

REM --- Start the dev server in a separate window ---
echo Starting the platform server...
start "Enterprise Sales Platform - Dev Server" cmd /k "pnpm dev"

REM --- Wait until the server is ready (max 60 seconds) ---
set /a tries=0
:wait
set /a tries+=1
if %tries% gtr 60 (
    echo.
    echo The server is taking too long to start.
    echo Make sure pnpm is installed, then run: pnpm dev
    goto :done
)
curl -s -o NUL --connect-timeout 2 "http://localhost:%PORT%"
if errorlevel 1 (
    timeout /t 1 /nobreak > NUL
    goto :wait
)

echo.
echo The platform is ready! Opening your browser...
start "" "%URL%"

:done
echo.
echo If your browser did not open, visit: %URL%
timeout /t 3 /nobreak > NUL
