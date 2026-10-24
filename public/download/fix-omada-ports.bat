@echo off
setlocal enabledelayedexpansion
title LEMA FAST WIFI - OMADA CONTROLLER PORT FIXER & CLEANUP
color 0B

cls
echo =====================================================================
echo       TP-LINK OMADA CONTROLLER - PORT RELEASE & CLEANUP UTILITY
echo                       Lema Fast WiFi Support
echo =====================================================================
echo.
echo Kosa la "Port 27217, 29810... already in use" linamaanisha Omada au
echo database yake (mongod.exe / java.exe) tayari inafanya kazi chinichini,
echo au ilikwama (stuck) kwenye kumbukumbu ya Windows.
echo.
echo Programu hii itafanya yafuatayo:
echo  1. Kufunga michakato iliyokwama ya Omada na Mongo (java, javaw, mongod)
echo  2. Kuachia bandari zote (Ports 27217, 29810 - 29817, 27001)
echo  3. Kukuwezesha kufungua Omada upya bila hitilafu yoyote!
echo.
echo =====================================================================
pause

echo.
echo [1/4] Inasimamisha Service ya Omada (kama ipo)...
net stop OmadaController >nul 2>&1

echo [2/4] Inafunga michakato iliyokwama ya Omada na MongoDB...
taskkill /F /IM "mongod.exe" >nul 2>&1
taskkill /F /IM "OmadaController.exe" >nul 2>&1
taskkill /F /IM "javaw.exe" >nul 2>&1
taskkill /F /IM "java.exe" >nul 2>&1

echo [3/4] Inasubiri sekunde 3 ili Windows iachie bandari zote...
timeout /t 3 /nobreak >nul

echo [4/4] Inakagua kama bandari zimeachiliwa...
netstat -ano | findstr "27217 29810 29811 29812 29813 29814" > temp_ports.txt
for %%A in (temp_ports.txt) do if %%~zA equ 0 (
    echo.
    echo =====================================================================
    echo  [HONGERA] Bandari zote za Omada sasa zipo HURU na zimeachiliwa!
    echo =====================================================================
) else (
    echo.
    echo [TAARIFA] Baadhi ya bandari zimesafishwa.
)
del temp_ports.txt >nul 2>&1

echo.
echo Sasa unaweza:
echo  A) Kufungua upya "Omada Network Application" kutoka Desktop yako.
echo  B) Au fungua kivinjari chako (Chrome/Edge): https://127.0.0.1:8043/
echo.
echo Bonyeza kitufe chochote kufunga ukurasa huu...
pause >nul
