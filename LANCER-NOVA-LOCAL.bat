@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js n'est pas installe ou n'est pas dans le PATH.
  echo Installez la version LTS depuis https://nodejs.org puis relancez ce fichier.
  pause
  exit /b 1
)
echo Demarrage de NOVA Academy...
node server-local.js
echo.
echo Le serveur s'est arrete. Si une erreur est affichee, prenez une capture d'ecran.
pause
