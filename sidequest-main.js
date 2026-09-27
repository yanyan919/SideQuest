(() => {
    'use strict';

    const VERSION = '0.3.0';
    const ROOT_ID = 'sidequest-root';
    const FAB_ID = 'sidequest-fab';
    const PANEL_ID = 'sidequest-panel';
    const SETTINGS_KEY = 'sidequest_settings_v3';

    const DEFAULTS = {
        includeUser: true,
        includeNarration: false,
        whoSaidIt: true,
        wordHunt: true,
    };

    let root;
    let fab;
    let panel;
    let dragged = false;

    function settings() {
        try {
            return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
        } catch {
            return { ...DEFAULTS };
        }
    }

    function saveSettings(value) {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(value)); } catch {}
    }

    function getContext() {
        try { return globalThis.SillyTavern?.getContext?.() || null; } catch { return null; }
    }

    function clean(text) {
        return String(text || '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function recentMessages() {
        const chat = getContext()?.chat;
        if (!Array.isArray(chat)) return [];
        return chat.filter(m => m && !m.is_system && m.mes).slice(-30);
    }

    function speaker(message) {
        if (message.is_user) return 'You';
        return String(message.name || message.ch_name || 'Character').trim() || 'Character';
    }

    function sources() {
        const s = settings();
        const out = [];
        for (const message of recentMessages()) {
            if (message.is_user && !s.includeUser) continue;
            const text = clean(message.mes);
            let found = false;
            const quoted = /[“"]([^“”"]{8,220})[”"]/g;
            let match;
            while ((match = quoted.exec(text))) {
                found = true;
                out.push({ speaker: speaker(message), line: match[1].trim() });
            }
            if (!found && s.includeNarration && text.length >= 12 && text.length <= 220) {
                out.push({ speaker: speaker(message), line: text });
            }
        }
        return out;
    }

    function makeDraggable(element, handle) {
        let active = false, pointer = 0, sx = 0, sy = 0, ox = 0, oy = 0;
        handle.addEventListener('pointerdown', e => {
            if (e.button !== 0) return;
            const r = element.getBoundingClientRect();
            active = true; pointer = e.pointerId;
            sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top; dragged = false;
            handle.setPointerCapture?.(pointer);
            e.preventDefault();
        });
        handle.addEventListener('pointermove', e => {
            if (!active || e.pointerId !== pointer) return;
            const dx = e.clientX - sx, dy = e.clientY - sy;
            if (Math.abs(dx) + Math.abs(dy) > 4) dragged = true;
            const r = element.getBoundingClientRect();
            const left = Math.max(6, Math.min(ox + dx, innerWidth - r.width - 6));
            const top = Math.max(6, Math.min(oy + dy, innerHeight - r.height - 6));
            element.style.left = left + 'px';
            element.style.top = top + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        });
        const stop = e => {
            if (!active || e.pointerId !== pointer) return;
            active = false;
            handle.releasePointerCapture?.(pointer);
        };
        handle.addEventListener('pointerup', stop);
        handle.addEventListener('pointercancel', stop);
    }

    function showError(error) {
        if (!root) return;
        const box = root.querySelector('#sidequest-diagnostic');
        if (!box) return;
        box.hidden = false;
        box.textContent = 'SideQuest启动遇到小问题：' + String(error?.message || error || 'Unknown error');
    }

    function buildQuest() {
        const list = sources();
        const empty = root.querySelector('#sidequest-empty');
        const card = root.querySelector('#sidequest-card');
        const prompt = root.querySelector('#sidequest-prompt');
        const options = root.querySelector('#sidequest-options');
        const feedback = root.querySelector('#sidequest-feedback');
        const status = root.querySelector('#sidequest-status');

        if (!list.length) {
            empty.hidden = false; card.hidden = true;
            status.textContent = '等待新的剧情……';
            return;
        }

        const s = settings();
        let type = s.whoSaidIt ? 'who' : 'word';
        if (s.whoSaidIt && s.wordHunt) type = Math.random() < 0.5 ? 'who' : 'word';

        options.innerHTML = '';
        feedback.textContent = '';

        if (type === 'who') {
            const target = list[Math.floor(Math.random() * list.length)];
            const names = [...new Set(list.map(x => x.speaker))];
            const choices = [target.speaker, ...names.filter(x => x !== target.speaker).sort(() => Math.random() - .5)].slice(0, 3);
            if (choices.length < 2) return buildWordQuest(list);

            root.querySelector('#sidequest-label').textContent = 'WHO SAID IT?';
            prompt.textContent = '“' + target.line + '”';
            choices.sort(() => Math.random() - .5).forEach(name => {
                const b = document.createElement('button');
                b.className = 'sidequest-option';
                b.type = 'button';
                b.textContent = name;
                b.onclick = () => {
                    [...options.children].forEach(x => x.disabled = true);
                    const ok = name === target.speaker;
                    b.classList.add(ok ? 'sidequest-correct' : 'sidequest-wrong');
                    feedback.textContent = ok ? '✨ 对啦！' : '不是这个，是 ' + target.speaker + '。';
                };
                options.appendChild(b);
            });
        } else {
            buildWordQuest(list);
            return;
        }

        empty.hidden = true; card.hidden = false;
        status.textContent = '小任务准备好了。';
    }

    function buildWordQuest(list) {
        const rootList = list.filter(x => (x.line.match(/[A-Za-z]{4,}/g) || []).length >= 3);
        if (!rootList.length) {
            root.querySelector('#sidequest-empty').hidden = false;
            root.querySelector('#sidequest-card').hidden = true;
            root.querySelector('#sidequest-status').textContent = '找到剧情了，再来一点英文对白就能玩啦。';
            return;
        }
        const target = rootList[Math.floor(Math.random() * rootList.length)];
        const words = [...new Set((target.line.match(/[A-Za-z]{4,}/g) || []).map(x => x.toLowerCase()))];
        const answer = words[Math.floor(Math.random() * words.length)];
        const choices = [answer, ...words.filter(x => x !== answer).sort(() => Math.random() - .5)].slice(0, 3);
        const options = root.querySelector('#sidequest-options');
        const feedback = root.querySelector('#sidequest-feedback');
        root.querySelector('#sidequest-label').textContent = 'WORD HUNT';
        root.querySelector('#sidequest-prompt').textContent = '哪个单词藏在这句里？\n\n“' + target.line + '”';
        options.innerHTML = '';
        feedback.textContent = '';
        choices.sort(() => Math.random() - .5).forEach(word => {
            const b = document.createElement('button');
            b.className = 'sidequest-option';
            b.type = 'button';
            b.textContent = word;
            b.onclick = () => {
                [...options.children].forEach(x => x.disabled = true);
                const ok = word === answer;
                b.classList.add(ok ? 'sidequest-correct' : 'sidequest-wrong');
                feedback.textContent = ok ? '✨ 抓到了！' : '答案是 ' + answer + '。';
            };
            options.appendChild(b);
        });
        root.querySelector('#sidequest-empty').hidden = true;
        root.querySelector('#sidequest-card').hidden = false;
        root.querySelector('#sidequest-status').textContent = '小任务准备好了。';
    }

    function createUI() {
        if (document.getElementById(ROOT_ID)) return;

        root = document.createElement('section');
        root.id = ROOT_ID;
        root.innerHTML = `
            <button id="sidequest-fab" type="button" aria-label="Open SideQuest">📝</button>
            <div id="sidequest-panel" class="sidequest-hidden" aria-hidden="true">
                <div class="sidequest-header">
                    <div id="sidequest-drag-handle">
                        <strong>SideQuest</strong>
                        <small>边等剧情，边偷偷玩一下</small>
                    </div>
                    <div>
                        <button id="sidequest-settings" class="sidequest-mini" type="button">⚙</button>
                        <button id="sidequest-close" class="sidequest-mini" type="button">×</button>
                    </div>
                </div>
                <div id="sidequest-main">
                    <div id="sidequest-status">准备中……</div>
                    <div id="sidequest-empty">
                        <div>✨</div>
                        <strong id="sidequest-empty-title">你的小支线</strong>
                        <p>它会从最近的 RP 里偷偷捡一点英文出来，做成小游戏。</p>
                    </div>
                    <div id="sidequest-card" hidden>
                        <div id="sidequest-label">WORD HUNT</div>
                        <div id="sidequest-prompt"></div>
                        <div id="sidequest-options"></div>
                        <div id="sidequest-feedback"></div>
                        <button id="sidequest-new" type="button">↻ 再来一个</button>
                    </div>
                    <div id="sidequest-diagnostic" hidden></div>
                </div>
                <div id="sidequest-settings-view" hidden>
                    <strong>游戏设置</strong>
                    <p>勾选你想玩的内容。以后哥哥可以继续往这里塞新游戏。</p>
                    <label><input id="sq-user" type="checkbox"> 我的对白也可以出题</label>
                    <label><input id="sq-narration" type="checkbox"> 旁白也可以出题</label>
                    <label><input id="sq-who" type="checkbox"> Who said it?</label>
                    <label><input id="sq-word" type="checkbox"> Word hunt</label>
                    <button id="sidequest-back" type="button">← 回去玩</button>
                </div>
            </div>`;
        document.body.appendChild(root);

        fab = root.querySelector('#sidequest-fab');
        panel = root.querySelector('#sidequest-panel');

        makeDraggable(fab, fab);
        makeDraggable(panel, root.querySelector('#sidequest-drag-handle'));

        fab.onclick = () => {
            if (dragged) { dragged = false; return; }
            const open = panel.classList.contains('sidequest-hidden');
            panel.classList.toggle('sidequest-hidden', !open);
            panel.setAttribute('aria-hidden', String(!open));
            if (open) buildQuest();
        };

        root.querySelector('#sidequest-close').onclick = () => {
            panel.classList.add('sidequest-hidden');
            panel.setAttribute('aria-hidden', 'true');
        };

        root.querySelector('#sidequest-new').onclick = () => {
            try { buildQuest(); } catch (e) { showError(e); }
        };

        const cfg = settings();
        const inputs = {
            includeUser: root.querySelector('#sq-user'),
            includeNarration: root.querySelector('#sq-narration'),
            whoSaidIt: root.querySelector('#sq-who'),
            wordHunt: root.querySelector('#sq-word'),
        };
        Object.entries(inputs).forEach(([key, input]) => {
            input.checked = cfg[key];
            input.onchange = () => { cfg[key] = input.checked; saveSettings(cfg); };
        });

        root.querySelector('#sidequest-settings').onclick = () => {
            root.querySelector('#sidequest-main').hidden = true;
            root.querySelector('#sidequest-settings-view').hidden = false;
        };
        root.querySelector('#sidequest-back').onclick = () => {
            root.querySelector('#sidequest-settings-view').hidden = true;
            root.querySelector('#sidequest-main').hidden = false;
            try { buildQuest(); } catch (e) { showError(e); }
        };

        // The UI is deliberately independent of SillyTavern APIs.
        // Chat-reading is an optional second layer.
        try { buildQuest(); } catch (e) { showError(e); }

        console.log('[SideQuest ' + VERSION + '] UI ready');
    }

    function boot() {
        try {
            createUI();
        } catch (error) {
            console.error('[SideQuest] UI boot failed:', error);
            try {
                const notice = document.createElement('div');
                notice.textContent = 'SideQuest 加载失败：' + String(error?.message || error);
                notice.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:2147483647;background:#8b1e1e;color:#fff;padding:10px 12px;border-radius:10px;font:12px sans-serif;';
                document.body?.appendChild(notice);
            } catch {}
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();