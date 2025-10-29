@echo off
pushd %~dp0
cd apps\client
npm install
npm run dev
pause