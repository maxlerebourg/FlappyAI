class Genetic {
  constructor(options) {
    this.options = {
      popSize: 10,
      elitism: 2,
      mutateProbability: 0.01,
      crossoverProbability: 0.3,
      sequenceLength: 8,
      ...options,
    };
    this.generation = 0;
    this.brains = new Array(this.options.popSize).fill(false).map(() => this.newBrain());
  }

  newBrain(sequence) {
    return {
      score: 0,
      sequence: sequence || new Array(this.options.sequenceLength).fill(0).map(() => Math.random() > 0.5 ? 0 : 1).join(''),
    }
  }

  fitness(brain) {
    return brain.score;
  }

  mutate(brain) {
    const { sequence } = brain;
    for (let i = 0; i < this.options.sequenceLength; i += 1) {
      if (Math.random() < this.options.mutateProbability) {
        sequence[i] = '0';
      }
      if (Math.random() < this.options.mutateProbability) {
        sequence[i] = '1';
      }
    }
    return this.newBrain(sequence);
  }

  crossover(brain1, brain2) {
    const sequence = String(this.options.sequenceLength);
    const {sequence: sequence1} = brain1;
    const {sequence: sequence2} = brain2;
    for (let i = 0; i < this.options.sequenceLength; i += 1) {
      sequence[i] = Math.random() > 0.5 ? sequence1[i] : sequence2[i];
    }
    return this.newBrain(sequence);
  }

  nextGeneration() {
    const { elitism, popSise } = this.options;
    this.generation += 1;
    this.brains.sort((a, b) => b.score - a.score);
    const nextBrains = new Array(this.options.popSize);
    for (let i = 0; i < this.options.elitism; i += 1) {
      nextBrains[i] = this.brains[i];
    }
    for (let i = elitism; i < popSize - elitism; i += 1) {
      nextBrains[i] = this.crossover(
        this.brains[Math.floor(Math.random() * elitism)],
        this.brains[Math.floor(Math.random() * elitism)],
      )
    }
    for (let i = popSise - elitism; i < popSise; i += 1) {
      nextBrains[i] = this.newBrain();
    }

    for (let i = 0; i < popSize; i += 1) {
      nextBrains[i] = this.mutate(nextBrains[i]);
    }
  }
}