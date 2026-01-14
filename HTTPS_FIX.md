# HTTPS Mixed Content Fix

## Problem
The page was loaded over HTTPS but was trying to make requests to HTTP endpoints, causing browser security blocks.

## Changes Made

### 1. setup.html
- Changed default API URL from `http://visualhub.co.kr/db_add/api.php` to `https://www.visualhub.co.kr/db_add/api.php`
- Updated all test URLs in `tryCommonPaths()` function to use HTTPS
- Added `www` subdomain for consistency with page URL

### 2. js/api.js
- Updated `API_BASE_URL` constant from `http://` to `https://`
- Updated all example URLs in comments to use HTTPS
- Changed domain to `www.visualhub.co.kr` for consistency

## Errors Fixed

### Before:
```
Mixed Content: The page at 'https://www.visualhub.co.kr/sds_db/setup.html' 
was loaded over HTTPS, but requested an insecure resource 
'http://visualhub.co.kr/db_add/api.php?action=test_connection'. 
This request has been blocked; the content must be served over HTTPS.
```

### After:
All requests now use HTTPS and match the page protocol.

## Additional Issues Detected

1. **CORS Errors**: Cross-origin requests from `www.visualhub.co.kr` to `visualhub.co.kr`
   - **Solution**: Use consistent domain (`www.visualhub.co.kr`) or configure CORS headers

2. **404 Errors**: API endpoints not found
   - **Solution**: Verify `api.php` file is uploaded to correct location
   - Use "자동 경로 찾기" (Auto Path Finder) button in setup.html

## Testing
After deployment, test the connection using:
1. Open `https://www.visualhub.co.kr/sds_db/setup.html`
2. Click "🔍 연결 테스트" (Connection Test) button
3. Or click "📂 자동 경로 찾기" (Auto Path Finder) button

## Next Steps

If you still see errors:

1. **For CORS errors**: Add these headers to your PHP API file:
   ```php
   header('Access-Control-Allow-Origin: https://www.visualhub.co.kr');
   header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
   header('Access-Control-Allow-Headers: Content-Type');
   ```

2. **For 404 errors**: Verify the `api.php` file exists at:
   - `https://www.visualhub.co.kr/db_add/api.php`
   - Check FTP upload location
   - Ensure file permissions are 644 or 755

3. **Domain consistency**: Ensure all resources use `www.visualhub.co.kr` or configure proper redirects

## Files Modified
- `/var/www/sds/sds_db/setup.html`
- `/var/www/sds/sds_db/js/api.js`
- `/var/www/sds_db/webapp/setup.html` (copied)
- `/var/www/sds_db/webapp/js/api.js` (copied)
