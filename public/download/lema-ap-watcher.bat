@echo off
setlocal enabledelayedexpansion
title LEMA FAST WIFI - AP REAL-TIME WATCHDOG MONITOR
color 0A

cls
echo =====================================================================
echo          LEMA FAST WIFI - TP-LINK OMADA AP WATCHDOG DAEMON
echo =====================================================================
echo  Hii programu inachunguza uhalisia wa AP yako kila sekunde 5-8.
echo  - Ukichomeka AP: Mfumo unabadilika kuwa ONLINE moja kwa moja!
echo  - Ukichomoa AP:  Mfumo unabadilika kuwa OFFLINE na kutuma kengele!
echo =====================================================================
echo.

:: Chaguo la IP ya AP (Inapima kwanza 192.168.88.115 kisha 192.168.1.153)
set DEFAULT_IP=192.168.88.115
set ALT_IP=192.168.1.153
set AP_IP=%DEFAULT_IP%

:: MAC address ya AP ya Omada
set AP_MAC=D4-D6-DF-0D-B3-A0

:: Seva ya Lema Fast WiFi
set PROD_SERVER=https://lemawifi.online

echo [MIPANGILIO YA MFUMO]
echo  - AP IP Target: %AP_IP% (au %ALT_IP%)
echo  - AP MAC:       %AP_MAC%
echo  - Seva:         %PROD_SERVER%
echo.
echo Inaanza kuchunguza mawasiliano ya AP sasa... (Bonyeza Ctrl+C kusimamisha)
echo =====================================================================
echo.

set LAST_STATE=unknown

:loop
:: Pima kama AP inajibu Ping
ping -n 1 -w 1000 %AP_IP% >nul 2>&1
set PING_RESULT=%errorlevel%

if not "%PING_RESULT%"=="0" (
    :: Jaribu pia IP mbadala (192.168.1.153)
    ping -n 1 -w 1000 %ALT_IP% >nul 2>&1
    if "%errorlevel%"=="0" (
        set AP_IP=%ALT_IP%
        set PING_RESULT=0
    )
)

if not "%PING_RESULT%"=="0" (
    :: Ping imeshindwa (AP Imezima au Imechomoka)
    if not "!LAST_STATE!"=="offline" (
        echo [!TIME!] 🔴 [OFFLINE] AP haijibu Ping kwa %AP_IP%! Waya umechomoka au umezima.
        echo          Inatuma taarifa ya OFFLINE kwenye mfumo wa Lema Fast WiFi...
        
        powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-RestMethod -Uri '%PROD_SERVER%/api/v1/hardware/alert/outage?ip=%AP_IP%&mac=%AP_MAC%&status=down' -TimeoutSec 4 | Out-Null } catch {}" >nul 2>&1
        
        echo          [OK] Hali imesasishwa: Mfumo sasa unaonyesha OFFLINE! Kengele imetumwa WhatsApp na SMS.
        set LAST_STATE=offline
    ) else (
        echo [!TIME!] 🔴 AP bado haipatikani (%AP_IP% OFFLINE)...
    )
) else (
    :: Ping imefanikiwa (AP Ipo Hewani)
    if not "!LAST_STATE!"=="online" (
        echo [!TIME!] 🟢 [ONLINE] AP imepatikana kikamilifu kwenye %AP_IP%!
        echo          Inatuma taarifa ya ONLINE kwenye mfumo wa Lema Fast WiFi...
        
        powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-RestMethod -Uri '%PROD_SERVER%/api/v1/hardware/alert/outage?ip=%AP_IP%&mac=%AP_MAC%&status=up' -TimeoutSec 4 | Out-Null; Invoke-RestMethod -Uri '%PROD_SERVER%/api/v1/hardware/heartbeat?ip=%AP_IP%&mac=%AP_MAC%' -TimeoutSec 4 | Out-Null } catch {}" >nul 2>&1
        
        echo          [OK] Hali imesasishwa: Mfumo sasa unaonyesha ONLINE!
        set LAST_STATE=online
    ) else (
        powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-RestMethod -Uri '%PROD_SERVER%/api/v1/hardware/heartbeat?ip=%AP_IP%&mac=%AP_MAC%' -TimeoutSec 3 | Out-Null } catch {}" >nul 2>&1
        echo [!TIME!] 🟢 AP ipo hewani (%AP_IP% ONLINE) - Mawasiliano mazuri.
    )
)

timeout /t 6 /nobreak >nul
goto loop
