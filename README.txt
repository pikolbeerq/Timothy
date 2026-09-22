CCCS Grade 11 – St. Timothy Attendance System V1.4 — Firebase Live

Connected to the CCCS-St-Timothy-Attendance Firebase project.

Features:
- Grade 11 – St. Timothy only
- Room 307
- Adviser: Niño G. Degamo
- Student enrollment and QR generation
- Phone QR scanner for TIME IN / TIME OUT
- Firebase Realtime Database sync across devices
- Public view-only live attendance board at #student-view
- Public board contains only student name + attendance status
- Private enrollment and detailed attendance use authenticated Firebase paths

IMPORTANT SECURITY NOTE:
This prototype uses Anonymous Authentication for the adviser interface. Before entering real student personal information, replace anonymous staff access with a true adviser/admin login and tighten Firebase rules so only the adviser account can read/write private and attendance paths.

GitHub Pages: upload all files in this folder.
