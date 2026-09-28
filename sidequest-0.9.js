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
        includeUser: true,
        includeCharacter: true,
        includeNarration: false,
        backgroundUrl: '',
        learningRecord: true,
        mistakeBook: true,
        repeatLearned: false,
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
            height: min(590px, calc(100vh - 190px));
            min-height: 390px;
            z-index: 2147483646 !important;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;
            border: 1px solid rgba(255,255,255,.16);
            border-radius: 22px;
            background: rgba(27,27,33,.62);
            color: var(--SmartThemeBodyColor, #f2f2f2) !important;
            box-shadow: 0 22px 70px rgba(0,0,0,.45);
            backdrop-filter: blur(18px);
        }
        #${PANEL_ID}.sq-hidden { display: none !important; }
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
        #${PANEL_ID} .sq-status { font-size:10px; opacity:.48; margin-bottom:14px; }
        #${PANEL_ID} .sq-empty { text-align:center; padding:50px 12px 20px; }
        #${PANEL_ID} .sq-empty-icon { font-size:34px; margin-bottom:9px; }
        #${PANEL_ID} .sq-empty-title { font-weight:750; font-size:16px; }
        #${PANEL_ID} .sq-empty p { font-size:12px; line-height:1.6; opacity:.58; }
        #${PANEL_ID} .sq-game-menu { display:grid; gap:10px; }
        #${PANEL_ID} .sq-game-choice {
            width:100%; display:flex; align-items:center; gap:12px; box-sizing:border-box;
            padding:13px 12px; text-align:left; border:1px solid rgba(255,255,255,.10);
            border-radius:15px; background:rgba(255,255,255,.055); color:#f2f2f2 !important;
            cursor:pointer; font:inherit;
        }
        #${PANEL_ID} .sq-game-choice:active { transform:scale(.99); }
        #${PANEL_ID} .sq-game-choice .sq-game-emoji { width:34px; text-align:center; font-size:24px; flex:none; }
        #${PANEL_ID} .sq-game-choice span:nth-child(2) { min-width:0; flex:1; }
        #${PANEL_ID} .sq-game-choice b { display:block; font-size:13px; }
        #${PANEL_ID} .sq-game-choice small { display:block; margin-top:4px; font-size:10px; opacity:.52; line-height:1.4; }
        #${PANEL_ID} .sq-game-choice em { display:inline-block; margin-top:5px; font-size:9px; font-style:normal; opacity:.4; }
        #${PANEL_ID} .sq-card {
            padding:15px; border:1px solid rgba(255,255,255,.09);
            border-radius:16px; background:rgba(255,255,255,.045);
        }
        #${PANEL_ID} .sq-label { font-size:9px; letter-spacing:.14em; font-weight:800; opacity:.45; margin-bottom:10px; }
        #${PANEL_ID} .sq-prompt {
            white-space:pre-wrap; padding:13px; border-radius:12px;
            background:rgba(0,0,0,.16); font-size:13px; line-height:1.6;
        }
        #${PANEL_ID} .sq-options { display:grid; gap:8px; margin-top:12px; }
        #${PANEL_ID} .sq-option, #${PANEL_ID} .sq-next, #${PANEL_ID} .sq-back {
            width:100%; box-sizing:border-box; padding:10px 12px;
            border:1px solid rgba(255,255,255,.1); border-radius:10px;
            background:rgba(255,255,255,.055); color:#f2f2f2 !important; font:inherit; cursor:pointer;
        }
        #${PANEL_ID} .sq-option { text-align:left; }
        #${PANEL_ID} .sq-option:disabled { opacity:.58; cursor:default; }
        #${PANEL_ID} .sq-ok { background:rgba(80,190,120,.2) !important; border-color:rgba(80,190,120,.4) !important; opacity:1 !important; }
        #${PANEL_ID} .sq-bad { background:rgba(210,90,90,.18) !important; border-color:rgba(210,90,90,.35) !important; opacity:1 !important; }
        #${PANEL_ID} .sq-feedback { min-height:22px; margin:10px 2px; font-size:12px; }
        #${PANEL_ID} .sq-settings { padding:2px 1px 10px; }
        #${PANEL_ID} .sq-settings h3 { margin:2px 0 5px; font-size:16px; }
        #${PANEL_ID} .sq-settings p { margin:0 0 14px; font-size:11px; opacity:.58; line-height:1.5; }
        #${PANEL_ID} .sq-setting-row { display:flex; align-items:center; gap:9px; padding:9px 0; font-size:12px; }
        #${PANEL_ID} .sq-setting-row input { margin:0; }
        .sq-details { margin:10px 0; border:1px solid rgba(255,255,255,.10); border-radius:12px; background:rgba(255,255,255,.035); overflow:hidden; }
        .sq-details summary { cursor:pointer; padding:11px 12px; font-size:12px; font-weight:700; list-style:none; }
        .sq-details summary::-webkit-details-marker { display:none; }
        .sq-details summary::after { content:'＋'; float:right; opacity:.55; }
        .sq-details[open] summary::after { content:'−'; }
        .sq-details-body { padding:3px 12px 10px; }
        .sq-setting-label { display:block; font-size:10px; opacity:.55; margin:8px 0 6px; }
        .sq-url-input { width:100%; box-sizing:border-box; padding:9px 10px; border:1px solid rgba(255,255,255,.12); border-radius:9px; background:rgba(0,0,0,.18); color:#f2f2f2 !important; }
        #${SETTINGS_ID} { margin-top:8px; }
        #${SETTINGS_ID} .sq-note { opacity:.55; font-size:11px; line-height:1.5; }
        @media (max-width:600px) {
            #${FAB_ID} { right:14px; bottom:118px; }
            #${PANEL_ID} { right:12px; bottom:180px; width:calc(100vw - 24px); height:min(570px,calc(100vh - 200px)); }
        }
    `;

    function loadSettings() {
        try {
            return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
        } catch {
            return { ...DEFAULTS };
        }
    }

    function saveSettings(settings) {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
    }

    function ctx() {
        try { return globalThis.SillyTavern?.getContext?.() || null; } catch { return null; }
    }

    function chatMessages() {
        const chat = ctx()?.chat;
        return Array.isArray(chat) ? chat.filter(m => m && !m.is_system && m.mes).slice(-40) : [];
    }

    function clean(value) {
        return String(value || '')
            .replace(/<br\s*\/?\s*>/gi, '\n')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }


    function speakText(text, lang='en-US') {
        try {
            const synth=globalThis.speechSynthesis;
            if (!synth || !text) return false;
            synth.cancel();
            const utterance=new SpeechSynthesisUtterance(String(text));
            utterance.lang=lang;
            utterance.rate=0.82;
            utterance.pitch=1;
            synth.speak(utterance);
            return true;
        } catch { return false; }
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

    function learningItems(list) {
        const items=[];
        for (const item of list) {
            const pairs=englishPairs(item.line);
            if (pairs.length) {
                for (const pair of pairs) items.push({...pair,speaker:item.speaker,source:item.line});
                continue;
            }
            const words=[...new Set((item.line.match(/[A-Za-z]{3,}/g)||[]).map(x=>x.toLowerCase()))];
            for (const word of words) items.push({english:word,translation:'暂无剧情翻译',speaker:item.speaker,source:item.line});
        }
        return items;
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
            return { learned:Array.isArray(raw.learned)?raw.learned:[], mistakes:Array.isArray(raw.mistakes)?raw.mistakes:[] };
        } catch { return { learned:[], mistakes:[] }; }
    }

    function saveRecords(records) {
        try {
            records.learned=records.learned.slice(-200);
            records.mistakes=records.mistakes.slice(-200);
            localStorage.setItem(RECORDS_KEY,JSON.stringify(records));
        } catch {}
    }

    function recordKey(item) {
        return String(item.english||item.word||'').trim().toLowerCase()+'|'+String(item.translation||'').trim();
    }

    function hasLearned(item) {
        if (!loadSettings().learningRecord) return false;
        const key=recordKey(item);
        return loadRecords().learned.some(x=>x.chat===chatKey() && x.key===key);
    }

    function markLearned(item) {
        const s=loadSettings();
        if (!s.learningRecord) return;
        const records=loadRecords();
        const key=recordKey(item);
        records.learned=records.learned.filter(x=>!(x.chat===chatKey() && x.key===key));
        records.learned.push({chat:chatKey(),key,english:item.english||item.word,translation:item.translation||'',time:Date.now()});
        saveRecords(records);
    }

    function markMistake(item,answer) {
        const s=loadSettings();
        if (!s.mistakeBook) return;
        const records=loadRecords();
        const key=recordKey(item);
        records.mistakes=records.mistakes.filter(x=>!(x.chat===chatKey() && x.key===key));
        records.mistakes.push({chat:chatKey(),key,english:item.english||item.word,translation:item.translation||'',wrong:String(answer||''),time:Date.now()});
        saveRecords(records);
    }

    function sources() {
        const s = loadSettings();
        const result = [];
        for (const message of chatMessages()) {
            const text = clean(message.mes);
            const speaker = message.is_user ? 'You' : (String(message.name || message.ch_name || 'Character').trim() || 'Character');
            if (!text) continue;

            if (message.is_user) {
                if (!s.includeUser) continue;
                if (text.length >= 8 && text.length <= 260) result.push({ speaker, line: text });
                continue;
            }

            let foundQuote = false;
            const re = /[“"]([^“”"]{8,240})[”"]/g;
            let match;
            while ((match = re.exec(text))) {
                foundQuote = true;
                if (s.includeCharacter) result.push({ speaker, line: match[1].trim() });
            }

            if (!foundQuote && s.includeNarration && text.length >= 12 && text.length <= 260) {
                result.push({ speaker, line: text });
            }
        }
        return result;
    }

    function addStyle() {
        if (document.getElementById('sidequest-style-v9')) return;
        const style = document.createElement('style');
        style.id = 'sidequest-style-v9';
        style.textContent = css;
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
        },1200);
    }

    function buildGame(root) {
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
            <button type="button" class="sq-game-choice" data-game="word">
                <span class="sq-game-emoji">🔎</span>
                <span><b>单词寻宝</b><small>从剧情里学词，再用语境确认意思</small></span>
            </button>
            <button type="button" class="sq-game-choice" data-game="speaker">
                <span class="sq-game-emoji">💬</span>
                <span><b>谁说的？</b><small>看一句话，猜它是谁说的</small><em>准备中</em></span>
            </button>
            <button type="button" class="sq-game-choice" data-game="meaning">
                <span class="sq-game-emoji">🧩</span>
                <span><b>情境猜意</b><small>根据上下文猜这个词是什么意思</small><em>准备中</em></span>
            </button>
            <button type="button" class="sq-game-choice" data-game="rebuild">
                <span class="sq-game-emoji">🪄</span>
                <span><b>句子拼图</b><small>把剧情里的句子重新拼起来</small><em>准备中</em></span>
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
                if (game !== 'word') return;
                root.dataset.sqGame='word';
                root.querySelector('.sq-game-menu').hidden=true;
                buildWord(root,list);
            };
        });
    }


    function buildLearn(root,listArg) {
        const list=listArg || sources();
        let items=learningItems(list);
        const s=loadSettings();
        if (!s.repeatLearned && s.learningRecord) items=items.filter(x=>!hasLearned(x));
        const empty=root.querySelector('.sq-empty');
        const card=root.querySelector('.sq-card');
        const menu=root.querySelector('.sq-game-menu');
        const status=root.querySelector('.sq-status');
        if (!items.length) {
            empty.hidden=false; card.hidden=true; menu.hidden=true;
            status.textContent='这些剧情里的内容都已经学过啦。';
            return;
        }
        const item=items[Math.floor(Math.random()*items.length)];
        empty.hidden=true; menu.hidden=true; card.hidden=false;
        status.textContent='学习：先看懂，再听一遍。';
        root.querySelector('.sq-label').textContent='LEARN';
        root.querySelector('.sq-prompt').textContent=item.english + (item.translation && item.translation!=='暂无剧情翻译' ? '\n\n' + item.translation : '\n\n（这段剧情没有现成中文翻译）');
        const box=root.querySelector('.sq-options');
        const feedback=root.querySelector('.sq-feedback');
        box.innerHTML='';
        feedback.textContent=item.translation==='暂无剧情翻译' ? '这段剧情没有现成翻译，先记住原文即可。' : '上面的中文来自剧情原文，不是 SideQuest 临时翻译的。';
        const actions=document.createElement('div');
        actions.className='sq-learn-actions';

        const listen=document.createElement('button');
        listen.type='button'; listen.className='sq-option'; listen.textContent='🔊 听发音';
        listen.onclick=()=>{
            if (!speakText(item.english,'en-US')) feedback.textContent='当前设备没有可用的系统 TTS。';
            else feedback.textContent='🔊 正在播放……';
        };
        actions.appendChild(listen);

        const learned=document.createElement('button');
        learned.type='button'; learned.className='sq-option'; learned.textContent='✓ 我认识了';
        learned.onclick=()=>{
            markLearned(item);
            feedback.textContent='已记入学习记录。下一条。';
            setTimeout(()=>buildLearn(root,sources()),220);
        };
        actions.appendChild(learned);
        box.appendChild(actions);

        const source=document.createElement('div');
        source.className='sq-source';
        source.textContent='来自：'+item.speaker;
        box.appendChild(source);

        const door=document.createElement('button');
        door.type='button'; door.className='sq-door'; door.textContent='🚪'; door.title='回到选择';
        door.onclick=()=>{ root.dataset.sqGame='menu'; buildGame(root); };
        card.appendChild(door);
    }

    function buildWord(root,listArg) {
        const list=listArg || sources();
        const pairs=list.flatMap(item=>englishPairs(item.line).map(pair=>({...pair,speaker:item.speaker,source:item.line})));
        const allItems=learningItems(list);
        const pool=pairs.length ? pairs : allItems.filter(x=>/[A-Za-z]{3,}/.test(x.english||''));
        if (!pool.length) {
            root.querySelector('.sq-empty').hidden=false;
            root.querySelector('.sq-card').hidden=true;
            root.querySelector('.sq-game-menu').hidden=true;
            root.querySelector('.sq-status').textContent='找到剧情了，但暂时没有英文。';
            return;
        }
        const target=pool[Math.floor(Math.random()*pool.length)];
        root.querySelector('.sq-empty').hidden=true;
        root.querySelector('.sq-game-menu').hidden=true;
        root.querySelector('.sq-card').hidden=false;
        root.querySelector('.sq-label').textContent='WORD HUNT';
        root.querySelector('.sq-status').textContent=pairs.length ? '语境复习：选出这句话对应的中文意思。' : '词汇复习：先从语境里找出目标词。';

        const prompt=root.querySelector('.sq-prompt');
        const box=root.querySelector('.sq-options');
        const feedback=root.querySelector('.sq-feedback');
        box.innerHTML=''; feedback.textContent='';

        if (pairs.length) {
            prompt.textContent='哪一个中文意思最符合这句剧情？\n\n'+target.english;
            const other=pairs.filter(x=>x!==target && x.translation!==target.translation).map(x=>x.translation).filter(Boolean);
            const fallbacks=['她没有回答，只是看着你。','他似乎没有想到会这样。','你决定暂时保持沉默。'];
            const choices=[target.translation,...other,...fallbacks].filter((x,i,a)=>x && a.indexOf(x)===i).slice(0,3);
            while(choices.length<3) choices.push(['先离开这里。','她轻轻笑了起来。','你不知道该说什么。'][choices.length-1]);
            renderChoices(root,choices,target.translation,'答对了！','再看看这句：'+target.translation);
            const listen=document.createElement('button');
            listen.type='button'; listen.className='sq-option'; listen.textContent='🔊 听这句';
            listen.onclick=()=>speakText(target.english,'en-US');
            box.appendChild(listen);
        } else {
            const words=[...new Set((target.english.match(/[A-Za-z]{3,}/g)||[]).map(x=>x.toLowerCase()))];
            const answer=words[Math.floor(Math.random()*words.length)];
            prompt.textContent='哪个单词真的出现在这句剧情里？\n\n'+target.english;
            const distract=['different','punishment','theater','quiet','really','master','always','little'].filter(x=>x!==answer).slice(0,2);
            renderChoices(root,[answer,...distract],answer,'抓到了！','答案是 '+answer+'。');
        }

        const door=document.createElement('button');
        door.type='button'; door.className='sq-door'; door.textContent='🚪'; door.title='回到选择';
        door.onclick=()=>{ root.dataset.sqGame='menu'; buildGame(root); };
        root.querySelector('.sq-card').appendChild(door);
    }

    function renderChoices(root,choices,answer,okText,badText) {
        const box=root.querySelector('.sq-options');
        const feedback=root.querySelector('.sq-feedback');
        box.innerHTML=''; feedback.textContent='';
        choices.sort(()=>Math.random()-.5).forEach(choice=>{
            const b=document.createElement('button');
            b.type='button'; b.className='sq-option'; b.textContent=choice;
            b.onclick=()=>{
                [...box.children].forEach(x=>x.disabled=true);
                const ok=choice===answer;
                b.classList.add(ok?'sq-ok':'sq-bad');
                if (!ok) markMistake({english:answer,translation:badText.replace(/^再看看这句：/,'')},choice);
                feedback.textContent=ok?'✨ '+okText:' '+badText;
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
        const height=Math.max(300,Math.min(590,vh-insetTop-insetBottom-24));
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

    function createPanel() {
        document.getElementById(PANEL_ID)?.remove();
        const panel=document.createElement('div');
        panel.id=PANEL_ID;
        panel.className='sq-hidden';
        panel.innerHTML=`
            <div class="sq-head">
                <div><span class="sq-title">SideQuest</span><span class="sq-sub">边等剧情，偷偷玩一下</span></div>
                <div class="sq-actions"><button class="sq-icon" data-act="settings" title="设置">⚙</button><button class="sq-icon" data-act="close" title="关闭">×</button></div>
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
                    <p>素材来源在这里设置；学习和小游戏都直接在窗口里选择；设置只负责素材来源和外观。</p>
                    <details class="sq-details">
                        <summary>题目素材</summary>
                        <div class="sq-details-body">
                            <label class="sq-setting-row"><input type="checkbox" data-key="includeUser"><span>我的对白</span></label>
                            <label class="sq-setting-row"><input type="checkbox" data-key="includeCharacter"><span>角色对白</span></label>
                            <label class="sq-setting-row"><input type="checkbox" data-key="includeNarration"><span>旁白</span></label>
                        </div>
                    </details>
                    <details class="sq-details">
                        <summary>学习记录</summary>
                        <div class="sq-details-body">
                            <label class="sq-setting-row"><input type="checkbox" data-key="learningRecord"><span>保存学习记录</span></label>
                            <label class="sq-setting-row"><input type="checkbox" data-key="mistakeBook"><span>保存错题本</span></label>
                            <label class="sq-setting-row"><input type="checkbox" data-key="repeatLearned"><span>允许已学内容重复出现</span></label>
                            <div class="sq-record-note">记录只保存很小的文字摘要，最多各 200 条，不保存整段聊天正文。</div>
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
                    <button class="sq-back" type="button">🚪 回到选择</button>
                </div>
            </div>`;
        // IMPORTANT: ST's mobile page can apply transforms/stacking rules to <body>.
        // A fixed element under <body> can then stop behaving like a viewport overlay.
        // Put the floating window directly under <html> so it is outside that layout tree.
        (document.documentElement || document.body).appendChild(panel);
        applyPanelBackground(panel);

        const settingsView=panel.querySelector('.sq-settings');
        const mainView=panel.querySelector('.sq-body');
        const showSettings=()=>{
            const fabRoot=document.getElementById('sidequest-root-v9');
            const fabOrb=document.getElementById(FAB_ID);
            if (fabRoot) fabRoot.style.setProperty('display','block','important');
            if (fabOrb) fabOrb.style.setProperty('display','none','important');
            panel.querySelector('.sq-empty').hidden=true;
            panel.querySelector('.sq-card').hidden=true;
            panel.querySelector('.sq-settings').hidden=false;
            panel.querySelector('.sq-status').textContent='设置';
            const s=loadSettings();
            panel.querySelectorAll('[data-key]').forEach(i=>{
                if (i.type==='checkbox') i.checked=!!s[i.dataset.key];
                else i.value=String(s[i.dataset.key]||'');
            });
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
            if (fabRoot) fabRoot.style.setProperty('display','block','important');
            if (fabOrb) fabOrb.style.setProperty('display','flex','important');
        };
        const closeButton=panel.querySelector('[data-act="close"]');
        closeButton.addEventListener('pointerup',e=>{
            e.preventDefault();
            e.stopPropagation();
            closePanel();
        });
        closeButton.onclick=e=>{
            e.preventDefault();
            e.stopPropagation();
            closePanel();
        };
        panel.querySelector('[data-act="settings"]').onclick=showSettings;
        panel.querySelector('.sq-back').onclick=back;

        panel.querySelectorAll('[data-key]').forEach(input=>{
            const key=input.dataset.key;
            const update=()=>{
                const s=loadSettings();
                s[key]=input.type==='checkbox' ? input.checked : input.value.trim();
                saveSettings(s);
                applyPanelBackground(panel);
            };
            input.addEventListener(input.type==='checkbox' ? 'change' : 'input',update);
            input.addEventListener('change',update);
        });

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
                if (!document.body.contains(panel)) document.body.appendChild(panel);
            } catch {}
            // Show the window first. Do not let a game-building error leave the
            // launcher hidden with an invisible window.
            panel.classList.remove('sq-hidden');
            panel.hidden=false;
            panel.style.setProperty('display','flex','important');
            panel.style.setProperty('position','fixed','important');
            panel.style.setProperty('z-index','2147483647','important');
            panel.style.setProperty('visibility','visible','important');
            panel.style.setProperty('opacity','1','important');

            const fabRoot=document.getElementById('sidequest-root-v9');
            const fabOrb=document.getElementById(FAB_ID);
            if (fabRoot) fabRoot.style.setProperty('display','block','important');
            if (fabOrb) fabOrb.style.setProperty('display','none','important');

            // Diagnostic step 2: use the REAL SideQuest panel, but temporarily
            // strip it down to the same simple kind of floating box that HELLO proved
            // the native/self-hosted ST can paint. Nothing inside the panel is deleted.
            // Keep the proven simple outer shell, but let the mobile
            // geometry guard calculate its real viewport size and position.
            panel.style.setProperty('display','block','important');
            panel.style.setProperty('overflow','auto','important');
            panel.style.setProperty('isolation','isolate','important');
            panel.style.setProperty('border-radius','16px','important');
            panel.style.setProperty('box-shadow','0 12px 40px rgba(0,0,0,.5)','important');
            applyMobileGeometry(panel);

            const oldDiagnostic=document.getElementById('sidequest-diagnostic-v9');
            if (oldDiagnostic) oldDiagnostic.remove();

            try {
                panel.dataset.sqGame='menu';
                buildGame(panel);
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

        const settings=context?.extensionSettings?.sidequest ?? loadSettings();
        if (context?.extensionSettings) {
            context.extensionSettings.sidequest={...DEFAULTS,...settings};
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
                <label class="checkbox_label"><input type="checkbox" data-sq="enabled"><span>启用 SideQuest 悬浮窗</span></label>
                <hr>
                <details class="sq-details">
                    <summary>题目素材</summary>
                    <div class="sq-details-body">
                        <label class="checkbox_label"><input type="checkbox" data-sq="includeUser"><span>我的对白</span></label>
                        <label class="checkbox_label"><input type="checkbox" data-sq="includeCharacter"><span>角色对白</span></label>
                        <label class="checkbox_label"><input type="checkbox" data-sq="includeNarration"><span>旁白</span></label>
                    </div>
                </details>
                <details class="sq-details">
                    <summary>背景</summary>
                    <div class="sq-details-body">
                        <label class="sq-setting-label">背景图片 URL</label>
                        <input class="sq-url-input" type="url" data-sq="backgroundUrl" placeholder="粘贴图片 URL">
                        <div class="sq-note">留空就是默认玻璃面板。</div>
                    </div>
                </details>
            </div>`;
        container.appendChild(drawer);

        const current=loadSettings();
        if (context?.extensionSettings?.sidequest) Object.assign(current,context.extensionSettings.sidequest);
        drawer.querySelectorAll('[data-sq]').forEach(input=>{
            const key=input.dataset.sq;
            if (input.type==='checkbox') input.checked=!!current[key];
            else input.value=String(current[key]||'');
            const update=()=>{
                current[key]=input.type==='checkbox' ? input.checked : input.value.trim();
                saveSettings(current);
                if (context?.extensionSettings?.sidequest) {
                    context.extensionSettings.sidequest[key]=current[key];
                    context.saveSettingsDebounced?.();
                }
                applyPanelBackground(document.getElementById(PANEL_ID));
                if (key==='enabled') {
                    document.getElementById(FAB_ID)?.toggleAttribute('hidden',!current.enabled);
                    if (!current.enabled) document.getElementById(PANEL_ID)?.classList.add('sq-hidden');
                }
            };
            input.addEventListener(input.type==='checkbox' ? 'change' : 'input',update);
            input.addEventListener('change',update);
        });
    }

    function syncSettingsAndUI() {
        const context=ctx();
        const saved=loadSettings();
        if (context?.extensionSettings) {
            context.extensionSettings.sidequest={...saved,...(context.extensionSettings.sidequest||{})};
            saveSettings(context.extensionSettings.sidequest);
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
