let config = {
    width: 800,
    height: 600,


    bridge_nb_tiles: 17,

    bird_width: 30,
    bird_height: 30,
    bird_density: 0.06,
    bird_color: '#555',

    jump_force: -8,

    sky_color: '#77b5fe',
    ground_color: '#555',
    pipe_color: '#050',

    pipe_space: 100,
    pipe_width: 100,

};

let pipes = [];


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

let bird = Bodies.circle(100, config.height / 2, config.bird_width, {
    density: config.bird_density,
    render: {fillStyle: config.bird_color}
});


World.add(world, [

    //Start Limite du terrain
    Bodies.rectangle(config.width / 2, 0, config.width, 10, {
        isStatic: true,
        render: {
            fillStyle: config.ground_color,
        },
    }),
    //Fin Limite du terrain
    //Sol invisible pour empecher le bateau de couler
    Bodies.rectangle(config.width / 2, config.height, config.width, 10, {
        isStatic: true,
        id: 10,
        render: {
            fillStyle: config.ground_color,
        },
    }),

    bird,
]);

Events.on(engine, 'collisionStart', function(e) {
    let pairs = e.pairs;
    for (let pair of pairs) {
        if((pair.bodyB.id === bird.id && pair.bodyA.id === 10) || (pair.bodyA.id === bird.id && pair.bodyB.id === 10)){
            console.log('loser');
        }
    }
});



setInterval(() => {
    let posY = Math.floor(Math.random() * (config.height - 200));
    console.log(posY + ' ' + (posY + config.pipe_space) + ' ');
    pipes.push(Bodies.rectangle(config.width / 2, 0, config.pipe_width, posY * 2, {
            render: {fillStyle: config.pipe_color},
            isStatic: true,
        }));
    pipes.push(Bodies.rectangle(config.width / 2, config.height, config.pipe_width, config.height - (posY - config.pipe_space) * 2, {
            render: {fillStyle: config.pipe_color},
            isStatic: true,
        }));
    World.add(world, pipes);
}, 2000);

setInterval(() => {
    pipes.map((pipe) => {
        //if (pipe.position.x < 0)
    })
}, 10);


//Controle of the player
document.onkeydown = function (e) {
    console.log(e.code);
    switch (e.code) {
        case "ArrowUp":
            Body.setVelocity(bird, {x: 0, y: config.jump_force});
            break;
    }
};


// add mouse control
/*let mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.1,
            render: {
                visible: false
            }
        }
    });

World.add(world, mouseConstraint);*/

// keep the mouse in sync with rendering
//render.mouse = mouse;
