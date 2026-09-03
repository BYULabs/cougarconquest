document.addEventListener('DOMContentLoaded', () => {
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const menuIcon = document.getElementById('menuIcon');
  const mobileMenu = document.getElementById('mobileMenu');

  const searchToggleBtn = document.getElementById('searchToggleBtn');
  const mobileSearchSubbar = document.getElementById('mobileSearchSubbar');
  const searchInputMobile = document.getElementById('searchInputMobile');
  const searchInputDesktop = document.getElementById('searchInputDesktop');

  // Toggle Hamburger Menu
  if (menuToggleBtn && mobileMenu) {
    menuToggleBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.toggle('hidden');
      menuIcon.className = isHidden ? 'fas fa-bars text-base' : 'fas fa-xmark text-base';
      if (!isHidden) mobileSearchSubbar.classList.add('hidden'); // Close search subbar if menu opens
    });
  }

  // Toggle Search Sub-Bar on Mobile
  if (searchToggleBtn && mobileSearchSubbar) {
    searchToggleBtn.addEventListener('click', () => {
      const isHidden = mobileSearchSubbar.classList.toggle('hidden');
      if (!isHidden) {
        mobileMenu.classList.add('hidden'); // Close main menu if search opens
        menuIcon.className = 'fas fa-bars text-base';
        searchInputMobile.focus();
      }
    });
  }

  // Sync mobile & desktop search inputs to feed filter logic[cite: 3]
  const handleSearch = (e) => {
    if (typeof searchQuery !== 'undefined' && typeof renderFeed === 'function') {
      searchQuery = e.target.value.toLowerCase().trim(); //[cite: 3]
      renderFeed(); //[cite: 3]
    }
  };

  if (searchInputDesktop) searchInputDesktop.addEventListener('input', handleSearch);
  if (searchInputMobile) searchInputMobile.addEventListener('input', handleSearch);
});

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('mainNavbar');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Don't hide navbar if scrolled near the top of the page
    if (currentScrollY < 50) {
      navbar.classList.remove('-translate-y-full');
      lastScrollY = currentScrollY;
      return;
    }

    // Scrolling down -> Hide navbar
    if (currentScrollY > lastScrollY) {
      navbar.classList.add('-translate-y-full');
    } 
    // Scrolling up -> Show navbar
    else {
      navbar.classList.remove('-translate-y-full');
    }

    lastScrollY = currentScrollY;
  });
});

// Local client state for interactive posts and social feed
let posts = [
  {
    id: 1,
    username: '@CougarFan99',
    avatar: 'CF',
    avatarGradient: 'from-byuNavy to-byuRoyal',
    timestamp: '2h ago',
    opponent: 'Utah Utes',
    category: 'holy-war',
    content: "This is the year we take back the Holy War! Our defense is lockdown and the offense is rolling on all cylinders.",
    byuScore: 31,
    oppScore: 24,
    likes: 47,
    liked: false,
    comments: 12,
  },
  {
    id: 2,
    username: '@ZoobieBlue',
    avatar: 'ZB',
    avatarGradient: 'from-byuRoyal to-cyan-400',
    timestamp: '5h ago',
    opponent: 'TCU Horned Frogs',
    category: 'big-12',
    content: "TCU on the road is going to be a massive test for this squad. Big 12 road win incoming!",
    byuScore: 27,
    oppScore: 20,
    likes: 23,
    liked: false,
    comments: 6,
  }
];

let nextId = 3;
let currentFilter = 'all';
let searchQuery = '';
let editingId = null;

// Notification Toast helper
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-byuRoyal' : 'bg-red-500';
  const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
  toast.className = `fixed bottom-6 right-6 z-50 ${bg} text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-2xl transform translate-y-20 opacity-0 transition-all duration-300 flex items-center gap-2`;
  toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-20', 'opacity-0');
  });
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    setTimeout(() => { toast.remove(); }, 300);
  }, 2500);
}

/**
 * Dynamically populates opponent select options based on the schedule cards rendered by EJS
 */
function populateOpponentDropdownFromDOM() {
  const select = document.getElementById('postOpponent');
  if (!select) return;

  // Extract unique opponents from rendered schedule cards in conquestGrid
  const scheduleOpponents = Array.from(document.querySelectorAll('#conquestGrid span'))
    .map(el => el.textContent.trim())
    .filter(Boolean);

  const uniqueOpponents = [...new Set(scheduleOpponents)];

  if (uniqueOpponents.length > 0) {
    select.innerHTML = '<option value="">Select Opponent</option>' +
      uniqueOpponents.map(name => `<option value="${name}">${name}</option>`).join('');
  }
}

function createPostCard(post) {
  const isEditing = editingId === post.id;

  const contentHTML = isEditing
    ? `<textarea id="editTextarea-${post.id}" class="w-full bg-[#001528] border border-byuRoyal/40 rounded-lg p-3 text-sm text-gray-200 resize-none focus:outline-none focus:border-byuRoyal focus:ring-1 focus:ring-byuRoyal transition" rows="3">${post.content}</textarea>`
    : `<p class="text-gray-300 leading-relaxed text-sm sm:text-base mb-3">${post.content}</p>`;

  const predictionHTML = (post.byuScore !== null && post.byuScore !== undefined)
    ? `<div class="inline-flex items-center gap-2 bg-byuNavy/60 border border-byuRoyal/30 rounded-full px-3 py-1.5 mb-3">
         <i class="fas fa-chart-line text-byuRoyal text-xs"></i>
         <span class="text-[10px] font-bold text-byuRoyal uppercase tracking-wide">Prediction</span>
         <span class="font-bold text-white text-sm">BYU ${post.byuScore} — ${post.oppScore} ${post.opponent}</span>
       </div>`
    : '';

  const likeClass = post.liked ? 'text-red-500' : 'text-gray-500';
  const likeIcon = post.liked ? 'fas' : 'far';

  return `
    <article class="post-card animate-fadeIn bg-gradient-to-br from-[#00375E]/70 to-byuNavy/40 border border-white/10 rounded-2xl p-5 mb-4" data-post-id="${post.id}">
      <div class="flex items-start gap-3 sm:gap-4">
        <div class="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br ${post.avatarGradient} flex items-center justify-center font-bold text-sm text-white border-2 border-white/10">${post.avatar}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-2">
            <span class="font-bold text-white text-sm sm:text-base">${post.username}</span>
            <span class="text-gray-500 text-xs">· ${post.timestamp}</span>
            <span class="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-xs font-semibold">
              <span class="text-gray-300">${post.opponent}</span>
            </span>
          </div>
          ${contentHTML}
          ${predictionHTML}
          <div class="flex items-center gap-4 sm:gap-6 text-sm">
            <button onclick="toggleLike(${post.id})" class="like-btn flex items-center gap-1.5 ${likeClass} hover:text-red-400 transition">
              <i class="${likeIcon} fa-heart"></i>
              <span class="like-count font-medium">${post.likes}</span>
            </button>
            <button class="flex items-center gap-1.5 text-gray-500 hover:text-byuRoyal transition">
              <i class="far fa-comment"></i>
              <span class="font-medium">${post.comments}</span>
            </button>
            <div class="flex items-center gap-3 sm:gap-4 ml-auto">
              <button onclick="toggleEdit(${post.id})" class="text-gray-500 hover:text-byuRoyal transition" title="${isEditing ? 'Save' : 'Edit'}">
                <i class="fas ${isEditing ? 'fa-check text-green-400' : 'fa-pen-to-square'}"></i>
              </button>
              <button onclick="deletePost(${post.id})" class="text-gray-500 hover:text-red-400 transition" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>`;
}

function renderFeed() {
  let filtered = posts.slice();

  if (currentFilter === 'holy-war') {
    filtered = filtered.filter(p => p.opponent.toLowerCase().includes('utah'));
  } else if (currentFilter === 'predictions') {
    filtered = filtered.filter(p => p.byuScore !== null && p.byuScore !== undefined);
  }

  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.opponent.toLowerCase().includes(searchQuery) ||
      p.content.toLowerCase().includes(searchQuery) ||
      p.username.toLowerCase().includes(searchQuery)
    );
  }

  const timeline = document.getElementById('feedTimeline');
  if (!timeline) return;

  if (filtered.length === 0) {
    timeline.innerHTML = `
      <div class="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
        <i class="fas fa-football text-5xl text-gray-700 mb-4"></i>
        <p class="text-gray-500 font-medium">No posts found.</p>
        <p class="text-gray-600 text-sm mt-1">Be the first to share your hype!</p>
      </div>`;
  } else {
    timeline.innerHTML = filtered.map(createPostCard).join('');
  }

  updateStats();
}

function updateStats() {
  const totalPostsEl = document.getElementById('totalPosts');
  const totalPredsEl = document.getElementById('totalPredictions');
  
  if (totalPostsEl) totalPostsEl.textContent = posts.length;
  if (totalPredsEl) totalPredsEl.textContent = posts.filter(p => p.byuScore !== null && p.byuScore !== undefined).length;
}

function submitPost() {
  const contentEl = document.getElementById('postContent');
  const opponentEl = document.getElementById('postOpponent');
  const byuScoreEl = document.getElementById('byuScore');
  const oppScoreEl = document.getElementById('oppScore');

  const content = contentEl.value.trim();
  const opponent = opponentEl.value;
  const byuScoreVal = byuScoreEl.value.trim();
  const oppScoreVal = oppScoreEl.value.trim();

  if (!content) {
    showToast('Write your hot take first!', 'error');
    contentEl.focus();
    return;
  }
  if (!opponent) {
    showToast('Select an opponent!', 'error');
    opponentEl.focus();
    return;
  }

  const hasPrediction = byuScoreVal !== '' && oppScoreVal !== '';
  const onlyOneFilled = (byuScoreVal !== '') !== (oppScoreVal !== '');

  if (onlyOneFilled) {
    showToast('Fill in both scores or leave blank!', 'error');
    return;
  }

  const newPost = {
    id: nextId++,
    username: '@CougarFan99',
    avatar: 'C',
    avatarGradient: 'from-amber-400 to-byuRoyal',
    timestamp: 'Just now',
    opponent: opponent,
    category: opponent.toLowerCase().includes('utah') ? 'holy-war' : 'big-12',
    content: content,
    byuScore: hasPrediction ? parseInt(byuScoreVal, 10) : null,
    oppScore: hasPrediction ? parseInt(oppScoreVal, 10) : null,
    likes: 0,
    liked: false,
    comments: 0,
  };

  posts.unshift(newPost);
  renderFeed();

  contentEl.value = '';
  opponentEl.value = '';
  byuScoreEl.value = '';
  oppScoreEl.value = '';

  showToast('Hype posted! Go Cougs! 🔥');
}

function deletePost(id) {
  const card = document.querySelector(`[data-post-id="${id}"]`);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateX(-30px)';
    setTimeout(() => {
      posts = posts.filter(p => p.id !== id);
      renderFeed();
      showToast('Post removed.');
    }, 300);
  }
}

function toggleLike(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;

  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;

  const card = document.querySelector(`[data-post-id="${id}"]`);
  if (card) {
    const likeBtn = card.querySelector('.like-btn');
    const icon = likeBtn.querySelector('i');
    const count = likeBtn.querySelector('.like-count');

    if (post.liked) {
      icon.className = 'fas fa-heart heart-pop';
      likeBtn.classList.remove('text-gray-500');
      likeBtn.classList.add('text-red-500');
    } else {
      icon.className = 'far fa-heart';
      likeBtn.classList.remove('text-red-500');
      likeBtn.classList.add('text-gray-500');
    }
    count.textContent = post.likes;
  }
}

function toggleEdit(id) {
  if (editingId === id) {
    const textarea = document.getElementById(`editTextarea-${id}`);
    if (textarea) {
      const post = posts.find(p => p.id === id);
      const newContent = textarea.value.trim();
      if (newContent) post.content = newContent;
    }
    editingId = null;
    renderFeed();
    showToast('Post updated!');
  } else {
    editingId = id;
    renderFeed();
    setTimeout(() => {
      const textarea = document.getElementById(`editTextarea-${id}`);
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 50);
  }
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });
  renderFeed();
}

function logPrediction() {
  const target = document.getElementById('postCreator');
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  const contentInput = document.getElementById('postContent');
  if (contentInput) setTimeout(() => contentInput.focus(), 600);
  
  showToast('Ready for your prediction!');
}

function viewHeadToHead() {
  const target = document.getElementById('rivalry');
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Bind Global Window Functions
window.logPrediction = logPrediction;
window.viewHeadToHead = viewHeadToHead;
window.submitPost = submitPost;
window.deletePost = deletePost;
window.toggleLike = toggleLike;
window.toggleEdit = toggleEdit;
window.setFilter = setFilter;

document.addEventListener('DOMContentLoaded', () => {
  populateOpponentDropdownFromDOM();
  renderFeed();

  const searchInput = document.getElementById('searchInput');
  const searchInputMobile = document.getElementById('searchInputMobile');

  const handleSearch = (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    if (searchInput && e.target !== searchInput) searchInput.value = e.target.value;
    if (searchInputMobile && e.target !== searchInputMobile) searchInputMobile.value = e.target.value;
    renderFeed();
  };

  if (searchInput) searchInput.addEventListener('input', handleSearch);
  if (searchInputMobile) searchInputMobile.addEventListener('input', handleSearch);
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
  setInterval(updateCountdown, 60000);
}

// Attach to DOMContentLoaded alongside existing initializations
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
});