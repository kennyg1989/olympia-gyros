// Mobile menu toggle
const toggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.classList.toggle('active');
  toggle.setAttribute('aria-expanded', open);
});

// Close mobile menu on link click
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

// Header scroll shadow
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Menu category tabs
const tabs = document.querySelectorAll('.menu-tab');
const cards = document.querySelectorAll('.menu-card');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const category = tab.dataset.category;

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    cards.forEach(card => {
      if (card.dataset.category === category) {
        card.hidden = false;
      } else {
        card.hidden = true;
      }
    });
  });
});

// Menu tabs scroll fade indicator
const tabsContainer = document.querySelector('.menu-tabs');
const tabsWrapper = document.querySelector('.menu-tabs-wrapper');
if (tabsContainer && tabsWrapper) {
  tabsContainer.addEventListener('scroll', () => {
    const atEnd = tabsContainer.scrollLeft + tabsContainer.clientWidth >= tabsContainer.scrollWidth - 10;
    const atStart = tabsContainer.scrollLeft > 10;
    tabsWrapper.classList.toggle('scrolled-end', atEnd);
    tabsWrapper.classList.toggle('scrolled-start', atStart);
  }, { passive: true });
}

// Show featured by default
document.querySelector('.menu-tab[data-category="featured"]').click();

// Hide sticky order button when hero order button is visible
const heroActions = document.querySelector('.hero-actions');
const stickyOrder = document.querySelector('.sticky-order');

if (heroActions && stickyOrder) {
  const observer = new IntersectionObserver(([entry]) => {
    stickyOrder.style.transform = entry.isIntersecting ? 'translateY(100%)' : 'translateY(0)';
    stickyOrder.style.transition = 'transform 300ms ease';
  }, { threshold: 0 });
  observer.observe(heroActions);
}
