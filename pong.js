let ctx;

let width, height;

let isRunning = false;
let finish = false;

let paddleLeft, paddleRight;

let bally;

let scoreLeft, scoreRight;
let winner;

let time;
let startms
let currentms;

let timer;

function setup() {
    width = 1024;
    height = 512;
    let container = document.getElementById("container");
    ctx = PNX.createCanvas(container, {
        width: width,
        height: height
    }, 1)[0];
    
    paddleLeft = paddle(ctx, PNX.vector(0, 0.35*height), 0.3*height);
    paddleRight = paddle(ctx, PNX.vector(width-0.06*height, 0.35*height), 0.3*height);
    bally = ball(ctx, PNX.vector(0.5*width, 0.5*height), 0.03*height);
    
    scoreLeft = text(ctx, PNX.vector(0.48*width,0.5*height), "", "50px Impact", "right", "middle");
    
    scoreRight = text(ctx, PNX.vector(0.52*width,0.5*height), "", "50px Impact", "left", "middle");
    
    winner = text(ctx, PNX.vector(0.5*width,0.5*height), "", "60px Impact", "center", "middle");
    
    time = text(ctx, PNX.vector(0.5*width,0.03*height), "", "60px Impact", "center", "top");
    
    timer = 0;
}

function loop() {
    if (isRunning) {
        keyMonitor();
        
        bally.update();
        
        let sec = Math.floor((Date.now() - startms) / 1000) % 60;
        sec = (sec.toString().length === 1) ? '0' + sec : sec;
        
        let minute = Math.floor((Date.now() - startms) / 60000);
        minute = (minute.toString().length === 1) ? '0' + minute : minute;
        time.value = minute + " : " + sec;
        
        ctx.clearRect(0,0,width,height);
        paddleLeft.draw();
        paddleRight.draw();
        bally.draw();
        scoreLeft.draw();
        ctx.fillRect(0.495*width, 0.45*height, 0.01*width, 0.1*height);
        scoreRight.draw();
        time.draw();
        
    } else if (finish) {
        ctx.globalAlpha = 0.02;
        ctx.fillRect(0,0,width, height);
        
        if (timer > 1) {
            PNX.noLoop();
            
            ctx.globalAlpha = 1;
            ctx.fillStyle = "white";
            winner.value = "A Győztes " + ((scoreLeft.value === 3) ? "bal" : "jobb");
            winner.draw();
        } else {
            timer += 1 / 120;
        }
    }
}

function start() {
    document.getElementById("startButton").style.display = "none";
    
    isRunning = true;
    startms = Date.now();
}

function paddle (ctx, position, pHeight) {
    let obj = PNX.rectangle(ctx, position, 0.06*height, pHeight);
    
    return obj;
}

function ball (ctx, position, radius) {
    let obj = PNX.particle(ctx, position, PNX.vector.fromPolar(PNX.random(4,5), PNX.random(-Math.PI/4,Math.PI/4)), radius);
    
    obj.update = function () {
        if(this.position.x < paddleLeft.sizeX+radius && this.velocity.x < 0) {
            if(this.position.y > paddleLeft.position.y && this.position.y < paddleLeft.position.y + paddleLeft.sizeY) {
                this.velocity.invertX();
                this.velocity.y += PNX.random(-1, 1);
                this.velocity.x += 1;
            } else {
                this.position = PNX.vector(0.5*width, 0.5*height);
                this.velocity = PNX.vector.fromPolar(PNX.random(4,5), PNX.random(-Math.PI/4,Math.PI/4));
                
                scoreRight.value++;
                
                if(scoreRight.value >= 3) {
                    isRunning = false;
                    finish = true;
                }
            }
        } else if(this.position.x > width - paddleRight.sizeX-radius && this.velocity.x > 0) {
            if(this.position.y > paddleRight.position.y && this.position.y < paddleRight.position.y + paddleRight.sizeY) {
                this.velocity.invertX();
                this.velocity.y += PNX.random(-1, 1);
                this.velocity.x -= 1;
            } else {
                this.position = PNX.vector(0.5*width, 0.5*height);
                this.velocity = PNX.vector.fromPolar(PNX.random(4,5), PNX.random(-Math.PI/4,Math.PI/4));
                
                scoreLeft.value++;
                
                if(scoreLeft.value >= 3) {
                    isRunning = false;
                    finish = true;
                }
            }
        }
        
        if (this.position.y <= radius && this.velocity.y < 0) {
            this.velocity.invertY();
        } else if (this.position.y >= height-radius && this.velocity.y > 0) {
            this.velocity.invertY();
        }
        
        this.position.add(this.velocity);
    };
    
    obj.draw = function () {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, radius, 0, 2*Math.PI);
        ctx.fill();
    };
    
    return obj;
}

function text (ctx, position, text, font, align, base) {
    let obj = PNX.point(ctx, position);
    
    obj.value = 0;
    
    obj.draw = function () {
        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = base;
        ctx.fillText(this.value.toString(), this.position.x, this.position.y);
    };
    
    return obj;
}

function keyMonitor() {
    if (PNX.keyIsDown("w") && paddleLeft.position.y > 0) {
        paddleLeft.position.y -= 5;
    } else if (PNX.keyIsDown("s") && paddleLeft.position.y < 0.7*height) {
        paddleLeft.position.y += 5;
    }
    
    if (PNX.keyIsDown("Numpad8") && paddleRight.position.y > 0) {
        paddleRight.position.y -= 5;
    } else if (PNX.keyIsDown("Numpad2") && paddleRight.position.y < 0.7*height) {
        paddleRight.position.y += 5;
    }
}