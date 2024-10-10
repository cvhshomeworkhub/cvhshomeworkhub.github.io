class Nucleotide {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.color = this.getColor();
        this.targetY = y;
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
        ctx.font = '16px Arial';
        ctx.fillText(this.type, this.x - 6, this.y + 6);
    }

    update() {
        this.y += (this.targetY - this.y) * 0.1;
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
            this.nucleotides.push(new Nucleotide(this.sequence[i], this.startX + i * 60, this.startY));
            this.complementary.push(new Nucleotide(this.getComplementary(this.sequence[i]), this.startX + i * 60, this.startY + 60));
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

    unwind(index) {
        if (index < this.nucleotides.length) {
            this.nucleotides[index].targetY -= 40;
            this.complementary[index].targetY += 40;
        }
    }

    update() {
        this.nucleotides.forEach(n => n.update());
        this.complementary.forEach(n => n.update());
    }
}

class RNAPolymerase {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 80;
        this.height = 100;
        this.speed = 1;
    }

    draw(ctx) {
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height / 2);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText('RNA', this.x + 10, this.y + 40);
        ctx.fillText('Pol', this.x + 10, this.y + 60);
    }

    move() {
        this.x += this.speed;
    }
}

class Transcription {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.dnaSequence = 'ATCGATTGCAGCTAGCTAGCTAGCTAGC';
        this.dna = new DNAStrand(this.dnaSequence, 50, 150);
        this.rnaPolymerase = new RNAPolymerase();
        this.mRNA = [];
        this.transcriptionProgress = 0;
        this.animate();
    }

    update() {
        this.dna.update();
        if (this.transcriptionProgress < this.dnaSequence.length * 60) {
            this.rnaPolymerase.move();
            this.rnaPolymerase.y = 100;
            
            if (this.transcriptionProgress % 60 === 0) {
                let index = this.transcriptionProgress / 60;
                this.dna.unwind(index);
                let base = this.dnaSequence[index];
                let complementaryRNA = base === 'T' ? 'U' : this.dna.getComplementary(base);
                let newNucleotide = new Nucleotide(complementaryRNA, 50 + index * 60, 250);
                newNucleotide.targetY = 250;
                this.mRNA.push(newNucleotide);
            }
            this.transcriptionProgress++;
        }
        this.mRNA.forEach(n => n.update());
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
        this.ctx.font = '20px Arial';
        this.ctx.fillText('DNA', 10, 180);
        this.ctx.fillText('mRNA', 10, 280);

        // Draw codons
        if (this.mRNA.length >= 3) {
            for (let i = 0; i < Math.floor(this.mRNA.length / 3); i++) {
                this.ctx.strokeStyle = 'white';
                this.ctx.strokeRect(50 + i * 180, 230, 180, 40);
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
