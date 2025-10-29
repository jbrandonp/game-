@echo off
pushd %~dp0
cd apps\server
npm install
npm run dev
pause