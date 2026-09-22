/*
  CCCS St. Timothy V1.3 — Firebase configuration
  ------------------------------------------------
  To enable LIVE attendance across the adviser's phone and enrolled students' phones:
  1) Create a Firebase project and Realtime Database.
  2) Enable Anonymous Authentication.
  3) Paste your Firebase Web config below.
  4) Set enabled: true.

  IMPORTANT: For actual school deployment, use authenticated roles/security rules before
  entering real student records. The prototype deliberately does not include a public
  database credential or open database rules.
*/
window.CCCS_FIREBASE_CONFIG = {
  enabled: true,
  apiKey: "AIzaSyAwyWKoEqTHwkv9NMkcjNO2Bu_4D_5frLc",
  authDomain: "cccs-st-timothy-attendance.firebaseapp.com",
  databaseURL: "https://cccs-st-timothy-attendance-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cccs-st-timothy-attendance",
  storageBucket: "cccs-st-timothy-attendance.firebasestorage.app",
  messagingSenderId: "115515283454",
  appId: "1:115515283454:web:4dab02c44998e1fe0052af"
};

window.CCCS_FIREBASE = (()=>{
  const c=window.CCCS_FIREBASE_CONFIG;
  let token='', uid='';
  const clean=p=>String(p).replace(/^\/+|\/+$/g,'');
  async function init(){
    if(!c.enabled||!c.apiKey||!c.databaseURL) throw new Error('Firebase not configured');
    const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(c.apiKey)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"returnSecureToken":true}'});
    const j=await r.json(); if(!r.ok)throw new Error(j?.error?.message||'Authentication failed'); token=j.idToken;uid=j.localId;return uid;
  }
  async function request(path,method='GET',body){
    const url=`${c.databaseURL.replace(/\/$/,'')}/${clean(path)}.json?auth=${encodeURIComponent(token)}`;
    const r=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});if(!r.ok)throw new Error('Database request failed');return r.json();
  }
  const get=p=>request(p);
  const set=(p,v)=>request(p,'PUT',v);
  async function publicGet(path){
    const url=`${c.databaseURL.replace(/\/$/,'')}/${clean(path)}.json`;
    const r=await fetch(url); if(!r.ok)throw new Error('Public database read failed'); return r.json();
  }
  function listen(path,cb){let stopped=false,last='';async function poll(){if(stopped)return;try{const v=await get(path),raw=JSON.stringify(v);if(raw!==last){last=raw;cb(v)}}catch(e){}setTimeout(poll,1800)}poll();return()=>{stopped=true}}
  function publicListen(path,cb){let stopped=false,last='';async function poll(){if(stopped)return;try{const v=await publicGet(path),raw=JSON.stringify(v);if(raw!==last){last=raw;cb(v)}}catch(e){}setTimeout(poll,1800)}poll();return()=>{stopped=true}}
  return {enabled:!!c.enabled,init,get,set,listen,publicGet,publicListen};
})();
