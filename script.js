// Storage key for localStorage
const STORAGE_KEY = 'storyHelperStories';
let currentStoryId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadAndDisplayStories();
    setupFormListener();
    setupCharCounter();
    setupBackButton();
});

// Setup back button
function setupBackButton() {
    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', () => {
        navigateToFeed();
    });
}

// Form submission handler
function setupFormListener() {
    const form = document.getElementById('storyForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitStory();
    });
}

// Character counter for textarea
function setupCharCounter() {
    const textarea = document.getElementById('storyContent');
    textarea.addEventListener('input', () => {
        document.getElementById('charCount').textContent = textarea.value.length;
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

    count.textContent = stories.length;

    if (stories.length === 0) {
        container.innerHTML = '<p class="empty-state">No stories yet. Be the first to share! 📝</p>';
        return;
    }

    container.innerHTML = stories.map(story => createStoryCard(story)).join('');
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
