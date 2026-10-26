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

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$project = '%~dp0'.TrimEnd('\'); $startup = [Environment]::GetFolderPath('Startup'); $shell = New-Object -ComObject WScript.Shell; $shortcut = $shell.CreateShortcut((Join-Path $startup 'Informacion del equipo.lnk')); $shortcut.TargetPath = Join-Path $project 'Iniciar aplicacion local.bat'; $shortcut.WorkingDirectory = $project; $shortcut.WindowStyle = 7; $shortcut.Save()"
if errorlevel 1 (
  echo No se pudo registrar el inicio automatico.
  pause
  exit /b 1
)

echo Inicio automatico configurado para este usuario de Windows.
echo La aplicacion local se abrira al iniciar sesion en Windows.
call "%~dp0Iniciar aplicacion local.bat"
