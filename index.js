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
                <div class="sidequest-empty-state">
                    <div class="sidequest-empty-icon">✨</div>
                    <div class="sidequest-empty-title">Your little side quest</div>
                    <div class="sidequest-empty-text">
                        When the next scene is generating, SideQuest will turn the last story into a tiny game here.
                    </div>
                </div>

                <div class="sidequest-preview-card">
                    <div class="sidequest-card-label">COMING SOON</div>
                    <div class="sidequest-card-title">“Who said it?”</div>
                    <div class="sidequest-card-text">Guess which character said a line from your story.</div>
                    <button class="sidequest-demo-button" type="button" disabled>Not ready yet</button>
                </div>
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

    const setOpen = (open) => {
        panel.classList.toggle('sidequest-hidden', !open);
        panel.setAttribute('aria-hidden', String(!open));
        fab.setAttribute('aria-expanded', String(open));
    };

    fab.addEventListener('click', () => {
        setOpen(panel.classList.contains('sidequest-hidden'));
    });

    close.addEventListener('click', () => setOpen(false));

    console.log('[SideQuest] panel ready');
});
