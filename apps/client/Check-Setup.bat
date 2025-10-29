@echo off
echo === Verifications de base ===
echo 1) Version de Node et npm (si 'n'est pas reconnu', installe Node.js LTS) :
node -v
npm -v
echo.
echo 2) Arborescence attendue (doit contenir apps\client et apps\server) :
dir
if not exist apps\client echo [ERREUR] Dossier apps\client introuvable. Dezippe correctement le starter.
if not exist apps\server echo [ERREUR] Dossier apps\server introuvable. Dezippe correctement le starter.
echo.
echo 3) Test d'installation minimale cote client :
if exist apps\client (
  pushd apps\client
  call npm -v
  popd
)
echo.
echo Si un des points ci-dessus echoue, re-installe Node.js (version LTS) puis re-ouvre le terminal.
pause