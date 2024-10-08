// Not at the moment --> https://docs.google.com/document/d/1aTY8vtHXxVROZyldSZ051JbU3wNq1N7ZW0g1w1fj1Wg/edit?usp=sharing

const darkModeBtn = document.getElementById('darkModeBtn');
let currentAssignmentId = '';

// Password configurations
const passwordConfigs = {
    'hughug2': {
        incorrect: 'mathewthomas',
        correctUrl: 'https://docs.google.com/document/d/1aTY8vtHXxVROZyldSZ051JbU3wNq1N7ZW0g1w1fj1Wg/edit?usp=sharing',
        wrongUrl: 'https://www.youtube.com/watch?v=oefAI2x2CQM'
    },
    'u2hw9alg2': {
        incorrect: 'kulkarni29',
        correctUrl: 'https://docs.google.com/document/d/1aTY8vtHXxVROZyldSZ051JbU3wNq1N7ZW0g1w1fj1Wg/edit?usp=sharing',
        wrongUrl: 'https://www.youtube.com/watch?v=PMCCFtpZXpI'
    },
    '912dj': {
        incorrect: 'diabolicaljournals129',
        correctUrl: 'https://docs.google.com/document/d/1aTY8vtHXxVROZyldSZ051JbU3wNq1N7ZW0g1w1fj1Wg/edit?usp=sharing',
        wrongUrl: 'https://jeroo.org/docs/JerooDocJava.pdf'
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
        if (password === config.incorrect) {
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
