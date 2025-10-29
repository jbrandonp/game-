@echo off
REM === Launch server and client in two separate terminals ===
pushd %~dp0
start cmd /k "cd apps\server && npm install && npm run dev"
start cmd /k "cd apps\client && npm install && npm run dev"
echo Deux fenêtres vont s'ouvrir: serveur (2567) et client (5173).
echo Si une fenetre se ferme tout de suite, lance d'abord Check-Setup.bat
pause