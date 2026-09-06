// SideQuest — tiny games between stories.

jQuery(async () => {
    if (document.getElementById('sidequest-root')) return;

    const root = document.createElement('section');
    root.id = 'sidequest-root';
    root.innerHTML = `
        <button id="sidequest-fab" type="button" aria-label="Open SideQuest" title="SideQuest">
            <span class="sidequest-fab-icon">📝</span>
        </button>

        <div id="sidequest-panel" class="sidequest-hidden" aria-hidden="true">
            <div class="sidequest-panel-header">
                <div>
                    <div class="sidequest-title">SideQuest</div>
                    <div class="sidequest-subtitle">Tiny games between stories</div>
                </div>
                <button id="sidequest-close" class="sidequest-icon-button" type="button" aria-label="Close">×</button>
            </div>

            <div class="sidequest-panel-body">
                <div class="sidequest-status" id="sidequest-status">
                    <span class="sidequest-status-dot"></span>
                    <span>Waiting for a story...</span>
                </div>

                <div class="sidequest-empty-state" id="sidequest-empty-state">
                    <div class="sidequest-empty-icon">✨</div>
                    <div class="sidequest-empty-title">Your little side quest</div>
                    <div class="sidequest-empty-text">
                        SideQuest will turn the last story into a tiny game while the next scene is generating.
                    </div>
                </div>

                <div class="sidequest-game-card" id="sidequest-game-card" hidden>
                    <div class="sidequest-card-label">WHO SAID IT?</div>
                    <div class="sidequest-card-prompt" id="sidequest-prompt"></div>
                    <div class="sidequest-options" id="sidequest-options"></div>
                    <div class="sidequest-feedback" id="sidequest-feedback" aria-live="polite"></div>
                </div>

                <div class="sidequest-source" id="sidequest-source" hidden></div>
            </div>

            <div class="sidequest-panel-footer">
                <span>SideQuest 0.1.0</span>
                <span>Fun first.</span>
            </div>
        </div>
    `;

    document.body.appendChild(root);

    const fab = root.querySelector('#sidequest-fab');
    const panel = root.querySelector('#sidequest-panel');
    const close = root.querySelector('#sidequest-close');
    const status = root.querySelector('#sidequest-status');
    const emptyState = root.querySelector('#sidequest-empty-state');
    const gameCard = root.querySelector('#sidequest-game-card');
    const prompt = root.querySelector('#sidequest-prompt');
    const options = root.querySelector('#sidequest-options');
    const feedback = root.querySelector('#sidequest-feedback');
    const source = root.querySelector('#sidequest-source');

    const setOpen = (open) => {
        panel.classList.toggle('sidequest-hidden', !open);
        panel.setAttribute('aria-hidden', String(!open));
        fab.setAttribute('aria-expanded', String(open));
    };

    fab.addEventListener('click', () => {
        setOpen(panel.classList.contains('sidequest-hidden'));
    });

    close.addEventListener('click', () => setOpen(false));

    function setStatus(text, active = false) {
        status.querySelector('span:last-child').textContent = text;
        status.classList.toggle('sidequest-status-active', active);
    }

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = String(value ?? '');
        return div.innerHTML;
    }

    function cleanText(text) {
        return String(text ?? '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getLatestCharacterMessage() {
        if (!Array.isArray(window.SillyTavern?.chat)) return null;

        for (let i = SillyTavern.chat.length - 1; i >= 0; i--) {
            const message = SillyTavern.chat[i];
            if (message && !message.is_user && !message.is_system && message.mes) {
                return { message, index: i };
            }
        }
        return null;
    }

    function extractDialogue(message) {
        const text = cleanText(message.mes);
        const matches = [];

        // Handles common formats such as: Character: "Hello." or Character: “Hello.”
        const regex = /(?:^|\s)([A-Za-z][A-Za-z0-9 _'’-]{0,30})\s*[:：]\s*[“"']([^“”"']{8,180})[”"']/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            matches.push({ speaker: match[1].trim(), line: match[2].trim() });
        }

        // Also accept quoted lines without a speaker label.
        if (!matches.length) {
            const quoted = /[“"]([^“”"]{12,180})[”"]/g;
            while ((match = quoted.exec(text)) !== null) {
                matches.push({ speaker: message.name || 'Character', line: match[1].trim() });
            }
        }

        return matches;
    }

    function buildWhoSaidIt() {
        const latest = getLatestCharacterMessage();
        if (!latest) {
            setStatus('Waiting for a story...', false);
            emptyState.hidden = false;
            gameCard.hidden = true;
            source.hidden = true;
            return;
        }

        const dialogues = extractDialogue(latest.message);
        if (!dialogues.length) {
            setStatus('Story found — waiting for dialogue...', false);
            emptyState.hidden = false;
            gameCard.hidden = true;
            source.hidden = false;
            source.textContent = 'SideQuest found the latest scene, but could not find a clean dialogue line yet.';
            return;
        }

        const target = dialogues[Math.floor(Math.random() * dialogues.length)];
        const speakers = [...new Set(dialogues.map(item => item.speaker))];
        const fallbackNames = ['Peregrine', 'You', 'Narrator'];
        for (const name of fallbackNames) {
            if (speakers.length >= 3) break;
            if (!speakers.includes(name)) speakers.push(name);
        }
        const shuffled = speakers.sort(() => Math.random() - 0.5).slice(0, Math.min(3, speakers.length));
        if (!shuffled.includes(target.speaker)) shuffled[Math.floor(Math.random() * shuffled.length)] = target.speaker;

        prompt.textContent = `“${target.line}”`;
        options.innerHTML = '';
        feedback.textContent = '';
        feedback.className = 'sidequest-feedback';

        for (const name of shuffled) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'sidequest-option';
            button.textContent = name;
            button.addEventListener('click', () => {
                const correct = name === target.speaker;
                [...options.querySelectorAll('button')].forEach(btn => {
                    btn.disabled = true;
                    if (btn.textContent === target.speaker) btn.classList.add('sidequest-correct');
                });
                if (correct) {
                    button.classList.add('sidequest-correct');
                    feedback.textContent = '✨ Yep! You got it.';
                    feedback.classList.add('sidequest-feedback-good');
                } else {
                    button.classList.add('sidequest-wrong');
                    feedback.textContent = `Not quite — ${target.speaker} said it.`;
                    feedback.classList.add('sidequest-feedback-bad');
                }
            });
            options.appendChild(button);
        }

        emptyState.hidden = true;
        gameCard.hidden = false;
        source.hidden = false;
        source.textContent = `From ${latest.message.name || 'the latest scene'}`;
        setStatus('A tiny quest is ready.', true);
    }

    function refreshFromLatestMessage() {
        buildWhoSaidIt();
    }

    // Use ST's event system when available, so the side quest refreshes after new RP turns.
    if (window.SillyTavern?.eventSource && window.SillyTavern?.eventTypes) {
        const events = SillyTavern.eventTypes;
        const refreshEvents = [events.MESSAGE_RECEIVED, events.MESSAGE_UPDATED, events.MESSAGE_SWIPED];
        for (const event of refreshEvents) {
            if (event) SillyTavern.eventSource.on(event, refreshFromLatestMessage);
        }
    }

    refreshFromLatestMessage();
    console.log('[SideQuest] panel + first mini-game ready');
});
