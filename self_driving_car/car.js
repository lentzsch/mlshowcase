class Car{
    constructor(x,y,width,height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = 3;
        this.friction = 0.05;
        this.angle = 0;

        this.controls = new Controls();
    }
    
    update () {
        this.#move();
    }

    #move() {
        //accelerates car
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.revers) {
            this.speed -= this.acceleration;
        }

        //makes sure car doesn't go faster than max forward/reverse speeds
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        //applies friction to slow down car if arrow keys are released
        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        //solves problem of car moving slightly due to friction never bringing the speed to absolute zero.
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0
        }

        //reverses the steering input if car is in reverse to better mimic real life controls
        //also prevents car from turning if not moving
        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }

        //Makes sure the car remains at speed regardless of angle/direction of travel
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);

        ctx.beginPath();
        ctx.rect(
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        ctx.fill();

        ctx.restore();
    }
}