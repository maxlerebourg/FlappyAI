class Player{
    constructor(user, group, brain) {
        this.user = user;
        this.distance = 0;
        this.gates = 0;
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
	jump() {
        Body.setVelocity(this.body, {x: 0, y: config.jump_force});
	};

    getData() {
		//console.log(this.body.alive + ' ' + this.brain.score);
		if (this.body.alive){
		    if (this.body.position.y > config.height || this.body.position.y < 0)
                this.body.alive = false;
            this.brain.score++;

			let minWidth = 1000;
			let height = 0;
			pipes.map((pipe) => {
				if (this.user && pipe.position.x < 140 && pipe.alive){
				    pipe.alive = false;
				    this.gates++;
				    if (this.user)
				    	document.getElementById("score").innerHTML = this.gates;
				}
				if (pipe.alive && minWidth > pipe.position.x - this.body.position.x){
				    minWidth = pipe.position.x - this.body.position.x;
				    height = this.body.position.y - pipe.position.y - pipe.posY / 2;
				}
			});
			return [minWidth, height];
		}
		return false;
	};

	ia() {
	    if (this.body.alive) {
            let output = this.brain.activate(this.getData());
            if (output > .5) this.jump();
        }
	}
}