// SideQuest — tiny games between stories.
// A lightweight SillyTavern UI extension: floating notebook -> draggable game panel.

const STORAGE_KEY = 'sidequest_settings_v2';
const DEFAULTS = {
    autoListen: true,
    includeUser: true,
    includeNarration: false,
    whoSaidIt: true,
    wordHunt: true,
};

let initialized = false;
let root = null;
let panelMoved = false;

function getContext() {
    try {
        return globalThis.SillyTavern?.getContext?.() ?? null;
    } catch (error) {
        console.error('[SideQuest] getContext failed:', error);
        return null;
    }
}

function loadSettings() {
    try {
        return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
        return { ...DEFAULTS };
    }
}

function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function cleanText(text) {
    return String(text ?? '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function displayName(message) {
    if (!message) return 'Unknown';
    if (message.is_user) return 'You';
    if (message.is_system) return 'System';
    return String(message.name || message.ch_name || 'Character').trim() || 'Character';
}

function messageRole(message) {
    if (message?.is_system) return 'system';
    if (message?.is_user) return 'user';
    return 'character';
}

function unique(values) {
    return [...new Set(values.filter(Boolean))];
}

function shuffle(values) {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function getRecentMessages(limit = 30) {
    const ctx = getContext();
    const chat = ctx?.chat;
    if (!Array.isArray(chat)) return [];
    return chat
        .map((message, index) => ({ message, index }))
        .filter(({ message }) => message && !message.is_system && message.mes)
        .slice(-limit);
}

function extractDialogue(message, settings) {
    const text = cleanText(message.mes);
    const fallbackSpeaker = displayName(message);
    const lines = [];
    let match;

    // Character: "..."
    const labeled = /(?:^|\s)([^:\n]{1,50})\s*[:：]\s*[“"「『]([^”"」』\n]{8,220})[”"」』]/g;
    while ((match = labeled.exec(text)) !== null) {
        const candidate = match[1].trim();
        if (candidate && !/^[\W_]+$/u.test(candidate)) {
            lines.push({ speaker: candidate, line: match[2].trim(), kind: 'dialogue' });
        }
    }
    if (lines.length) return lines;

    // "..."
    const quoted = /[“"]([^“”"]{8,220})[”"]/g;
    while ((match = quoted.exec(text)) !== null) {
        lines.push({ speaker: fallbackSpeaker, line: match[1].trim(), kind: 'dialogue' });
    }
    if (lines.length) return lines;

    // Optional narration source.
    if (settings.includeNarration) {
        const plain = text.replace(/^[*~_\-—]+|[*~_\-—]+$/g, '').trim();
        if (plain.length >= 12 && plain.length <= 220) {
            return [{ speaker: fallbackSpeaker, line: plain, kind: 'narration' }];
        }
    }

    return [];
}

function getSources(settings) {
    const messages = getRecentMessages();
    const out = [];

    for (const { message, index } of messages) {
        const role = messageRole(message);
        if (role === 'user' && !settings.includeUser) continue;

        for (const item of extractDialogue(message, settings)) {
            out.push({ ...item, role, messageIndex: index });
        }
    }
    return { messages, sources: out };
}

function clamp(element, left, top) {
    const r = element.getBoundingClientRect();
    return {
        left: Math.max(6, Math.min(left, innerWidth - r.width - 6)),
        top: Math.max(6, Math.min(top, innerHeight - r.height - 6)),
    };
}

function makeDraggable(element, handle, { allowButtons = false, onDragged } = {}) {
    let dragging = false;
    let moved = false;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let originLeft = 0;
    let originTop = 0;

    handle.addEventListener('pointerdown', event => {
        if (event.button !== undefined && event.button !== 0) return;
        if (!allowButtons && event.target.closest('button')) return;

        const r = element.getBoundingClientRect();
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        originLeft = r.left;
        originTop = r.top;
        dragging = true;
        moved = false;

        handle.setPointerCapture?.(pointerId);
        element.classList.add('sidequest-dragging');
        event.preventDefault();
    });

    handle.addEventListener('pointermove', event => {
        if (!dragging || event.pointerId !== pointerId) return;

        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;

        const next = clamp(element, originLeft + dx, originTop + dy);
        element.style.left = `${next.left}px`;
        element.style.top = `${next.top}px`;
        element.style.right = 'auto';
        element.style.bottom = 'auto';

        if (moved) onDragged?.();
    });

    const stop = event => {
        if (!dragging || (event.pointerId !== undefined && event.pointerId !== pointerId)) return;
        dragging = false;
        handle.releasePointerCapture?.(pointerId);
        pointerId = null;
        element.classList.remove('sidequest-dragging');
    };

    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);

    return () => {
        const result = moved;
        moved = false;
        return result;
    };
}

function initSideQuest() {
    if (initialized || !document.body) return;
    initialized = true;

    const settings = loadSettings();

    root = document.createElement('section');
    root.id = 'sidequest-root';
    root.innerHTML = `
        <button id="sidequest-fab" type="button" aria-label="Open SideQuest" title="SideQuest">
            <span class="sidequest-fab-icon">📝</span>
        </button>

        <div id="sidequest-panel" class="sidequest-hidden" aria-hidden="true">
            <div class="sidequest-panel-header">
                <div class="sidequest-drag-handle" title="Drag to move">
                    <div class="sidequest-title">SideQuest</div>
                    <div class="sidequest-subtitle">Tiny games between stories</div>
                </div>
                <div class="sidequest-header-actions">
                    <button id="sidequest-settings-button" class="sidequest-icon-button" type="button" title="Settings">⚙</button>
                    <button id="sidequest-close" class="sidequest-icon-button" type="button" title="Close">×</button>
                </div>
            </div>

            <div class="sidequest-panel-body">
                <div class="sidequest-status" id="sidequest-status">
                    <span class="sidequest-status-dot"></span><span>Watching your story...</span>
                </div>

                <div id="sidequest-main-view">
                    <div class="sidequest-empty-state" id="sidequest-empty-state">
                        <div class="sidequest-empty-icon">✨</div>
                        <div class="sidequest-empty-title">Your little side quest</div>
                        <div class="sidequest-empty-text">
                            SideQuest turns recent RP lines into tiny games while you wait for the next scene.
                        </div>
                    </div>

                    <div class="sidequest-game-card" id="sidequest-game-card" hidden>
                        <div class="sidequest-card-label" id="sidequest-card-label">WHO SAID IT?</div>
                        <div class="sidequest-card-prompt" id="sidequest-prompt"></div>
                        <div class="sidequest-options" id="sidequest-options"></div>
                        <div class="sidequest-feedback" id="sidequest-feedback" aria-live="polite"></div>
                        <button id="sidequest-new-quest" class="sidequest-new-button" type="button">↻ New quest</button>
                    </div>

                    <div class="sidequest-source" id="sidequest-source" hidden></div>
                </div>

                <div class="sidequest-settings-view" id="sidequest-settings-view" hidden>
                    <div class="sidequest-settings-title">SideQuest settings</div>
                    <div class="sidequest-settings-note">
                        Pick what can become a game. Changes save automatically.
                    </div>

                    <label class="sidequest-setting-row">
                        <span><strong>Auto-listen</strong><small>Refresh after new RP messages.</small></span>
                        <input id="sq-setting-auto" type="checkbox">
                    </label>
                    <label class="sidequest-setting-row">
                        <span><strong>My messages</strong><small>Allow your own dialogue as source text.</small></span>
                        <input id="sq-setting-user" type="checkbox">
                    </label>
                    <label class="sidequest-setting-row">
                        <span><strong>Narration</strong><small>Allow narration to become source text.</small></span>
                        <input id="sq-setting-narration" type="checkbox">
                    </label>
                    <label class="sidequest-setting-row">
                        <span><strong>Who said it?</strong><small>Guess the speaker from recent RP.</small></span>
                        <input id="sq-setting-who" type="checkbox">
                    </label>
                    <label class="sidequest-setting-row">
                        <span><strong>Word hunt</strong><small>Pick a word from a recent sentence.</small></span>
                        <input id="sq-setting-word" type="checkbox">
                    </label>

                    <button id="sidequest-back" class="sidequest-back-button" type="button">← Back to quests</button>
                </div>
            </div>

            <div class="sidequest-panel-footer">
                <span>SideQuest 0.2.0</span><span>Fun first.</span>
            </div>
        </div>`;

    document.body.appendChild(root);

    const fab = root.querySelector('#sidequest-fab');
    const panel = root.querySelector('#sidequest-panel');
    const dragHandle = root.querySelector('.sidequest-drag-handle');
    const close = root.querySelector('#sidequest-close');
    const settingsButton = root.querySelector('#sidequest-settings-button');
    const backButton = root.querySelector('#sidequest-back');
    const status = root.querySelector('#sidequest-status');
    const emptyState = root.querySelector('#sidequest-empty-state');
    const gameCard = root.querySelector('#sidequest-game-card');
    const cardLabel = root.querySelector('#sidequest-card-label');
    const prompt = root.querySelector('#sidequest-prompt');
    const options = root.querySelector('#sidequest-options');
    const feedback = root.querySelector('#sidequest-feedback');
    const source = root.querySelector('#sidequest-source');
    const settingsView = root.querySelector('#sidequest-settings-view');
    const newQuest = root.querySelector('#sidequest-new-quest');

    const inputs = {
        autoListen: root.querySelector('#sq-setting-auto'),
        includeUser: root.querySelector('#sq-setting-user'),
        includeNarration: root.querySelector('#sq-setting-narration'),
        whoSaidIt: root.querySelector('#sq-setting-who'),
        wordHunt: root.querySelector('#sq-setting-word'),
    };

    for (const [key, input] of Object.entries(inputs)) input.checked = settings[key];

    function setOpen(open) {
        panel.classList.toggle('sidequest-hidden', !open);
        panel.setAttribute('aria-hidden', String(!open));
        fab.setAttribute('aria-expanded', String(open));

        if (open && !panelMoved) {
            const f = fab.getBoundingClientRect();
            const p = panel.getBoundingClientRect();
            const left = Math.max(8, Math.min(f.right - p.width, innerWidth - p.width - 8));
            const top = Math.max(8, Math.min(f.top - 14 - p.height, innerHeight - p.height - 8));
            panel.style.left = `${left}px`;
            panel.style.top = `${top}px`;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        }
    }

    const fabWasDragged = makeDraggable(fab, fab, { allowButtons: true });
    fab.addEventListener('click', event => {
        if (fabWasDragged()) {
            event.preventDefault();
            return;
        }
        setOpen(panel.classList.contains('sidequest-hidden'));
    });

    makeDraggable(panel, dragHandle, {
        onDragged: () => { panelMoved = true; },
    });

    close.addEventListener('click', () => setOpen(false));

    function showSettings(show) {
        settingsView.hidden = !show;
        root.querySelector('#sidequest-main-view').hidden = show;
        settingsButton.classList.toggle('sidequest-active', show);
        if (!show) buildQuest();
    }

    settingsButton.addEventListener('click', () => showSettings(settingsView.hidden));
    backButton.addEventListener('click', () => showSettings(false));

    for (const [key, input] of Object.entries(inputs)) {
        input.addEventListener('change', () => {
            settings[key] = input.checked;
            saveSettings(settings);
            if (settingsView.hidden) buildQuest();
        });
    }

    function setStatus(text, active = false) {
        status.querySelector('span:last-child').textContent = text;
        status.classList.toggle('sidequest-status-active', active);
    }

    function finishChoice(correct, answer, chosenButton) {
        [...options.querySelectorAll('button')].forEach(button => {
            button.disabled = true;
            if (button.dataset.answer === answer) button.classList.add('sidequest-correct');
        });

        if (correct) {
            chosenButton.classList.add('sidequest-correct');
            feedback.textContent = '✨ Nice. Your RP memory is getting dangerous.';
            feedback.className = 'sidequest-feedback sidequest-feedback-good';
        } else {
            chosenButton.classList.add('sidequest-wrong');
            feedback.textContent = `Not quite — it was ${answer}.`;
            feedback.className = 'sidequest-feedback sidequest-feedback-bad';
        }
    }

    function buildWhoSaidIt(sources, participants) {
        if (!settings.whoSaidIt) return false;

        const dialogue = sources.filter(item => item.kind === 'dialogue');
        if (!dialogue.length) return false;

        const target = dialogue.slice(-8)[Math.floor(Math.random() * Math.min(8, dialogue.slice(-8).length))];
        const names = unique([...dialogue.map(item => item.speaker), ...participants]);
        const answers = [target.speaker, ...shuffle(names.filter(name => name !== target.speaker))].slice(0, 3);

        if (answers.length < 2) return false;

        cardLabel.textContent = 'WHO SAID IT?';
        prompt.textContent = `“${target.line}”`;
        options.innerHTML = '';
        feedback.textContent = '';
        feedback.className = 'sidequest-feedback';

        for (const name of shuffle(answers)) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'sidequest-option';
            button.textContent = name;
            button.dataset.answer = target.speaker;
            button.addEventListener('click', () => finishChoice(name === target.speaker, target.speaker, button));
            options.appendChild(button);
        }

        source.textContent = `From: ${target.speaker}`;
        return true;
    }

    function buildWordHunt(sources) {
        if (!settings.wordHunt || !sources.length) return false;

        const eligible = sources.filter(item => item.line.split(/\s+/).length >= 7);
        if (!eligible.length) return false;

        const target = eligible[Math.floor(Math.random() * Math.min(8, eligible.length))];
        const words = target.line.match(/[A-Za-z]{4,}/g) || [];
        const uniqueWords = unique(words.map(word => word.toLowerCase()));

        if (uniqueWords.length < 3) return false;

        const answer = uniqueWords[Math.floor(Math.random() * uniqueWords.length)];
        const choices = [answer, ...shuffle(uniqueWords.filter(word => word !== answer))].slice(0, 3);

        cardLabel.textContent = 'WORD HUNT';
        prompt.innerHTML = `Which word appears in this line?<br><br>“${target.line}”`;
        options.innerHTML = '';
        feedback.textContent = '';
        feedback.className = 'sidequest-feedback';

        for (const word of shuffle(choices)) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'sidequest-option';
            button.textContent = word;
            button.dataset.answer = answer;
            button.addEventListener('click', () => finishChoice(word === answer, answer, button));
            options.appendChild(button);
        }

        source.textContent = `A word from ${target.speaker}\'s line`;
        return true;
    }

    function buildQuest() {
        const { messages, sources } = getSources(settings);

        if (!sources.length) {
            setStatus('Waiting for a story...');
            emptyState.hidden = false;
            gameCard.hidden = true;
            source.hidden = true;
            return;
        }

        const participants = unique(messages.map(({ message }) => displayName(message)));

        const built = Math.random() < 0.65
            ? buildWhoSaidIt(sources, participants) || buildWordHunt(sources)
            : buildWordHunt(sources) || buildWhoSaidIt(sources, participants);

        if (!built) {
            setStatus('I found the story — give me a little more dialogue.');
            emptyState.hidden = false;
            gameCard.hidden = true;
            source.hidden = true;
            return;
        }

        emptyState.hidden = true;
        gameCard.hidden = false;
        source.hidden = false;
        setStatus('A tiny quest is ready.', true);
    }

    newQuest.addEventListener('click', buildQuest);

    // ST exposes the extension context through this stable global API.
    const ctx = getContext();
    const eventSource = ctx?.eventSource;
    const eventTypes = ctx?.eventTypes ?? ctx?.event_types;

    if (eventSource && eventTypes) {
        for (const event of unique([
            eventTypes.MESSAGE_RECEIVED,
            eventTypes.MESSAGE_UPDATED,
            eventTypes.MESSAGE_SWIPED,
            eventTypes.CHAT_CHANGED,
        ])) {
            eventSource.on(event, () => {
                if (settings.autoListen && settingsView.hidden) buildQuest();
            });
        }
    }

    buildQuest();
    console.log('[SideQuest] ready');
}

function start() {
    try {
        initSideQuest();
    } catch (error) {
        initialized = false;
        console.error('[SideQuest] failed to initialize:', error);
        if (globalThis.toastr) toastr.error('SideQuest failed to start. Check the browser console for details.', 'SideQuest');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
    start();
}
