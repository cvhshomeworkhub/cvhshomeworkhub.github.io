const darkModeBtn = document.getElementById('darkModeBtn');
const passwordPrompt = document.getElementById('passwordPrompt');
const passwordInput = document.getElementById('passwordInput');
const message = document.getElementById('message');

darkModeBtn.addEventListener('click', () => {
    passwordPrompt.classList.toggle('hidden');
});

document.getElementById('submitPassword').addEventListener('click', () => {
    const password = passwordInput.value;
    
    if (password === "iamvengeance//thebatman") {
        window.location.href = 'iamvengeance.html';
    } else {
        document.body.classList.toggle('dark');
        passwordPrompt.classList.add('hidden');
    }
});

// Add event listeners for assignment buttons
document.querySelectorAll('.passwordBtn').forEach(button => {
    button.addEventListener('click', () => {
        const url = button.getAttribute('data-url');
        passwordPrompt.classList.remove('hidden');

        // Handle password check for each button
        document.getElementById('submitPassword').onclick = () => {
            if (passwordInput.value === "yourAssignmentPassword") {
                window.open(url, '_blank');
                passwordPrompt.classList.add('hidden');
            } else {
                message.textContent = "Incorrect Password!";
                message.classList.remove('hidden');
            }
        };
    });
});
