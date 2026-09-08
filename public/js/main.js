document.addEventListener('DOMContentLoaded', () => {
  // Navigation elements
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const menuIcon = document.getElementById('menuIcon');
  const mobileMenu = document.getElementById('mobileMenu');

  const searchToggleBtn = document.getElementById('searchToggleBtn');
  const mobileSearchSubbar = document.getElementById('mobileSearchSubbar');
  const searchInputMobile = document.getElementById('searchInputMobile');

  // Toggle Mobile Hamburger Menu
  if (menuToggleBtn && mobileMenu) {
    menuToggleBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.toggle('hidden');
      menuIcon.className = isHidden ? 'fas fa-bars text-base' : 'fas fa-xmark text-base';
      if (!isHidden && mobileSearchSubbar) {
        mobileSearchSubbar.classList.add('hidden'); // Close search subbar if menu opens
      }
    });
  }

  // Toggle Mobile Search Sub-Bar
  if (searchToggleBtn && mobileSearchSubbar) {
    searchToggleBtn.addEventListener('click', () => {
      const isHidden = mobileSearchSubbar.classList.toggle('hidden');
      if (!isHidden) {
        if (mobileMenu) {
          mobileMenu.classList.add('hidden'); // Close main menu if search opens
          menuIcon.className = 'fas fa-bars text-base';
        }
        if (searchInputMobile) searchInputMobile.focus();
      }
    });
  }

  // Auto-hide / reveal navbar on scroll
  const navbar = document.getElementById('mainNavbar');
  let lastScrollY = window.scrollY;

  if (navbar) {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      // Don't hide navbar near the top of the page
      if (currentScrollY < 50) {
        navbar.classList.remove('-translate-y-full');
        lastScrollY = currentScrollY;
        return;
      }

      // Scrolling down -> Hide navbar
      if (currentScrollY > lastScrollY) {
        navbar.classList.add('-translate-y-full');
      } 
      // Scrolling up -> Reveal navbar
      else {
        navbar.classList.remove('-translate-y-full');
      }

      lastScrollY = currentScrollY;
    });
  }

  // Initialize Kickoff Countdown
  initCountdown();
});

/**
 * Handles the live kickoff countdown timer calculation
 */
function initCountdown() {
  const countdownEl = document.getElementById('gameCountdown');
  if (!countdownEl) return;

  const targetDateStr = countdownEl.getAttribute('data-start-date');
  if (!targetDateStr) return;

  const targetTime = new Date(targetDateStr).getTime();
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 60000); // Update every minute
}