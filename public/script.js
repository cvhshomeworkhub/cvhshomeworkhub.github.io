// Theme handling
function setTheme(theme) {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = document.body.className;
    const newTheme = currentTheme === 'light-mode' ? '' : 'light-mode';
    setTheme(newTheme);
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || '';
    setTheme(savedTheme);
});

// Password handling
let currentAssignmentId = '';

const passwordConfigs = {
    'hughug2': {
        incorrect: 'random',
        correctUrl: 'sample.org',
        wrongUrl: 'sample.com'
    },
    'odyssventure': {
        incorrect: 'random',
        correctUrl: 'sample.org',
        wrongUrl: 'sample.com'
    },
    'u2hw9alg2': {
        incorrect: 'random',
        correctUrl: 'sample.org',
        wrongUrl: 'sample.com'
    },
    '912dj': {
        incorrect: 'random',
        correctUrl: 'sample.org',
        wrongUrl: 'sample.com'
    }
};

function showPasswordPrompt(assignmentId) {
    const modal = document.getElementById('passwordPrompt');
    modal.classList.remove('hidden');
    currentAssignmentId = assignmentId;
    const passwordInput = document.getElementById('passwordInput');
    passwordInput.value = '';
    passwordInput.focus();
}

function closePasswordPrompt() {
    const modal = document.getElementById('passwordPrompt');
    modal.classList.add('hidden');
}

// Event Listeners
document.getElementById('submitPassword')?.addEventListener('click', () => {
    const password = document.getElementById('passwordInput').value;
    const config = passwordConfigs[currentAssignmentId];
    
    if (config) {
        if (password === config.incorrect) {
            window.location.href = config.correctUrl;
        } else {
            window.location.href = config.wrongUrl;
        }
    }
    
    closePasswordPrompt();
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('passwordPrompt');
    if (e.target === modal) {
        closePasswordPrompt();
    }
});

// Handle escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePasswordPrompt();
    }
});
