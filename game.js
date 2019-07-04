let config = {
    width: 800,
    height: 600,


    bridge_nb_tiles: 17,

    bird_width: 30,
    bird_height: 30,
    bird_density: 0.06,
    bird_color: '#FF0',

    jump_force: -8,

    sky_color: '#77b5fe',
    ground_color: '#555',
    pipe_color: '#050',

    pipe_space: 100,
    pipe_width: 100,

};

let Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Composites = Matter.Composites,
    Constraint = Matter.Constraint,
    Events = Matter.Events,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies;

// create engine
let engine = Engine.create(),
    world = engine.world;


// create renderer
let render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: config.width,
        height: config.height,
        wireframes: !false,
        showAngleIndicator: false,
        background: config.sky_color
    }
});
setTimeout(function () {
    Render.run(render);
}, 500);


// create runner
let runner = Runner.create();
Runner.run(runner, engine);

let pop = [],
    pipes = [],
    intervalWalls = null,
    intervalGame = null,
    neat = null,
    hightestScore = null;

let group = Body.nextGroup(true);
let bird = null;


let createWalls = () => {
    let posY = Math.floor(Math.random() * (config.height - 250) + 125);
    //console.log(Math.floor((posY + config.pipe_space / 2) / 2) + ' '+Math.floor((config.height - posY + config.pipe_space / 2) / 2))
    
    var h1 = config.height - posY - config.pipe_space;
    var h2 = posY  - config.pipe_space;

    var y1 = h1 / 2;
    var y2 = config.height - h2 / 2; 

    pipes.push(Bodies.rectangle(
        config.width,
        y1, 
        config.pipe_width, 
        h1, {
            render: {fillStyle: config.pipe_color},
            isStatic: true,
            id: Math.floor(Math.random() * 1000) + 10000,
            alive: true,
            posY: posY,
        }));
    pipes.push(Bodies.rectangle(
        config.width, 
        y2, 
        config.pipe_width, 
        h2, {
            render: {fillStyle: config.pipe_color},
            isStatic: true,
            id: Math.floor(Math.random() * 1000) + 10000,
            alive: false,
        }));
    World.add(world, pipes);
};
let ia = () => {
    let i = false;
    //console.log(pop[1].getData());
    pop.map(el => {
        el.ia();
        el.body.alive ? i = true : null;
    });
    if (!i) iaEnd();
};

let moveWalls = () => {
    pipes.map((pipe) => {
        if (pipe.position.x < 0){
            World.remove(world, pipe);
        }
        if (pipe.position.x < -20){
            pipes.splice(pipe, 1);
        }
        Body.translate(pipe, {x: -3, y: 0})
    });
};
Events.on(engine, 'tick', moveWalls);
//setInterval(moveWalls,1000);
Events.on(engine, 'collisionStart', function(e) {
    let pairs = e.pairs;
    for (let pair of pairs) {
        if (pair.bodyA.id < 1000 && pair.bodyB.id > 10000){
            pair.bodyA.alive = false;
        }
        if (pair.bodyB.id < 1000 && pair.bodyA.id > 10000){
            pair.bodyB.alive = false;
        }
    }
});


let player = () => {
    bird = new Player(true, group, null);

    clearInterval(intervalGame);
    intervalGame = setInterval(() =>{console.log(bird.getData());},10);
    
    bird.body.isStatic = true;
    setTimeout(() => {bird.body.isStatic = false;}, 4000);

    World.add(world, bird.body);
    document.onkeydown = function (e) {
        switch (e.code) {
            case "ArrowUp":
                bird.jump();
                break;
            case "ArrowLeft":
                Runner.stop(runner);
                clearInterval(intervalGame);
                clearInterval(intervalWalls);
                break;
            case "ArrowRight":
                Runner.start(runner, engine);
                intervalGame = setInterval(() =>{console.log(bird.getData());},10);
                intervalWalls = setInterval(createWalls, 4500);
                break;
        }
    };
};
//Controle of the player
let running = true;
document.onkeydown = function (e) {
        switch (e.code) {
            case "ArrowLeft":
                if (running){
                    running = !running;
                    Runner.stop(runner);
                    console.log(pop.find(el => {return el.body.alive}).getData());
                    clearTimeout(intervalGame);
                    clearInterval(intervalGame);
                    clearInterval(intervalWalls);
                } else {
                    running = !running;
                    Runner.start(runner, engine);
                    clearTimeout(intervalGame);
                    clearInterval(intervalGame);
                    clearInterval(intervalWalls);
                    intervalGame = setInterval(ia, 50);
                    intervalWalls = setInterval(createWalls, 3500);
                }
                break;
        }
    };

let start = () => {
    World.clear(world);

    pipes = [];
    clearInterval(intervalWalls);
    intervalWalls = setInterval(createWalls, 3500);


    World.add(world, [
        //Start Limite du terrain
        Bodies.rectangle(config.width / 2, -25, config.width, 60, {
            isStatic: true,
            id: Math.floor(Math.random() * 1000) + 10000,
            render: {
                fillStyle: config.ground_color,
            },
        }),
        Bodies.rectangle(config.width / 2, config.height + 25, config.width, 60, {
            isStatic: true,
            id: Math.floor(Math.random() * 1000) + 10000,
            render: {
                fillStyle: config.ground_color,
            },
        }),
    //Fin Limite du terrain
    ]);


    //player();

};
let iaInit = () => {
    neat = new neataptic.Neat(2, 1, popu => {console.log(popu.brain.score)},
        {
            mutation: neataptic.methods.mutation.ALL,
            popsize: 10,
            elitism: Math.round(0.2 * 10),
            network: new neataptic.architect.Random(2, 6, 1)
        }
    );
    iaStart();
};

let iaStart = () => {
    start();
    pop = [];
    for(let genome of neat.population){
        //genome = neat.population[genome];
        let birdo = new Player(false, group, genome);

        birdo.body.isStatic = true;
        setTimeout(() => {
            birdo.body.isStatic = false;
            Body.setVelocity(birdo.body, {x: 0, y: Math.random() * - 10 + 5})
        }, 5000);
        pop.push(birdo);


    }
    intervalGame = setTimeout(() => {
        intervalGame = setInterval(ia, 50);
    }, 5000);
    World.add(world, pop.map(el => {return el.body}));

};
let iaEnd = () => {
    clearInterval(intervalGame);
    neat.sort();
    pop.map(el => {hightestScore < el.brain.score ? hightestScore = el.brain.score: null;});


    console.log('Generation:', neat.generation, '- average score:', neat.getAverage() + '- hightest score:' + hightestScore);
    
    
    hightestScore = 0;

    pop = [];

    pop.map(el => {el.brain.score = 0;});

    let newPopulation = [];

    // Elitism
    for(let i = 0; i < neat.elitism; i++){
        newPopulation.push(neat.population[i]);
    }

    // Breed the next individuals
    for(let i = 0; i < neat.popsize - neat.elitism; i++){
        newPopulation.push(neat.getOffspring());
    }

    // Replace the old population with the new population
    neat.population = newPopulation;
    neat.mutate();

    neat.generation++;
    iaStart();
};

start();
iaInit();


