class Nucleotide {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.color = this.getColor();
        this.targetX = x;
        this.targetY = y;
    }

    getColor() {
        switch (this.type) {
            case 'A': return '#FF5733'; // Red
            case 'T': return '#33FF57'; // Green
            case 'C': return '#3357FF'; // Blue
            case 'G': return '#F3FF33'; // Yellow
            case 'U': return '#FF33F1'; // Pink
            default: return '#FFFFFF'; // White for unknown
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '16px Orbitron';
        ctx.fillText(this.type, this.x - 6, this.y + 6);
    }

    update() {
        this.x += (this.targetX - this.x) * 0.1;
        this.y += (this.targetY - this.y) * 0.1;
    }
}

class DNAStrand {
    constructor(sequence, startX, startY, spacing = 50) {
        this.sequence = sequence;
        this.nucleotides = [];
        this.complementary = [];
        this.startX = startX;
        this.startY = startY;
        this.spacing = spacing;
        this.initializeStrand();
    }

    initializeStrand() {
        for (let i = 0; i < this.sequence.length; i++) {
            this.nucleotides.push(new Nucleotide(this.sequence[i], this.startX + i * this.spacing, this.startY));
            this.complementary.push(new Nucleotide(this.getComplementary(this.sequence[i]), this.startX + i * this.spacing, this.startY + 50));
        }
    }

    getComplementary(base) {
        switch (base) {
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

        ctx.strokeStyle = '#FFFFFF';
        for (let i = 0; i < this.nucleotides.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.nucleotides[i].x, this.nucleotides[i].y + this.nucleotides[i].radius);
            ctx.lineTo(this.complementary[i].x, this.complementary[i].y - this.complementary[i].radius);
            ctx.stroke();
        }
    }

    update() {
        this.nucleotides.forEach(n => n.update());
        this.complementary.forEach(n => n.update());
    }
}

class MutationSimulation {
    constructor() {
        this.canvas = document.getElementById('mutationCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 600;
        console.log(`Canvas size set to ${this.canvas.width}x${this.canvas.height}`);

        this.dnaSequence = 'ATCGATTGCAGCT';
        this.insertionDNA = new DNAStrand(this.dnaSequence, 50, 100);
        this.deletionDNA = new DNAStrand(this.dnaSequence, 50, 300);
        this.substitutionDNA = new DNAStrand(this.dnaSequence, 50, 500);

        this.insertionRNA = [];
        this.deletionRNA = [];
        this.substitutionRNA = [];

        this.mutationIndex = 5; // Index where mutation occurs
        console.log('MutationSimulation initialized');
        this.animate();
    }

    update() {
        this.insertionDNA.update();
        this.deletionDNA.update();
        this.substitutionDNA.update();

        // Update RNA strands
        this.insertionRNA.forEach(n => n.update());
        this.deletionRNA.forEach(n => n.update());
        this.substitutionRNA.forEach(n => n.update());

        // Perform mutations if RNA strands are not complete
        if (this.insertionRNA.length < this.dnaSequence.length + 1) {
            this.performInsertion();
        }
        if (this.deletionRNA.length < this.dnaSequence.length) {
            this.performDeletion();
        }
        if (this.substitutionRNA.length < this.dnaSequence.length) {
            this.performSubstitution();
        }
    }

    performInsertion() {
        let index = this.insertionRNA.length;
        if (index === this.mutationIndex) {
            // Insert an extra base
            let newBase = 'G'; // You can randomize this
            let newNucleotide = new Nucleotide(newBase, 50 + index * this.insertionDNA.spacing, 180);
            this.insertionRNA.push(newNucleotide);
        } else if (index < this.dnaSequence.length) {
            let base = this.dnaSequence[index];
            let complementaryRNA = base === 'T' ? 'U' : this.insertionDNA.getComplementary(base);
            let newNucleotide = new Nucleotide(complementaryRNA, 50 + index * this.insertionDNA.spacing, 180);
            this.insertionRNA.push(newNucleotide);
        }
    }

    performDeletion() {
        let index = this.deletionRNA.length;
        if (index !== this.mutationIndex && index < this.dnaSequence.length) {
            let base = this.dnaSequence[index];
            let complementaryRNA = base === 'T' ? 'U' : this.deletionDNA.getComplementary(base);
            let newNucleotide = new Nucleotide(complementaryRNA, 50 + index * this.deletionDNA.spacing, 380);
            this.deletionRNA.push(newNucleotide);
        }
    }

    performSubstitution() {
        let index = this.substitutionRNA.length;
        if (index < this.dnaSequence.length) {
            let base = this.dnaSequence[index];
            let complementaryRNA = base === 'T' ? 'U' : this.substitutionDNA.getComplementary(base);
            if (index === this.mutationIndex) {
                // Substitute with a different base
                complementaryRNA = 'G'; // You can randomize this
            }
            let newNucleotide = new Nucleotide(complementaryRNA, 50 + index * this.substitutionDNA.spacing, 580);
            this.substitutionRNA.push(newNucleotide);
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('Canvas cleared and filled with black');

        // Draw DNA strands
        this.insertionDNA.draw(this.ctx);
        this.deletionDNA.draw(this.ctx);
        this.substitutionDNA.draw(this.ctx);
        console.log('DNA strands drawn');

        // Draw RNA strands
        this.insertionRNA.forEach(n => n.draw(this.ctx));
        this.deletionRNA.forEach(n => n.draw(this.ctx));
        this.substitutionRNA.forEach(n => n.draw(this.ctx));
        console.log('RNA strands drawn');

        // Draw labels
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Orbitron';
        this.ctx.fillText('Insertion', 10, 50);
        this.ctx.fillText('Deletion', 10, 250);
        this.ctx.fillText('Substitution', 10, 450);
        console.log('Labels drawn');

        // Draw mutation indicators
        this.drawMutationIndicator(this.insertionRNA, 180);
        this.drawMutationIndicator(this.deletionRNA, 380);
        this.drawMutationIndicator(this.substitutionRNA, 580);
        console.log('Mutation indicators drawn');
    }

    drawMutationIndicator(rnaStrand, yOffset) {
        if (rnaStrand.length > this.mutationIndex) {
            this.ctx.strokeStyle = 'yellow';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(50 + this.mutationIndex * this.insertionDNA.spacing, yOffset, 30, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    animate() {
        console.log('Animation frame started');
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.onload = () => {
    console.log('Window loaded, initializing simulation');
    window.simulation = new MutationSimulation();
};
