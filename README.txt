CCCS Grade 11 – St. Timothy Attendance Prototype V1.2

Features:
- Enrollment limited to Grade 11 – St. Timothy
- Generated attendance code and QR per student
- Phone rear-camera QR scanner (browser BarcodeDetector support required)
- Manual code entry fallback
- TIME IN / TIME OUT and late detection
- Simulated parent SMS notification
- St. Timothy-only student list
- View-only class attendance board showing Present/Late/Not Checked In
- CSV attendance export
- Installable PWA

IMPORTANT:
This prototype stores data only in the browser (localStorage). It is NOT yet a shared online database. Student View on another phone will not receive live attendance until a secured backend is added. Do not use real student PII for production yet. QR codes contain only the generated attendance code, not LRN or personal details.

For GitHub Pages: upload the files in this ZIP to a repository and enable Pages. Camera access requires HTTPS; GitHub Pages provides HTTPS.

V1.2 scanner fix:
- Fixed Start Camera button/function naming collision that prevented the tap action.
- Camera now opens even when native BarcodeDetector is unavailable.
- Added jsQR fallback for broader Android/iPhone browser QR detection.
- Clear camera permission/error messages and rear-camera preference.
