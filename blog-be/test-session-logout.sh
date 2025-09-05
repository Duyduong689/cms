#!/bin/bash

# Session-based Authentication Test Script
# Tests immediate token invalidation on logout

BASE_URL="http://localhost:3000"
COOKIE_JAR="test_cookies.txt"

echo "🔐 Session-Based Authentication Test"
echo "===================================="

# Clean up previous test cookies
rm -f $COOKIE_JAR

echo
echo "1️⃣  Login and get session cookies..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}' \
  -c $COOKIE_JAR \
  -w "HTTP_STATUS:%{http_code}")

LOGIN_STATUS=$(echo $LOGIN_RESPONSE | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$LOGIN_STATUS" = "200" ] || [ "$LOGIN_STATUS" = "201" ]; then
    echo "✅ Login successful (Status: $LOGIN_STATUS)"
    echo "   Session cookies saved to $COOKIE_JAR"
else
    echo "❌ Login failed (Status: $LOGIN_STATUS)"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

echo
echo "2️⃣  Test protected route with valid session..."
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -b $COOKIE_JAR \
  -w "HTTP_STATUS:%{http_code}")

ME_STATUS=$(echo $ME_RESPONSE | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$ME_STATUS" = "200" ]; then
    echo "✅ Protected route accessible (Status: $ME_STATUS)"
    # Extract user info without the HTTP status
    USER_INFO=$(echo $ME_RESPONSE | sed 's/HTTP_STATUS:[0-9]*$//')
    echo "   User: $USER_INFO"
else
    echo "❌ Protected route failed (Status: $ME_STATUS)"
    echo "   Response: $ME_RESPONSE"
fi

echo
echo "3️⃣  Logout and invalidate session..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -b $COOKIE_JAR \
  -w "HTTP_STATUS:%{http_code}")

LOGOUT_STATUS=$(echo $LOGOUT_RESPONSE | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$LOGOUT_STATUS" = "200" ]; then
    echo "✅ Logout successful (Status: $LOGOUT_STATUS)"
    echo "   Session should now be invalidated"
else
    echo "❌ Logout failed (Status: $LOGOUT_STATUS)"
    echo "   Response: $LOGOUT_RESPONSE"
fi

echo
echo "4️⃣  Test protected route with invalidated session..."
ME_AFTER_LOGOUT=$(curl -s -X GET "$BASE_URL/auth/me" \
  -b $COOKIE_JAR \
  -w "HTTP_STATUS:%{http_code}")

ME_AFTER_STATUS=$(echo $ME_AFTER_LOGOUT | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$ME_AFTER_STATUS" = "401" ]; then
    echo "✅ Session invalidated successfully (Status: $ME_AFTER_STATUS)"
    echo "   Expected 401 Unauthorized - Session revoked"
    ERROR_MSG=$(echo $ME_AFTER_LOGOUT | sed 's/HTTP_STATUS:[0-9]*$//')
    echo "   Response: $ERROR_MSG"
else
    echo "❌ Session NOT invalidated (Status: $ME_AFTER_STATUS)"
    echo "   Expected 401, got $ME_AFTER_STATUS"
    echo "   Response: $ME_AFTER_LOGOUT"
fi

echo
echo "5️⃣  Test refresh token after logout..."
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -b $COOKIE_JAR \
  -w "HTTP_STATUS:%{http_code}")

REFRESH_STATUS=$(echo $REFRESH_RESPONSE | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$REFRESH_STATUS" = "401" ]; then
    echo "✅ Refresh token invalidated (Status: $REFRESH_STATUS)"
    echo "   Expected 401 Unauthorized"
else
    echo "❌ Refresh token still valid (Status: $REFRESH_STATUS)"
    echo "   Expected 401, got $REFRESH_STATUS"
    echo "   Response: $REFRESH_RESPONSE"
fi

echo
echo "🎯 Test Summary:"
echo "================"
if [ "$LOGIN_STATUS" = "200" ] && [ "$ME_STATUS" = "200" ] && [ "$LOGOUT_STATUS" = "200" ] && [ "$ME_AFTER_STATUS" = "401" ] && [ "$REFRESH_STATUS" = "401" ]; then
    echo "✅ ALL TESTS PASSED!"
    echo "   ✓ Login successful"
    echo "   ✓ Protected route accessible before logout"
    echo "   ✓ Logout successful"
    echo "   ✓ Protected route blocked after logout (session invalidated)"
    echo "   ✓ Refresh token invalidated after logout"
    echo
    echo "🎉 Session-based token invalidation is working correctly!"
else
    echo "❌ SOME TESTS FAILED"
    echo "   Check the individual test results above"
fi

# Clean up
rm -f $COOKIE_JAR
echo
echo "🧹 Cleanup completed"
