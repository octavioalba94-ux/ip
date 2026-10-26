@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo No se encontro npm. Instala Node.js y vuelve a intentarlo.
  pause
  exit /b 1
)

curl.exe --silent --fail http://localhost:3000/api/health >nul 2>nul
if errorlevel 1 (
  if exist "%~dp0node_modules\vite\bin\vite.js" (
    start "Informacion del equipo - servidor" /min /D "%~dp0" cmd /k npm run dev
  ) else (
    start "Informacion del equipo - servidor" /min /D "%~dp0" cmd /k "npm install && npm run dev"
  )
)

for /L %%i in (1,1,30) do (
  curl.exe --silent --fail http://localhost:3000/api/health >nul 2>nul
  if not errorlevel 1 goto open
  timeout /t 1 /nobreak >nul
)

echo El servicio no respondio en 30 segundos. Revisa la ventana del servidor.
pause
exit /b 1

:open
start "" http://localhost:3000
