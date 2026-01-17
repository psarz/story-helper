// Storage key for localStorage
const STORAGE_KEY = 'storyHelperStories';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadAndDisplayStories();
    setupFormListener();
    setupCharCounter();
});

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
        container.innerHTML = '<p class="empty-state">No stories yet. Be the first to share!</p>';
        return;
    }

    container.innerHTML = stories.map(story => createStoryCard(story)).join('');

    // Attach event listeners to all rate buttons
    document.querySelectorAll('.btn-rate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const storyId = parseInt(e.target.dataset.storyId);
            const rating = parseInt(e.target.previousElementSibling.value);
            rateStory(storyId, rating);
        });
    });
}

// Create HTML for a story card
function createStoryCard(story) {
    const avgRating = getAverageRating(story);
    const ratingDisplay = avgRating > 0 
        ? `<span class="rating-badge">${avgRating.toFixed(1)}</span>`
        : `<span class="rating-badge no-votes">—</span>`;

    const ratingCount = story.ratings.length;
    const countText = ratingCount === 0 
        ? 'No ratings yet' 
        : `${ratingCount} rating${ratingCount !== 1 ? 's' : ''}`;

    return `
        <div class="story-card">
            <div class="story-header">
                <div class="story-title">${escapeHtml(story.title)}</div>
                <div class="story-meta">Posted on ${story.timestamp}</div>
            </div>
            <div class="story-content">${escapeHtml(story.content)}</div>
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
                    >
                    <button class="btn-rate" data-story-id="${story.id}">Rate</button>
                </div>
            </div>
        </div>
    `;
}

// Rate a story
function rateStory(storyId, rating) {
    if (rating < 1 || rating > 10 || !Number.isInteger(rating)) {
        alert('Please enter a rating between 1 and 10');
        return;
    }

    const stories = getStories();
    const story = stories.find(s => s.id === storyId);

    if (story) {
        story.ratings.push(rating);
        saveStories(stories);
        loadAndDisplayStories();
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
