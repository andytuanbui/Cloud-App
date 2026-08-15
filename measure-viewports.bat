@echo off
setlocal enabledelayedexpansion

REM ---------------------------------------------------------------------------
REM  CloudWise - automated Wisdom Canvas viewport measurement
REM
REM  Prerequisite: Expo web is already serving on http://localhost:8082
REM  Everything else is handled here. Nothing to click, no DevTools.
REM
REM  Result: docs\canvas-templates\wis-money-001\measurements-raw.json
REM ---------------------------------------------------------------------------

cd /d "%~dp0tools\measure-viewports" || goto :fail

echo.
echo === CloudWise viewport measurement ===
echo Target: http://localhost:8082
echo.

echo [1/3] Installing the measurement runner (first run only)...
call npm install --no-audit --no-fund --silent
if errorlevel 1 goto :fail

echo [2/3] Ensuring a Chromium build is available (first run only)...
call npx --yes playwright install chromium
if errorlevel 1 goto :fail

echo [3/3] Measuring 375x812, 390x844 and 430x932...
echo.
call node run.mjs
set RUN_EXIT=%errorlevel%

echo.
if "%RUN_EXIT%"=="0" (
  echo DONE. Results written to:
) else (
  echo FINISHED WITH ERRORS. Partial results written to:
)
echo   %~dp0docs\canvas-templates\wis-money-001\measurements-raw.json
echo.
echo Tell Claude the run is finished - it reads the file directly.
echo.
pause
exit /b %RUN_EXIT%

:fail
echo.
echo Setup failed. Check that Node.js is installed and on PATH,
echo and that Expo web is running on http://localhost:8082
echo.
pause
exit /b 1
