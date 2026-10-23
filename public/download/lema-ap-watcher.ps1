# =====================================================================
# LEMA FAST WIFI - REAL-TIME AP STATUS WATCHDOG DAEMON (POWERSHELL)
# =====================================================================
param (
    [string]$ApIp = "192.168.1.153",
    [string]$ServerUrl = "https://lemawifi.online",
    [string]$ApMac = "D4-D6-DF-0D-B3-A0",
    [int]$IntervalSeconds = 6
)

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "         LEMA FAST WIFI - TP-LINK OMADA STATUS WATCHDOG             " -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "AP IP Lengo: $ApIp" -ForegroundColor White
Write-Host "AP MAC:      $ApMac" -ForegroundColor White
Write-Host "Seva:        $ServerUrl" -ForegroundColor White
Write-Host "Kipindi:     Kila sekunde $IntervalSeconds" -ForegroundColor White
Write-Host "Maelezo:     Ukichomeka AP -> Mfumo unaweka ONLINE moja kwa moja!" -ForegroundColor Gray
Write-Host "             Ukichomoa AP  -> Mfumo unaweka OFFLINE na kutuma kengele!" -ForegroundColor Gray
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$lastState = "unknown"

while ($true) {
    # Test connection via ping
    $isUp = Test-Connection -ComputerName $ApIp -Count 1 -Quiet -TimeoutSeconds 1 -ErrorAction SilentlyContinue

    $timeStr = (Get-Date).ToString('HH:mm:ss')

    if ($isUp) {
        if ($lastState -ne "online") {
            Write-Host "[$timeStr] 🟢 [ONLINE] AP imepatikana kwenye $ApIp! Inatuma taarifa kwenye mfumo..." -ForegroundColor Green
            try {
                Invoke-RestMethod -Uri "$ServerUrl/api/v1/hardware/alert/outage?ip=$ApIp&mac=$ApMac&status=up" -Method Get -TimeoutSec 4 -ErrorAction SilentlyContinue | Out-Null
                Invoke-RestMethod -Uri "$ServerUrl/api/v1/hardware/heartbeat?ip=$ApIp&mac=$ApMac" -Method Get -TimeoutSec 4 -ErrorAction SilentlyContinue | Out-Null
                Write-Host "[$timeStr] [OK] Mfumo sasa unaonyesha ONLINE!" -ForegroundColor Green
            } catch {
                Write-Host "[$timeStr] [TAHADHARI] Seva haikupokea ombi kwa sasa." -ForegroundColor Yellow
            }
            $lastState = "online"
        } else {
            try {
                Invoke-RestMethod -Uri "$ServerUrl/api/v1/hardware/heartbeat?ip=$ApIp&mac=$ApMac" -Method Get -TimeoutSec 4 -ErrorAction SilentlyContinue | Out-Null
            } catch {}
            Write-Host "[$timeStr] 🟢 AP ipo hewani ($ApIp ONLINE)" -ForegroundColor DarkGreen
        }
    } else {
        if ($lastState -ne "offline") {
            Write-Host "[$timeStr] 🔴 [OFFLINE] AP haijibu Ping ($ApIp)! Inatuma taarifa ya dharura..." -ForegroundColor Red
            try {
                Invoke-RestMethod -Uri "$ServerUrl/api/v1/hardware/alert/outage?ip=$ApIp&mac=$ApMac&status=down" -Method Get -TimeoutSec 4 -ErrorAction SilentlyContinue | Out-Null
                Write-Host "[$timeStr] [OK] Mfumo sasa unaonyesha OFFLINE!" -ForegroundColor Red
            } catch {
                Write-Host "[$timeStr] [TAHADHARI] Seva haikupokea ombi kwa sasa." -ForegroundColor Yellow
            }
            $lastState = "offline"
        } else {
            Write-Host "[$timeStr] 🔴 AP bado haipatikani ($ApIp OFFLINE)..." -ForegroundColor DarkRed
        }
    }

    Start-Sleep -Seconds $IntervalSeconds
}
