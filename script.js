// Storage key for localStorage
const STORAGE_KEY = 'storyHelperStories';
const FLAGGED_KEY = 'storyHelperFlagged';
const ADMIN_PASSWORD = 'admin123'; // Site owner can change this
const SAMPLE_STORIES_KEY = 'sampleStoriesAdded';
let currentStoryId = null;
let adminUnlocked = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    addSampleStoriesIfNeeded();
    loadAndDisplayStories();
    setupFormListener();
    setupCharCounter();
    setupBackButton();
    setupGuideButton();
    setupAdminButton();
});

// Add sample stories on first visit
function addSampleStoriesIfNeeded() {
    if (localStorage.getItem(SAMPLE_STORIES_KEY)) {
        return; // Already added
    }

    const sampleStories = [
        {
            id: Date.now() - 100000,
            title: "The Last Library",
            content: `In the year 2087, when books existed only in digital form and paper was a forgotten memory, Maya discovered something extraordinary in her grandmother's attic.

A real book. Bound in leather, its pages yellowed but intact. The title read "The Lord of the Rings."

She had never seen one before. Her generation read on screens—immersive, interactive, but somehow soulless. This object felt different. It had weight. Substance. History.

That night, she opened it. The words drew her in like nothing digital ever had. The prose painted vivid pictures in her mind. She wasn't just reading; she was experiencing another world, transported by the author's carefully chosen words.

By morning, she had read fifty pages without stopping. Her eyes were tired, but her heart was alive.

Maya realized then that some things—real, tangible, thoughtfully created—could never be replaced by technology. There was magic in the old ways, in the quiet act of reading by lamplight, turning physical pages, discovering words that had survived generations.

She decided then: she would find more books. She would read them. And when she was older, she would share this magic with others who had forgotten it existed.

The last library, she thought, smiling, would be rebuilt one reader at a time.`,
            timestamp: new Date(Date.now() - 100000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            ratings: [9, 8, 10, 9, 7]
        },
        {
            id: Date.now() - 200000,
            title: "A Cup of Tea",
            content: `The café smelled of cinnamon and old wood. Sarah sat in the corner booth, the same one she'd occupied every Tuesday morning for the past five years.

The barista, Marco, already had her order ready. Chamomile tea with honey. He knew her better than her own family did at this point.

Today felt different, though. Today, Sarah had made a decision.

She had spent twenty years in a job she hated. Twenty years pretending to be someone she wasn't. Twenty years saying "yes" when she meant "no."

But not anymore.

As she wrapped her hands around the warm cup, a sense of peace washed over her. The tea was perfectly steeped—not too strong, not too weak. Just right. Like everything would be, from now on.

Marco walked by and smiled. "You look happy," he said. "Happier than usual."

Sarah smiled back. "I am, actually. I just made a decision. I'm quitting my job next week."

Marco set down a plate of complimentary biscuits. "Good for you. Life's too short for jobs you hate."

As she sipped her tea, Sarah watched the morning light stream through the café windows. Outside, the world looked full of possibilities. Her hands were shaking—not from fear, but from excitement.

This cup of tea had become more than just a ritual. It was a marker. Before this moment, and after it.

Sometimes, Sarah thought, the biggest decisions come in the quietest moments.`,
            timestamp: new Date(Date.now() - 200000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            ratings: [8, 9, 8, 10]
        },
        {
            id: Date.now() - 300000,
            title: "The Letter",
            content: `It had been three years since the funeral. Three years since anyone had seen inside her father's desk drawer.

His letter sat on top—cream-colored envelope, his handwriting sprawled across it: "To be opened when you stop running from yourself."

Elena had found it by accident while moving. Her first instinct was to throw it away. She wasn't ready. She didn't know if she'd ever be ready.

But the words on the envelope stayed with her for weeks.

One rainy afternoon, sitting alone in her apartment, she finally opened it.

Her father had always seen through her masks. Even as a child, when she pretended to be happy, he knew. When she claimed to be fine after her first heartbreak, he knew.

The letter was long—pages and pages of careful, loving handwriting. He wrote about the mistakes he'd made. About how he'd wish he'd told her certain things while he was alive. About how proud he was of her, even when she didn't believe in herself.

And then came the part that made her cry:

"The person you're meant to be is already inside you. Stop running from her. She's worth knowing."

Elena read the letter three times that day. Then again the next day. And the day after.

Her father had seen her truth before she ever could. And even after death, his words reached her, wrapped around her like an embrace, telling her that it was finally okay to be herself.

She framed the letter. And the next morning, she woke up and did something different: she stopped running.`,
            timestamp: new Date(Date.now() - 300000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            ratings: [10, 9, 10]
        }
    ];

    const currentStories = getStories();
    const allStories = [...sampleStories, ...currentStories];
    saveStories(allStories);
    localStorage.setItem(SAMPLE_STORIES_KEY, 'true');
}

// Setup guide button
function setupGuideButton() {
    const guideBtn = document.getElementById('guideBtn');
    const guideModal = document.getElementById('guideModal');
    const closeGuideBtn = document.getElementById('closeGuideBtn');

    guideBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
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

    adminBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        adminModal.classList.add('active');
        adminUnlocked = false;
        adminPassword.value = '';
    });

    closeAdminBtn.addEventListener('click', () => {
        adminModal.classList.remove('active');
        adminUnlocked = false;
        adminPassword.value = '';
    });

    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.classList.remove('active');
            adminUnlocked = false;
            adminPassword.value = '';
        }
    });

    adminLoginBtn.addEventListener('click', () => {
        if (adminPassword.value === ADMIN_PASSWORD) {
            adminUnlocked = true;
            displayModerationPanel();
            adminPassword.value = '';
        } else {
            alert('❌ Incorrect password');
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

    let html = `
        <div class="admin-content">
            <h3 style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                Stories to Moderate
                <span style="font-size: 0.8em; color: #666;">Total: ${stories.length} | Flagged: ${flaggedIds.length}</span>
            </h3>
    `;

    stories.forEach((story, index) => {
        const isFlagged = flaggedIds.includes(story.id);
        const flaggedClass = isFlagged ? 'background-color: #ffebee; border-left: 4px solid #ff4444;' : '';

        html += `
            <div class="moderation-story" style="${flaggedClass}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <h4 style="margin: 0; flex: 1;">${index + 1}. ${escapeHtml(story.title)}</h4>
                    ${isFlagged ? '<span style="background: #ff4444; color: white; padding: 4px 8px; border-radius: 3px; font-size: 0.75em; font-weight: bold;">⚠️ FLAGGED</span>' : ''}
                </div>
                <div class="story-preview" style="margin: 0 0 12px 0; padding: 0; line-height: 1.5; color: #666;">${escapeHtml(story.content.substring(0, 120))}...</div>
                <div style="font-size: 0.85em; color: #999; margin-bottom: 12px; display: flex; gap: 15px;">
                    <span>📅 ${story.timestamp}</span>
                    <span>⭐ ${story.ratings.length} ratings</span>
                    <span>📝 ${story.content.length} chars</span>
                </div>
                <div class="moderation-actions">
                    <button class="btn-delete" onclick="deleteStory(${story.id})">🗑️ Delete</button>
                    ${isFlagged 
                        ? `<button class="btn-flag" onclick="unflagStory(${story.id})" style="background: #4caf50;">✓ Unflag</button>` 
                        : `<button class="btn-flag" onclick="flagStory(${story.id})">⚠️ Flag</button>`
                    }
                    <button class="btn-flag" onclick="viewStoryAsAdmin(${story.id})" style="background: #2196F3;">👁️ View</button>
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
                ${escapeHtml(story.content).split('\n\n').join('</p><p>')}
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

// View story from admin panel
function viewStoryAsAdmin(storyId) {
    const adminModal = document.getElementById('adminModal');
    adminModal.classList.remove('active');
    navigateToStory(storyId);
}
