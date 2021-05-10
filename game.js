const config = {
  width: 800,
  height: 600,

  bird_width: 30,
  bird_height: 30,
  bird_density: 0.06,
  bird_color: '#FF0',
  sky_color: '#77b5fe',
  ground_color: '#555',
  pipe_color: '#050',

  pipe_space: 100,
  pipe_width: 100,
  timeout_start: 500,

  player: true,
  jump_force: 8,
  wall_speed: 3,
  space_between_wall: 130,
};

const {
  Engine, Render, Runner, Body, Bodies, Constraint, Events,
  MouseConstraint, Mouse, Composite,
} = Matter;

const engine = Engine.create();
const world = engine.world;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: config.width,
    height: config.height,
    wireframes: true,
    showAngleIndicator: !false,
    background: './background.png'
  }
});
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);
const group = Body.nextGroup(true);

let tick;
let pop = [];
let pipes = [];
let neat = null;
let bird = null;
let running = false;

function createWalls(first) {
  const posY = Math.floor(Math.random() * (config.height - 250) + 125);
  console.log(posY)
  const h1 = config.height - posY - config.pipe_space;
  const h2 = posY - config.pipe_space;
  const y1 = h1 / 2;
  const y2 = config.height - h2 / 2;
  const pipe1 = Bodies.rectangle(
    first ? config.width / 2 + 50 : config.width,
    y1,
    config.pipe_width,
    h1,
    {
      id: Math.floor(Math.random() * 1000) + 10000,
      isStatic: true,
      render: {
        fillStyle: config.pipe_color,
        sprite: {
          texture: './pipeT.png',
          yOffset: (posY - 100) / 500,
        }
      },
    },
  );
  const pipe2 = Bodies.rectangle(
    first ? config.width / 2 + 50 : config.width,
    y2,
    config.pipe_width,
    h2,
    {
      id: Math.floor(Math.random() * 1000) + 10000,
      isStatic: true,
      render: {
        fillStyle: config.pipe_color,
        sprite: {
          texture: './pipeM.png',
          yOffset: -(posY - 100) / 500,
        }
      },
    },
  );
  pipes.push(pipe1, pipe2);
  Composite.add(world, [pipe1, pipe2]);
}

function ia() {
  let oneAlive = false;
  for (let i = 0; i < pop.length; i += 1) {
    if (pop[i].body.alive) {
      pop[i].ia();
      oneAlive = true;
    }
  }
  if (running && !oneAlive && (!bird || !bird.body.alive)) iaEnd();
}
function moveWalls() {
  for (let i = pipes.length - 1; i >= 0; i -= 1) {
    const pipe = pipes[i];
    if (pipe.position.x < -20) {
      Composite.remove(world, pipe);
      pipes.splice(i, 1);
    } else {
      Body.translate(pipe, {x: -config.wall_speed, y: 0})
    }
  }
}
function killCollindingBodies(e) {
  const { pairs } = e;
  for (let i = 0; i < pairs.length; i += 1) {
    pairs[i].bodyA.alive = false;
    pairs[i].bodyB.alive = false;
  }
}

Events.on(runner, 'tick', () => {
  tick += 1;
  if (tick > config.space_between_wall) {
    createWalls();
    tick = 0;
  }
  if (tick % 4 === 0) ia();
  moveWalls();
});
Events.on(engine, 'collisionStart', killCollindingBodies);
Events.on(engine, 'collisionActive', killCollindingBodies);
Events.on(engine, 'collisionEnd', killCollindingBodies);

document.onkeydown = function (e) {
  switch (e.code) {
    case 'ArrowUp':
      if (bird) bird.jump();
      break;
    case 'ArrowLeft':
      if (running) Runner.stop(runner);
      else Runner.start(runner, engine);
      running = !running;
      console.log(neat);
      break;
  }
};

function player() {
  bird = new Player(true, group, null);
  bird.body.isStatic = true;
  setTimeout(() => { bird.body.isStatic = false; }, config.timeout_start);
  Composite.add(world, bird.body);
}

function start() {
  Composite.clear(world);
  pipes = [];
  createWalls(true);

  Composite.add(world, [
    Bodies.rectangle(config.width / 2, -25, config.width, 60, {
      isStatic: true,
      id: Math.floor(Math.random() * 1000) + 10000,
      render: {
        visible: false,
        fillStyle: config.ground_color,
      },
    }),
    Bodies.rectangle(config.width / 2, config.height + 25, config.width, 60, {
      isStatic: true,
      id: Math.floor(Math.random() * 1000) + 10000,
      render: {
        visible: false,
        fillStyle: config.ground_color,
      },
    }),
  ]);
  running = true;
  tick = config.space_between_wall;

  player();
}

function iaStart() {
  start();
  pop = [];
  for (let i = 0; i < neat.population.length; i += 1) {
    const genome = neat.population[i];
    const birdo = new Player(false, group, genome);
    Body.setVelocity(birdo.body, {x: 0, y: Math.random() * -10 + 5});
    pop.push(birdo);
  }
  Composite.add(world, pop.map(el => el.body));
}

function iaEnd() {
  neat.sort();
  console.log('Generation:', neat.generation, '- average score:', neat.getAverage(), '- hightest score:', neat.population[0].score);

  const newPopulation = new Array(neat.popsize);
  for (let i = 0; i < newPopulation.length; i += 1) {
    if (i < neat.elitism) newPopulation[i] = neat.population[i];
    else newPopulation[i] = neat.getOffspring();
  }

  neat.population = newPopulation;
  neat.mutate();
  neat.generation += 1;

  iaStart();
}

function iaInit() {
  neat = new neataptic.Neat(
    2,
    1,
    popu => console.log(popu.brain.score),
    {
      mutation: neataptic.methods.mutation.ALL,
      popsize: 5,
      elitism: 1,
      network: new neataptic.architect.Random(1, 6, 1),
    }
  );
  iaStart();
}

setTimeout(() => {
  iaInit();
}, 1000);


