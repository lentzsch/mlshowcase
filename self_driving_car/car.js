class Car{
    constructor(x,y,width,height, controlType, maxSpeed = 3){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;


        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this);
        }
        this.controls = new Controls(controlType);
    }
    
    update (roadBorders, traffic) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        
        if (this.sensor){
            this.sensor.update(roadBorders, traffic);
        }
    }

    #assessDamage(roadBorders, traffic) {
        
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this.polygon, roadBorders[i])){
                return true;
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            if (polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }

        return false;

    }

    #createPolygon(){
        const points = [];
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width, this.height);

        //gets the four corners of the car hitbox
        points.push({
            x: this.x - Math.sin(this.angle - alpha)*rad,
            y: this.y - Math.cos(this.angle - alpha)*rad
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });

        return points
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

    draw(ctx, color){
        if(this.damaged){
            ctx.fillStyle = "grey";
        } else {
            ctx.fillStyle = color;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);

        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        if (this.sensor){
            this.sensor.draw(ctx);
        }
    }
}