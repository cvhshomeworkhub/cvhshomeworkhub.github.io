class Nucleotide {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.color = this.getColor();
    }

    getColor() {
        switch (this.type) {
            case 'A': return '#FF5733'; // Red
            case 'U': return '#FF33F1'; // Pink
            case 'C': return '#3357FF'; // Blue
            case 'G': return '#F3FF33'; // Yellow
            default: return '#FFFFFF'; // White for unknown
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '24px Orbitron';
        ctx.fillText(this.type, this.x - 8, this.y + 8);
    }
}

class mRNAStrand {
    constructor(sequence, startX, startY) {
        this.sequence = sequence;
        this.nucleotides = [];
        this.startX = startX;
        this.startY = startY;
        this.spacing = 80;
        this.initializeStrand();
    }

    initializeStrand() {
        for (let i = 0; i < this.sequence.length; i++) {
            this.nucleotides.push(new Nucleotide(this.sequence[i], this.startX + i * this.spacing, this.startY));
        }
    }

    draw(ctx) {
        this.nucleotides.forEach(n => n.draw(ctx));
    }
}

class tRNA {
    constructor(aminoAcid, x, y) {
        this.aminoAcid = aminoAcid;
        this.x = x;
        this.y = y;
        this.radius = 30;
    }

    draw(ctx) {
        ctx.fillStyle = '#FFA500'; // tRNA color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(this.aminoAcid, this.x - 10, this.y + 6);
    }
}

class Ribosome {
    constructor() {
        this.x = 600;
        this.y = 250;
        this.tRNAs = [];
        this.currentIndex = 0;
        this.aminoAcids = ['Methionine', 'Phenylalanine', 'Leucine', 'Serine', 'Tyrosine']; // Example amino acids
    }

    draw(ctx, mRNA) {
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x - 50, this.y - 30, 100, 60); // Ribosome body

        if (this.currentIndex < mRNA.nucleotides.length) {
            ctx.fillStyle = '#FFFF00'; // Highlight current codon
            ctx.fillRect(this.x - 50, this.y - 30, 100, 60);
            ctx.fillStyle = 'black';
            ctx.font = '16px Orbitron';
            const codon = mRNA.nucleotides.slice(this.currentIndex, this.currentIndex + 3).map(n => n.type).join('');
            ctx.fillText(`Codon: ${codon}`, this.x - 45, this.y);
        }
    }

    addAminoAcid() {
        if (this.currentIndex < this.aminoAcids.length) {
            let aminoAcid = this.aminoAcids[this.currentIndex];
            this.tRNAs.push(new tRNA(aminoAcid, this.x, this.y + 50 * this.tRNAs.length));
            this.currentIndex++;
        }
    }

    reset() {
        this.currentIndex = 0;
        this.tRNAs = [];
    }
}

class Translation {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.mRNASequence = 'AUGUUCUGAA'; // Example mRNA sequence (with a start and stop codon)
        this.mRNA = new mRNAStrand(this.mRNASequence, 50, 150);
        this.ribosome = new Ribosome();
        this.animate();
    }

    update() {
        if (this.ribosome.currentIndex < this.mRNA.nucleotides.length) {
            this.ribosome.addAminoAcid();
            // Reset if stop codon reached
            if (this.ribosome.currentIndex >= this.mRNA.nucleotides.length) {
                this.ribosome.reset();
                this.mRNA = new mRNAStrand(this.mRNASequence, 50, 150); // Reset mRNA for new cycle
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw mRNA
        this.mRNA.draw(this.ctx);

        // Draw Ribosome
        this.ribosome.draw(this.ctx, this.mRNA);

        // Draw tRNAs
        this.ribosome.tRNAs.forEach(tRNA => tRNA.draw(this.ctx));
        
        // Draw labels
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Orbitron';
        this.ctx.fillText('mRNA', 10, 30);
        this.ctx.fillText('tRNA', 10, 300);
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
