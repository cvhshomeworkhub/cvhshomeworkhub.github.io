const darkModeBtn = document.getElementById('darkModeBtn');
const passwordPrompt = document.getElementById('passwordPrompt');
const passwordInput = document.getElementById('passwordInput');

darkModeBtn.addEventListener('click', () => {
    passwordPrompt.classList.toggle('hidden');
});

document.getElementById('submitPassword').addEventListener('click', () => {
    const password = passwordInput.value;
    
    // Change "yourSecretPassword" to the actual password you want
    if (password === "iamvengeance//thebat") {
        window.location.href = 'iamvengeance.html';
    } else {
        document.body.classList.toggle('dark');
        passwordPrompt.classList.add('hidden');
    }
});
