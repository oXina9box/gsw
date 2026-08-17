/* Gem Studio · merged app script (studio shell + landing interactions) */
/* Lineage: app.js (studio/dashboard shell, base) + script.js (landing interactions, ported). */
/* Originals quarantined in _attic/. */

/* Gem Studio · app shell · localStorage store (swap for API later) */
const LS = 'gem-studio-v1';
const DEPTS = ['Research','Marketing','Creative','Story','Storyboard','Script','Screenplay','AI Conversion','Video Production','Launch','Social Posting','Social Management','Reporting'];
const uid = p => p + Math.random().toString(36).slice(2, 7);

const agentFiles = (n, t) => ({
  role: `You are the ${n}. ${t === 'supervisor' ? 'You supervise the lane; approve or kick back work.' : 'You produce work and hand it to the next agent.'}`,
  soul: '', jobdescription: '## Deliverable\n\n## Constraints\n\n## Output format\n\n## Handoff',
  skills: '', memory: '## Session Log\n(empty)', user: ''
});

function seed() {
  const db = {
    channels: [
      { id: 'c1', name: 'Sci-Fi Shorts', status: 'active',
        identity: { audience: '18–34 · short-form native', voice: 'Witty · cerebral · visually bold' },
        strategy: { cadence: '3×/week', pillars: ['Hard sci-fi', 'AI ethics', 'Space'] } },
      { id: 'c2', name: 'True Crime Docs', status: 'active',
        identity: { audience: '25–44 · long-form', voice: 'Measured · tense · factual' },
        strategy: { cadence: '1×/week', pillars: ['Cold cases', 'Forensics'] } }
    ],
    productions: [
      { id: 'p1', ch: 'c1', title: 'Ep 13 — The Signal', step: 4 },
      { id: 'p2', ch: 'c1', title: 'Ep 14 — Static', step: 1 },
      { id: 'p3', ch: 'c2', title: 'Ep 5 — The Alibi', step: 9 }
    ],
    departments: DEPTS.map((name, i) => ({ id: 'd' + i, name, order: i, lanes: [] }))
  };
  db.departments[5].lanes = [{ id: 'l1', name: 'Script Writing', agents: [
    { id: 'a1', name: 'Jr Writer', type: 'worker', files: agentFiles('Jr Writer', 'worker') },
    { id: 'a2', name: 'Sr Script Writer', type: 'worker', files: agentFiles('Sr Script Writer', 'worker') },
    { id: 'a3', name: 'Script Engineer', type: 'supervisor', files: agentFiles('Script Engineer', 'supervisor') }
  ] }];
  return db;
}
function load() { try { return JSON.parse(localStorage.getItem(LS)) || seed(); } catch { return seed(); } }
let db = load();
const save = () => localStorage.setItem(LS, JSON.stringify(db));


function render() {
  const [, v, id] = location.hash.split('/');
  if (v === 'channel') channelView(id);
  else if (v === 'production') productionView(id);
  else if (v === 'builder') builderView();
  else studioView();
  root.querySelector('[data-reset]')?.addEventListener('click', () => {
    if (confirm('Reset demo data?')) { localStorage.removeItem(LS); db = seed(); save(); render(); }
  });
}
function pipe(s) { return `<div class="pipe">${DEPTS.map((_, i) => `<i class="${i < s ? 'done' : i === s ? 'now' : ''}"></i>`).join('')}</div>`; }
function agentCount() { return db.departments.reduce((n, d) => n + d.lanes.reduce((m, l) => m + l.agents.length, 0), 0); }

function studioView() {
  const act = db.productions.filter(p => p.step < DEPTS.length);
  root.innerHTML = `
  <div class="app-head">
    <div><p class="section-kicker">Studio view</p><h1 class="app-title">Gem Studio</h1></div>
    <div class="app-actions"><a class="button button-outline" href="#/builder">Lanes & agents</a>
    <button class="button button-primary" data-add="channel">+ Channel</button></div>
  </div>
  <div class="stat-row">
    <div class="stat"><b>${db.channels.length}</b><span>Channels</span></div>
    <div class="stat"><b>${act.length}</b><span>In production</span></div>
    <div class="stat"><b>${db.productions.length - act.length}</b><span>Shipped</span></div>
    <div class="stat"><b>${agentCount()}</b><span>Agents hired</span></div>
  </div>
  <p class="desk-label">Channels</p>
  <div class="ch-grid">${db.channels.map(c => `
    <a class="ch-card" href="#/channel/${c.id}">
      <div class="ch-top"><b>${c.name}</b><span class="dot ${c.status}"></span></div>
      <small>${c.identity.voice}</small>
      <small>${c.strategy.cadence} · ${c.strategy.pillars.slice(0, 2).join(' · ')}</small>
      <div class="ch-count">${db.productions.filter(p => p.ch === c.id).length} productions</div>
    </a>`).join('')}
  </div>
  <p class="desk-label">Active productions</p>
  <div class="prod-list">${act.map(p => `
    <a class="prod-row" href="#/production/${p.id}">
      <span class="prod-name">${p.title}</span><span class="prod-dept">${DEPTS[p.step]}</span>${pipe(p.step)}
    </a>`).join('')}
  </div>`;
  bindAdd();
}

function channelView(id) {
  const c = db.channels.find(x => x.id === id); if (!c) return studioView();
  const prods = db.productions.filter(p => p.ch === id);
  root.innerHTML = `
  <div class="app-head">
    <div><p class="section-kicker"><a class="text-link" href="#/">← Studio</a></p><h1 class="app-title">${c.name}</h1></div>
    <button class="button button-primary" data-add="production" data-ch="${c.id}">+ Production</button>
  </div>
  <div class="id-grid">
    <div class="panel"><p class="desk-label">Identity</p><small>Audience — ${c.identity.audience}</small><small>Voice — ${c.identity.voice}</small></div>
    <div class="panel"><p class="desk-label">Strategy</p><small>Cadence — ${c.strategy.cadence}</small><small>Pillars — ${c.strategy.pillars.join(' · ')}</small></div>
  </div>
  <p class="desk-label">Productions</p>
  <div class="prod-list">${prods.map(p => `
    <a class="prod-row" href="#/production/${p.id}">
      <span class="prod-name">${p.title}</span><span class="prod-dept">${p.step < DEPTS.length ? DEPTS[p.step] : 'Shipped'}</span>${pipe(p.step)}
    </a>`).join('') || '<small class="muted">None yet.</small>'}
  </div>`;
  bindAdd();
}

function productionView(id) {
  const p = db.productions.find(x => x.id === id); if (!p) return studioView();
  root.innerHTML = `
  <div class="app-head">
    <div><p class="section-kicker"><a class="text-link" href="#/channel/${p.ch}">← Channel</a></p><h1 class="app-title">${p.title}</h1></div>
    ${p.step < DEPTS.length ? `<button class="button button-primary" data-advance="${p.id}">Advance → ${DEPTS[p.step]}</button>` : '<span class="prod-dept">SHIPPED</span>'}
  </div>
  <div class="dept-flow">${DEPTS.map((d, i) => `
    <div class="dept-step ${i < p.step ? 'done' : i === p.step ? 'now' : ''}"><i></i><strong>${d}</strong></div>`).join('')}
  </div>`;
  root.querySelector('[data-advance]')?.addEventListener('click', () => { p.step++; save(); render(); });
}

function builderView() {
  root.innerHTML = `
  <div class="app-head">
    <div><p class="section-kicker"><a class="text-link" href="#/">← Studio</a></p><h1 class="app-title">Lanes & agents</h1></div>
    <button class="text-link" data-reset>Reset demo data</button>
  </div>
  ${db.departments.map(d => `
    <section class="b-dept">
      <div class="b-dept-head"><strong>${d.name}</strong>
        <button class="button button-outline" data-add="lane" data-dept="${d.id}">+ Lane</button></div>
      ${d.lanes.map(l => `
        <div class="b-lane">
          <div class="b-lane-head"><b>${l.name}</b>
            <button class="button button-outline" data-add="agent" data-dept="${d.id}" data-lane="${l.id}">+ Agent</button></div>
          <div class="b-agents">${l.agents.map(a => `
            <button class="chip ${a.type}" data-agent="${a.id}" data-lane="${l.id}" data-dept="${d.id}">${a.name}<em>${a.type === 'supervisor' ? '★' : '·'}</em></button>`).join('') || '<small class="muted">No agents yet.</small>'}
          </div>
        </div>`).join('')}
    </section>`).join('')}`;
  bindAdd();
  root.querySelectorAll('[data-agent]').forEach(b => b.addEventListener('click', () => {
    const a = db.departments.find(d => d.id === b.dataset.dept)?.lanes.find(l => l.id === b.dataset.lane)?.agents.find(x => x.id === b.dataset.agent);
    if (a) editAgent(a);
  }));
}

/* ---- agent editor: the six files ---- */
function editAgent(a) {
  const d = document.createElement('dialog'); d.className = 'command-dialog dialog-wide';
  d.innerHTML = `<div class="dialog-topline"><span>${a.name} · ${a.type}</span><button class="dialog-close" data-x>×</button></div>
  <form class="modal-form" method="dialog">
    ${['role', 'soul', 'jobdescription', 'skills', 'memory', 'user'].map(k => `
      <label><span>${k}.md</span><textarea name="${k}" rows="${k === 'jobdescription' ? 6 : 3}">${a.files[k] || ''}</textarea></label>`).join('')}
    <button class="button button-primary" value="ok">Save agent</button>
  </form>`;
  root.appendChild(d); d.showModal();
  d.querySelector('[data-x]').onclick = () => d.close();
  d.onclose = () => {
    if (d.returnValue === 'ok') { a.files = Object.fromEntries(new FormData(d.querySelector('form'))); save(); }
    d.remove(); render();
  };
}

/* ---- easy-add modals ---- */
function ask(title, fields, cb) {
  const d = document.createElement('dialog'); d.className = 'command-dialog';
  d.innerHTML = `<div class="dialog-topline"><span>${title}</span><button class="dialog-close" data-x>×</button></div>
  <form class="modal-form" method="dialog">
    ${fields.map(f => `<label><span>${f.label}</span><input name="${f.name}" placeholder="${f.ph || ''}" required></label>`).join('')}
    <button class="button button-primary" value="ok">Create</button>
  </form>`;
  root.appendChild(d); d.showModal();
  d.querySelector('[data-x]').onclick = () => d.close();
  d.onclose = () => { if (d.returnValue === 'ok') cb(Object.fromEntries(new FormData(d.querySelector('form')))); d.remove(); };
}

function bindAdd() {
  root.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.add;
    if (k === 'channel') ask('New channel', [{ name: 'name', label: 'Channel name', ph: 'Comedy Sketches' }], v => {
      db.channels.push({ id: uid('c'), name: v.name, status: 'active', identity: { audience: 'TBD', voice: 'TBD' }, strategy: { cadence: 'TBD', pillars: [] } });
      save(); render();
    });
    if (k === 'production') ask('New production', [{ name: 'title', label: 'Title', ph: 'Ep 1 — Pilot' }], v => {
      db.productions.push({ id: uid('p'), ch: b.dataset.ch, title: v.title, step: 0 });
      save(); render();
    });
    if (k === 'lane') ask('New lane', [{ name: 'name', label: 'Lane name', ph: 'Script Writing' }], v => {
      db.departments.find(x => x.id === b.dataset.dept).lanes.push({ id: uid('l'), name: v.name, agents: [] });
      save(); render();
    });
    if (k === 'agent') ask('New agent', [
      { name: 'name', label: 'Agent name', ph: 'Prompt Engineer' },
      { name: 'type', label: 'Type (worker | supervisor)', ph: 'worker' }
    ], v => {
      const t = /sup/i.test(v.type) ? 'supervisor' : 'worker';
      db.departments.find(x => x.id === b.dataset.dept).lanes.find(x => x.id === b.dataset.lane)
        .agents.push({ id: uid('a'), name: v.name, type: t, files: agentFiles(v.name, t) });
      save(); render();
    });
  }));
}
/* === dashboard entry (studio shell) — boots after all functions defined === */
const root = document.getElementById('app');
if (root) {
  addEventListener('hashchange', render);
  render();
}


/* === landing interactions (ported from script.js) === */
/* Gem Studio · landing interactions */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = document.querySelectorAll('[data-reveal]');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = entry.target.dataset.delay || 0;
      entry.target.style.transitionDelay = `${delay}ms`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.classList.toggle('is-open');
    mainNav.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuToggle.classList.remove('is-open');
    mainNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }));
}

const dialog = document.querySelector('#command-dialog');
const openCommand = document.querySelector('[data-command-open]');
const closeCommand = document.querySelector('[data-command-close]');
if (dialog && openCommand && closeCommand) {
  openCommand.addEventListener('click', () => dialog.showModal());
  closeCommand.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.querySelectorAll('[data-command-link]').forEach((link) => link.addEventListener('click', () => dialog.close()));
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      dialog.open ? dialog.close() : dialog.showModal();
    }
    if (event.key === 'Escape' && dialog.open) dialog.close();
  });
}

const signalTabs = document.querySelectorAll('.signal-tab');
const boardCards = document.querySelectorAll('.board-card');
const boardStatus = document.querySelector('#board-status');
signalTabs.forEach((tab) => tab.addEventListener('click', () => {
  const filter = tab.dataset.filter;
  signalTabs.forEach((item) => item.classList.toggle('is-active', item === tab));
  boardCards.forEach((card) => card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.signal !== filter));
  const visibleCount = [...boardCards].filter((card) => !card.classList.contains('is-hidden')).length;
  if (boardStatus) boardStatus.textContent = `Showing ${visibleCount} signal card${visibleCount === 1 ? '' : 's'}`;
}));

const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow && window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
  window.addEventListener('pointermove', (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
    cursorGlow.style.opacity = '1';
  }, { passive: true });
}
