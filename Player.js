class Player{
	constructor(user, group) {
		this.user = user;
		this.network = new synaptic.Architect.Perceptron(3, 6, 1);
		this.score = 0;
		this.distance = 0;

		this.body = Bodies.rectangle(150, config.height / 2, config.bird_width, config.bird_height, {
	        render: {fillStyle: config.bird_color},
	        id: Math.floor(Math.random() * 1000),
	        alive: true,
	        collisionFilter: {
	           	group: group,
	        },
	    });   
	}

	getData(pipes){
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
		}
		return [minWidth, height];
	}
}