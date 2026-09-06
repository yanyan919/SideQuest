// SideQuest — tiny games between stories.
// Automatically follows the active ST chat and keeps User / Character roles separate.

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
                    <span>Watching your story...</span>
                </div>

                <div class="sidequest-empty-state" id="sidequest-empty-state">
                    <div class="sidequest-empty-icon">✨</div>
                    <div class="sidequest-empty-title">Your little side quest</div>
                    <div class="sidequest-empty-text">
                        SideQuest watches the current chat and turns recent lines into tiny games.
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

    function getRecentMessages(limit = 24) {
        if (!Array.isArray(window.SillyTavern?.chat)) return [];
        return SillyTavern.chat
            .map((message, index) => ({ message, index }))
            .filter(({ message }) => message && !message.is_system && message.mes)
            .slice(-limit);
    }

    // Reads the actual ST message objects, so the plugin does not have to guess
    // whether a line belongs to the user or to a character.
    function collectParticipants(messages) {
        const participants = new Map();

        for (const { message } of messages) {
            const role = messageRole(message);
            if (role === 'system') continue;

            const name = displayName(message);
            if (!participants.has(name)) {
                participants.set(name, { name, role, count: 0 });
            }
            participants.get(name).count += 1;
        }

        return [...participants.values()];
    }

    function extractQuotedLines(text, fallbackSpeaker) {
        const lines = [];
        const quoted = /[“"]([^“”"]{8,220})[”"]/g;
        let match;

        while ((match = quoted.exec(text)) !== null) {
            const line = match[1].trim();
            if (line) lines.push({ speaker: fallbackSpeaker, line });
        }

        return lines;
    }

    function extractDialogue(message) {
        const text = cleanText(message.mes);
        const fallbackSpeaker = displayName(message);
        const lines = [];

        // Explicit speaker labels inside a message take priority.
        // Example: Peregrine: “I suppose you could stay for dinner.”
        const labeled = /(?:^|\s)([A-Za-z][A-Za-z0-9 _'’.-]{0,40})\s*[:：]\s*[“"]([^“”"]{8,220})[”"]/g;
        let match;
        while ((match = labeled.exec(text)) !== null) {
            lines.push({ speaker: match[1].trim(), line: match[2].trim() });
        }

        if (lines.length) return lines;

        // Normal ST character messages: message.name is the speaker.
        // User messages are also preserved as "You".
        return extractQuotedLines(text, fallbackSpeaker);
    }

    function getCandidateLines(messages) {
        const candidates = [];

        for (const { message, index } of messages) {
            const role = messageRole(message);
            if (role === 'system') continue;

            for (const dialogue of extractDialogue(message)) {
                candidates.push({ ...dialogue, role, messageIndex: index });
            }
        }

        return candidates;
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

    function chooseTarget(candidates) {
        // Prefer a recent line, but not always the absolute newest one.
        const recent = candidates.slice(-8);
        return recent[Math.floor(Math.random() * recent.length)] || candidates[candidates.length - 1];
    }

    function buildWhoSaidIt() {
        const messages = getRecentMessages();
        if (!messages.length) {
            setStatus('Waiting for a story...', false);
            emptyState.hidden = false;
            gameCard.hidden = true;
            source.hidden = true;
            return;
        }

        const candidates = getCandidateLines(messages);
        if (!candidates.length) {
            setStatus('Story found — waiting for dialogue...', false);
            emptyState.hidden = false;
            gameCard.hidden = true;
            source.hidden = false;
            source.textContent = 'SideQuest is watching the chat. A quoted line will become a quest when one appears.';
            return;
        }

        const target = chooseTarget(candidates);
        const participants = collectParticipants(messages).map(item => item.name);
        let speakers = unique(candidates.map(item => item.speaker));

        // Add real participants from the current chat rather than hard-coded names.
        speakers = unique([...speakers, ...participants]);

        // Keep the quiz useful even when the current scene contains only one speaker.
        // The distractors are real people from the active chat whenever possible.
        const distractors = shuffle(speakers.filter(name => name !== target.speaker));
        const selected = [target.speaker, ...distractors].slice(0, 3);

        // If there are fewer than 2 real speakers, don't invent fake characters.
        if (selected.length < 2) {
            setStatus('Dialogue found — need another speaker for this quest.', false);
            emptyState.hidden = false;
            gameCard.hidden = true;
            source.hidden = false;
            source.textContent = `Found a line from ${target.speaker}. More characters will unlock the guessing game.`;
            return;
        }

        const shuffled = shuffle(selected);
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
        source.textContent = `Watching ${participants.join(' · ')}`;
        setStatus('A tiny quest is ready.', true);
    }

    function refreshFromChat() {
        buildWhoSaidIt();
    }

    // ST's own message objects provide the role information. The event listeners
    // make SideQuest refresh itself after new turns, edits and swipes.
    if (window.SillyTavern?.eventSource && window.SillyTavern?.eventTypes) {
        const events = SillyTavern.eventTypes;
        const refreshEvents = unique([
            events.MESSAGE_RECEIVED,
            events.MESSAGE_UPDATED,
            events.MESSAGE_SWIPED,
            events.CHAT_CHANGED,
        ]);

        for (const event of refreshEvents) {
            if (event) SillyTavern.eventSource.on(event, refreshFromChat);
        }
    }

    refreshFromChat();
    console.log('[SideQuest] automatic chat listener ready');
});
