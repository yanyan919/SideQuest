export default 'SideQuest';

(() => {
    'use strict';

    const VERSION = '0.9.0';
    const SETTINGS_KEY = 'sidequest_v9_settings';
    const FAB_ID = 'sidequest-fab-v9';
    const PANEL_ID = 'sidequest-panel-v9';
    const SETTINGS_ID = 'sidequest-settings-v9';

    const DEFAULTS = {
        enabled: true,
        includeCharacter: true,
        includeNarration: true,
        backgroundUrl: '',
        learningRecord: true,
        mistakeBook: true,
        repeatLearned: false,
        translationMode: 'english',
        sourceMessages: 20,
        ttsProvider: 'system',
        fishBaseUrl: 'https://api.fish.audio',
        fishReferenceId: '',
        fishModel: 's2.1-pro-free',
        mimoBaseUrl: 'https://api.xiaomimimo.com',
        mimoVoice: 'Mia',
        mimoModel: 'mimo-v2.5-tts',
    };

    const css = `
        #${FAB_ID} {
            position: fixed !important;
            right: 18px;
            bottom: 105px;
            width: 52px;
            height: 52px;
            z-index: 2147483647 !important;
            border: 1px solid rgba(255,255,255,.28);
            border-radius: 999px;
            background: rgba(45,45,52,.96);
            color: #fff;
            box-shadow: 0 8px 28px rgba(0,0,0,.35);
            font-size: 25px;
            line-height: 1;
            cursor: grab;
            touch-action: none;
            user-select: none;
            padding: 0;
        }
        #${FAB_ID}:active { cursor: grabbing; }
        #${PANEL_ID} {
            position: fixed !important;
            right: 18px;
            bottom: 168px;
            width: min(360px, calc(100vw - 24px));
            height: min(520px, calc(100vh - 210px));
            min-height: 390px;
            z-index: 2147483646 !important;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;
            border: 1px solid rgba(255,255,255,.16);
            border-radius: 22px;
            background: rgba(27,27,33,.80);
            color: var(--SmartThemeBodyColor, #f2f2f2) !important;
            box-shadow: 0 22px 70px rgba(0,0,0,.45);
            backdrop-filter: blur(14px);
        }
        #${PANEL_ID}.sq-hidden { display: none !important; }
        #${PANEL_ID} {
            background:linear-gradient(145deg,rgba(34,31,48,.94),rgba(24,31,39,.92));
            border-color:rgba(155,182,180,.22);
            box-shadow:0 24px 80px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.07);
        }
        #${PANEL_ID} .sq-head { background:linear-gradient(100deg,rgba(150,178,176,.10),rgba(148,226,211,.045)); border-bottom-color:rgba(175,194,190,.12); }
        #${PANEL_ID} .sq-title { letter-spacing:.02em; }
        #${PANEL_ID} .sq-icon { border:1px solid rgba(255,255,255,.08); transition:background .16s ease,transform .16s ease; }
        #${PANEL_ID} .sq-icon:hover { background:rgba(150,178,176,.18); }
        #${PANEL_ID} .sq-game-choice {
            background:linear-gradient(115deg,rgba(255,255,255,.065),rgba(150,178,176,.035));
            border-color:rgba(170,190,188,.13); box-shadow:inset 0 1px 0 rgba(255,255,255,.035);
            transition:transform .16s ease,border-color .16s ease,background .16s ease;
        }
        #${PANEL_ID} .sq-game-choice:hover { transform:translateY(-1px); border-color:rgba(148,205,196,.42); background:rgba(148,205,196,.10); }
        #${PANEL_ID} .sq-game-choice .sq-game-emoji { display:grid;place-items:center;height:42px;border-radius:13px;background:rgba(150,178,176,.09); }
        #${PANEL_ID} .sq-card { background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(150,178,176,.035)); border-color:rgba(170,190,188,.15); box-shadow:inset 0 1px 0 rgba(255,255,255,.035); }
        #${PANEL_ID} .sq-label { color:#b7d8d2; opacity:.9; }
        #${PANEL_ID} .sq-prompt { background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.09); }
        #${PANEL_ID} .sq-option, #${PANEL_ID} .sq-next, #${PANEL_ID} .sq-back { border-color:rgba(170,190,188,.13); background:linear-gradient(100deg,rgba(255,255,255,.065),rgba(150,178,176,.035)); transition:transform .14s ease,border-color .14s ease,background .14s ease; }
        #${PANEL_ID} .sq-option:not(:disabled):hover { border-color:rgba(148,205,196,.38); background:rgba(148,205,196,.10); }
        #${PANEL_ID} .sq-option:not(:disabled):active { transform:scale(.99); }
        #${PANEL_ID} .sq-inline-speak { background:rgba(148,205,196,.12); border:1px solid rgba(148,205,196,.22); }
        #${PANEL_ID} .sq-feedback { line-height:1.55; }
        #${PANEL_ID} .sq-head {
            display:flex; align-items:center; justify-content:space-between; gap:10px;
            padding:14px 14px 12px 17px;
            border-bottom:1px solid rgba(255,255,255,.08);
            cursor:grab; user-select:none; touch-action:none;
        }
        #${PANEL_ID} .sq-title { font-weight:800; font-size:17px; }
        #${PANEL_ID} .sq-sub { display:block; margin-top:3px; font-size:10px; opacity:.52; font-weight:400; }
        #${PANEL_ID} .sq-actions { display:flex; gap:5px; }
        #${PANEL_ID} .sq-icon {
            width:30px; height:30px; padding:0; border:0; border-radius:50%;
            background:rgba(255,255,255,.07); color:#f2f2f2 !important; cursor:pointer; font-size:16px;
            -webkit-appearance:none; appearance:none;
            display:inline-flex; align-items:center; justify-content:center;
            pointer-events:auto !important;
        }
        #${PANEL_ID} .sq-body { flex:1; min-height:0; overflow:auto; padding:16px; }
        #${PANEL_ID} .sq-status { font-size:12px; opacity:.72; margin-bottom:10px; line-height:1.5; }
        #${PANEL_ID} .sq-empty { text-align:center; padding:50px 12px 20px; }
        #${PANEL_ID} .sq-empty-icon { font-size:34px; margin-bottom:9px; }
        #${PANEL_ID} .sq-empty-title { font-weight:750; font-size:16px; }
        #${PANEL_ID} .sq-empty p { font-size:12px; line-height:1.6; opacity:.58; }
        #${PANEL_ID} .sq-game-menu { display:grid; gap:10px; }
        #${PANEL_ID} .sq-game-menu[hidden],
        #${PANEL_ID} .sq-card[hidden],
        #${PANEL_ID} .sq-empty[hidden],
        #${PANEL_ID} .sq-settings[hidden] { display:none !important; }
        #${PANEL_ID} .sq-door {
            position:absolute; top:7px; right:8px; left:auto; bottom:auto; z-index:4;
            width:21px; height:21px; padding:0; border:0; border-radius:50%;
            background:transparent; color:#fff !important; opacity:.20;
            font-size:11px; line-height:21px; cursor:pointer;
        }
        #${PANEL_ID} .sq-door:active { opacity:.72; transform:scale(.94); }
        #${PANEL_ID} .sq-learn-actions { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-top:9px; }
        #${PANEL_ID} .sq-learn-actions .sq-option { text-align:center; }
        #${PANEL_ID} .sq-mini-action {
            width:100%; box-sizing:border-box; padding:9px 10px; margin-top:8px;
            border:1px solid rgba(255,255,255,.08); border-radius:10px;
            background:rgba(255,255,255,.045); color:#f2f2f2 !important; font:inherit; cursor:pointer; font-size:11px;
        }
        #${PANEL_ID} .sq-prompt-row { display:flex; align-items:flex-start; gap:7px; }
        #${PANEL_ID} .sq-prompt-main { min-width:0; flex:1; white-space:pre-wrap; }
        #${PANEL_ID} .sq-inline-speak {
            flex:0 0 auto; width:27px; height:27px; padding:0; border:0; border-radius:50%;
            background:rgba(255,255,255,.055); color:#fff !important; font-size:13px; cursor:pointer; opacity:.72;
        }
        #${PANEL_ID} .sq-inline-speak:active { transform:scale(.92); opacity:1; }
        #${PANEL_ID} .sq-meaning {
            margin-top:7px; padding:2px 2px 0;
            color:inherit; font-size:11px; line-height:1.5; opacity:.62;
        }
        #${PANEL_ID} .sq-context { margin-top:10px; font-size:13px; line-height:1.6; opacity:.72; overflow-wrap:anywhere; }
        #${PANEL_ID} .sq-source { margin-top:10px; font-size:12px; opacity:.62; line-height:1.55; overflow-wrap:anywhere; }
        #${PANEL_ID} .sq-record-note { margin-top:10px; padding:10px 11px; border-radius:10px; background:rgba(255,255,255,.035); font-size:12px; line-height:1.6; opacity:.72; }
        #${PANEL_ID} .sq-game-choice {
            width:100%; display:flex; align-items:center; gap:12px; box-sizing:border-box;
            padding:13px 12px; text-align:left; border:1px solid rgba(255,255,255,.10);
            border-radius:15px; background:rgba(255,255,255,.055); color:#f2f2f2 !important;
            cursor:pointer; font:inherit;
        }
        #${PANEL_ID} .sq-game-choice:active { transform:scale(.99); }
        #${PANEL_ID} .sq-game-choice .sq-game-emoji { width:34px; text-align:center; font-size:24px; flex:none; }
        #${PANEL_ID} .sq-game-choice span:nth-child(2) { min-width:0; flex:1; }
        #${PANEL_ID} .sq-game-choice b { display:block; font-size:16px; }
        #${PANEL_ID} .sq-game-choice small { display:block; margin-top:5px; font-size:12px; opacity:.72; line-height:1.5; }
        #${PANEL_ID} .sq-game-choice em { display:inline-block; margin-top:5px; font-size:11px; font-style:normal; opacity:.65; }
        #${PANEL_ID} .sq-card {
            position:relative; padding:13px; padding-top:17px;
            border:1px solid rgba(255,255,255,.09);
            border-radius:16px; background:rgba(255,255,255,.045);
        }
        #${PANEL_ID} .sq-label { font-size:11px; letter-spacing:.12em; font-weight:800; opacity:.72; margin-bottom:10px; }
        #${PANEL_ID} .sq-prompt {
            white-space:pre-wrap; padding:14px; border-radius:12px;
            background:rgba(0,0,0,.16); font-size:16px; line-height:1.7;
        }
        #${PANEL_ID} .sq-options { display:grid; gap:8px; margin-top:12px; }
        #${PANEL_ID} .sq-option, #${PANEL_ID} .sq-next, #${PANEL_ID} .sq-back {
            width:100%; box-sizing:border-box; padding:10px 12px;
            border:1px solid rgba(255,255,255,.1); border-radius:10px;
            background:rgba(255,255,255,.055); color:#f2f2f2 !important; font:inherit; cursor:pointer;
        }
        #${PANEL_ID} .sq-option { text-align:left; font-size:15px; line-height:1.5; min-height:42px; }
        #${PANEL_ID} .sq-option:disabled { opacity:.58; cursor:default; }
        #${PANEL_ID} .sq-ok { background:rgba(80,190,120,.2) !important; border-color:rgba(80,190,120,.4) !important; opacity:1 !important; }
        #${PANEL_ID} .sq-bad { background:rgba(210,90,90,.18) !important; border-color:rgba(210,90,90,.35) !important; opacity:1 !important; }
        #${PANEL_ID} .sq-feedback { min-height:24px; margin:12px 2px; font-size:14px; line-height:1.55; }
        #${PANEL_ID} .sq-settings { padding:2px 1px 10px; }
        #${PANEL_ID} .sq-settings h3 { margin:2px 0 5px; font-size:16px; }
        #${PANEL_ID} .sq-settings p { margin:0 0 14px; font-size:11px; opacity:.58; line-height:1.5; }
        #${PANEL_ID} .sq-setting-row { display:flex; align-items:center; gap:9px; padding:9px 0; font-size:12px; }
        #${PANEL_ID} .sq-setting-row input { margin:0; }
        .sq-details { margin:9px 0; border:1px solid rgba(255,255,255,.10); border-radius:13px; background:rgba(255,255,255,.035); overflow:hidden; }
        .sq-details summary { cursor:pointer; padding:12px 13px; font-size:12px; font-weight:700; list-style:none; transition:background .15s ease; }
        .sq-details summary:active { background:rgba(255,255,255,.045); }
        .sq-details summary::-webkit-details-marker { display:none; }
        .sq-details summary::after { content:'＋'; float:right; opacity:.55; }
        .sq-details[open] summary::after { content:'−'; }
        .sq-details-body { padding:4px 13px 12px; }
        .sq-setting-label { display:block; font-size:11px; opacity:.68; margin:10px 0 6px; line-height:1.45; }
        .sq-url-input { width:100%; box-sizing:border-box; padding:10px 11px; border:1px solid rgba(255,255,255,.12); border-radius:10px; background:rgba(0,0,0,.18); color:#f2f2f2 !important; font:inherit; font-size:13px; min-height:40px; }
        .sq-url-input:focus { outline:2px solid rgba(148,205,196,.35); outline-offset:1px; border-color:rgba(148,205,196,.45); }
        #sidequest-panel-v9 .sq-note { font-size:11px; line-height:1.65; opacity:.62; margin:8px 0; overflow-wrap:anywhere; }
        @media (prefers-reduced-motion: reduce) {
            #sidequest-panel-v9 *, #sidequest-fab-v9 { transition:none !important; animation:none !important; }
        }
        #${SETTINGS_ID} { margin-top:8px; }
        #${SETTINGS_ID} .sq-note { opacity:.55; font-size:11px; line-height:1.5; }
        @media (max-width:600px) {
            #${FAB_ID} { right:14px; bottom:118px; }
            #${PANEL_ID} { right:12px; bottom:180px; width:calc(100vw - 24px); height:min(520px,calc(100vh - 220px)); }
        }
    `;

    const PROFILES_KEY='sidequest_v9_profiles';
    const ACTIVE_PROFILE_KEY='sidequest_v9_active_profile';
    const DEFAULT_PROFILE_ID='profile-1';

    function loadProfiles() {
        try {
            const raw=JSON.parse(localStorage.getItem(PROFILES_KEY)||'null');
            if(raw && Array.isArray(raw.profiles) && raw.profiles.length) return raw;
        } catch {}
        let legacy={};
        try { legacy=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'); } catch {}
        const initial={profiles:[{id:DEFAULT_PROFILE_ID,name:'学习档案 1',settings:{...DEFAULTS,...legacy}}]};
        try { localStorage.setItem(PROFILES_KEY,JSON.stringify(initial)); } catch {}
        try { localStorage.setItem(ACTIVE_PROFILE_KEY,DEFAULT_PROFILE_ID); } catch {}
        return initial;
    }

    function activeProfileId() {
        const data=loadProfiles();
        const id=localStorage.getItem(ACTIVE_PROFILE_KEY)||DEFAULT_PROFILE_ID;
        return data.profiles.some(p=>p.id===id)?id:data.profiles[0].id;
    }

    function activeProfile() {
        const data=loadProfiles();
        return data.profiles.find(p=>p.id===activeProfileId())||data.profiles[0];
    }

    function loadSettings() {
        try { return { ...DEFAULTS, ...(activeProfile()?.settings||{}) }; }
        catch { return { ...DEFAULTS }; }
    }

    function saveSettings(settings) {
        try {
            const data=loadProfiles();
            const id=activeProfileId();
            const profile=data.profiles.find(p=>p.id===id);
            if(profile) profile.settings={...DEFAULTS,...settings};
            localStorage.setItem(PROFILES_KEY,JSON.stringify(data));
            localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));
        } catch {}
    }

    function createProfile() {
        const data=loadProfiles();
        if(data.profiles.length>=3) return null;
        const n=data.profiles.length+1;
        const id='profile-'+Date.now().toString(36);
        const profile={id,name:'学习档案 '+n,settings:{...DEFAULTS}};
        data.profiles.push(profile);
        try {
            localStorage.setItem(PROFILES_KEY,JSON.stringify(data));
            localStorage.setItem(ACTIVE_PROFILE_KEY,id);
        } catch {}
        return profile;
    }

    function renameActiveProfile(name) {
        const value=String(name||'').trim().slice(0,32);
        if(!value) return false;
        const data=loadProfiles();
        const profile=data.profiles.find(p=>p.id===activeProfileId());
        if(!profile) return false;
        profile.name=value;
        try { localStorage.setItem(PROFILES_KEY,JSON.stringify(data)); return true; } catch { return false; }
    }

    function switchActiveProfile(id) {
        const data=loadProfiles();
        if(!data.profiles.some(p=>p.id===id)) return false;
        try { localStorage.setItem(ACTIVE_PROFILE_KEY,id); return true; } catch { return false; }
    }

    function ctx() {
        try { return globalThis.SillyTavern?.getContext?.() || null; } catch { return null; }
    }

    function chatMessages() {
        const chat = ctx()?.chat;
        return Array.isArray(chat) ? chat.filter(m => m && !m.is_system && m.mes).slice(-200) : [];
    }

    function clean(value) {
        return String(value || '')
            .replace(/<br\s*\/?\s*>/gi, '\n')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\r/g, '')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s*\n+/g, '\n')
            .replace(/^[ \n]+|[ \n]+$/g, '')
            .trim();
    }

    const TTS_SECRETS_KEY='sidequest_v9_tts_secrets';
    const TTS_AUDIO_CACHE=new Map();
    const TTS_CACHE_DB='sidequest_tts_audio_v1';
    const TTS_CACHE_STORE='audio';
    const TTS_CACHE_MAX_ITEMS=200;
    const TTS_CACHE_MAX_BYTES=50*1024*1024;
    let ttsCacheDbPromise=null;
    let activeTtsAudio=null;

    // IndexedDB stores audio Blobs across panel closes and page reloads.
    // If unavailable or full, playback still works with the in-memory cache.
    function openTtsCacheDb() {
        if(!globalThis.indexedDB) return Promise.resolve(null);
        if(ttsCacheDbPromise) return ttsCacheDbPromise;
        ttsCacheDbPromise=new Promise(resolve=>{
            try {
                const request=indexedDB.open(TTS_CACHE_DB,1);
                request.onupgradeneeded=()=>{
                    const db=request.result;
                    if(!db.objectStoreNames.contains(TTS_CACHE_STORE)) db.createObjectStore(TTS_CACHE_STORE,{keyPath:'key'});
                };
                request.onsuccess=()=>resolve(request.result);
                request.onerror=()=>resolve(null);
                request.onblocked=()=>resolve(null);
            } catch { resolve(null); }
        });
        return ttsCacheDbPromise;
    }

    async function getPersistentTtsBlob(key) {
        try {
            const db=await openTtsCacheDb();
            if(!db) return null;
            return await new Promise(resolve=>{
                const request=db.transaction(TTS_CACHE_STORE,'readonly').objectStore(TTS_CACHE_STORE).get(key);
                request.onsuccess=()=>{
                    const record=request.result;
                    if(record?.blob instanceof Blob){
                        try { const touch=db.transaction(TTS_CACHE_STORE,'readwrite'); touch.objectStore(TTS_CACHE_STORE).put({...record,usedAt:Date.now()}); } catch {}
                        resolve(record.blob);
                    } else resolve(null);
                };
                request.onerror=()=>resolve(null);
            });
        } catch { return null; }
    }

    async function putPersistentTtsBlob(key,blob) {
        try {
            const db=await openTtsCacheDb();
            if(!db || !(blob instanceof Blob) || !blob.size || blob.size>TTS_CACHE_MAX_BYTES) return;
            await new Promise(resolve=>{
                const tx=db.transaction(TTS_CACHE_STORE,'readwrite');
                tx.objectStore(TTS_CACHE_STORE).put({key,blob,size:blob.size,usedAt:Date.now()});
                tx.oncomplete=resolve; tx.onerror=resolve; tx.onabort=resolve;
            });
            await new Promise(resolve=>{
                const tx=db.transaction(TTS_CACHE_STORE,'readwrite');
                const store=tx.objectStore(TTS_CACHE_STORE);
                const request=store.getAll();
                request.onsuccess=()=>{
                    const items=(request.result||[]).sort((a,b)=>(a.usedAt||0)-(b.usedAt||0));
                    let total=items.reduce((sum,item)=>sum+(Number(item.size)||item.blob?.size||0),0);
                    while(items.length>TTS_CACHE_MAX_ITEMS || total>TTS_CACHE_MAX_BYTES) {
                        const old=items.shift();
                        if(!old) break;
                        store.delete(old.key);
                        total-=Number(old.size)||old.blob?.size||0;
                    }
                };
                tx.oncomplete=resolve; tx.onerror=resolve; tx.onabort=resolve;
            });
        } catch {}
    }

    function loadTtsSecrets() {
        try {
            const all=JSON.parse(localStorage.getItem(TTS_SECRETS_KEY)||'{}');
            return all && typeof all==='object' ? (all[activeProfileId()]||{}) : {};
        } catch { return {}; }
    }

    function saveTtsSecret(key,value) {
        try {
            const all=JSON.parse(localStorage.getItem(TTS_SECRETS_KEY)||'{}');
            const data=all && typeof all==='object' ? all : {};
            const id=activeProfileId();
            data[id]={...(data[id]||{}),[key]:String(value||'')};
            localStorage.setItem(TTS_SECRETS_KEY,JSON.stringify(data));
        } catch {}
    }

    function syncTtsSecretInputs(panel) {
        if(!panel) return;
        const secrets=loadTtsSecrets();
        panel.querySelectorAll('[data-secret]').forEach(input=>{ input.value=String(secrets[input.dataset.secret]||''); });
    }

    function ttsCacheKey(provider,text,settings) {
        const baseUrl=provider==='fish'?settings.fishBaseUrl:settings.mimoBaseUrl;
        const variant=provider==='fish'?(settings.fishReferenceId||''):(settings.mimoVoice||'');
        return [provider,String(baseUrl||'').trim().replace(/\/+$/,''),provider==='fish'?settings.fishModel:settings.mimoModel,variant,text].join('\u241f');
    }
    async function speakText(text, lang='en-US', options={}) {
        const bypassCache=options?.bypassCache===true;
        const spoken=String(text||'').replace(/[\u0000-\u001F\u007F]/g,' ').replace(/\s+/g,' ').trim();
        if(!spoken) return false;
        const settings=loadSettings();
        const provider=settings.ttsProvider||'system';
        if(provider==='system') {
            const synth=globalThis.speechSynthesis;
            if(!synth || !globalThis.SpeechSynthesisUtterance) throw new Error('当前浏览器不支持系统语音。');
            synth.cancel();
            const utterance=new SpeechSynthesisUtterance(spoken);
            utterance.lang=lang;
            utterance.rate=0.9;
            utterance.pitch=1;
            synth.speak(utterance);
            return true;
        }

        const secrets=loadTtsSecrets();
        const secretKey=provider==='fish'?'fishApiKey':'mimoApiKey';
        const apiKey=String(secrets[secretKey]||'').trim();
        if(!apiKey) throw new Error('请先在 SideQuest 设置中填写'+(provider==='fish'?'Fish Audio':'MiMo')+' API Key。');

        const cacheKey=ttsCacheKey(provider,spoken,settings);
        let objectUrl=bypassCache?null:TTS_AUDIO_CACHE.get(cacheKey);
        if(!objectUrl && !bypassCache) {
            const savedBlob=await getPersistentTtsBlob(cacheKey);
            if(savedBlob) {
                objectUrl=URL.createObjectURL(savedBlob);
                TTS_AUDIO_CACHE.set(cacheKey,objectUrl);
            }
        }
        if(!objectUrl) {
            let blob;
            if(provider==='fish') {
                const headers={'Authorization':'Bearer '+apiKey,'Content-Type':'application/json','model':String(settings.fishModel||'s2.1-pro-free')};
                const body={text:spoken,format:'mp3'};
                if(String(settings.fishReferenceId||'').trim()) body.reference_id=String(settings.fishReferenceId).trim();
                const baseUrl=String(settings.fishBaseUrl||'https://api.fish.audio').trim().replace(/\/+$/,'');
                const proxyUrl='/proxy/'+baseUrl+'/v1/tts';
                const response=await fetch(proxyUrl,{method:'POST',headers,body:JSON.stringify(body)});
                if(!response.ok) {
                    const detail=(await response.text().catch(()=>'' )).slice(0,180);
                    throw new Error('Fish Audio 请求失败（HTTP '+response.status+'）'+(detail?'：'+detail:''));
                }
                const fishType=String(response.headers.get('content-type')||'').toLowerCase();
                blob=await response.blob();
                if(!blob.size) throw new Error('Fish Audio 返回了空音频。');
                // Some proxy paths strip Content-Type even when the body is valid MP3.
                // Inspect the bytes before treating an unknown content type as an error.
                const bytes=new Uint8Array(await blob.slice(0,4).arrayBuffer());
                const hasId3=bytes.length>=3 && bytes[0]===0x49 && bytes[1]===0x44 && bytes[2]===0x33;
                const hasMpegFrame=bytes.length>=2 && bytes[0]===0xFF && (bytes[1]&0xE0)===0xE0;
                const looksLikeMp3=hasId3||hasMpegFrame;
                const declaredNonAudio=fishType.includes('json') || fishType.includes('text/html') || fishType.startsWith('text/');
                if(declaredNonAudio || (!fishType.startsWith('audio/') && !looksLikeMp3)) {
                    const detail=(await blob.slice(0,160).text().catch(()=>'' )).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\uFFFF]/g,'�').slice(0,120);
                    throw new Error('Fish Audio 返回内容无法识别为音频（Content-Type: '+(fishType||'未提供')+'）。'+(detail?'响应开头：'+detail:'请检查 ST 代理和 API URL。'));
                }
                if(looksLikeMp3 && !fishType.startsWith('audio/')) blob=new Blob([await blob.arrayBuffer()],{type:'audio/mpeg'});
            } else if(provider==='mimo') {
                const mimoBaseUrl=String(settings.mimoBaseUrl||'https://api.xiaomimimo.com').trim().replace(/\/+$/,'');
                const proxyUrl='/proxy/'+mimoBaseUrl+'/v1/chat/completions';
                const response=await fetch(proxyUrl,{
                    method:'POST',
                    headers:{'api-key':apiKey,'Content-Type':'application/json'},
                    body:JSON.stringify({
                        model:String(settings.mimoModel||'mimo-v2.5-tts'),
                        messages:[
                            {role:'user',content:''},
                            {role:'assistant',content:spoken}
                        ],
                        audio:{format:'mp3',voice:String(settings.mimoVoice||'Mia')}
                    })
                });
                if(!response.ok) {
                    const detail=(await response.text().catch(()=>'' )).slice(0,180);
                    throw new Error('MiMo 请求失败（HTTP '+response.status+'）'+(detail?'：'+detail:''));
                }
                const data=await response.json();
                const encoded=data?.choices?.[0]?.message?.audio?.data;
                if(!encoded) throw new Error('MiMo 没有返回音频，请检查模型名称和音色设置。');
                const binary=atob(encoded);
                const bytes=new Uint8Array(binary.length);
                for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
                blob=new Blob([bytes],{type:'audio/mpeg'});
            } else {
                throw new Error('未知的 TTS 方式，请重新选择。');
            }
            if(bypassCache && activeTtsAudio) { activeTtsAudio.pause(); activeTtsAudio=null; }
            if(bypassCache) {
                const previousUrl=TTS_AUDIO_CACHE.get(cacheKey);
                if(previousUrl) URL.revokeObjectURL(previousUrl);
                TTS_AUDIO_CACHE.delete(cacheKey);
            }
            await putPersistentTtsBlob(cacheKey,blob);
            objectUrl=URL.createObjectURL(blob);
            TTS_AUDIO_CACHE.set(cacheKey,objectUrl);
            while(TTS_AUDIO_CACHE.size>20) {
                const oldest=TTS_AUDIO_CACHE.keys().next().value;
                const oldUrl=TTS_AUDIO_CACHE.get(oldest);
                URL.revokeObjectURL(oldUrl);
                TTS_AUDIO_CACHE.delete(oldest);
            }
        }
        if(activeTtsAudio) { activeTtsAudio.pause(); activeTtsAudio=null; }
        activeTtsAudio=new Audio(objectUrl);
        activeTtsAudio.preload='auto';
        try {
            await activeTtsAudio.play();
        } catch(error) {
            const name=String(error?.name||'');
            if(name==='NotSupportedError' || /operation is not supported|not supported/i.test(String(error?.message||''))) {
                throw new Error('浏览器无法播放这段音频（The operation is not supported）。可能是接口返回的音频格式不兼容、音频内容无效，或 iPhone 浏览器限制了异步播放。请先试试“系统语音”；如果只有 Fish/MiMo 报错，请检查该接口返回的音频格式。');
            }
            if(name==='NotAllowedError') throw new Error('浏览器阻止了音频播放。请直接点击单词旁的发音按钮再试一次，或检查 iPhone 的静音/网页音频设置。');
            throw error;
        }
        return true;
    }

    function speakFromPanel(text,panel) {
        speakText(text).catch(error=>{
            console.warn('[SideQuest] TTS failed',error);
            const status=panel?.querySelector('.sq-status');
            if(status) status.textContent=String(error?.message||'发音失败，请检查 TTS 设置。')+'（详情已记录到浏览器控制台）';
        });
    }

    function englishPairs(text) {
        const out=[];
        const re=/([A-Za-z][A-Za-z'’.,!? -]{1,180})[（(]([^）)]{1,220})[）)]/g;
        let m;
        while ((m=re.exec(text))) {
            const english=m[1].trim().replace(/^[\s"'“”]+|[\s"'“”]+$/g,'');
            const translation=m[2].trim();
            if (/[A-Za-z]{2,}/.test(english) && translation) out.push({english,translation});
        }
        return out;
    }

    const TRANSLATION_CACHE_KEY='sidequest_v9_translation_cache';

    function loadTranslationCache() {
        try { const value=JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY)||'{}'); return value && typeof value==='object' ? value : {}; }
        catch { return {}; }
    }

    function chineseText(value) {
        const text=String(value||'').trim();
        // Translate Chinese-bearing source lines, including lines with occasional English.
        // Skip lines that already contain an explicit English-Chinese pair.
        return /[\u3400-\u9fff]/.test(text) && englishPairs(text).length===0;
    }

    function learningItems(list) {
        const items=[];
        const cache=loadTranslationCache();
        const mode=loadSettings().translationMode||'english';
        for(const item of list){
            const pairs=englishPairs(item.line);
            for(const pair of pairs){
                if(mode!=='chinese') items.push({...pair,speaker:item.speaker,source:item.line,kind:item.kind,origin:'existing'});
            }
            const translated=cache[item.line];
            if(mode!=='english' && translated && chineseText(item.line)){
                items.push({english:translated,translation:item.line,speaker:item.speaker,source:item.line,kind:item.kind,origin:'translated'});
            }
        }
        return items;
    }

    let translationJobRunning=false;
    async function translateChineseSources(sourceList) {
        const mode=loadSettings().translationMode||'english';
        if(mode==='english' || translationJobRunning) return;
        const list=sourceList||sources();
        const cache=loadTranslationCache();
        const pending=[...new Set(list.map(x=>x.line).filter(line=>chineseText(line) && !cache[line]))].slice(0,8);
        if(!pending.length) return;
        translationJobRunning=true;
        try {
            for(const line of pending){
                try {
                    const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(line.slice(0,450))+'&langpair=zh-CN|en-US';
                    const response=await fetch(url,{method:'GET'});
                    if(!response.ok) continue;
                    const data=await response.json();
                    if(Number(data?.responseStatus||200)!==200) continue;
                    const translated=String(data?.responseData?.translatedText||'').trim();
                    if(translated && !/[\u3400-\u9fff]{2}/.test(translated) && translated.toLowerCase()!==line.toLowerCase()){
                        cache[line]=translated;
                        // Keep the cache bounded so long-running chats stay lightweight.
                        const keys=Object.keys(cache);
                        for(const oldKey of keys.slice(0,Math.max(0,keys.length-1000))) delete cache[oldKey];
                        try { localStorage.setItem(TRANSLATION_CACHE_KEY,JSON.stringify(cache)); } catch {}
                    }
                } catch(error) { console.warn('[SideQuest] translation request failed',error); }
            }
        } finally {
            translationJobRunning=false;
            refreshOpenGame();
        }
    }


    const RECORDS_KEY='sidequest_v9_records';

    function chatKey() {
        try {
            const c=ctx();
            return String(c?.chatId || c?.chat?.[0]?.chat_id || c?.chat?.[0]?.name || 'global');
        } catch { return 'global'; }
    }

    function loadRecords() {
        try {
            const raw=JSON.parse(localStorage.getItem(RECORDS_KEY)||'{}');
            const records={ learned:Array.isArray(raw.learned)?raw.learned:[], mistakes:Array.isArray(raw.mistakes)?raw.mistakes:[], favorites:Array.isArray(raw.favorites)?raw.favorites:[] };
            // Existing records are migrated into the first profile without deleting them.
            for(const list of [records.learned,records.mistakes,records.favorites]) for(const item of list) if(!item.profile) item.profile=DEFAULT_PROFILE_ID;
            return records;
        } catch { return { learned:[], mistakes:[] }; }
    }

    function saveRecords(records) {
        try {
            records.learned=records.learned.slice(-1000);
            records.mistakes=records.mistakes.slice(-1000);
            records.favorites=(Array.isArray(records.favorites)?records.favorites:[]).slice(-1000);
            localStorage.setItem(RECORDS_KEY,JSON.stringify(records));
        } catch {}
    }

    function recordKey(item) {
        return String(item.english||item.word||'').trim().toLowerCase()+'|'+String(item.translation||'').trim();
    }

    function hasLearned(item) {
        if (!loadSettings().learningRecord) return false;
        const key=recordKey(item);
        return loadRecords().learned.some(x=>x.profile===activeProfileId() && x.chat===chatKey() && x.key===key);
    }

    function markLearned(item) {
        const s=loadSettings();
        if (!s.learningRecord) return;
        const records=loadRecords();
        const key=recordKey(item);
        records.learned=records.learned.filter(x=>!(x.profile===activeProfileId() && x.chat===chatKey() && x.key===key));
        records.learned.push({profile:activeProfileId(),chat:chatKey(),key,english:item.english||item.word,translation:item.translation||'',time:Date.now()});
        saveRecords(records);
    }

    function isFavorite(item) {
        const key=recordKey(item);
        return loadRecords().favorites.some(x=>x.profile===activeProfileId() && x.key===key);
    }

    function toggleFavorite(item) {
        const records=loadRecords();
        const profile=activeProfileId();
        const key=recordKey(item);
        const exists=records.favorites.some(x=>x.profile===profile && x.key===key);
        if(exists) records.favorites=records.favorites.filter(x=>!(x.profile===profile && x.key===key));
        else records.favorites.push({profile,chat:chatKey(),key,english:item.english||item.word||'',translation:item.translation||'',source:item.source||'',speaker:item.speaker||'',count:Number(item.count)||1,time:Date.now()});
        saveRecords(records);
        return !exists;
    }

    function markMistake(item,answer) {
        const s=loadSettings();
        if (!s.mistakeBook) return;
        const records=loadRecords();
        const key=recordKey(item);
        records.mistakes=records.mistakes.filter(x=>!(x.profile===activeProfileId() && x.chat===chatKey() && x.key===key));
        records.mistakes.push({profile:activeProfileId(),chat:chatKey(),key,english:item.english||item.word,translation:item.translation||'',wrong:String(answer||''),time:Date.now()});
        saveRecords(records);
    }

    function sources() {
        const s=loadSettings();
        const result=[];
        const pushUnique=(speaker,line,kind)=>{
            const value=clean(line);
            if(!value || value.length<4 || value.length>280) return;
            const key=kind+'|'+speaker+'|'+value;
            if(!result.some(x=>x.key===key)) result.push({speaker,line:value,kind,key});
        };

        const userName=String(ctx()?.name1||'').trim().toLowerCase();
        const isUserSpeaker=name=>{
            const n=String(name||'').trim().toLowerCase();
            return n==='you' || n==='user' || n==='{{user}}' || (userName && n===userName);
        };

        const recentCount=Math.max(1,Math.min(200,Number(s.sourceMessages)||20));
        for(const message of chatMessages().slice(-recentCount)){
            // 只从 AI/角色回复正文抓取；用户自己发给 AI 的消息永远不进题目池。
            if(message.is_user) continue;

            const speaker=String(message.name||message.ch_name||'Character').trim()||'Character';
            let raw=clean(message.mes);
            if(!raw) continue;

            // *xxx* 是内心话，不是对白。
            raw=clean(raw.replace(/\*[\s\S]*?\*/g,' '));
            if(!raw) continue;

            const lines=raw.split(/\n+/).map(x=>x.trim()).filter(Boolean);
            const text=lines.join('\n');
            const dialogueRanges=[];
            // 对白采用严格白名单：只有成对引号内部的文字才算对白。
            // 支持英文直引号、弯引号及中文/日式引号；不再把冒号标签或英文（中文）格式
            // 自动认作对白，避免旁白被误收进“只抓对白”模式。
            const quoteRe=/“([^”]{2,260})”|"([^"]{2,260})"|「([^」]{2,260})」|『([^』]{2,260})』/g;
            let match;
            while((match=quoteRe.exec(text))){
                const quoted=match[1]??match[2]??match[3]??match[4]??'';
                dialogueRanges.push([match.index,quoteRe.lastIndex]);
                if(s.includeCharacter) pushUnique(speaker,quoted,'dialogue');
            }

            if(s.includeNarration){
                if(dialogueRanges.length){
                    let cursor=0;
                    for(const [start,end] of dialogueRanges.sort((a,b)=>a[0]-b[0])){
                        const before=text.slice(cursor,start).trim();
                        if(before) pushUnique(speaker,before,'narration');
                        cursor=Math.max(cursor,end);
                    }
                    const after=text.slice(cursor).trim();
                    if(after) pushUnique(speaker,after,'narration');
                }else if(text.length>=12 && text.length<=280){
                    pushUnique(speaker,text,'narration');
                }
            }
        }
        return result;
    }

    function addStyle() {
        if (document.getElementById('sidequest-style-v9')) return;
        const style=document.createElement('style');
        style.id='sidequest-style-v9';
        style.textContent=css;
        document.head?.appendChild(style);
    }

    function makeDraggable(element, handle) {
        let drag = null;
        handle.addEventListener('pointerdown', e => {
            if (e.button !== 0) return;
            const r = element.getBoundingClientRect();
            drag = { id:e.pointerId, sx:e.clientX, sy:e.clientY, left:r.left, top:r.top, moved:false };
            handle.setPointerCapture?.(e.pointerId);
            e.preventDefault();
        });
        handle.addEventListener('pointermove', e => {
            if (!drag || e.pointerId !== drag.id) return;
            const dx=e.clientX-drag.sx, dy=e.clientY-drag.sy;
            if (Math.abs(dx)+Math.abs(dy)>4) drag.moved=true;
            const r=element.getBoundingClientRect();
            element.style.left=Math.max(6,Math.min(drag.left+dx,innerWidth-r.width-6))+'px';
            element.style.top=Math.max(6,Math.min(drag.top+dy,innerHeight-r.height-6))+'px';
            element.style.right='auto'; element.style.bottom='auto';
        });
        const stop=e => { if (drag && e.pointerId===drag.id) { element.dataset.sqDragged=drag.moved?'1':'0'; drag=null; } };
        handle.addEventListener('pointerup', stop);
        handle.addEventListener('pointercancel', stop);
    }

    let sideQuestListenersBound = false;

    function refreshOpenGame() {
        const panel=document.getElementById(PANEL_ID);
        if (!panel || panel.classList.contains('sq-hidden')) return;
        if (panel.querySelector('.sq-settings')?.hidden === false) return;
        const mode=panel.dataset.sqGame || 'menu';
        if (mode === 'word') buildWord(panel);
        else if (mode === 'learn') buildLearn(panel);
        else if (mode === 'sentence') buildSentenceLab(panel);
        else if (mode === 'spell') buildSpelling(panel);
        else if (mode === 'records') buildRecordBook(panel);
        else buildGame(panel);
    }

    function bindStoryListeners() {
        if (sideQuestListenersBound) return;
        sideQuestListenersBound=true;

        const source=globalThis.eventSource;
        const types=globalThis.event_types || {};
        const names=[
            types.MESSAGE_RECEIVED, types.MESSAGE_SENT, types.MESSAGE_SWIPED,
            types.MESSAGE_UPDATED, types.CHAT_CHANGED,
            'MESSAGE_RECEIVED','MESSAGE_SENT','MESSAGE_SWIPED','MESSAGE_UPDATED','CHAT_CHANGED'
        ].filter(Boolean);

        if (source?.on) {
            [...new Set(names)].forEach(name=>{
                try { source.on(name, refreshOpenGame); } catch {}
            });
        }

        let lastSignature='';
        setInterval(()=>{
            const list=chatMessages();
            const signature=list.slice(-8).map(m=>String(m.mes||'')).join('\u0001');
            if (signature !== lastSignature) {
                lastSignature=signature;
                refreshOpenGame();
            }
        },2200);
    }

    const COMMON_WORDS=new Set(('the a an and or but if then than so because as at by for from in into of on onto to with without about above after before between during through over under again once here there where when while who whom whose which what this that these those i me my mine we us our ours you your yours he him his she her hers it its they them their theirs am is are was were be been being do does did doing have has had having can could will would shall should may might must not no yes very too also just only even still already really quite rather almost ever never always often sometimes usually maybe perhaps all some any each every both few many much more most less least own same other another such s t re ve ll d m don doesn didn isn aren wasn weren won wouldn couldn shouldn cannot cant im youre hes shes theyre youll thats theres whats').split(/\s+/));
    function vocabularySources(list) {
        const mode=loadSettings().translationMode||'english';
        const cache=loadTranslationCache();
        const result=[];
        const add=(line,source,translation,item)=>{
            const text=String(line||'').trim();
            if(!text) return;
            result.push({line:text,source:String(source||text),translation:String(translation||''),speaker:item.speaker||'Character',kind:item.kind||'narration'});
        };
        for(const item of list||[]) {
            const line=String(item.line||'');
            const pairs=englishPairs(line);
            if(mode!=='chinese') {
                if(pairs.length) pairs.forEach(pair=>add(pair.english,line,pair.translation,item));
                else if(!chineseText(line)) add(line,line,'',item);
            }
            if(mode!=='english' && chineseText(line) && cache[line]) add(cache[line],line,line,item);
        }
        return result;
    }

    function extractedWords(list) {
        const words=new Map();
        for(const source of vocabularySources(list)) {
            const line=String(source.line||'').replace(/\[[a-z_-]{2,}\]/gi,' ');
            const matches=line.match(/[A-Za-z][A-Za-z'’\-]{2,}/g)||[];
            for(const raw of matches) {
                const word=raw.replace(/^['’\-]+|['’\-]+$/g,'');
                const normalized=word.toLowerCase().replace(/[’]/g,"'");
                if(normalized.length<3 || COMMON_WORDS.has(normalized.replace(/['’]/g,'')) || !/[aeiou]/i.test(normalized)) continue;
                if(/^(.)\1{2,}$/i.test(normalized)) continue;
                const key=normalized;
                if(!words.has(key)) words.set(key,{english:word,word:normalized,translation:source.translation||'',source:source.source||line,speaker:source.speaker||'Character',kind:source.kind||'narration',count:0,key:'word|'+key});
                const item=words.get(key);
                if(!item._sourceKeys) item._sourceKeys=new Set();
                const sourceKey=String(source.source||line)+'|'+String(source.speaker||'Character');
                if(!item._sourceKeys.has(sourceKey)){ item._sourceKeys.add(sourceKey); item.count++; }
                if(item.source.length<String(source.source||line).length) item.source=String(source.source||line);
                if(!item.translation && source.translation) item.translation=source.translation;
            }
        }
        return [...words.values()].map(item=>{ delete item._sourceKeys; return item; }).sort((a,b)=>b.count-a.count||a.english.localeCompare(b.english));
    }

    function buildGame(root) {
        root.dataset.sqGame='menu';
        const list=sources();
        const empty=root.querySelector('.sq-empty');
        const card=root.querySelector('.sq-card');
        const menu=root.querySelector('.sq-game-menu');
        const status=root.querySelector('.sq-status');
        if (!list.length) {
            empty.hidden=false; card.hidden=true; menu.hidden=true;
            status.textContent='还没有找到可出题的剧情内容。';
            return;
        }

        empty.hidden=true;
        card.hidden=true;
        menu.hidden=false;
        status.textContent='从最近的剧情里挑一个小游戏。';

        menu.innerHTML=`
            <button type="button" class="sq-game-choice" data-game="learn">
                <span class="sq-game-emoji">📖</span>
                <span><b>学习</b><small>先把剧情里不会的英文看懂、听懂</small></span>
            </button>
            <button type="button" class="sq-game-choice" data-game="sentence">
                <span class="sq-game-emoji">🧩</span>
                <span><b>句子拆解</b><small>点句子里的单词看释义、听发音，再挑词练拼写</small></span>
            </button>
            <button type="button" class="sq-game-choice" data-game="records">
                <span class="sq-game-emoji">📚</span>
                <span><b>我的学习档案</b><small>直接查看收藏夹、已学记录和错题本</small></span>
            </button>
            <button type="button" class="sq-game-choice" data-game="spell">
                <span class="sq-game-emoji">✍️</span>
                <span><b>拼写挑战</b><small>根据剧情句子或打乱字母练习拼写</small></span>
            </button>
            <button type="button" class="sq-game-choice" data-game="word">
                <span class="sq-game-emoji">🔎</span>
                <span><b>单词寻宝</b><small>从剧情里学词，再用语境确认意思</small></span>
            </button>
        `;

        menu.querySelectorAll('[data-game]').forEach(button=>{
            button.onclick=()=>{
                const game=button.dataset.game;
                if (game === 'learn') {
                    root.dataset.sqGame='learn';
                    root.querySelector('.sq-game-menu').hidden=true;
                    buildLearn(root,list);
                    return;
                }
                if (game === 'sentence') {
                    root.dataset.sqGame='sentence';
                    root.querySelector('.sq-game-menu').hidden=true;
                    buildSentenceLab(root,list);
                    return;
                }
                if (game === 'records') {
                    root.dataset.sqGame='records';
                    root.querySelector('.sq-game-menu').hidden=true;
                    buildRecordBook(root);
                    return;
                }
                if (game === 'spell') {
                    root.dataset.sqGame='spell';
                    root.querySelector('.sq-game-menu').hidden=true;
                    buildSpelling(root,list);
                    return;
                }
                if (game !== 'word') return;
                root.dataset.sqGame='word';
                root.querySelector('.sq-game-menu').hidden=true;
                buildWord(root,list);
            };
        });
    }


    const WORD_MEANING_CACHE_KEY='sidequest_v9_word_meanings';

    async function translateWordToChinese(word) {
        const key=String(word||'').toLowerCase().trim();
        if(!key) return '';
        let cache={};
        try { cache=JSON.parse(localStorage.getItem(WORD_MEANING_CACHE_KEY)||'{}')||{}; } catch {}
        if(cache[key]) return cache[key];
        const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(key)+'&langpair=en-US|zh-CN';
        const response=await fetch(url);
        if(!response.ok) throw new Error('translation request failed');
        const data=await response.json();
        const value=String(data?.responseData?.translatedText||'').trim();
        if(!value || value.toLowerCase()===key.toLowerCase() || /[A-Za-z]{10,}/.test(value) && !/[\u3400-\u9fff]/.test(value)) return '';
        cache[key]=value;
        const keys=Object.keys(cache);
        for(const oldKey of keys.slice(0,Math.max(0,keys.length-500))) delete cache[oldKey];
        try { localStorage.setItem(WORD_MEANING_CACHE_KEY,JSON.stringify(cache)); } catch {}
        return value;
    }

    async function buildSentenceLab(root,listArg) {
        const list=listArg||sources();
        if((loadSettings().translationMode||'english')!=='english') await translateChineseSources(list);
        const mode=loadSettings().translationMode||'english';
        const candidates=[];
        for(const source of list){
            const pairs=englishPairs(source.line);
            if(pairs.length){
                pairs.forEach(pair=>candidates.push({...pair,speaker:source.speaker,source:source.line,kind:source.kind}));
                continue;
            }
            // English-only dialogue is also useful sentence material; previously the
            // lab only used explicit English（Chinese） pairs, making the pool tiny.
            if(mode!=='chinese' && /[A-Za-z]{3,}/.test(source.line)){
                const chunks=String(source.line).match(/[^.!?]+(?:[.!?]+|$)/g)||[source.line];
                for(const chunk of chunks){
                    const english=chunk.trim();
                    if(english.length>=12 && english.length<=280 && /[A-Za-z]{3,}/.test(english)){
                        candidates.push({english,translation:'',speaker:source.speaker,source:source.line,kind:source.kind});
                    }
                }
            }
        }
        if(mode!=='english'){
            learningItems(list).filter(x=>/[A-Za-z]{3,}/.test(x.english||'')).forEach(x=>candidates.push(x));
        }
        const seenSentences=new Set();
        const items=candidates.filter(x=>{
            const key=String(x.english||'').toLowerCase().replace(/\s+/g,' ').trim();
            if(!key || seenSentences.has(key)) return false;
            seenSentences.add(key); return true;
        });
        const empty=root.querySelector('.sq-empty'),card=root.querySelector('.sq-card'),menu=root.querySelector('.sq-game-menu');
        if(!items.length){empty.hidden=false;card.hidden=true;menu.hidden=true;root.querySelector('.sq-status').textContent='暂时没有可拆解的英文句子。';return;}
        const item=items[Math.floor(Math.random()*items.length)];
        empty.hidden=true;menu.hidden=true;card.hidden=false;
        root.querySelector('.sq-label').textContent='SENTENCE LAB';
        root.querySelector('.sq-status').textContent='点句子里的词，逐个查看；选中一个词后可以练拼写。';
        const prompt=root.querySelector('.sq-prompt'),box=root.querySelector('.sq-options'),feedback=root.querySelector('.sq-feedback');
        prompt.replaceChildren();box.replaceChildren();feedback.textContent='';
        const sentence=document.createElement('div');sentence.style.cssText='display:flex;flex-wrap:wrap;gap:5px;line-height:1.8;';
        let selected=null;
        let meaningRequestId=0;
        const detail=document.createElement('div');detail.className='sq-card';detail.style.cssText='margin-top:12px;padding:12px;background:rgba(255,255,255,.035);';
        const detailWord=document.createElement('div');detailWord.style.cssText='font-size:21px;font-weight:800;';detailWord.textContent='点上方任意英文单词';detail.appendChild(detailWord);
        const detailMeaning=document.createElement('div');detailMeaning.className='sq-meaning';detailMeaning.textContent='点击单词后，查询常见中文意思，并结合原句理解用法。';detail.appendChild(detailMeaning);
        const detailContext=document.createElement('div');detailContext.className='sq-context';detailContext.style.cssText='margin-top:7px;font-size:12px;';detailContext.textContent='本句语境：'+String(item.english||'');detail.appendChild(detailContext);
        if(item.translation){const sentenceMeaning=document.createElement('div');sentenceMeaning.className='sq-meaning';sentenceMeaning.textContent='整句意思：'+item.translation;detail.appendChild(sentenceMeaning);}
        const detailActions=document.createElement('div');detailActions.style.cssText='display:flex;gap:8px;margin-top:10px;';
        const hear=document.createElement('button');hear.type='button';hear.className='sq-option';hear.textContent='🔊 听单词';hear.disabled=true;hear.onclick=()=>{if(selected)speakFromPanel(selected,root);};detailActions.appendChild(hear);
        const spell=document.createElement('button');spell.type='button';spell.className='sq-option';spell.textContent='✍️ 练拼写';spell.disabled=true;spell.onclick=()=>{if(selected){root.dataset.sqGame='spell';buildSpelling(root,list,selected);}};detailActions.appendChild(spell);
        detail.appendChild(detailActions);
        const tokens=String(item.english||'').match(/[A-Za-z][A-Za-z'’-]*|[^A-Za-z]+/g)||[];
        tokens.forEach(raw=>{
            if(!/^[A-Za-z]/.test(raw)){sentence.appendChild(document.createTextNode(raw));return;}
            const token=document.createElement('button');token.type='button';token.className='sq-option';token.style.cssText='display:inline-block;width:auto;min-height:34px;padding:4px 7px;font-size:15px;';token.textContent=raw;
            token.onclick=()=>{
                selected=raw.toLowerCase().replace(/[’]/g,"'");
                detailWord.textContent=raw;
                const requestId=++meaningRequestId;
                detailMeaning.textContent='正在查询常见中文意思……';
                hear.disabled=false;
                const canSpell=selected.length>=4&&!COMMON_WORDS.has(selected.replace(/['’]/g,''))&&extractedWords(list).some(x=>x.word.toLowerCase().replace(/[’]/g,"'")===selected);
                spell.disabled=!canSpell;
                translateWordToChinese(selected).then(value=>{
                    if(requestId!==meaningRequestId)return;
                    detailMeaning.textContent=value?'常见中文意思：'+value:'暂时没有查到可靠的单词翻译；可以结合本句语境理解。';
                }).catch(()=>{
                    if(requestId===meaningRequestId)detailMeaning.textContent='在线翻译暂不可用；可以先结合本句语境理解。';
                });
            };
            sentence.appendChild(token);
        });
        prompt.appendChild(sentence);
        const translation=document.createElement('div');translation.className='sq-meaning';translation.style.marginTop='10px';translation.textContent=item.translation||'这句暂时没有现成翻译；可以先逐词拆解。';prompt.appendChild(translation);
        const sentenceHear=document.createElement('button');sentenceHear.type='button';sentenceHear.className='sq-option';sentenceHear.style.marginTop='10px';sentenceHear.textContent='🔊 听整句';sentenceHear.onclick=()=>speakFromPanel(item.english,root);prompt.appendChild(sentenceHear);
        prompt.appendChild(detail);
        const next=document.createElement('button');next.type='button';next.className='sq-option';next.textContent='换一句 →';next.onclick=()=>buildSentenceLab(root,sources());box.appendChild(next);
        const back=document.createElement('button');back.type='button';back.className='sq-option';back.textContent='← 返回小游戏菜单';back.onclick=()=>buildGame(root);box.appendChild(back);
    }
    async function buildLearn(root,listArg) {
        const list=listArg||sources();
        if((loadSettings().translationMode||'english')!=='english') await translateChineseSources(list);
        let items=learningItems(list);
        const s=loadSettings();
        if(!s.repeatLearned && s.learningRecord) items=items.filter(x=>!hasLearned(x));

        const empty=root.querySelector('.sq-empty'), card=root.querySelector('.sq-card'), menu=root.querySelector('.sq-game-menu'), status=root.querySelector('.sq-status');
        if(!items.length){
            empty.hidden=false; card.hidden=true; menu.hidden=true;
            status.textContent='暂时没有“英文＋现成中文”的剧情内容。';
            return;
        }

        const item=items[Math.floor(Math.random()*items.length)];
        empty.hidden=true; menu.hidden=true; card.hidden=false;
        status.textContent='看看、听听，再决定自己是不是真的会了。';
        root.querySelector('.sq-label').textContent='LEARN';
        card.querySelectorAll('.sq-door').forEach(x=>x.remove());

        const prompt=root.querySelector('.sq-prompt'), box=root.querySelector('.sq-options'), feedback=root.querySelector('.sq-feedback');
        box.innerHTML=''; feedback.textContent='';

        const row=document.createElement('div'); row.className='sq-prompt-row';
        const main=document.createElement('div'); main.className='sq-prompt-main'; main.textContent=item.english; row.appendChild(main);
        const speak=document.createElement('button'); speak.type='button'; speak.className='sq-inline-speak'; speak.textContent='🔊'; speak.title='听发音'; speak.setAttribute('aria-label','听发音'); speak.onclick=()=>speakFromPanel(item.english,root); row.appendChild(speak);
        prompt.innerHTML=''; prompt.appendChild(row);

        const meaning=document.createElement('div'); meaning.className='sq-meaning'; meaning.textContent=item.translation; prompt.appendChild(meaning);

        const actions=document.createElement('div'); actions.className='sq-learn-actions';
        const learned=document.createElement('button'); learned.type='button'; learned.className='sq-option'; learned.textContent='✓ 会了';
        learned.onclick=()=>{ markLearned(item); feedback.textContent='已记住。'; setTimeout(()=>{ if(root.dataset.sqGame==='learn') buildLearn(root,sources()); },420); };
        const notYet=document.createElement('button'); notYet.type='button'; notYet.className='sq-option'; notYet.textContent='↻ 还不会';
        notYet.onclick=()=>{ markMistake(item,'还不会'); feedback.textContent='没关系，记一下。'; setTimeout(()=>{ if(root.dataset.sqGame==='learn') buildLearn(root,sources()); },620); };
        actions.appendChild(learned); actions.appendChild(notYet);
        box.appendChild(actions);

    }

    async function buildWordBank(root,listArg) {
        const list=listArg||sources();
        const mode=loadSettings().translationMode||'english';
        if(mode!=='english') await translateChineseSources(list);
        const words=extractedWords(list);
        const empty=root.querySelector('.sq-empty'), card=root.querySelector('.sq-card'), menu=root.querySelector('.sq-game-menu'), status=root.querySelector('.sq-status');
        if(!words.length) {
            empty.hidden=false; card.hidden=true; menu.hidden=true;
            status.textContent='最近的 AI 回复里暂时没有可收集的英文单词。';
            return;
        }
        empty.hidden=true; menu.hidden=true; card.hidden=false;
        root.querySelector('.sq-label').textContent='WORD COLLECTION';
        status.textContent='共收集 '+words.length+' 个不同单词。点词查看释义、发音和练习。';
        const prompt=root.querySelector('.sq-prompt'), box=root.querySelector('.sq-options'), feedback=root.querySelector('.sq-feedback');
        prompt.textContent='我的词汇 · '+words.length+' 词';
        box.replaceChildren(); feedback.textContent='';
        const note=document.createElement('div'); note.className='sq-context'; note.textContent='点单词查看学习卡片；收藏的词会保存在学习档案里。'; box.appendChild(note);
        const grid=document.createElement('div'); grid.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:10px;';
        words.slice(0,80).forEach(item=>{
            const b=document.createElement('button'); b.type='button'; b.className='sq-option'; b.style.cssText='min-width:0;overflow-wrap:anywhere;text-align:left;';
            b.replaceChildren();
            const wordLabel=document.createElement('span');
            wordLabel.style.cssText='display:block;font-size:16px;font-weight:750;line-height:1.4;';
            wordLabel.textContent=item.english;
            b.appendChild(wordLabel);
            if(item.translation){
                const meaningLabel=document.createElement('span');
                meaningLabel.style.cssText='display:block;margin-top:4px;font-size:13px;line-height:1.45;opacity:.78;';
                meaningLabel.textContent=item.translation;
                b.appendChild(meaningLabel);
            }
            const countLabel=document.createElement('span');
            countLabel.style.cssText='display:block;margin-top:5px;font-size:11px;opacity:.62;';
            countLabel.textContent=item.count>1?'出现 '+item.count+' 次':'点开学习';
            b.appendChild(countLabel);
            b.style.minHeight='66px';
            b.onclick=()=>buildWordDetail(root,item,list);
            grid.appendChild(b);
        });
        box.appendChild(grid);
        if(words.length>80){const more=document.createElement('div');more.className='sq-context';more.textContent='为保持界面轻量，本页最多显示 80 个词；当前列表按出现次数排序。';box.appendChild(more);}
    }

    function buildWordDetail(root,item,listArg) {
        const prompt=root.querySelector('.sq-prompt'), box=root.querySelector('.sq-options'), feedback=root.querySelector('.sq-feedback');
        root.querySelector('.sq-label').textContent='WORD DETAIL';
        root.querySelector('.sq-status').textContent='单词学习卡 · 发音、释义、语境和拼写';
        prompt.replaceChildren();
        const row=document.createElement('div');row.className='sq-prompt-row';
        const word=document.createElement('div');word.className='sq-prompt-main';word.style.cssText='font-size:23px;font-weight:800;';word.textContent=item.english;row.appendChild(word);
        const speak=document.createElement('button');speak.type='button';speak.className='sq-inline-speak';speak.textContent='🔊';speak.title='听单词发音';speak.onclick=()=>speakFromPanel(item.english,root);row.appendChild(speak);prompt.appendChild(row);
        const meaning=document.createElement('div');meaning.className='sq-meaning';meaning.textContent=item.translation||'可以结合原句理解这个词的意思。';prompt.appendChild(meaning);
        const contextDetails=document.createElement('details');contextDetails.style.cssText='margin-top:10px;font-size:13px;line-height:1.6;';
        const contextSummary=document.createElement('summary');contextSummary.textContent='查看原句与语境';contextSummary.style.cursor='pointer';contextDetails.appendChild(contextSummary);
        const context=document.createElement('div');context.className='sq-context';context.textContent=item.source;contextDetails.appendChild(context);
        const contextMeta=document.createElement('div');contextMeta.className='sq-source';contextMeta.textContent=item.speaker+' · 出现 '+item.count+' 次';contextDetails.appendChild(contextMeta);prompt.appendChild(contextDetails);
        box.replaceChildren();feedback.textContent='';
        const save=document.createElement('button');save.type='button';save.className='sq-option';save.textContent=isFavorite(item)?'★ 已收藏（点此取消）':'☆ 收藏到我的收藏夹';
        save.onclick=()=>{
            const added=toggleFavorite(item);
            save.textContent=added?'★ 已收藏（点此取消）':'☆ 收藏到我的收藏夹';
            feedback.textContent=added?'已保存到「我的学习档案」→「我的收藏夹」。':'已从收藏夹移除。';
            const panel=document.getElementById(PANEL_ID);
            if(panel) renderRecordManager(panel);
        };box.appendChild(save);
        const learned=document.createElement('button');learned.type='button';learned.className='sq-option';learned.textContent='✓ 标记为已学';
        learned.onclick=()=>{
            markLearned(item);
            feedback.textContent=loadSettings().learningRecord?'已加入学习记录。':'你关闭了「保存学习记录」，所以这次没有保存。';
            const panel=document.getElementById(PANEL_ID);
            if(panel) renderRecordManager(panel);
        };box.appendChild(learned);
        const back=document.createElement('button');back.type='button';back.className='sq-option';back.textContent='← 返回单词列表';
        back.onclick=()=>buildWordBank(root,listArg||sources());box.appendChild(back);
        const spell=document.createElement('button');spell.type='button';spell.className='sq-option';spell.textContent='✍️ 用这个词练习拼写';
        spell.onclick=()=>{root.dataset.sqGame='spell';buildSpelling(root,listArg||sources(),item.word);};box.appendChild(spell);
    }

    async function buildSpelling(root,listArg,forcedWord) {
        const list=listArg||sources();
        const modeSetting=loadSettings().translationMode||'english';
        if(modeSetting!=='english') await translateChineseSources(list);
        const words=extractedWords(list).filter(x=>x.word.length>=4);
        const pool=forcedWord?words.filter(x=>x.word===String(forcedWord).toLowerCase().replace(/[’]/g,"'")):words;
        const available=pool;
        const empty=root.querySelector('.sq-empty'), card=root.querySelector('.sq-card'), menu=root.querySelector('.sq-game-menu');
        if(!available.length) {
            empty.hidden=false;card.hidden=true;menu.hidden=true;
            root.querySelector('.sq-status').textContent='还没有足够长的英文单词可以进行拼写练习。';
            return;
        }
        const target=available[Math.floor(Math.random()*available.length)];
        const mode=forcedWord?'context':(Math.random()<0.5?'context':'scramble');
        empty.hidden=true;menu.hidden=true;card.hidden=false;
        root.querySelector('.sq-label').textContent='SPELLING';
        root.querySelector('.sq-status').textContent=mode==='context'?'句中补词：根据剧情上下文拼出缺失单词。':'字母重组：把打乱的字母重新拼成单词。';
        const prompt=root.querySelector('.sq-prompt'),box=root.querySelector('.sq-options'),feedback=root.querySelector('.sq-feedback');
        prompt.replaceChildren();
        const context=document.createElement('div');context.className='sq-prompt-main';
        if(mode==='context') {
            context.textContent=String(target.source||'').replace(/[A-Za-z][A-Za-z'’-]*/g,token=>token.toLowerCase()===target.word?'＿'.repeat(target.word.length):token);
        } else {
            let letters=target.word.split('').sort(()=>Math.random()-.5);
            if(letters.join('').toLowerCase()===target.word.toLowerCase()) letters=target.word.split('').reverse();
            context.textContent='字母顺序被打乱了：\n'+letters.join(' · ');
        }
        prompt.appendChild(context);
        const hint=document.createElement('div');hint.className='sq-context';hint.textContent='提示：'+target.word.length+' 个字母 · 角色：'+target.speaker;prompt.appendChild(hint);
        box.replaceChildren();feedback.textContent='';
        const input=document.createElement('input');input.type='text';input.autocomplete='off';input.autocapitalize='none';input.spellcheck=false;input.placeholder='输入英文拼写';input.className='sq-url-input';input.style.marginTop='12px';input.setAttribute('aria-label','英文单词拼写答案');box.appendChild(input);
        const hintButton=document.createElement('button');hintButton.type='button';hintButton.className='sq-option';hintButton.textContent='💡 提示首字母';hintButton.style.marginTop='8px';hintButton.onclick=()=>{feedback.textContent='提示：首字母是 “'+target.word.charAt(0)+'”';};box.appendChild(hintButton);
        const submit=document.createElement('button');submit.type='button';submit.className='sq-option';submit.textContent='检查答案';submit.style.marginTop='8px';box.appendChild(submit);
        const check=()=>{
            if(submit.disabled)return;
            const answer=input.value.trim();
            if(!answer){feedback.textContent='先试着拼写一下吧。';input.focus();return;}
            submit.disabled=true;input.disabled=true;
            if(answer.toLowerCase()===target.word.toLowerCase()) {
                markLearned(target);feedback.textContent='✓ 正确！ '+target.english;
            } else {
                markMistake(target,answer);feedback.textContent='再记一下：正确拼写是 '+target.english;
            }
            const next=document.createElement('button');next.type='button';next.className='sq-option';next.style.marginTop='8px';next.textContent='下一题 →';next.onclick=()=>buildSpelling(root,sources());box.appendChild(next);
        };
        submit.onclick=check;
        input.addEventListener('keydown',e=>{if(e.key==='Enter' && !e.isComposing){e.preventDefault();check();}});
        // No adjacent skip button: avoid accidental taps discarding an unfinished attempt on mobile.
    }

    function buildWord(root,listArg) {
        const list=listArg||sources();
        const pairs=list.flatMap(item=>englishPairs(item.line).map(pair=>({...pair,speaker:item.speaker,source:item.line,kind:item.kind})));
        const allItems=learningItems(list);
        const sentenceItems=list.flatMap(item=>{
            const found=englishPairs(item.line);
            const chunks=String(item.line||'').match(/[^.!?]+(?:[.!?]+|$)/g)||[];
            return chunks.map(chunk=>{
                const english=chunk.trim();
                if(english.length<12 || english.length>280 || !/[A-Za-z]{3,}/.test(english)) return null;
                const paired=found.find(pair=>english.includes(pair.english)||pair.english.includes(english));
                return {english,translation:paired?.translation||'',speaker:item.speaker,source:item.line,kind:item.kind};
            }).filter(Boolean);
        });
        const pool=[];
        const seenPool=new Set();
        for(const item of [...pairs,...sentenceItems,...allItems.filter(x=>/[A-Za-z]{3,}/.test(x.english||''))]){
            const key=String(item.english||'').toLowerCase().replace(/\\s+/g,' ').trim();
            if(key && !seenPool.has(key)){seenPool.add(key);pool.push(item);}
        }
        if(!pool.length){ root.querySelector('.sq-empty').hidden=false; root.querySelector('.sq-card').hidden=true; root.querySelector('.sq-game-menu').hidden=true; root.querySelector('.sq-status').textContent='找到剧情了，但暂时没有英文。'; return; }

        const target=pool[Math.floor(Math.random()*pool.length)];
        root.querySelector('.sq-empty').hidden=true; root.querySelector('.sq-game-menu').hidden=true; root.querySelector('.sq-card').hidden=false;
        root.querySelector('.sq-label').textContent='WORD HUNT';
        root.querySelector('.sq-status').textContent=target.translation?'语境复习：选出这句话最符合的意思。':'词汇复习：从原句里找出目标词。';

        const card=root.querySelector('.sq-card'); card.querySelectorAll('.sq-door').forEach(x=>x.remove());
        const prompt=root.querySelector('.sq-prompt'), box=root.querySelector('.sq-options'), feedback=root.querySelector('.sq-feedback');
        box.innerHTML=''; feedback.textContent='';

        const row=document.createElement('div'); row.className='sq-prompt-row';
        const main=document.createElement('div'); main.className='sq-prompt-main'; main.textContent=target.translation?target.english:'从这句剧情中找词：\n'+target.english; row.appendChild(main);
        const speak=document.createElement('button'); speak.type='button'; speak.className='sq-inline-speak'; speak.textContent='🔊'; speak.title='听这句'; speak.setAttribute('aria-label','听这句'); speak.onclick=()=>speakText(target.english,'en-US'); row.appendChild(speak);
        prompt.innerHTML=''; prompt.appendChild(row);

        if(target.translation){
            const other=pool.filter(x=>x!==target&&x.translation&&x.translation!==target.translation).map(x=>x.translation).filter(Boolean);
            const fallbacks=['她没有回答，只是看着你。','他似乎没有想到会这样。','你决定暂时保持沉默。'];
            const choices=[target.translation,...other,...fallbacks].filter((x,i,a)=>x&&a.indexOf(x)===i).slice(0,3);
            while(choices.length<3) choices.push(['先离开这里。','她轻轻笑了起来。','你不知道该说什么。'][choices.length-1]);
            renderChoices(root,choices,target.translation,'答对了！','再看看这句：'+target.translation,target);
        }else{
            const words=[...new Set((target.english.match(/[A-Za-z]{3,}/g)||[]).map(x=>x.toLowerCase()))];
            const answer=words[Math.floor(Math.random()*words.length)];
            const distract=['different','punishment','theater','quiet','really','master','always','little'].filter(x=>x!==answer).slice(0,2);
            renderChoices(root,[answer,...distract],answer,'抓到了！','答案是 '+answer+'。',target);
        }

        const context=document.createElement('div'); context.className='sq-context'; context.textContent='来自：'+target.speaker; box.appendChild(context);
    }

    function renderChoices(root,choices,answer,okText,badText,item) {
        const box=root.querySelector('.sq-options'), feedback=root.querySelector('.sq-feedback');
        box.innerHTML=''; feedback.textContent='';
        choices.sort(()=>Math.random()-.5).forEach(choice=>{
            const b=document.createElement('button'); b.type='button'; b.className='sq-option'; b.textContent=choice;
            b.onclick=()=>{
                [...box.querySelectorAll('.sq-option')].forEach(x=>x.disabled=true);
                const ok=choice===answer; b.classList.add(ok?'sq-ok':'sq-bad');
                if(ok){ markLearned(item); feedback.textContent='✨ '+okText; }
                else { markMistake(item,choice); feedback.textContent=' '+badText; }
                setTimeout(()=>{ if(root.dataset.sqGame==='word') buildWord(root,sources()); },700);
            };
            box.appendChild(b);
        });
    }

    function applyMobileGeometry(panel) {
        if (!panel) return;
        const vv=window.visualViewport;
        const vw=Math.max(280,Math.round(vv?.width||window.innerWidth||360));
        const vh=Math.max(360,Math.round(vv?.height||window.innerHeight||640));
        const cs=getComputedStyle(document.documentElement);
        const insetTop=parseFloat(cs.getPropertyValue('--tt-inset-top'))||0;
        const insetBottom=parseFloat(cs.getPropertyValue('--tt-inset-bottom'))||0;
        const margin=12;
        const width=Math.max(280,Math.min(360,vw-margin*2));
        const height=Math.max(300,Math.min(520,vh-insetTop-insetBottom-24));
        panel.style.setProperty('position','fixed','important');
        panel.style.setProperty('transform','none','important');
        panel.style.setProperty('perspective','none','important');
        panel.style.setProperty('box-sizing','border-box','important');
        panel.style.setProperty('width',width+'px','important');
        panel.style.setProperty('max-width',width+'px','important');
        panel.style.setProperty('height',height+'px','important');
        panel.style.setProperty('max-height',height+'px','important');
        panel.style.setProperty('min-height','0','important');
        const r=panel.getBoundingClientRect();
        const currentLeft=parseFloat(panel.style.left);
        const currentTop=parseFloat(panel.style.top);
        const left=Math.max(margin,Math.min(vw-r.width-margin,Number.isFinite(currentLeft)?currentLeft:vw-r.width-margin));
        const top=Math.max(insetTop+margin,Math.min(vh-insetBottom-r.height-margin,Number.isFinite(currentTop)?currentTop:vh-insetBottom-r.height-margin));
        panel.style.setProperty('left',left+'px','important');
        panel.style.setProperty('top',top+'px','important');
        panel.style.setProperty('right','auto','important');
        panel.style.setProperty('bottom','auto','important');
    }

    function applyPanelBackground(panel) {
        if (!panel) return;
        const url=String(loadSettings().backgroundUrl||'').trim();
        if (url) {
            panel.style.setProperty('background-image','linear-gradient(rgba(20,20,28,.58),rgba(20,20,28,.68)), url("' + url.replace(/"/g,'\\\"') + '")','important');
            panel.style.setProperty('background-size','cover','important');
            panel.style.setProperty('background-position','center','important');
        } else {
            panel.style.removeProperty('background-image');
            panel.style.removeProperty('background-size');
            panel.style.removeProperty('background-position');
        }
    }

    function renderProfileControls(panel) {
        const select=panel.querySelector('[data-profile-select]');
        const name=panel.querySelector('[data-profile-name]');
        if(!select) return;
        const data=loadProfiles();
        select.innerHTML='';
        for(const p of data.profiles){
            const option=document.createElement('option');
            option.value=p.id; option.textContent=p.name;
            option.selected=p.id===activeProfileId();
            select.appendChild(option);
        }
        if(name) name.value=activeProfile()?.name||'';
        const create=panel.querySelector('[data-act="profile-create"]');
        if(create) create.disabled=data.profiles.length>=3;
        const note=panel.querySelector('[data-profile-note]');
        if(note) note.textContent=data.profiles.length>=3?'最多创建 3 套档案。':'每套档案的设置、学习记录和错题本独立保存。';
    }

    function renderRecordManager(panel,hostOverride) {
        const host=hostOverride||panel.querySelector('[data-record-manager]');
        if(!host) return;
        host.innerHTML='';
        const records=loadRecords();
        const profile=activeProfileId();
        const learned=records.learned.filter(x=>x.profile===profile);
        const mistakes=records.mistakes.filter(x=>x.profile===profile);
        const favorites=records.favorites.filter(x=>x.profile===profile);
        const makeSection=(title,items,type)=>{
            const section=document.createElement('section');
            section.style.cssText='margin:8px 0 14px;';
            const heading=document.createElement('div');
            heading.style.cssText='font-size:12px;font-weight:700;margin:8px 0;';
            heading.textContent=title+'（'+items.length+'）';
            section.appendChild(heading);
            if(!items.length){
                const empty=document.createElement('div');
                empty.className='sq-note'; empty.textContent='这里还没有记录。'; section.appendChild(empty);
            }
            items.slice().reverse().forEach(item=>{
                const row=document.createElement('div');
                row.style.cssText='display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-top:1px solid rgba(255,255,255,.08);';
                const content=document.createElement('div');
                content.style.cssText='flex:1;min-width:0;font-size:11px;line-height:1.45;overflow-wrap:anywhere;';
                const word=document.createElement('div');
                word.style.fontWeight='700'; word.textContent=item.english||item.word||'（无英文内容）';
                content.appendChild(word);
                if(item.translation){
                    const meaning=document.createElement('div');
                    meaning.style.opacity='.7'; meaning.textContent=item.translation; content.appendChild(meaning);
                }
                if(type==='mistakes' && item.wrong){
                    const wrong=document.createElement('div');
                    wrong.style.opacity='.55'; wrong.textContent='你的答案：'+item.wrong; content.appendChild(wrong);
                }
                const date=document.createElement('div');
                date.style.cssText='font-size:9px;opacity:.4;margin-top:3px;';
                date.textContent=item.time?new Date(item.time).toLocaleString():'';
                content.appendChild(date);
                const del=document.createElement('button');
                del.type='button'; del.className='sq-icon'; del.style.flex='0 0 30px'; del.textContent='删除'; del.title='删除这条记录';
                del.style.width='42px'; del.style.borderRadius='8px'; del.style.fontSize='10px';
                del.onclick=()=>{
                    const latest=loadRecords();
                    latest[type]=latest[type].filter(x=>!(x.profile===profile && x.time===item.time && x.key===item.key && (type!=='mistakes'||x.wrong===item.wrong)));
                    saveRecords(latest); renderRecordManager(panel,host);
                };
                row.append(content,del); section.appendChild(row);
            });
            const labels={learned:'学习记录',mistakes:'错题本',favorites:'收藏夹'};
            const clear=document.createElement('button');
            clear.type='button'; clear.className='sq-mini-action'; clear.textContent='清空本档案的'+(labels[type]||'记录');
            clear.onclick=()=>{
                if(!confirm('确定清空本档案的'+(labels[type]||'记录')+'吗？此操作无法撤销。')) return;
                const latest=loadRecords();
                latest[type]=latest[type].filter(x=>x.profile!==profile);
                saveRecords(latest); renderRecordManager(panel,host);
            };
            section.appendChild(clear);
            host.appendChild(section);
        };
        makeSection('我的收藏夹',favorites,'favorites');
        makeSection('已学记录',learned,'learned');
        makeSection('错题本',mistakes,'mistakes');
    }

    function buildRecordBook(root) {
        const empty=root.querySelector('.sq-empty'), card=root.querySelector('.sq-card'), menu=root.querySelector('.sq-game-menu');
        empty.hidden=true; menu.hidden=true; card.hidden=false;
        root.querySelector('.sq-label').textContent='MY LEARNING LIBRARY';
        root.querySelector('.sq-status').textContent='当前学习档案的收藏、已学记录与错题本。';
        root.querySelector('.sq-prompt').textContent='收藏夹与学习记录保存在当前浏览器，并按学习档案分开。';
        const box=root.querySelector('.sq-options');
        box.replaceChildren();
        const host=document.createElement('div');
        host.dataset.recordManagerView='';
        box.appendChild(host);
        renderRecordManager(root,host);
        const back=document.createElement('button');
        back.type='button'; back.className='sq-option'; back.textContent='← 返回小游戏菜单';
        back.onclick=()=>buildGame(root);
        box.appendChild(back);
    }

    function createPanel() {
        document.getElementById(PANEL_ID)?.remove();
        const panel=document.createElement('div');
        panel.id=PANEL_ID;
        panel.className='sq-hidden';
        panel.innerHTML=`
            <div class="sq-head">
                <div><span class="sq-title">SideQuest</span><span class="sq-sub">边等剧情，偷偷玩一下</span></div>
                <div class="sq-actions"><button class="sq-icon" data-act="settings" title="设置">⚙</button><button class="sq-icon" data-act="exit" title="退出 SideQuest">🚪</button><button class="sq-icon" data-act="close" title="返回/关闭">×</button></div>
            </div>
            <div class="sq-body">
                <div class="sq-status">准备中……</div>
                <div class="sq-empty"><div class="sq-empty-icon">✨</div><div class="sq-empty-title">你的小支线</div><p>它会从最近的 RP 里捡一点内容，变成小游戏。</p></div>
                <div class="sq-game-menu" hidden></div>
                <div class="sq-card" hidden>
                    <div class="sq-label"></div>
                    <div class="sq-prompt"></div>
                    <div class="sq-options"></div>
                    <div class="sq-feedback"></div>
                </div>
                <div class="sq-settings" hidden>
                    <h3>SideQuest 设置</h3>
                    <p>只读取 AI/角色回复正文；你的消息不会进入素材池。这里可以选择抓取对白或 AI 回复里的旁白。</p>
                    <details class="sq-details" open>
                        <summary>学习档案</summary>
                        <div class="sq-details-body">
                            <label class="sq-setting-label">当前档案</label>
                            <select data-profile-select class="sq-url-input"></select>
                            <label class="sq-setting-label">档案名称</label>
                            <input data-profile-name class="sq-url-input" maxlength="32" placeholder="给这套档案起名">
                            <div style="display:flex;gap:8px;">
                                <button type="button" class="sq-mini-action" data-act="profile-rename">保存名称</button>
                                <button type="button" class="sq-mini-action" data-act="profile-create">新建档案</button>
                            </div>
                            <div class="sq-note" data-profile-note></div>
                        </div>
                    </details>
                    <details class="sq-details">
                        <summary>我的记录与错题本</summary>
                        <div class="sq-details-body">
                            <div class="sq-note">可以查看、逐条删除，或清空当前档案的记录。不同档案互不影响。</div>
                            <div data-record-manager></div>
                        </div>
                    </details>
                    <details class="sq-details">
                        <summary>题目素材</summary>
                        <div class="sq-details-body">
                            <label class="sq-setting-row"><input type="checkbox" data-key="includeCharacter"><span>角色对白</span></label>
                            <label class="sq-setting-row"><input type="checkbox" data-key="includeNarration"><span>AI 回复里的旁白</span></label>
                        </div>
                    </details>
                    <details class="sq-details">
                        <summary>抓取范围</summary>
                        <div class="sq-details-body">
                            <label class="sq-setting-label">从最近多少条聊天消息中抓取</label>
                            <select class="sq-url-input" data-key="sourceMessages">
                                <option value="5">最近 5 条</option><option value="10">最近 10 条</option><option value="20">最近 20 条（默认）</option><option value="40">最近 40 条</option><option value="80">最近 80 条</option><option value="120">最近 120 条</option><option value="200">最近 200 条</option>
                            </select>
                            <div class="sq-note">优先使用最新聊天内容。按 ST 消息条目计数，包含角色回复和用户消息；用户消息不会被抓取成学习素材。</div>
                        </div>
                    </details>
                    <details class="sq-details" open>
                        <summary>语言模式与中文翻译</summary>
                        <div class="sq-details-body">
                            <label class="sq-setting-label">学习素材模式</label>
                            <select class="sq-url-input" data-key="translationMode">
                                <option value="english">英语模式：只用已有英文素材</option>
                                <option value="chinese">中文模式：把 AI 的中文回复翻译成英语</option>
                                <option value="mixed">混合模式：已有英文 + 中文翻译</option>
                            </select>
                            <div class="sq-note">中文翻译使用 MyMemory 在线翻译服务。选择中文/混合模式后，符合条件的 AI 中文回复片段会发送给该第三方服务翻译；翻译结果只缓存在本机浏览器中。服务可能限流或翻译不准确，用户消息不会被发送。</div>
                        </div>
                    </details>
                    <details class="sq-details">
                        <summary>发音设置（TTS）</summary>
                        <div class="sq-details-body">
                            <label class="sq-setting-label">发音服务</label>
                            <select class="sq-url-input" data-key="ttsProvider">
                                <option value="system">系统语音（默认、无需 API）</option>
                                <option value="fish">Fish Audio（在线）</option>
                                <option value="mimo">MiMo TTS（在线）</option>
                            </select>
                            <div class="sq-note">下面只显示当前选择的服务设置，切换服务不会删除另一项已保存的配置。</div>
                            <div data-tts-provider-panel="system"><div class="sq-note">使用设备/浏览器自带语音，不需要 API Key。</div></div>
                            <div data-tts-provider-panel="fish" hidden>
                                <label class="sq-setting-label">Fish Audio API URL</label>
                                <input class="sq-url-input" type="url" data-key="fishBaseUrl" placeholder="https://api.fish.audio">
                                <label class="sq-setting-label">Fish Audio API Key</label>
                                <input class="sq-url-input" type="password" autocomplete="off" data-secret="fishApiKey" placeholder="粘贴 Fish Audio API Key">
                                <label class="sq-setting-label">模型</label>
                                <select class="sq-url-input" data-key="fishModel">
                                    <option value="s2.1-pro-free">S2.1 Pro Free（默认）</option>
                                    <option value="s2.1-pro">S2.1 Pro</option>
                                </select>
                                <label class="sq-setting-label">音色 ID（可选）</label>
                                <input class="sq-url-input" type="text" data-key="fishReferenceId" placeholder="reference_id；留空使用服务默认音色">
                                <button type="button" class="sq-mini-action" data-act="tts-test">测试 Fish Audio 连接并试听</button>
                                <div class="sq-note">请求路径：当前 ST 网页 → 同源 /proxy/ → Fish Audio 云端 /v1/tts → 音频返回浏览器播放。HTTP 500 表示代理或服务端返回错误，不等同于 iPhone 播放失败；如果只有首次在线合成后提示浏览器阻止播放，再点一次通常会命中缓存，但这属于 iOS 用户手势限制的可能表现。测试会实际合成英文并可能计入用量。</div>
                            </div>
                            <div data-tts-provider-panel="mimo" hidden>
                                <label class="sq-setting-label">MiMo API URL</label>
                                <input class="sq-url-input" type="url" data-key="mimoBaseUrl" placeholder="https://api.xiaomimimo.com">
                                <label class="sq-setting-label">MiMo API Key</label>
                                <input class="sq-url-input" type="password" autocomplete="off" data-secret="mimoApiKey" placeholder="粘贴小米 MiMo API Key">
                                <label class="sq-setting-label">模型</label>
                                <input class="sq-url-input" type="text" data-key="mimoModel" placeholder="mimo-v2.5-tts">
                                <label class="sq-setting-label">音色</label>
                                <input class="sq-url-input" type="text" data-key="mimoVoice" placeholder="例如 Mia、Chloe、Milo、Dean">
                                <button type="button" class="sq-mini-action" data-act="tts-test">测试 MiMo 连接并试听</button>
                                <div class="sq-note">尚未注册 MiMo 时可以先不填写。测试会发送一段英文到所选服务，可能计入用量。</div>
                            </div>
                            <div class="sq-note">API Key 单独保存在当前浏览器的本地存储，不写入公开插件源码或 ST 扩展设置镜像，但并非加密保险箱。云端服务会收到测试文字或你点击朗读的学习文本。音频会优先缓存在本机 IndexedDB（最多 200 条 / 50 MiB），当前页面另有最多 20 条的临时缓存；不同浏览器或设备不共享缓存。</div>
                        </div>
                    </details>
                    <details class="sq-details">
                        <summary>学习记录</summary>
                        <div class="sq-details-body">
                            <label class="sq-setting-row"><input type="checkbox" data-key="learningRecord"><span>保存学习记录</span></label>
                            <label class="sq-setting-row"><input type="checkbox" data-key="mistakeBook"><span>保存错题本</span></label>
                            <label class="sq-setting-row"><input type="checkbox" data-key="repeatLearned"><span>允许已学内容重复出现</span></label>
                            <div class="sq-record-note">每类记录最多保存 1000 条摘要，不保存整段聊天正文。</div>
                        </div>
                    </details>
                    <details class="sq-details">
                        <summary>背景</summary>
                        <div class="sq-details-body">
                            <label class="sq-setting-label">背景图片 URL</label>
                            <input class="sq-url-input" type="url" data-key="backgroundUrl" placeholder="粘贴图片 URL">
                            <div class="sq-note">留空就是默认玻璃面板。</div>
                        </div>
                    </details>
                </div>
            </div>`;
        // IMPORTANT: ST's mobile page can apply transforms/stacking rules to <body>.
        // A fixed element under <body> can then stop behaving like a viewport overlay.
        // Put the floating window directly under <html> so it is outside that layout tree.
        (document.documentElement || document.body).appendChild(panel);
        applyPanelBackground(panel);

        const settingsView=panel.querySelector('.sq-settings');
        const mainView=panel.querySelector('.sq-body');
        const syncTtsProviderPanels=()=>{ const provider=loadSettings().ttsProvider||'system'; panel.querySelectorAll('[data-tts-provider-panel]').forEach(section=>{ section.hidden=section.dataset.ttsProviderPanel!==provider; }); };
        const syncSettingsInputs=()=>{ const current=loadSettings(); panel.querySelectorAll('[data-key]').forEach(i=>{ if(i.type==='checkbox') i.checked=!!current[i.dataset.key]; else i.value=String(current[i.dataset.key]??''); }); syncTtsSecretInputs(panel); syncTtsProviderPanels(); };
        const showSettings=()=>{
            const fabRoot=document.getElementById('sidequest-root-v9');
            const fabOrb=document.getElementById(FAB_ID);
            if (fabRoot) fabRoot.style.setProperty('display','block','important');
            if (fabOrb) fabOrb.style.setProperty('display','none','important');
            panel.querySelector('.sq-empty').hidden=true;
            panel.querySelector('.sq-game-menu').hidden=true;
            panel.querySelector('.sq-card').hidden=true;
            panel.querySelector('.sq-settings').hidden=false;
            panel.querySelector('.sq-status').textContent='设置';
            syncSettingsInputs();
            renderProfileControls(panel);
            renderRecordManager(panel);
        };
        const back=()=>{
            settingsView.hidden=true;
            buildGame(panel);
        };

        const closePanel=()=>{
            panel.classList.add('sq-hidden');
            panel.style.setProperty('display','none','important');
            const fabRoot=document.getElementById('sidequest-root-v9');
            const fabOrb=document.getElementById(FAB_ID);
            if(fabRoot) fabRoot.style.setProperty('display','block','important');
            if(fabOrb) fabOrb.style.setProperty('display','flex','important');
        };
        const goUpOneLevel=()=>{
            const settings=panel.querySelector('.sq-settings');
            if(settings && settings.hidden===false){
                settings.hidden=true;
                panel.dataset.sqGame='menu';
                buildGame(panel);
                return;
            }
            const card=panel.querySelector('.sq-card');
            if(card && card.hidden===false){
                panel.dataset.sqGame='menu';
                buildGame(panel);
                return;
            }
            closePanel();
        };
        const exitButton=panel.querySelector('[data-act="exit"]');
        exitButton.addEventListener('pointerup',e=>{
            e.preventDefault(); e.stopPropagation(); closePanel();
        });
        exitButton.onclick=e=>{
            e.preventDefault(); e.stopPropagation(); closePanel();
        };
        const closeButton=panel.querySelector('[data-act="close"]');
        closeButton.addEventListener('pointerup',e=>{
            e.preventDefault(); e.stopPropagation(); goUpOneLevel();
        });
        closeButton.onclick=e=>{
            e.preventDefault(); e.stopPropagation(); goUpOneLevel();
        };
        panel.querySelector('[data-act="settings"]').onclick=showSettings;

        const profileSelect=panel.querySelector('[data-profile-select]');
        profileSelect?.addEventListener('change',()=>{
            if(!switchActiveProfile(profileSelect.value)) return;
            renderProfileControls(panel);
            syncSettingsInputs();
            applyPanelBackground(panel);
            renderRecordManager(panel);
            panel.querySelector('.sq-status').textContent='已切换学习档案';
        });
        panel.querySelector('[data-act="profile-rename"]')?.addEventListener('click',()=>{
            const input=panel.querySelector('[data-profile-name]');
            if(!renameActiveProfile(input?.value)) { if(input) input.focus(); return; }
            renderProfileControls(panel);
        });
        panel.querySelector('[data-act="profile-create"]')?.addEventListener('click',()=>{
            const profile=createProfile();
            if(!profile) return;
            renderProfileControls(panel);
            const s=loadSettings();
            panel.querySelectorAll('[data-key]').forEach(i=>{
                if(i.type==='checkbox') i.checked=!!s[i.dataset.key];
                else i.value=String(s[i.dataset.key]||'');
            });
            applyPanelBackground(panel);
            renderRecordManager(panel);
            panel.querySelector('.sq-status').textContent='已创建空白学习档案';
        });

        panel.querySelectorAll('[data-act="tts-test"]').forEach(button=>button.addEventListener('click',()=>{
            const provider=loadSettings().ttsProvider||'system';
            const status=panel.querySelector('.sq-status');
            status.textContent='正在连接 '+(provider==='fish'?'Fish Audio':provider==='mimo'?'MiMo':'系统语音')+' 并生成测试音频……';
            speakText('Hello! This is a SideQuest voice test.','en-US',{bypassCache:true}).then(()=>{
                status.textContent='请求已成功，正在播放测试音频。若没有声音，请检查设备音量和浏览器播放权限。';
            }).catch(error=>{
                console.warn('[SideQuest] TTS connection test failed',error);
                status.textContent=String(error?.message||'连接/试听失败。');
            });
        }));
        panel.querySelectorAll('[data-secret]').forEach(input=>{
            const save=()=>saveTtsSecret(input.dataset.secret,input.value);
            input.addEventListener('change',save);
            input.addEventListener('blur',save);
        });

        panel.querySelectorAll('[data-key]').forEach(input=>{
            const key=input.dataset.key;
            const update=()=>{
                const s=loadSettings();
                const value=input.type==='checkbox' ? input.checked : input.value.trim();
                s[key]=value;
                saveSettings(s);
                if(key==='ttsProvider') syncTtsProviderPanels();
                applyPanelBackground(panel);
            };
            input.addEventListener(input.type==='checkbox' || input.tagName==='SELECT' ? 'change' : 'input',update);
        });

        syncTtsSecretInputs(panel);
        makeDraggable(panel,panel.querySelector('.sq-head'));
        return panel;
    }

    function createFab(panel) {
        document.getElementById(FAB_ID)?.closest('#sidequest-root-v9')?.remove();
        document.getElementById(FAB_ID)?.remove();

        // Follow the proven ST floating-extension pattern:
        // one fixed root <div>, with a non-button orb inside it.
        const root = document.createElement('div');
        root.id = 'sidequest-root-v9';
        root.style.cssText = [
            'position:fixed !important',
            'left:0px !important',
            'top:0px !important',
            'right:auto !important',
            'bottom:auto !important',
            'width:48px !important',
            'height:48px !important',
            'z-index:2147483647 !important',
            'isolation:isolate !important',
            'font-family:inherit',
            'user-select:none',
            '-webkit-user-select:none',
            'touch-action:none',
            'pointer-events:auto !important',
            'transform:none !important',
            'float:none !important',
            'margin:0 !important',
            'padding:0 !important',
            'display:block !important',
            'visibility:visible !important',
            'opacity:1 !important'
        ].join(';');

        const orb = document.createElement('div');
        orb.id = FAB_ID;
        orb.setAttribute('role','button');
        orb.setAttribute('aria-label','打开 SideQuest');
        orb.title='打开 SideQuest';
        orb.textContent='⭐';
        orb.style.cssText = [
            'position:absolute !important',
            'left:0 !important',
            'top:0 !important',
            'right:auto !important',
            'bottom:auto !important',
            'inset:auto !important',
            'width:48px !important',
            'height:48px !important',
            'box-sizing:border-box',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'border:0',
            'border-radius:999px',
            'background:transparent',
            'color:#fff',
            'text-shadow:0 2px 12px rgba(0,0,0,.55)',
            'box-shadow:none',
            'font-size:34px',
            'line-height:1',
            'cursor:pointer',
            'pointer-events:auto !important',
            'transform:none !important',
            'margin:0 !important',
            'visibility:visible !important',
            'opacity:1 !important'
        ].join(';');

        root.appendChild(orb);
        // Keep the launcher outside ST's transformed mobile layout containers.
        (document.documentElement || document.body).appendChild(root);

        let dragging=false;
        let moved=false;
        let sx=0,sy=0,ox=0,oy=0;

        const clampPosition=()=>{
            const w=root.getBoundingClientRect().width || 48;
            const h=root.getBoundingClientRect().height || 48;
            const x=Math.max(4,Math.min(parseFloat(root.style.left)||0,window.innerWidth-w-4));
            const y=Math.max(4,Math.min(parseFloat(root.style.top)||0,window.innerHeight-h-4));
            root.style.setProperty('left',x+'px','important');
            root.style.setProperty('top',y+'px','important');
        };

        const start=(x,y)=>{
            const r=root.getBoundingClientRect();
            dragging=true;
            moved=false;
            sx=x; sy=y;
            ox=x-r.left; oy=y-r.top;
        };
        const move=(x,y)=>{
            if(!dragging) return;
            if(Math.abs(x-sx)+Math.abs(y-sy)>5) moved=true;
            root.style.setProperty('left',Math.max(4,Math.min(x-ox,window.innerWidth-52))+'px','important');
            root.style.setProperty('top',Math.max(4,Math.min(y-oy,window.innerHeight-52))+'px','important');
        };
        const finish=()=>{
            if(!dragging) return;
            dragging=false;
            clampPosition();
            root.dataset.dragged=moved?'1':'0';
        };

        let tapTimer=null;
        const openPanel=()=>{
            // Re-portal the window at click time. Some self-hosted ST mobile
            // layouts can move/repaint extension DOM differently after boot.
            // Keep the launcher root alive, but place the actual window directly
            // under <body> when it opens so it gets a fresh top-level paint.
            try {
                if(!document.body.contains(panel)) document.body.appendChild(panel);
            } catch {}

            panel.classList.remove('sq-hidden');
            panel.hidden=false;
            panel.style.setProperty('display','flex','important');
            panel.style.setProperty('position','fixed','important');
            panel.style.setProperty('z-index','2147483647','important');
            panel.style.setProperty('visibility','visible','important');
            panel.style.setProperty('opacity','1','important');

            const fabRoot=document.getElementById('sidequest-root-v9');
            const fabOrb=document.getElementById(FAB_ID);
            if(fabRoot) fabRoot.style.setProperty('display','block','important');
            if(fabOrb) fabOrb.style.setProperty('display','none','important');

            applyMobileGeometry(panel);

            try {
                const currentChat=chatKey();
                if(panel.dataset.sqChatKey && panel.dataset.sqChatKey!==currentChat){
                    panel.dataset.sqInitialized='';
                    panel.dataset.sqGame='menu';
                    panel.querySelector('.sq-settings').hidden=true;
                }
                if(panel.dataset.sqInitialized!=='1'){
                    panel.dataset.sqGame='menu';
                    buildGame(panel);
                    panel.dataset.sqInitialized='1';
                    panel.dataset.sqChatKey=currentChat;
                }
            } catch(error) {
                console.error('[SideQuest] buildGame failed',error);
                panel.querySelector('.sq-empty').hidden=false;
                panel.querySelector('.sq-game-menu').hidden=true;
                panel.querySelector('.sq-card').hidden=true;
                panel.querySelector('.sq-settings').hidden=true;
                panel.querySelector('.sq-status').textContent='窗口已打开，但这套 ST 的聊天数据暂时无法读取。';
            }
        };
        const closeTapTimer=()=>{
            if(tapTimer!==null) {
                clearTimeout(tapTimer);
                tapTimer=null;
            }
        };
        orb.addEventListener('pointerdown',e=>{
            if(e.pointerType==='mouse' && e.button!==0) return;
            closeTapTimer();
            start(e.clientX,e.clientY);
            orb.setPointerCapture?.(e.pointerId);
            // Do not call preventDefault here. The orb already has touch-action:none,
            // and keeping the native pointer sequence intact makes tapping reliable.
            e.stopPropagation();
            tapTimer=setTimeout(()=>{
                if(dragging && !moved) openPanel();
            },220);
        });
        orb.addEventListener('pointermove',e=>{
            if(dragging && Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)>5) {
                closeTapTimer();
            }
            move(e.clientX,e.clientY);
            if(dragging) { e.preventDefault(); e.stopPropagation(); }
        });
        orb.addEventListener('pointerup',e=>{
            const wasDragged=moved;
            closeTapTimer();
            finish();
            if(!wasDragged) openPanel();
            e.stopPropagation();
        });
        orb.addEventListener('pointercancel',()=>{
            closeTapTimer();
            finish();
        });
        orb.addEventListener('click',e=>{
            // Pointerup already handles the tap. Stop the follow-up click so
            // one tap cannot toggle the window twice.
            e.preventDefault();
            e.stopPropagation();
        });

        // Put the orb in the same safe mobile corner strategy used by
        // the referenced ST floating extension.
        const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent||'') ||
            (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
        // Use pixel coordinates rather than calc(), then clamp against the actual viewport.
        // This also makes the draggable state unambiguous on iPhone Safari.
        const bottomGap = isIOS ? 150 : 120;
        root.style.setProperty('left', Math.max(4, window.innerWidth - 52) + 'px', 'important');
        root.style.setProperty('top', Math.max(4, window.innerHeight - bottomGap - 48) + 'px', 'important');
        clampPosition();

        window.addEventListener('resize',clampPosition,{passive:true});
        window.visualViewport?.addEventListener('resize',()=>{
            const panel=document.getElementById(PANEL_ID);
            if(panel && !panel.classList.contains('sq-hidden')) applyMobileGeometry(panel);
        },{passive:true});
        return root;
    }

    function ensureFloatingUI() {
        if (!document.body) {
            setTimeout(ensureFloatingUI,250);
            return;
        }
        addStyle();
        let panel=document.getElementById(PANEL_ID);
        if (!panel) panel=createPanel();

        const existing=document.getElementById('sidequest-root-v9');
        if (existing) existing.remove();
        createFab(panel);

        console.log('[SideQuest 0.9.0] floating root injected outside body', document.getElementById(FAB_ID));
    }

    function renderExtensionSettings() {
        const context=ctx();
        const container=document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
        if (!container || document.getElementById(SETTINGS_ID)) return;

        if (context?.extensionSettings) {
            context.extensionSettings.sidequest={...DEFAULTS,...loadSettings()};
            context.saveSettingsDebounced?.();
        }

        const drawer=document.createElement('div');
        drawer.id=SETTINGS_ID;
        drawer.className='inline-drawer';
        drawer.innerHTML=`
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>SideQuest</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label"><input type="checkbox" data-sq-enabled><span>启用 SideQuest 悬浮窗</span></label>
                <div class="sq-note">学习模式、素材范围、翻译、发音、背景和学习记录统一在 SideQuest 悬浮窗的设置里管理，避免两处设置互相覆盖。</div>
                <button type="button" class="sq-mini-action" data-sq-open-settings>打开 SideQuest 设置</button>
            </div>`;
        container.appendChild(drawer);

        const enabled=drawer.querySelector('[data-sq-enabled]');
        enabled.checked=loadSettings().enabled!==false;
        enabled.addEventListener('change',()=>{
            const current=loadSettings();
            current.enabled=enabled.checked;
            saveSettings(current);
            if(context?.extensionSettings?.sidequest){
                context.extensionSettings.sidequest.enabled=current.enabled;
                context.saveSettingsDebounced?.();
            }
            const fab=document.getElementById(FAB_ID);
            const panel=document.getElementById(PANEL_ID);
            if(fab) fab.toggleAttribute('hidden',!current.enabled);
            if(!current.enabled && panel){
                panel.classList.add('sq-hidden');
                panel.style.setProperty('display','none','important');
            }
        });

        drawer.querySelector('[data-sq-open-settings]')?.addEventListener('click',()=>{
            const current=loadSettings();
            if(current.enabled===false){
                current.enabled=true;
                saveSettings(current);
                enabled.checked=true;
                if(context?.extensionSettings?.sidequest){
                    context.extensionSettings.sidequest.enabled=true;
                    context.saveSettingsDebounced?.();
                }
                document.getElementById(FAB_ID)?.removeAttribute('hidden');
            }
            const panel=document.getElementById(PANEL_ID);
            if(!panel) return;
            panel.classList.remove('sq-hidden');
            panel.hidden=false;
            panel.style.setProperty('display','flex','important');
            panel.style.setProperty('visibility','visible','important');
            panel.style.setProperty('opacity','1','important');
            const fabRoot=document.getElementById('sidequest-root-v9');
            const fabOrb=document.getElementById(FAB_ID);
            if(fabRoot) fabRoot.style.setProperty('display','block','important');
            if(fabOrb) fabOrb.style.setProperty('display','none','important');
            applyMobileGeometry(panel);
            panel.querySelector('[data-act="settings"]')?.click();
        });
    }

    function syncSettingsAndUI() {
        const context=ctx();
        const saved=loadSettings();
        if (context?.extensionSettings) {
            context.extensionSettings.sidequest={...DEFAULTS,...saved};
            context.saveSettingsDebounced?.();
        }
        renderExtensionSettings();
        if (context?.extensionSettings?.sidequest?.enabled===false || saved.enabled===false) {
            document.getElementById(FAB_ID)?.setAttribute('hidden','');
        }
    }

    function boot() {
        try {
            const saved=loadSettings();
            if (ctx()?.extensionSettings) {
                const context=ctx();
                context.extensionSettings.sidequest={...DEFAULTS,...(context.extensionSettings.sidequest||{}),...saved};
                context.saveSettingsDebounced?.();
            }
            ensureFloatingUI();
            bindStoryListeners();
            syncSettingsAndUI();
        } catch(error) {
            console.error('[SideQuest] boot failed',error);
            const notice=document.createElement('div');
            notice.textContent='SideQuest 加载失败：'+(error?.message||error);
            notice.style.cssText='position:fixed;left:10px;bottom:10px;z-index:2147483647;background:#8b1e1e;color:white;padding:10px;border-radius:10px;';
            document.body?.appendChild(notice);
        }
    }

    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
    else boot();
})();