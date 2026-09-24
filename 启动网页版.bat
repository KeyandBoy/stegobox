@echo off
setlocal
title 隐匣 StegoBox - 网页版
cd /d "%~dp0"

echo ========================================
echo   隐匣 StegoBox 网页版启动器
echo ========================================
echo.
echo 目录: %CD%
echo.

set "PY="
where python >nul 2>&1
if not errorlevel 1 set "PY=python"
if not defined PY (
  where py >nul 2>&1
  if not errorlevel 1 set "PY=py"
)
if not defined PY (
  echo  [!] 未找到 Python
  echo      请安装: https://www.python.org/downloads/
  echo      安装时勾选 "Add Python to PATH"
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

echo [1/2] 启动本地服务 http://127.0.0.1:%PORT%/
echo [2/2] 打开浏览器...
echo.
echo 关闭本窗口即可停止服务。
echo ----------------------------------------

start "" "http://127.0.0.1:%PORT%/demo/"
"%PY%" -m http.server %PORT% --bind 127.0.0.1

echo.
echo 服务已停止。
pause
