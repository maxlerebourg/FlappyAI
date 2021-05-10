class Player {
  constructor(user, group, brain) {
    this.user = user;
    this.brain = brain || {};
    this.brain.score = 0;
    this.body = Bodies.circle(150, config.height / 2, config.bird_width, {
      id: Math.floor(Math.random() * 1000),
      alive: true,
      render: {
        fillStyle: config.bird_color,
        sprite: {
          texture: './flappy.png',
          xScale: .4,
          yScale: .4,
        }
      },
      collisionFilter: { group: group },
    });
  }

  jump() {
    Body.setVelocity(this.body, {x: 0, y: -config.jump_force});
  };

  getData() {
    if (this.body.position.y > config.height || this.body.position.y < 0)
      this.body.alive = false;
    this.brain.score += 1;

    if (!this.body.alive && this.user) {
      start();
      return;
    }

    let pipe1X = Number.MAX_SAFE_INTEGER;
    let posY = 0;
    pipes.forEach((pipe) => {
      if (this.user) {
        document.getElementById('score').innerHTML = this.brain.score;
      }
      if (pipe.bounds.min.y === 0
        && pipe.position.x < pipe1X && pipe.bounds.max.x > this.body.bounds.min.x) {
        pipe1X = pipe.position.x;
        posY = this.body.position.y - (pipe.bounds.max.y + config.pipe_space);
      }
    });
    return [posY];
  };

  ia() {
    const data = this.getData();
    const output = this.brain.activate(data);
    if (output > .5) this.jump();
  }
}