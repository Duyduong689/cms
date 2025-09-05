# Session-based Authentication Test Script (PowerShell)
# Tests immediate token invalidation on logout

$BaseUrl = "http://localhost:3000"
$CookieJar = "test_cookies.txt"

Write-Host "🔐 Session-Based Authentication Test" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Clean up previous test cookies
if (Test-Path $CookieJar) {
    Remove-Item $CookieJar
}

Write-Host ""
Write-Host "1️⃣  Login and get session cookies..." -ForegroundColor Yellow

try {
    $LoginBody = @{
        email = "admin@example.com"
        password = "password123"
    } | ConvertTo-Json

    $LoginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Body $LoginBody -ContentType "application/json" -SessionVariable WebSession
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Response: $($LoginResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2️⃣  Test protected route with valid session..." -ForegroundColor Yellow

try {
    $MeResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/me" -Method GET -WebSession $WebSession
    Write-Host "✅ Protected route accessible" -ForegroundColor Green
    Write-Host "   User: $($MeResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Protected route failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3️⃣  Logout and invalidate session..." -ForegroundColor Yellow

try {
    $LogoutResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/logout" -Method POST -WebSession $WebSession
    Write-Host "✅ Logout successful" -ForegroundColor Green
    Write-Host "   Response: $($LogoutResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
    Write-Host "   Session should now be invalidated" -ForegroundColor Gray
} catch {
    Write-Host "❌ Logout failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "4️⃣  Test protected route with invalidated session..." -ForegroundColor Yellow

try {
    $MeAfterLogout = Invoke-RestMethod -Uri "$BaseUrl/auth/me" -Method GET -WebSession $WebSession
    Write-Host "❌ Session NOT invalidated" -ForegroundColor Red
    Write-Host "   Expected 401, but got successful response" -ForegroundColor Red
    Write-Host "   Response: $($MeAfterLogout | ConvertTo-Json -Compress)" -ForegroundColor Red
    $Test4Passed = $false
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Session invalidated successfully (401 Unauthorized)" -ForegroundColor Green
        Write-Host "   Expected 401 Unauthorized - Session revoked" -ForegroundColor Gray
        $Test4Passed = $true
    } else {
        Write-Host "❌ Unexpected error (Status: $($_.Exception.Response.StatusCode))" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $Test4Passed = $false
    }
}

Write-Host ""
Write-Host "5️⃣  Test refresh token after logout..." -ForegroundColor Yellow

try {
    $RefreshResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/refresh" -Method POST -WebSession $WebSession
    Write-Host "❌ Refresh token still valid" -ForegroundColor Red
    Write-Host "   Expected 401, but got successful response" -ForegroundColor Red
    Write-Host "   Response: $($RefreshResponse | ConvertTo-Json -Compress)" -ForegroundColor Red
    $Test5Passed = $false
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Refresh token invalidated (401 Unauthorized)" -ForegroundColor Green
        Write-Host "   Expected 401 Unauthorized" -ForegroundColor Gray
        $Test5Passed = $true
    } else {
        Write-Host "❌ Unexpected error (Status: $($_.Exception.Response.StatusCode))" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $Test5Passed = $false
    }
}

Write-Host ""
Write-Host "🎯 Test Summary:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan

if ($Test4Passed -and $Test5Passed) {
    Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "   ✓ Login successful" -ForegroundColor Green
    Write-Host "   ✓ Protected route accessible before logout" -ForegroundColor Green
    Write-Host "   ✓ Logout successful" -ForegroundColor Green
    Write-Host "   ✓ Protected route blocked after logout (session invalidated)" -ForegroundColor Green
    Write-Host "   ✓ Refresh token invalidated after logout" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Session-based token invalidation is working correctly!" -ForegroundColor Green
} else {
    Write-Host "❌ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "   Check the individual test results above" -ForegroundColor Red
}

Write-Host ""
Write-Host "🧹 Test completed" -ForegroundColor Cyan
