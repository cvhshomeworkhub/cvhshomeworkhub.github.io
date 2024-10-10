class Nucleotide {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.color = this.getColor();
    }

    getColor() {
        switch(this.type) {
            case 'A': return '#FF5733';
            case 'T': return '#33FF57';
            case 'C': return '#3357FF';
            case 'G': return '#F3FF33';
            case 'U': return '#FF33F1';
            default: return '#FFFFFF';
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(this.type, this.x - 4, this.y + 4);
    }
}

class DNAStrand {
    constructor(sequence, startX, startY) {
        this.sequence = sequence;
        this.nucleotides = [];
        this.complementary = [];
        this.startX = startX;
        this.startY = startY;
        this.initializeStrand();
    }

    initializeStrand() {
        for (let i = 0; i < this.sequence.length; i++) {
            this.nucleotides.push(new Nucleotide(this.sequence[i], this.startX + i * 40, this.startY));
            this.complementary.push(new Nucleotide(this.getComplementary(this.sequence[i]), this.startX + i * 40, this.startY + 40));
        }
    }

    getComplementary(base) {
        switch(base) {
            case 'A': return 'T';
            case 'T': return 'A';
            case 'C': return 'G';
            case 'G': return 'C';
            default: return '';
        }
    }

    draw(ctx) {
        this.nucleotides.forEach(n => n.draw(ctx));
        this.complementary.forEach(n => n.draw(ctx));
        
        // Draw lines connecting the strands
        ctx.strokeStyle = '#FFFFFF';
        for (let i = 0; i < this.nucleotides.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.nucleotides[i].x, this.nucleotides[i].y + this.nucleotides[i].radius);
            ctx.lineTo(this.complementary[i].x, this.complementary[i].y - this.complementary[i].radius);
            ctx.stroke();
        }
    }
}

class RNAPolymerase {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 40;
        this.height = 60;
    }

    draw(ctx) {
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText('RNA', this.x + 5, this.y + 30);
        ctx.fillText('Pol', this.x + 5, this.y + 45);
    }

    move(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Transcription {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.dnaSequence = 'ATCG';
        this.dna = new DNAStrand(this.dnaSequence, 50, 100);
        this.rnaPolymerase = new RNAPolymerase();
        this.mRNA = [];
        this.transcriptionProgress = 0;
        this.animate();
    }

    update() {
        if (this.transcriptionProgress < this.dnaSequence.length) {
            this.rnaPolymerase.move(50 + this.transcriptionProgress * 40, 80);
            if (this.transcriptionProgress % 30 === 0) {
                let base = this.dnaSequence[this.transcriptionProgress / 30];
                let complementaryRNA = base === 'T' ? 'U' : this.dna.getComplementary(base);
                this.mRNA.push(new Nucleotide(complementaryRNA, 50 + (this.transcriptionProgress / 30) * 40, 180));
            }
            this.transcriptionProgress++;
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw DNA
        this.dna.draw(this.ctx);

        // Draw RNA Polymerase
        this.rnaPolymerase.draw(this.ctx);

        // Draw mRNA
        this.mRNA.forEach(n => n.draw(this.ctx));

        // Draw labels
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('DNA', 10, 120);
        this.ctx.fillText('mRNA', 10, 200);

        // Draw codons
        if (this.mRNA.length >= 3) {
            for (let i = 0; i < Math.floor(this.mRNA.length / 3); i++) {
                this.ctx.strokeStyle = 'white';
                this.ctx.strokeRect(50 + i * 120, 165, 120, 30);
            }
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.onload = () => {
    window.simulation = new Transcription();
};
