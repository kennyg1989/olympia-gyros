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
let initialLoad = true;

function filterMenu(category) {
  cards.forEach(card => {
    card.hidden = card.dataset.category !== category;
  });
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Only scroll tab strip on user interaction, not initial load
    if (!initialLoad) {
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    filterMenu(tab.dataset.category);
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

// Show featured by default (without scrolling)
filterMenu('featured');
document.querySelector('.menu-tab[data-category="featured"]').classList.add('active');
initialLoad = false;

// Menu search
const searchInput = document.getElementById('menu-search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();

    if (query === '') {
      // Reset to active tab
      const activeTab = document.querySelector('.menu-tab.active');
      if (activeTab) filterMenu(activeTab.dataset.category);
      return;
    }

    // Deactivate tabs during search
    tabs.forEach(t => t.classList.remove('active'));

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.hidden = !text.includes(query);
    });
  });
}

// About gallery (specials carousel)
const gallery = document.getElementById('specials');
if (gallery) {
  const slides = gallery.querySelectorAll('.gallery-slide');
  const dots = gallery.querySelectorAll('.gallery-dot');
  const prevBtn = gallery.querySelector('.gallery-prev');
  const nextBtn = gallery.querySelector('.gallery-next');
  let current = 0;
  let autoTimer;

  function showSlide(idx) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAuto() {
    autoTimer = setInterval(() => showSlide(current + 1), 10000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  prevBtn.addEventListener('click', () => { showSlide(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { showSlide(current + 1); resetAuto(); });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { showSlide(i); resetAuto(); });
  });

  startAuto();
}

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
