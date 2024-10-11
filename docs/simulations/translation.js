class AminoAcid {
    constructor(sequence, x, y) {
        this.sequence = sequence; // The codon sequence that codes for this amino acid
        this.x = x;
        this.y = y;
        this.radius = 35;
        this.color = this.getRandomColor();
        this.targetY = y;
        // Simplified amino acid naming - just using single letters for visualization
        this.letter = this.getAminoAcidLetter(sequence);
    }

    getRandomColor() {
        const colors = ['#FF9999', '#99FF99', '#9999FF', '#FFFF99', '#FF99FF'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getAminoAcidLetter(sequence) {
        // Simplified codon table with just a few examples
        const codonTable = {
            'AUG': 'M', 'UUU': 'F', 'UUC': 'F', 'UUA': 'L',
            'UUG': 'L', 'UCU': 'S', 'UCC': 'S', 'UCA': 'S',
            'UCG': 'S', 'UAU': 'Y', 'UAC': 'Y', 'UGU': 'C',
            'UGC': 'C', 'UGG': 'W', 'UAA': '*', 'UAG': '*',
            'UGA': '*'
        };
        return codonTable[sequence] || 'X';
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(this.letter, this.x - 8, this.y + 8);
    }

    update() {
        this.y += (this.targetY - this.y) * 0.1;
    }
}

class TRNA {
    constructor(anticodon, x, y) {
        this.anticodon = anticodon;
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 80;
        this.color = '#FFD700';
    }

    draw(ctx) {
        // Draw tRNA as a simplified L shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.color;
        ctx.stroke();

        // Draw anticodon
        ctx.fillStyle = 'white';
        ctx.font = '16px Orbitron';
        ctx.fillText(this.anticodon, this.x + this.width - 30, this.y + this.height - 10);
    }
}

class Ribosome {
    constructor() {
        this.x = 800; // Start from right side
        this.y = 150;
        this.size = 80;
        this.speed = -1; // Move left
    }

    draw(ctx) {
        // Draw ribosome as two subunits
        ctx.fillStyle = '#8B4513';
        // Large subunit
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        // Small subunit
        ctx.beginPath();
        ctx.arc(this.x, this.y + 30, this.size/3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '20px Orbitron';
        ctx.fillText('Ribosome', this.x - 40, this.y - 40);
    }

    move() {
        this.x += this.speed;
    }
}

class Translation {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.mRNASequence = 'AUGUCUUUUCCCGGGAAAUAA'; // Example mRNA sequence
        this.spacing = 80;
        this.ribosome = new Ribosome();
        this.aminoAcids = [];
        this.currentTRNA = null;
        this.translationProgress = 0;
        this.animate();
    }

    update() {
        if (this.translationProgress < this.mRNASequence.length - 2) {
            this.ribosome.move();

            if (this.translationProgress % 3 === 0) {
                let codonIndex = this.translationProgress;
                let codon = this.mRNASequence.substr(codonIndex, 3);
                
                // Create new amino acid
                if (codon && codon.length === 3) {
                    let newAminoAcid = new AminoAcid(
                        codon,
                        800 + (codonIndex/3) * this.spacing,
                        300
                    );
                    this.aminoAcids.push(newAminoAcid);

                    // Create temporary tRNA
                    this.currentTRNA = new TRNA(
                        this.getAnticodon(codon),
                        this.ribosome.x - 30,
                        180
                    );
                }
            }
            this.translationProgress++;
        } else {
            // Reset simulation
            this.translationProgress = 0;
            this.ribosome.x = 800;
            this.aminoAcids = [];
            this.currentTRNA = null;
        }
    }

    getAnticodon(codon) {
        return codon.split('').map(base => {
            switch(base) {
                case 'A': return 'U';
                case 'U': return 'A';
                case 'C': return 'G';
                case 'G': return 'C';
                default: return 'X';
            }
        }).join('');
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw mRNA strand
        this.drawMRNA();

        // Draw ribosome
        this.ribosome.draw(this.ctx);

        // Draw current tRNA if exists
        if (this.currentTRNA) {
            this.currentTRNA.draw(this.ctx);
        }

        // Draw amino acids (protein chain)
        this.aminoAcids.forEach(aa => aa.draw(this.ctx));

        // Draw labels
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '24px Orbitron';
        this.ctx.fillText('mRNA', 10, 30);
        this.ctx.fillText('Protein', 10, 400);
    }

    drawMRNA() {
        // Draw mRNA as a sequence of nucleotides
        for (let i = 0; i < this.mRNASequence.length; i++) {
            this.ctx.fillStyle = '#FF9933';
            this.ctx.beginPath();
            this.ctx.arc(50 + i * 30, 150, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Orbitron';
            this.ctx.fillText(this.mRNASequence[i], 43 + i * 30, 155);
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.onload = () => {
    window.simulation = new Translation();
};
