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
