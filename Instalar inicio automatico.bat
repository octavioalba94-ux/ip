@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js/npm. Instala Node.js 20.19 o superior y vuelve a intentarlo.
  pause
  exit /b 1
)

if not exist "%~dp0node_modules\vite\bin\vite.js" (
  echo Instalando dependencias de la aplicacion...
  call npm install
  if errorlevel 1 (
    echo No se pudieron instalar las dependencias.
    pause
    exit /b 1
  )
)

set "IP_APP_DIR=%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; $project = $env:IP_APP_DIR.TrimEnd('\'); $node = (Get-Command node.exe).Source; $user = [Security.Principal.WindowsIdentity]::GetCurrent().Name; $action = New-ScheduledTaskAction -Execute $node -Argument 'server.js' -WorkingDirectory $project; $trigger = New-ScheduledTaskTrigger -AtLogOn -User $user; $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited; $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries; Register-ScheduledTask -TaskName 'Informacion del equipo - servicio local' -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description 'Inicia en segundo plano el servicio local para consultar la IPv4 Ethernet.' -Force | Out-Null; $startup = [Environment]::GetFolderPath('Startup'); $oldShortcut = Join-Path $startup 'Informacion del equipo.lnk'; if (Test-Path -LiteralPath $oldShortcut) { Remove-Item -LiteralPath $oldShortcut }; try { Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -TimeoutSec 2 -UseBasicParsing | Out-Null } catch { Start-ScheduledTask -TaskName 'Informacion del equipo - servicio local' }"
if errorlevel 1 (
  echo No se pudo registrar el servicio local de inicio automatico.
  pause
  exit /b 1
)

echo Servicio local configurado para iniciarse en segundo plano al iniciar sesion.
echo Abriendo ahora la pagina local para mostrar la IPv4 Ethernet...
for /L %%i in (1,1,30) do (
  curl.exe --silent --fail http://localhost:3000/api/health >nul 2>nul
  if not errorlevel 1 goto open
  timeout /t 1 /nobreak >nul
)

echo El servicio no respondio en 30 segundos. Revisa que Node.js pueda ejecutarse.
pause
exit /b 1

:open
start "" http://localhost:3000
