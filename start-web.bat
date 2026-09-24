@echo off
setlocal
title StegoBox Web Launcher
cd /d "%~dp0"

echo ========================================
echo   StegoBox Web Launcher
echo ========================================
echo.
echo Root: %CD%
echo.

set "PY="
where python >nul 2>&1
if not errorlevel 1 set "PY=python"
if not defined PY (
  where py >nul 2>&1
  if not errorlevel 1 set "PY=py"
)
if not defined PY (
  echo [!] Python not found. Install: https://www.python.org/downloads/
  echo     Check "Add Python to PATH" during setup.
  pause
  exit /b 1
)

set "PORT="
for %%p in (8000 8001 8002 8080 8888 9000) do (
  if not defined PORT (
    netstat -ano | findstr /r /c:"LISTENING" | findstr /c:":%%p " >nul 2>&1
    if errorlevel 1 set "PORT=%%p"
  )
)
if not defined PORT set "PORT=8000"

echo [1/2] Starting http://127.0.0.1:%PORT%/
echo [2/2] Opening browser...
echo.
echo Close this window to stop the server.
echo ----------------------------------------

start "" "http://127.0.0.1:%PORT%/demo/"
"%PY%" -m http.server %PORT% --bind 127.0.0.1

echo.
echo Server stopped.
pause
