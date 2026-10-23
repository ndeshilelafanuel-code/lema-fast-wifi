# ============================================================
# LEMA FAST WIFI - REAL-TIME AP STATUS WATCHDOG (POWERSHELL)
# ============================================================
param (
    [string]$ApIp = "192.168.88.10",
    [string]$ServerUrl = "https://lemawifi.online",
    [int]$IntervalSeconds = 10
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  LEMA FAST WIFI - TP-LINK OMADA STATUS WATCHDOG DAEMON" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "AP IP: $ApIp" -ForegroundColor White
Write-Host "Server: $ServerUrl" -ForegroundColor White
Write-Host "Interval: $IntervalSeconds sekunde" -ForegroundColor White
Write-Host "Kazi: Ukichomeka AP, mfumo unaweka ONLINE; ukichomoa, unaweka OFFLINE." -ForegroundColor Gray
Write-Host ""

$lastState = "unknown"

while ($true) {
    $isUp = Test-Connection -ComputerName $ApIp -Count 1 -Quiet -TimeoutSeconds 1 -ErrorAction SilentlyContinue

    if ($isUp) {
        if ($lastState -ne "online") {
            Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] 🟢 AP IMERUDI HEWANI (ONLINE)! Inaripoti kwenye mfumo..." -ForegroundColor Green
            try {
                Invoke-RestMethod -Uri "$ServerUrl/api/v1/hardware/alert/outage?ip=$ApIp&status=up" -Method Get -TimeoutSec 5 | Out-Null
                Invoke-RestMethod -Uri "$ServerUrl/api/v1/hardware/heartbeat?ip=$ApIp" -Method Get -TimeoutSec 5 | Out-Null
            } catch {}
            $lastState = "online"
        } else {
            try {
                Invoke-RestMethod -Uri "$ServerUrl/api/v1/hardware/heartbeat?ip=$ApIp" -Method Get -TimeoutSec 5 | Out-Null
            } catch {}
            Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] 🟢 AP Ipo Hewani (Heartbeat sent)" -ForegroundColor DarkGreen
        }
    } else {
        if ($lastState -ne "offline") {
            Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] 🚨 AP IMEZIMA (OFFLINE)! Inatuma taarifa kwenye mfumo..." -ForegroundColor Red
            try {
                Invoke-RestMethod -Uri "$ServerUrl/api/v1/hardware/alert/outage?ip=$ApIp&status=down" -Method Get -TimeoutSec 5 | Out-Null
            } catch {}
            $lastState = "offline"
        } else {
            Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] 🔴 AP Bado Imezima..." -ForegroundColor DarkRed
        }
    }

    Start-Sleep -Seconds $IntervalSeconds
}
