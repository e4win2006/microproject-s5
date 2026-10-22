@echo off
title Campus Recruitment Portal - Stop Servers
color 0e

echo =====================================================================
echo                Stopping Campus Recruitment Portal
echo =====================================================================
echo.

echo Stopping Node.js processes on port 5000 and 5173...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo Terminating backend process PID %%a...
    taskkill /F /PID %%a >nul 2>nul
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Terminating frontend process PID %%a...
    taskkill /F /PID %%a >nul 2>nul
)

echo.
echo All portal servers stopped.
echo.
pause
