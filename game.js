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
    intervalIA = null,
    neat = null;

let group = Body.nextGroup(true);
let bird = new Player(true, group);


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

//Controle of the player
/*document.onkeydown = function (e) {
    //console.log(e.code);
    switch (e.code) {
        case "ArrowUp":
            bird.jump();
            break;
    }
};*/

let start = () => {
    clearInterval(intervalWalls);
    intervalWalls = setInterval(createWalls, 3000);
    
    
    clearInterval(intervalGame);
    setTimeout(() => {intervalGame = setInterval(() =>{bird.getData(pipes);},10)}, 3000);

    bird.body.isStatic = true;
    setTimeout(() => {bird.body.isStatic = false;}, 4000)


    pipes = [];

    World.clear(world);
    World.add(world, [
        //bird.body,
        //Start Limite du terrain
        Bodies.rectangle(config.width / 2, 0, config.width, 10, {
            isStatic: true,
            id: 10000,
            render: {
                visible: false,
                fillStyle: config.ground_color,
            },
        }),
        Bodies.rectangle(config.width / 2, config.height, config.width, 10, {
            isStatic: true,
            id: Math.floor(Math.random() * 1000) + 10000,
            render: {
                fillStyle: config.ground_color,
            },
        }),
    //Fin Limite du terrain
    ]);
};
let iaInit = () => {
    neat = new neataptic.Neat(2, 1, (player) => {
            console.log(player.score);
            return player.distance + player.score * 100;
        },
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
    players = [];
    highestScore = 0;

    for(let genome in neat.population){
        genome = neat.population[genome];
        let birdo = new Player(false, group, genome);

        

        birdo.body.isStatic = true;
        setTimeout(() => {
            birdo.body.isStatic = false;
            Body.setVelocity(birdo.body, {x: 0, y: Math.random() * -10})

        }, 4000);
    }
    setInterval(() => {neat.population.map((el)=>{el.ia()})}, 10);
};

let iaEnd = () => {
    //clearInterval(intervalIA);
    console.log('Generation:', neat.generation, '- average score:', neat.getAverage());

    neat.sort();
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
};

iaInit();

start();




