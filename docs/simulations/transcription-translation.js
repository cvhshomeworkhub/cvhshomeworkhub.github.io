// Constants
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

// Colors
const colors = {
    DNA: '#FF6B6B',
    RNA: '#4ECDC4',
    ribosome: '#45B7D1',
    tRNA: '#FFA07A',
    aminoAcid: '#98D8C8'
};

// Bases and codons
const dnaBases = ['A', 'T', 'C', 'G'];
const rnaBases = ['A', 'U', 'C', 'G'];
const codonTable = {
    'AUG': 'Met', 'UAA': 'STOP', 'UAG': 'STOP', 'UGA': 'STOP',
    // ... (add more codons and corresponding amino acids)
};

// State variables
let dnaSequence = [];
let mRNA = [];
let tRNA = [];
let aminoAcids = [];
let currentStage = 'idle';  // 'idle', 'transcription', 'translation'

// Initialize
function init() {
    dnaSequence = generateRandomDNA(20);
    drawDNA();
}

// Generate random DNA sequence
function generateRandomDNA(length) {
    return Array.from({length}, () => dnaBases[Math.floor(Math.random() * dnaBases.length)]);
}

// Draw DNA
function drawDNA() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors.DNA;
    ctx.font = '20px Arial';
    dnaSequence.forEach((base, index) => {
        ctx.fillText(base, 50 + index * 30, height / 2);
    });
}

// Transcription
function transcribe() {
    currentStage = 'transcription';
    mRNA = dnaSequence.map(base => base === 'T' ? 'U' : base);
    animateTranscription();
}

// Animate transcription
function animateTranscription() {
    let index = 0;
    const interval = setInterval(() => {
        if (index >= mRNA.length) {
            clearInterval(interval);
            currentStage = 'idle';
            return;
        }
        ctx.fillStyle = colors.RNA;
        ctx.fillText(mRNA[index], 50 + index * 30, height / 2 + 40);
        index++;
    }, 200);
}

// Translation
function translate() {
    currentStage = 'translation';
    for (let i = 0; i < mRNA.length; i += 3) {
        const codon = mRNA.slice(i, i + 3).join('');
        if (codon in codonTable) {
            aminoAcids.push(codonTable[codon]);
            if (codonTable[codon] === 'STOP') break;
        }
    }
    animateTranslation();
}

// Animate translation
function animateTranslation() {
    let index = 0;
    const interval = setInterval(() => {
        if (index >= aminoAcids.length) {
            clearInterval(interval);
            currentStage = 'idle';
            return;
        }
        ctx.fillStyle = colors.aminoAcid;
        ctx.fillText(aminoAcids[index], 50 + index * 60, height / 2 + 80);
        index++;
    }, 500);
}

// Event listeners
document.getElementById('startTranscription').addEventListener('click', transcribe);
document.getElementById('startTranslation').addEventListener('click', translate);
document.getElementById('reset').addEventListener('click', init);

// Initialize the simulation
init();
