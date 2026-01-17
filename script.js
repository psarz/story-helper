// Storage key for localStorage
const STORAGE_KEY = 'storyHelperStories';
const FLAGGED_KEY = 'storyHelperFlagged';
const ADMIN_PASSWORD = 'admin123'; // Site owner can change this
let currentStoryId = null;
let adminUnlocked = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadAndDisplayStories();
    setupFormListener();
    setupCharCounter();
    setupBackButton();
    setupGuideButton();
    setupAdminButton();
});

// Setup guide button
function setupGuideButton() {
    const guideBtn = document.getElementById('guideBtn');
    const guideModal = document.getElementById('guideModal');
    const closeGuideBtn = document.getElementById('closeGuideBtn');

    guideBtn.addEventListener('click', () => {
        guideModal.classList.add('active');
    });

    closeGuideBtn.addEventListener('click', () => {
        guideModal.classList.remove('active');
    });

    guideModal.addEventListener('click', (e) => {
        if (e.target === guideModal) {
            guideModal.classList.remove('active');
        }
    });
}

// Setup admin button
function setupAdminButton() {
    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('adminModal');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminPassword = document.getElementById('adminPassword');

    adminBtn.addEventListener('click', () => {
        adminModal.classList.add('active');
        adminUnlocked = false;
    });

    closeAdminBtn.addEventListener('click', () => {
        adminModal.classList.remove('active');
        adminUnlocked = false;
    });

    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.classList.remove('active');
            adminUnlocked = false;
        }
    });

    adminLoginBtn.addEventListener('click', () => {
        if (adminPassword.value === ADMIN_PASSWORD) {
            adminUnlocked = true;
            displayModerationPanel();
            adminPassword.value = '';
        } else {
            alert('Incorrect password');
            adminPassword.value = '';
        }
    });

    adminPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            adminLoginBtn.click();
        }
    });
}

// Display moderation panel
function displayModerationPanel() {
    const adminPanel = document.getElementById('adminPanel');
    const stories = getStories();
    const flaggedIds = getFlaggedStories();

    if (stories.length === 0) {
        adminPanel.innerHTML = '<p>No stories to moderate.</p>';
        return;
    }

    let html = '<div class="admin-content"><h3>Stories to Moderate</h3>';

    stories.forEach(story => {
        const isFlagged = flaggedIds.includes(story.id);
        const flaggedClass = isFlagged ? 'style="background-color: #ffebee;"' : '';

        html += `
            <div class="moderation-story" ${flaggedClass}>
                <h4>${escapeHtml(story.title)}</h4>
                <div class="story-preview">${escapeHtml(story.content.substring(0, 100))}</div>
                <div style="font-size: 0.85em; color: #666; margin-bottom: 8px;">
                    ${story.timestamp} | ${story.ratings.length} ratings | ${isFlagged ? '⚠️ FLAGGED' : '✓ OK'}
                </div>
                <div class="moderation-actions">
                    <button class="btn-delete" onclick="deleteStory(${story.id})">🗑️ Delete Story</button>
                    ${isFlagged 
                        ? `<button class="btn-flag" onclick="unflagStory(${story.id})">✓ Unflag</button>` 
                        : `<button class="btn-flag" onclick="flagStory(${story.id})">⚠️ Flag for Review</button>`
                    }
                </div>
            </div>
        `;
    });

    html += '</div>';
    adminPanel.innerHTML = html;
}

// Form submission handler
function setupFormListener() {
    const form = document.getElementById('storyForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitStory();
    });
}

// Page navigation
function navigateToFeed() {
    document.getElementById('feedPage').classList.add('active');
    document.getElementById('storyPage').classList.remove('active');
    currentStoryId = null;
    loadAndDisplayStories();
}

function navigateToStory(storyId) {
    currentStoryId = storyId;
    displayStoryDetail(storyId);
    document.getElementById('feedPage').classList.remove('active');
    document.getElementById('storyPage').classList.add('active');
    window.scrollTo(0, 0);
}

// Submit a new story
function submitStory() {
    const title = document.getElementById('storyTitle').value.trim();
    const content = document.getElementById('storyContent').value.trim();

    if (!title || !content) {
        alert('Please fill in all fields');
        return;
    }

    const stories = getStories();
    const newStory = {
        id: Date.now(),
        title: title,
        content: content,
        timestamp: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        ratings: [],
        userRated: false
    };

    stories.unshift(newStory);
    saveStories(stories);

    // Clear form and show success message
    document.getElementById('storyForm').reset();
    document.getElementById('charCount').textContent = '0';
    
    const successMsg = document.getElementById('successMessage');
    successMsg.textContent = '✓ Story published successfully!';
    setTimeout(() => {
        successMsg.textContent = '';
    }, 3000);

    loadAndDisplayStories();
}

// Get all stories from localStorage
function getStories() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save stories to localStorage
function saveStories(stories) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}

// Load and display all stories
function loadAndDisplayStories() {
    const stories = getStories();
    const container = document.getElementById('storiesContainer');
    const count = document.getElementById('storyCount');
    const flaggedIds = getFlaggedStories();

    // Filter out flagged stories for regular users
    const visibleStories = stories.filter(s => !flaggedIds.includes(s.id));

    count.textContent = visibleStories.length;

    if (visibleStories.length === 0) {
        container.innerHTML = '<p class="empty-state">No stories yet. Be the first to share! 📝</p>';
        return;
    }

    container.innerHTML = visibleStories.map(story => createStoryCard(story)).join('');
}

// Create HTML for a story card
function createStoryCard(story) {
    const avgRating = getAverageRating(story);
    const ratingDisplay = avgRating > 0 
        ? `<span class="rating-badge">${avgRating.toFixed(1)}</span>`
        : `<span class="rating-badge no-votes">—</span>`;

    const ratingCount = story.ratings.length;
    const countText = ratingCount === 0 
        ? 'No ratings' 
        : `${ratingCount} rating${ratingCount !== 1 ? 's' : ''}`;

    // Create preview text
    const previewText = story.content.substring(0, 150) + (story.content.length > 150 ? '...' : '');

    return `
        <div class="story-card" onclick="navigateToStory(${story.id})">
            <div class="story-header">
                <div class="story-title">${escapeHtml(story.title)}</div>
                <div class="story-meta">
                    <span>📅 ${story.timestamp}</span>
                    <span>📝 ${story.content.length} chars</span>
                </div>
            </div>
            <div class="story-preview">${escapeHtml(previewText)}</div>
            <div class="story-footer">
                <div class="rating-display">
                    ${ratingDisplay}
                    <span class="rating-count">${countText}</span>
                </div>
                <div class="rating-control">
                    <input 
                        type="number" 
                        class="rating-input" 
                        min="1" 
                        max="10" 
                        value="5"
                        aria-label="Rate this story"
                        onclick="event.stopPropagation()"
                    >
                    <button class="btn-rate" data-story-id="${story.id}" onclick="event.stopPropagation(); rateStory(${story.id}, this)">⭐ Rate</button>
                </div>
            </div>
        </div>
    `;
}

// Rate a story
function rateStory(storyId, buttonElement) {
    const ratingInput = buttonElement.previousElementSibling;
    const rating = parseInt(ratingInput.value);

    if (rating < 1 || rating > 10 || !Number.isInteger(rating)) {
        alert('Please enter a rating between 1 and 10');
        return;
    }

    const stories = getStories();
    const story = stories.find(s => s.id === storyId);

    if (story) {
        story.ratings.push(rating);
        saveStories(stories);
        
        // Update the display
        if (currentStoryId === storyId) {
            displayStoryDetail(storyId);
        } else {
            loadAndDisplayStories();
        }
        
        ratingInput.value = '5';
    }
}

// Display detailed story view
function displayStoryDetail(storyId) {
    const stories = getStories();
    const story = stories.find(s => s.id === storyId);

    if (!story) {
        navigateToFeed();
        return;
    }

    const avgRating = getAverageRating(story);
    const ratingCount = story.ratings.length;

    let ratingStatsHtml = '';
    if (ratingCount > 0) {
        const minRating = Math.min(...story.ratings);
        const maxRating = Math.max(...story.ratings);
        
        ratingStatsHtml = `
            <div class="rating-stats">
                <div class="stat-box">
                    <div class="stat-value">${avgRating.toFixed(1)}</div>
                    <div class="stat-label">Average Rating</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${ratingCount}</div>
                    <div class="stat-label">Total Rating${ratingCount !== 1 ? 's' : ''}</div>
                </div>
            </div>
        `;
    }

    const detailHtml = `
        <div class="story-detail">
            <h1>${escapeHtml(story.title)}</h1>
            <div class="story-meta">
                <span>📅 Posted on ${story.timestamp}</span>
                <span>📝 ${story.content.length} characters</span>
            </div>
            <div class="story-content">
                ${escapeHtml(story.content)}
            </div>
            <div class="rating-section">
                <h3>⭐ Ratings & Reviews</h3>
                ${ratingStatsHtml}
                <div class="rating-control" style="margin-top: 15px;">
                    <input 
                        type="number" 
                        class="rating-input" 
                        id="detailRatingInput"
                        min="1" 
                        max="10" 
                        value="5"
                        aria-label="Rate this story"
                    >
                    <button class="btn-rate" onclick="rateStoryDetail(${storyId})">⭐ Submit Rating</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('storyDetailContent').innerHTML = detailHtml;
}

// Rate from detail view
function rateStoryDetail(storyId) {
    const ratingInput = document.getElementById('detailRatingInput');
    const rating = parseInt(ratingInput.value);

    if (rating < 1 || rating > 10 || !Number.isInteger(rating)) {
        alert('Please enter a rating between 1 and 10');
        return;
    }

    const stories = getStories();
    const story = stories.find(s => s.id === storyId);

    if (story) {
        story.ratings.push(rating);
        saveStories(stories);
        displayStoryDetail(storyId);
        ratingInput.value = '5';
    }
}

// Calculate average rating
function getAverageRating(story) {
    if (story.ratings.length === 0) return 0;
    const sum = story.ratings.reduce((a, b) => a + b, 0);
    return sum / story.ratings.length;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get flagged stories
function getFlaggedStories() {
    const flagged = localStorage.getItem(FLAGGED_KEY);
    return flagged ? JSON.parse(flagged) : [];
}

// Save flagged stories
function saveFlaggedStories(flaggedIds) {
    localStorage.setItem(FLAGGED_KEY, JSON.stringify(flaggedIds));
}

// Flag a story for review
function flagStory(storyId) {
    const flaggedIds = getFlaggedStories();
    if (!flaggedIds.includes(storyId)) {
        flaggedIds.push(storyId);
        saveFlaggedStories(flaggedIds);
        displayModerationPanel();
    }
}

// Unflag a story
function unflagStory(storyId) {
    let flaggedIds = getFlaggedStories();
    flaggedIds = flaggedIds.filter(id => id !== storyId);
    saveFlaggedStories(flaggedIds);
    displayModerationPanel();
}

// Delete a story (admin only)
function deleteStory(storyId) {
    if (!confirm('Are you sure you want to delete this story? This cannot be undone.')) {
        return;
    }

    let stories = getStories();
    stories = stories.filter(s => s.id !== storyId);
    saveStories(stories);

    // Also remove from flagged list
    let flaggedIds = getFlaggedStories();
    flaggedIds = flaggedIds.filter(id => id !== storyId);
    saveFlaggedStories(flaggedIds);

    displayModerationPanel();
    loadAndDisplayStories();
}
