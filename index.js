// SideQuest — tiny games between stories.
// Follows the active SillyTavern chat without hard-coding a character or language.

jQuery(async () => {
    if (document.getElementById('sidequest-root')) return;
    const STORAGE_KEY = 'sidequest_settings_v1';
    const defaults = { autoListen: true, includeUser: true, includeNarration: false, whoSaidIt: true };
    let settings = loadSettings();
    let panelMoved = false;

    const root = document.createElement('section');
    root.id = 'sidequest-root';
    root.innerHTML = `
        <button id="sidequest-fab" type="button" aria-label="Open SideQuest" title="SideQuest"><span class="sidequest-fab-icon">📝</span></button>
        <div id="sidequest-panel" class="sidequest-hidden" aria-hidden="true">
            <div class="sidequest-panel-header">
                <div class="sidequest-drag-handle" title="Drag to move"><div class="sidequest-title">SideQuest</div><div class="sidequest-subtitle">Tiny games between stories</div></div>
                <div class="sidequest-header-actions"><button id="sidequest-settings-button" class="sidequest-icon-button" type="button" aria-label="Settings" title="Settings">⚙</button><button id="sidequest-close" class="sidequest-icon-button" type="button" aria-label="Close">×</button></div>
            </div>
            <div class="sidequest-panel-body">
                <div class="sidequest-status" id="sidequest-status"><span class="sidequest-status-dot"></span><span>Watching your story...</span></div>
                <div class="sidequest-empty-state" id="sidequest-empty-state"><div class="sidequest-empty-icon">✨</div><div class="sidequest-empty-title">Your little side quest</div><div class="sidequest-empty-text">SideQuest watches the current chat and turns recent lines into tiny games.</div></div>
                <div class="sidequest-game-card" id="sidequest-game-card" hidden><div class="sidequest-card-label">WHO SAID IT?</div><div class="sidequest-card-prompt" id="sidequest-prompt"></div><div class="sidequest-options" id="sidequest-options"></div><div class="sidequest-feedback" id="sidequest-feedback" aria-live="polite"></div></div>
                <div class="sidequest-source" id="sidequest-source" hidden></div>
                <div class="sidequest-settings-view" id="sidequest-settings-view" hidden>
                    <div class="sidequest-settings-title">Settings</div><div class="sidequest-settings-note">Make SideQuest behave the way you like. Changes save automatically.</div>
                    <label class="sidequest-setting-row"><span><strong>Auto-listen</strong><small>Watch new RP messages and refresh quests automatically.</small></span><input id="sq-setting-auto" type="checkbox"></label>
                    <label class="sidequest-setting-row"><span><strong>Include my messages</strong><small>Allow your own dialogue to become a source for games.</small></span><input id="sq-setting-user" type="checkbox"></label>
                    <label class="sidequest-setting-row"><span><strong>Include narration</strong><small>Allow narration to become a source when a game supports it.</small></span><input id="sq-setting-narration" type="checkbox"></label>
                    <label class="sidequest-setting-row"><span><strong>Who said it?</strong><small>Keep the first mini-game enabled.</small></span><input id="sq-setting-who" type="checkbox"></label>
                    <button id="sidequest-back" class="sidequest-back-button" type="button">← Back to quests</button>
                </div>
            </div>
            <div class="sidequest-panel-footer"><span>SideQuest 0.1.0</span><span>Fun first.</span></div>
        </div>`;
    document.body.appendChild(root);

    const fab = root.querySelector('#sidequest-fab'), panel = root.querySelector('#sidequest-panel'), dragHandle = root.querySelector('.sidequest-drag-handle');
    const close = root.querySelector('#sidequest-close'), settingsButton = root.querySelector('#sidequest-settings-button'), backButton = root.querySelector('#sidequest-back');
    const status = root.querySelector('#sidequest-status'), emptyState = root.querySelector('#sidequest-empty-state'), gameCard = root.querySelector('#sidequest-game-card');
    const prompt = root.querySelector('#sidequest-prompt'), options = root.querySelector('#sidequest-options'), feedback = root.querySelector('#sidequest-feedback');
    const source = root.querySelector('#sidequest-source'), settingsView = root.querySelector('#sidequest-settings-view');
    const settingInputs = { autoListen: root.querySelector('#sq-setting-auto'), includeUser: root.querySelector('#sq-setting-user'), includeNarration: root.querySelector('#sq-setting-narration'), whoSaidIt: root.querySelector('#sq-setting-who') };
    for (const [key, input] of Object.entries(settingInputs)) input.checked = settings[key];

    function loadSettings() { try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; } catch { return { ...defaults }; } }
    function saveSettings() { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }
    function setOpen(open) { panel.classList.toggle('sidequest-hidden', !open); panel.setAttribute('aria-hidden', String(!open)); fab.setAttribute('aria-expanded', String(open)); if (open && !panelMoved) positionPanelNearFab(); }
    function positionPanelNearFab() { const f = fab.getBoundingClientRect(), p = panel.getBoundingClientRect(); const left = Math.max(8, Math.min(f.right - p.width, innerWidth - p.width - 8)); const top = Math.max(8, Math.min(f.top - 14 - p.height, innerHeight - p.height - 8)); panel.style.left = `${left}px`; panel.style.top = `${top}px`; panel.style.right = 'auto'; panel.style.bottom = 'auto'; }
    function clamp(element, left, top) { const r = element.getBoundingClientRect(); return { left: Math.max(6, Math.min(left, innerWidth - r.width - 6)), top: Math.max(6, Math.min(top, innerHeight - r.height - 6)) }; }

    function makeDraggable(element, handle, { allowButtons = false, onDragged } = {}) {
        let dragging = false, moved = false, pointerId = null, startX = 0, startY = 0, originLeft = 0, originTop = 0;
        handle.addEventListener('pointerdown', event => {
            if (event.button !== undefined && event.button !== 0) return;
            if (!allowButtons && event.target.closest('button')) return;
            const r = element.getBoundingClientRect(); pointerId = event.pointerId; startX = event.clientX; startY = event.clientY; originLeft = r.left; originTop = r.top; dragging = true; moved = false;
            handle.setPointerCapture?.(pointerId); element.classList.add('sidequest-dragging'); event.preventDefault();
        });
        handle.addEventListener('pointermove', event => {
            if (!dragging || event.pointerId !== pointerId) return;
            const dx = event.clientX - startX, dy = event.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
            const next = clamp(element, originLeft + dx, originTop + dy);
            element.style.left = `${next.left}px`; element.style.top = `${next.top}px`; element.style.right = 'auto'; element.style.bottom = 'auto';
            if (moved) onDragged?.();
        });
        const stop = event => { if (!dragging || (event.pointerId !== undefined && event.pointerId !== pointerId)) return; dragging = false; handle.releasePointerCapture?.(pointerId); pointerId = null; element.classList.remove('sidequest-dragging'); };
        handle.addEventListener('pointerup', stop); handle.addEventListener('pointercancel', stop);
        return () => { const result = moved; moved = false; return result; };
    }

    const fabWasDragged = makeDraggable(fab, fab, { allowButtons: true });
    fab.addEventListener('click', event => { if (fabWasDragged()) { event.preventDefault(); return; } setOpen(panel.classList.contains('sidequest-hidden')); });
    makeDraggable(panel, dragHandle, { onDragged: () => { panelMoved = true; } });
    close.addEventListener('click', () => setOpen(false));
    settingsButton.addEventListener('click', () => showSettings(settingsView.hidden));
    backButton.addEventListener('click', () => showSettings(false));
    for (const [key, input] of Object.entries(settingInputs)) input.addEventListener('change', () => { settings[key] = input.checked; saveSettings(); if (settingsView.hidden) buildWhoSaidIt(); });

    function showSettings(show) { settingsView.hidden = !show; settingsButton.classList.toggle('sidequest-active', show); emptyState.hidden = show; gameCard.hidden = show; source.hidden = show; if (!show) buildWhoSaidIt(); }
    function setStatus(text, active = false) { status.querySelector('span:last-child').textContent = text; status.classList.toggle('sidequest-status-active', active); }
    function cleanText(text) { return String(text ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
    function displayName(message) { if (!message) return 'Unknown'; if (message.is_user) return 'You'; if (message.is_system) return 'System'; return String(message.name || message.ch_name || 'Character').trim() || 'Character'; }
    function messageRole(message) { return message?.is_system ? 'system' : message?.is_user ? 'user' : 'character'; }
    function getRecentMessages(limit = 24) { if (!Array.isArray(window.SillyTavern?.chat)) return []; return SillyTavern.chat.map((message, index) => ({ message, index })).filter(({ message }) => message && !message.is_system && message.mes).slice(-limit); }
    function collectParticipants(messages) { const map = new Map(); for (const { message } of messages) { const role = messageRole(message); if (role === 'system') continue; const name = displayName(message); if (!map.has(name)) map.set(name, { name, role, count: 0 }); map.get(name).count++; } return [...map.values()]; }
    function extractQuotedLines(text, fallbackSpeaker) { const lines = [], quoted = /[“"]([^“”"]{8,220})[”"]/g; let match; while ((match = quoted.exec(text)) !== null) { const line = match[1].trim(); if (line) lines.push({ speaker: fallbackSpeaker, line }); } return lines; }
    function extractDialogue(message) {
        const text = cleanText(message.mes), fallbackSpeaker = displayName(message), lines = []; let match;
        const labeled = /(?:^|\s)([^:\n]{1,50})\s*[:：]\s*[“"「『]([^”"」』\n]{8,220})[”"」』]/g;
        while ((match = labeled.exec(text)) !== null) { const candidate = match[1].trim(); if (candidate && !/^[\W_]+$/u.test(candidate)) lines.push({ speaker: candidate, line: match[2].trim() }); }
        if (lines.length) return lines;
        const quoted = extractQuotedLines(text, fallbackSpeaker); if (quoted.length) return quoted;
        // Conservative fallback for cards that write dialogue without quotation marks.
        const plain = text.replace(/^[*~_\-—]+|[*~_\-—]+$/g, '').trim();
        if (plain.length >= 8 && plain.length <= 220) return [{ speaker: fallbackSpeaker, line: plain }];
        return [];
    }
    function getCandidateLines(messages) { const out = []; for (const { message, index } of messages) { const role = messageRole(message); if (role === 'user' && !settings.includeUser) continue; for (const dialogue of extractDialogue(message)) out.push({ ...dialogue, role, messageIndex: index }); } return out; }
    function unique(values) { return [...new Set(values.filter(Boolean))]; }
    function shuffle(values) { const copy = [...values]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }

    function buildWhoSaidIt() {
        if (!settings.whoSaidIt) { setStatus('Mini-games are turned off.'); emptyState.hidden = false; gameCard.hidden = true; source.hidden = true; return; }
        const messages = getRecentMessages(), candidates = getCandidateLines(messages);
        if (!candidates.length) { setStatus('Waiting for a story...'); emptyState.hidden = false; gameCard.hidden = true; source.hidden = true; return; }
        const recent = candidates.slice(-8), target = recent[Math.floor(Math.random() * recent.length)];
        const participants = collectParticipants(messages).map(item => item.name), speakers = unique([...candidates.map(item => item.speaker), ...participants]);
        const selected = [target.speaker, ...shuffle(speakers.filter(name => name !== target.speaker))].slice(0, 3);
        if (selected.length < 2) { setStatus('Dialogue found — waiting for another speaker...'); emptyState.hidden = false; gameCard.hidden = true; source.hidden = false; source.textContent = `Found a line from ${target.speaker}. More speakers will unlock the guessing game.`; return; }
        prompt.textContent = `“${target.line}”`; options.innerHTML = ''; feedback.textContent = ''; feedback.className = 'sidequest-feedback';
        for (const name of shuffle(selected)) { const button = document.createElement('button'); button.type = 'button'; button.className = 'sidequest-option'; button.textContent = name; button.addEventListener('click', () => { const correct = name === target.speaker; [...options.querySelectorAll('button')].forEach(btn => { btn.disabled = true; if (btn.textContent === target.speaker) btn.classList.add('sidequest-correct'); }); if (correct) { button.classList.add('sidequest-correct'); feedback.textContent = '✨ Yep! You got it.'; feedback.classList.add('sidequest-feedback-good'); } else { button.classList.add('sidequest-wrong'); feedback.textContent = `Not quite — ${target.speaker} said it.`; feedback.classList.add('sidequest-feedback-bad'); } }); options.appendChild(button); }
        emptyState.hidden = true; gameCard.hidden = false; source.hidden = false; source.textContent = `Watching ${participants.join(' · ')}`; setStatus('A tiny quest is ready.', true);
    }

    function refreshFromChat() { if (!settings.autoListen || !settingsView.hidden) return; buildWhoSaidIt(); }
    if (window.SillyTavern?.eventSource && window.SillyTavern?.eventTypes) { const events = window.SillyTavern.eventTypes; for (const event of unique([events.MESSAGE_RECEIVED, events.MESSAGE_UPDATED, events.MESSAGE_SWIPED, events.CHAT_CHANGED])) if (event) window.SillyTavern.eventSource.on(event, refreshFromChat); }
    refreshFromChat();
    console.log('[SideQuest] draggable companion + adaptive dialogue listener ready');
});
