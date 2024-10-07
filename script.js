//not at moment -- https://docs.google.com/document/d/1aTY8vtHXxVROZyldSZ051JbU3wNq1N7ZW0g1w1fj1Wg/edit?usp=sharing

const darkModeBtn = document.getElementById('darkModeBtn');
let currentAssignmentId = '';

// Password configurations
const passwordConfigs = {
    'bio-13.12': {
        password: '13.1.13.2.13.12',
        correctUrl: 'https://docs.google.com/document/d/1aTY8vtHXxVROZyldSZ051JbU3wNq1N7ZW0g1w1fj1Wg/edit?usp=sharing',
        wrongUrl: 'https://www.youtube.com/watch?v=oefAI2x2CQM'
    },
    'hug-babyprez': {
        password: 'leboxadodelababado',
        correctUrl: 'https://docs.google.com/document/d/1aTY8vtHXxVROZyldSZ051JbU3wNq1N7ZW0g1w1fj1Wg/edit?usp=sharing',
        wrongUrl: 'https://www.youtube.com/watch?v=PMCCFtpZXpI'
    },
    'spiralflowers1': {
        password: 'spiralwee.uno',
        correctUrl: 'https://docs.google.com/document/d/1aTY8vtHXxVROZyldSZ051JbU3wNq1N7ZW0g1w1fj1Wg/edit?usp=sharing',
        wrongUrl: 'https://jeroo.org/docs/JerooDocJava.pdf'
    }
};

// Show password prompt
function showPasswordPrompt(assignmentId) {
    const modal = document.getElementById('passwordModal');
    modal.style.display = 'block';
    currentAssignmentId = assignmentId;
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
}

// Close password prompt
function closePasswordPrompt() {
    const modal = document.getElementById('passwordModal');
    modal.style.display = 'none';
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
    const modal = document.getElementById('passwordModal');
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

// Optional: Initialize Three.js (if you plan to use it for background animation)
// Uncomment the following lines if you want to implement a background animation
/*
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
*/
