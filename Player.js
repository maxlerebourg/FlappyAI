function Player(user, group, brain) {
    this.user = user;
    this.score = 0;
    this.distance = 0;

    if (brain) {
    	this.brain = brain;
    	this.brain.score = 0;
    } 

    this.body = Bodies.circle(150, config.height / 2, config.bird_width, {
        render: {
        	fillStyle: config.bird_color
        },
        id: Math.floor(Math.random() * 1000),
        alive: true,
        collisionFilter: {
            group: group,
        },
    });
}

Player.prototype = {
	jump : () => {
        Body.setVelocity(bird.body, {x: 0, y: config.jump_force});
	},

    getData : () => {
		console.log(this.score);
		if (this.body.alive){
			this.distance++;
			
			let minWidth = 1000;
			let height;
			pipes.map((pipe) => {
				if (pipe.position.x < 140 && pipe.alive){
				    pipe.alive = false;
				    this.score++;
				    if (this.user) 
				    	document.getElementById("score").innerHTML = this.score;
				}
				if (pipe.alive && minWidth > pipe.position.x - this.body.position.x){
				    minWidth = pipe.position.x - this.body.position.x;
				    height = this.body.position.y - pipe.position.y - pipe.posY / 2;
				} 
			})
			return [minWidth, height];
		}
		return false;
	},

	ia : () => {
		let output = this.brain.activate(this.getData());
		console.log(output);
		if (output > .5) this.jump();
	}
}