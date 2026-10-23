@echo off
title Lema Fast WiFi - AP Auto-Status Watchdog
color 0A

:: LEMA FAST WIFI - TP-LINK OMADA AP REAL-TIME WATCHDOG
:: Hii script inachunguza uhalisia wa AP yako kila sekunde 10.
:: Ukichomeka AP, mfumo unabadilika kuwa ONLINE moja kwa moja!
:: Ukichomoa AP, mfumo unabadilika kuwa OFFLINE na kukutumia kengele!

set AP_IP=192.168.88.10
set SERVER_URL=https://lemawifi.online

echo ============================================================
echo   LEMA FAST WIFI - TP-LINK OMADA REAL-TIME STATUS WATCHDOG
echo ============================================================
echo Inachunguza AP yenye IP: %AP_IP%
echo Seva ya Mfumo: %SERVER_URL%
echo.
echo [INFO] Ili kurekebisha IP ya AP yako, fungua faili hili kwa Notepad na ubadilishe AP_IP.
echo.

set LAST_STATE=unknown

:loop
ping -n 1 -w 1200 %AP_IP% >nul 2>&1
if errorlevel 1 (
    if not "%LAST_STATE%"=="offline" (
        echo [%TIME%] [!] AP IMEZIMA! Inatuma taarifa ya OFFLINE kwenye mfumo...
        curl -s "%SERVER_URL%/api/v1/hardware/alert/outage?ip=%AP_IP%&status=down" >nul
        set LAST_STATE=offline
    ) else (
        echo [%TIME%] AP bado Imezima (Offline)...
    )
) else (
    if not "%LAST_STATE%"=="online" (
        echo [%TIME%] [OK] AP IMERUDI HEWANI! Inatuma taarifa ya ONLINE kwenye mfumo...
        curl -s "%SERVER_URL%/api/v1/hardware/alert/outage?ip=%AP_IP%&status=up" >nul
        curl -s "%SERVER_URL%/api/v1/hardware/heartbeat?ip=%AP_IP%" >nul
        set LAST_STATE=online
    ) else (
        curl -s "%SERVER_URL%/api/v1/hardware/heartbeat?ip=%AP_IP%" >nul
        echo [%TIME%] AP ipo Hewani (Online) - Heartbeat imetumwa.
    )
)

timeout /t 10 /nobreak >nul
goto loop
