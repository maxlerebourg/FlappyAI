let config = {
    width: 800,
    height: 600,


    bridge_nb_tiles: 17,

    bird_width: 50,
    bird_height: 50,
    bird_density: 0.06,
    bird_color: '#FF0',

    jump_force: -8,

    sky_color: '#77b5fe',
    ground_color: '#555',
    pipe_color: '#050',

    pipe_space: 90,
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
    intervalGame = null;

let group = Body.nextGroup(true);
//let bird = new Player(true, group);


Events.on(engine, 'collisionStart', function(e) {
    let pairs = e.pairs;
    for (let pair of pairs) {
        if (pair.bodyA.id < 1000 && pair.bodyB.id > 10000){
            pair.bodyA.alive = false;
            console.log('caca');
        }
        if (pair.bodyB.id < 1000 && pair.bodyA.id > 10000){
            pair.bodyB.alive = false;
            console.log('caca');
        }
            //console.log('loser');
            //start();
    }
});


var createWalls = () => {
    let posY = Math.floor(Math.random() * (config.height - 200));

    pipes.push(Bodies.rectangle(config.width, - 50, config.pipe_width, posY * 2, {
            render: {fillStyle: config.pipe_color},
            isStatic: true,
            id: Math.floor(Math.random() * 1000) + 10000,
            alive: true,
            posY: posY,
        }));
    pipes.push(Bodies.rectangle(config.width, config.height + 50, config.pipe_width, config.height - (posY - config.pipe_space) * 2, {
            render: {fillStyle: config.pipe_color},
            isStatic: true,
            id: Math.floor(Math.random() * 1000) + 10000,
            alive: false,
        }));
    World.add(world, pipes);
};

var walling = () => {
    minWidth = 500;
    pipes.map((pipe) => {
        if (pipe.position.x < 0){
            World.remove(world, pipe);
        }
        if (pipe.position.x < -20){
            pipes.splice(pipe, 1);
        }
        Body.translate(pipe, {x: -3, y: 0})
    });
    //ia();
};


//Controle of the player
/*document.onkeydown = function (e) {
    //console.log(e.code);
    switch (e.code) {
        case "ArrowUp":
            Body.setVelocity(bird.body, {x: 0, y: config.jump_force});
            break;
    }
};*/

start = () => {
    clearInterval(intervalWalls);
    intervalWalls = setInterval(createWalls, 3000);
    clearInterval(intervalGame);
    setTimeout(() => {
        intervalGame = setInterval(() =>{
            walling();
            //bird.getData(pipes);
        },10)}, 
    3000);

    
    //bird.body.isStatic = true;
    //setTimeout(() => {bird.body.isStatic = false;}, 4000)


    pipes = [];
    World.clear(world);

    World.add(world, [
        //bird.body,
        //Start Limite du terrain
        Bodies.rectangle(config.width / 2, 0, config.width, 10, {
            isStatic: true,
            id: 10000,
            render: {
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
    iaInit();
}
iaInit = () => {
    pop = [];
    for (let i = 0; i < 10; i++){
        let birdo = new Player(false, group);
        pop.push(birdo);
        birdo.body.isStatic = true;
        setTimeout(() => {
            birdo.body.isStatic = false;
            Body.setVelocity(birdo.body, {x: 0, y: Math.random() * -10})

        }, 4000);   
    }
    World.add(world, pop.map((guy) => {return guy.body}));
}
start();


var rate = .3;
ia = () => {
    pop.map((birdo) => {
        if (birdo.body.alive){
            birdo.network.activate(birdo.getData(pipes));
        }
    });
    
    //console.log(network.activate([dwidth, dheight]));
    //if (network.activate([dwidth, dheight]) > .55) {
    //    Body.setVelocity(bird, {x: 0, y: config.jump_force});
    //}
    //network.propagate(rate, [distance / 10000]);

}

