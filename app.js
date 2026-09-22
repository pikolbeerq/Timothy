const KEY='cccs_sttimothy_attendance_v13';
const OLD_KEYS=['cccs_sttimothy_attendance_v11'];
let seed=localStorage.getItem(KEY)||OLD_KEYS.map(k=>localStorage.getItem(k)).find(Boolean);
let db=JSON.parse(seed||'{"students":[],"attendance":[],"notices":[],"settings":{"school":"Cordova Catholic Cooperative School","late":"07:30"}}');
const save=()=>{localStorage.setItem(KEY,JSON.stringify(db)); queueCloudSave()};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDate=()=>{let d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
const fmt=d=>new Date(d).toLocaleString();
function code(){let y=new Date().getFullYear(),n=db.students.length+1,c;do{c=`CCCS-${y}-${String(n++).padStart(5,'0')}`}while(db.students.some(s=>s.code===c));return c}
function statusFor(s){let a=db.attendance.filter(x=>x.studentId===s.id&&x.date===localDate()&&x.type==='IN');if(!a.length)return 'Not Checked In';return a.some(x=>x.late)?'Late':'Present'}
function render(){let ta=db.attendance.filter(a=>a.date===localDate()),ins=new Set();ta.forEach(a=>a.type==='IN'?ins.add(a.studentId):ins.delete(a.studentId));sTotal.textContent=db.students.length;sPresent.textContent=new Set(ta.filter(a=>a.type==='IN').map(a=>a.studentId)).size;sLate.textContent=new Set(ta.filter(a=>a.type==='IN'&&a.late).map(a=>a.studentId)).size;sInside.textContent=ins.size;
recent.innerHTML=ta.slice(-8).reverse().map(a=>{let s=db.students.find(x=>x.id===a.studentId);return `<div class='notice'><b>${esc(s?.name||'Unknown')}</b> <span class='pill ${a.type==='OUT'?'out':''}'>${a.type}</span><br><small>${fmt(a.at)} ${a.late?'• LATE':''}</small></div>`}).join('')||'<p class=muted>No attendance yet.</p>';
renderStudents();renderAttendance();renderBoard();renderReports()}
function renderStudents(){let q=(studentSearch?.value||'').toLowerCase(),arr=db.students.filter(s=>[s.name,s.lrn,s.code].some(v=>String(v).toLowerCase().includes(q)));studentList.innerHTML=arr.length?`<div class='studentCards'>${arr.map(s=>`<article class='studentCard'><div><span class='mini'>${esc(s.code)}</span><h3>${esc(s.name)}</h3><p>LRN: ${esc(s.lrn)}<br>Grade 11 – St. Timothy<br>Guardian: ${esc(s.guardian)}<br>Mobile: ${esc(s.mobile)}</p></div><div class='qrMini' id='qr-${esc(s.id)}'></div><button data-showqr='${esc(s.id)}'>Show QR</button></article>`).join('')}</div>`:'<p class=muted>No St. Timothy students enrolled.</p>';document.querySelectorAll('[data-showqr]').forEach(b=>b.onclick=()=>showQR(b.dataset.showqr))}
function showQR(id){let s=db.students.find(x=>x.id===id);if(!s)return;let w=window.open('','_blank','width=430,height=620');w.document.write(`<title>${esc(s.name)} QR</title><style>body{font-family:Arial;text-align:center;padding:30px}#q{display:flex;justify-content:center;margin:25px}.code{font-size:22px;font-weight:bold}.muted{color:#555}</style><h2>Grade 11 – St. Timothy</h2><h1>${esc(s.name)}</h1><div id='q'></div><div class='code'>${esc(s.code)}</div><p class='muted'>Attendance QR • Do not share publicly</p><script src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'><\/script><script>window.onload=()=>new QRCode(document.getElementById('q'),{text:${JSON.stringify(s.code)},width:220,height:220})<\/script>`);w.document.close()}
function renderAttendance(){let arr=db.attendance.filter(a=>a.date===localDate()).slice().reverse();attendanceList.innerHTML=arr.length?`<table><tr><th>Time</th><th>Student</th><th>Event</th><th>Status</th></tr>${arr.map(a=>{let s=db.students.find(x=>x.id===a.studentId);return `<tr><td>${new Date(a.at).toLocaleTimeString()}</td><td>${esc(s?.name)}</td><td>${a.type}</td><td>${a.late?'Late':'Recorded'}</td></tr>`}).join('')}</table>`:'<p class=muted>No attendance today.</p>'}
function renderBoard(){sectionBoard.innerHTML=db.students.length?`<div class='boardGrid'>${db.students.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(s=>{let st=statusFor(s),cls=st==='Present'?'present':st==='Late'?'late':'unchecked';return `<div class='boardStudent ${cls}'><b>${esc(s.name)}</b><span>${st==='Present'?'🟢':st==='Late'?'🟡':'⚪'} ${st}</span></div>`}).join('')}</div>`:'<p class=muted>No students enrolled.</p>'}
function renderReports(){reportList.innerHTML=db.attendance.length?`<table><tr><th>Date/Time</th><th>Student</th><th>Event</th><th>Late</th></tr>${db.attendance.slice().reverse().map(a=>{let s=db.students.find(x=>x.id===a.studentId);return `<tr><td>${fmt(a.at)}</td><td>${esc(s?.name)}</td><td>${a.type}</td><td>${a.late?'Yes':'No'}</td></tr>`}).join('')}</table>`:'<p class=muted>No records.</p>'}
function recordCode(c){let type=scanType.value,s=db.students.find(x=>x.code.toLowerCase()===String(c).trim().toLowerCase());if(!s){scanResult.innerHTML='<p class=bad>Student code not found.</p>';return false}let now=new Date(),hm=now.toTimeString().slice(0,5),late=type==='IN'&&hm>(db.settings.late||'07:30'),last=db.attendance.filter(a=>a.studentId===s.id&&a.date===localDate()).at(-1);if(last?.type===type){scanResult.innerHTML=`<p class=bad>${esc(s.name)} already has a ${type} record as the latest event today.</p>`;return false}let a={id:(crypto.randomUUID?.()||Date.now().toString()),studentId:s.id,type,at:now.toISOString(),date:localDate(),late};db.attendance.push(a);save();scanResult.innerHTML=`<div class='result'><h3 class=ok>${type==='IN'?'✓ Time In':'✓ Time Out'} recorded</h3><p><b>${esc(s.name)}</b>${late?' • LATE':''}</p><p>Attendance has been recorded for Grade 11 – St. Timothy.</p><small>${cloudReady?'Syncing to the shared section board…':'Saved on this device. Configure Firebase to enable live viewing on everyone’s phones.'}</small></div>`;scanCode.value='';render();return true}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button,.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector('#'+b.dataset.tab).classList.add('active');if(b.dataset.tab!=='scanner')stopCameraScan()});
enrollForm.onsubmit=e=>{e.preventDefault();let f=Object.fromEntries(new FormData(e.target));if(db.students.some(s=>s.lrn===f.lrn))return alert('This LRN is already enrolled.');let s={...f,grade:'Grade 11',section:'St. Timothy',id:crypto.randomUUID?.()||Date.now().toString(),code:code(),createdAt:new Date().toISOString()};db.students.push(s);save();enrollResult.innerHTML=`<div class='result'><h3>Enrollment Successful</h3><p>${esc(s.name)} is enrolled in <b>Grade 11 – St. Timothy</b>.</p><div class='code'>${esc(s.code)}</div><div id='newQR' class='qrBox'></div><p><button id='openStudentQR'>Open / Print Student QR</button></p><small>This QR contains only the generated attendance code, not the student's LRN or personal information.</small></div>`;if(window.QRCode)new QRCode(document.getElementById('newQR'),{text:s.code,width:180,height:180});document.querySelector('#openStudentQR').onclick=()=>showQR(s.id);e.target.reset();render()};
studentSearch.oninput=renderStudents;scanBtn.onclick=()=>recordCode(scanCode.value);refreshBoard.onclick=renderBoard;
exportBtn.onclick=()=>{let rows=[['Date/Time','LRN','Student Code','Name','Grade','Section','Event','Late']];db.attendance.forEach(a=>{let s=db.students.find(x=>x.id===a.studentId)||{};rows.push([a.at,s.lrn,s.code,s.name,'Grade 11','St. Timothy',a.type,a.late?'Yes':'No'])});let csv=rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),x=document.createElement('a');x.href=url;x.download='St_Timothy_Attendance_Report.csv';x.click();URL.revokeObjectURL(url)};
schoolName.value=db.settings.school||'';lateTime.value=db.settings.late||'07:30';saveSettings.onclick=()=>{db.settings.school=schoolName.value;db.settings.late=lateTime.value;save();alert('Settings saved.')};
let stream=null,scanTimer=null,scanBusy=false;
const startCameraBtn=document.getElementById('startCamera');
const stopCameraBtn=document.getElementById('stopCamera');
const cameraVideo=document.getElementById('camera');
const cameraContainer=document.getElementById('cameraWrap');
const cameraStatus=document.getElementById('cameraNote');
const scanCanvas=document.createElement('canvas');
const scanCtx=scanCanvas.getContext('2d',{willReadFrequently:true});
let qrDetector=null;

function loadJsQR(){
  if(window.jsQR)return Promise.resolve(true);
  return new Promise(resolve=>{
    const existing=document.querySelector('script[data-jsqr]');
    if(existing){existing.addEventListener('load',()=>resolve(!!window.jsQR),{once:true});existing.addEventListener('error',()=>resolve(false),{once:true});return}
    const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';sc.async=true;sc.dataset.jsqr='1';sc.onload=()=>resolve(true);sc.onerror=()=>resolve(false);document.head.appendChild(sc)
  })
}

async function detectQR(){
  if(scanBusy||!stream||cameraVideo.readyState<2)return;
  scanBusy=true;
  try{
    let raw='';
    if(qrDetector){
      const codes=await qrDetector.detect(cameraVideo);
      if(codes?.length)raw=codes[0].rawValue||'';
    }else if(window.jsQR){
      const w=cameraVideo.videoWidth,h=cameraVideo.videoHeight;
      if(w&&h){scanCanvas.width=w;scanCanvas.height=h;scanCtx.drawImage(cameraVideo,0,0,w,h);const img=scanCtx.getImageData(0,0,w,h);const found=window.jsQR(img.data,w,h,{inversionAttempts:'dontInvert'});if(found)raw=found.data||''}
    }
    if(raw&&recordCode(raw)){
      navigator.vibrate?.(120);
      cameraStatus.innerHTML='<span class="ok">✓ QR scanned successfully. Ready for the next student.</span>';
      await stopCameraScan();
      setTimeout(()=>startCameraScan(),900);
    }
  }catch(e){}finally{scanBusy=false}
}

async function startCameraScan(){
  if(stream)return;
  cameraStatus.textContent='Requesting camera permission…';
  if(!window.isSecureContext){cameraStatus.innerHTML='<span class="bad">Camera access requires HTTPS. Open the deployed GitHub Pages site, not a downloaded HTML file.</span>';return}
  if(!navigator.mediaDevices?.getUserMedia){cameraStatus.innerHTML='<span class="bad">Camera access is not supported in this browser. Try Chrome on Android or Safari on iPhone.</span>';return}
  startCameraBtn.disabled=true;
  try{
    if('BarcodeDetector' in window){try{qrDetector=new BarcodeDetector({formats:['qr_code']})}catch(e){qrDetector=null}}
    if(!qrDetector)await loadJsQR();
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
    cameraVideo.srcObject=stream;
    await cameraVideo.play();
    cameraContainer.hidden=false;
    startCameraBtn.hidden=true;
    stopCameraBtn.hidden=false;
    cameraStatus.textContent=(qrDetector||window.jsQR)?'Camera ready. Point it at a St. Timothy student QR code.':'Camera opened, but automatic QR detection could not load. Use the manual student code below.';
    scanTimer=setInterval(detectQR,300);
  }catch(e){
    let msg=e?.message||String(e);
    if(e?.name==='NotAllowedError')msg='Camera permission was denied. Allow Camera permission for this site in your browser settings, then tap Start Camera Scanner again.';
    else if(e?.name==='NotFoundError')msg='No usable camera was found on this device.';
    else if(e?.name==='NotReadableError')msg='The camera is being used by another app. Close the other camera app and try again.';
    cameraStatus.innerHTML=`<span class='bad'>${esc(msg)}</span>`;
  }finally{startCameraBtn.disabled=false}
}

async function stopCameraScan(){
  if(scanTimer){clearInterval(scanTimer);scanTimer=null}
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
  cameraVideo.srcObject=null;
  cameraContainer.hidden=true;
  startCameraBtn.hidden=false;
  stopCameraBtn.hidden=true;
}

startCameraBtn.addEventListener('click',startCameraScan);
stopCameraBtn.addEventListener('click',stopCameraScan);

// ---- Optional Firebase Realtime Database sync (V1.3) ----
let cloudReady=false, cloudTimer=null, cloudApplying=false;
const cloudStatus=()=>document.getElementById('cloudStatus');
function publicCloudState(){return {students:db.students,attendance:db.attendance,settings:db.settings,updatedAt:new Date().toISOString()}}
function queueCloudSave(){
  if(!cloudReady||cloudApplying)return; clearTimeout(cloudTimer); cloudTimer=setTimeout(pushCloud,250);
}
async function pushCloud(){
  try{await window.CCCS_FIREBASE.set('sections/st-timothy',publicCloudState()); const el=cloudStatus();if(el)el.textContent='Live sync connected';}
  catch(e){const el=cloudStatus();if(el)el.textContent='Live sync error';}
}
async function initCloud(){
  const el=cloudStatus();
  if(!window.CCCS_FIREBASE?.enabled){if(el)el.textContent='Local mode — add Firebase config for live sharing';return}
  try{
    await window.CCCS_FIREBASE.init(); cloudReady=true; if(el)el.textContent='Live sync connected';
    window.CCCS_FIREBASE.listen('sections/st-timothy',remote=>{
      if(!remote)return; cloudApplying=true;
      db.students=Array.isArray(remote.students)?remote.students:db.students;
      db.attendance=Array.isArray(remote.attendance)?remote.attendance:db.attendance;
      db.settings={...db.settings,...(remote.settings||{})};
      localStorage.setItem(KEY,JSON.stringify(db)); cloudApplying=false; render();
    });
    const remote=await window.CCCS_FIREBASE.get('sections/st-timothy');
    if(remote){cloudApplying=true;db.students=Array.isArray(remote.students)?remote.students:db.students;db.attendance=Array.isArray(remote.attendance)?remote.attendance:db.attendance;db.settings={...db.settings,...(remote.settings||{})};localStorage.setItem(KEY,JSON.stringify(db));cloudApplying=false}
    else if(db.students.length||db.attendance.length) await pushCloud();
  }catch(e){cloudReady=false;if(el)el.textContent='Local mode — Firebase connection failed'}
}
let deferred;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;installBtn.hidden=false});installBtn.onclick=async()=>{if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;installBtn.hidden=true}};if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js?v=1.3');initCloud().finally(render);
