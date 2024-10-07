const darkModeBtn = document.getElementById('darkModeBtn');
let currentAssignmentId = '';

// Password configurations
const passwordConfigs = {
    'bio-lab': {
        password: 'biology2024',
        correctUrl: 'https://example.com/biology-resources',
        wrongUrl: 'https://example.com/study-tips'
    },
    'geo-essay': {
        password: 'geography2024',
        correctUrl: 'https://example.com/geography-resources',
        wrongUrl: 'https://example.com/essay-writing-tips'
    },
    'math-project': {
        password: 'algebra2024',
        correctUrl: 'https://example.com/math-resources',
        wrongUrl: 'https://example.com/math-practice'
    }
};

// Show password prompt
function showPasswordPrompt(assignmentId) {
    const modal = document.getElementById('passwordPrompt');
    modal.classList.remove('hidden');
    currentAssignmentId = assignmentId;
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
}

// Close password prompt
function closePasswordPrompt() {
    const modal = document.getElementById('passwordPrompt');
    modal.classList.add('hidden');
}

// Handle password submission
document.getElementById('submitPassword').addEventListener('click', () => {
    const password = document.getElementById('passwordInput').value;
    const config = passwordConfigs[currentAssignmentId];
    
    if (config) {
        if (password === config.password) {
            window.location.href = config.correctUrl;
        } else {
            window.location.href = config.wrongUrl;
        }
    }
    
    closePasswordPrompt();
});

// Dark mode toggle
darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
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
