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
  enabled: false,
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: ""
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
  function listen(path,cb){let stopped=false,last='';async function poll(){if(stopped)return;try{const v=await get(path),raw=JSON.stringify(v);if(raw!==last){last=raw;cb(v)}}catch(e){}setTimeout(poll,2500)}poll();return()=>{stopped=true}}
  return {enabled:!!c.enabled,init,get,set,listen};
})();
