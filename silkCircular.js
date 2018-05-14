var ctx;

var width = 512;
var height = 512;

var i, j;

var offsetX, offsetY;

var time;

var lin;

var r1, g1, b1;
var r2, g2, b2;

var pointer;

function setup() {
    var container = document.getElementById("container");
    
    ctx = PNX.createCanvas(container, {
        width: width,
        height: height,
    },
                           1
                          )[0];
    
    ctx.lineWidth = 1;
    //ctx.lineCap = "round";
    //ctx.lineJoin = "round";
    
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,width, height);
    
    ctx.globalAlpha = 0.04;
    ctx.globalCompositeOperation = "lighter";
    
    offsetX = 100*Math.random();
    offsetY = 100*Math.random();
    
    r1 = Math.floor(256*Math.random());
    g1 = Math.floor(256*Math.random());
    b1 = Math.floor(256*Math.random());
    r2 = Math.floor(256*Math.random());
    g2 = Math.floor(256*Math.random());
    b2 = Math.floor(256*Math.random());
    
    time = 0;
    lin = 0;
}

function loop() {
    //ctx.clearRect(0,0,width, height);
    
    if(time < Math.PI*2) {
        ctx.strokeStyle = "#" + Math.floor(PNX.lerp(r2, r1, lin)).toString(16) + Math.floor(PNX.lerp(g2, g1, lin)).toString(16) + Math.floor(PNX.lerp(b2, b1, lin)).toString(16);

        ctx.beginPath();
        pointer = PNX.vector.fromPolar(PNX.map(PNX.noise2D(offsetX + 2*Math.cos(0), 0.5*Math.sin(0) + time, 2), 0, 1, 0, 0.5*width), 0).add(PNX.vector(0.5*width, 0.5*height));
        ctx.moveTo(pointer.x, pointer.y);
        for(i = 1; i <= width; i += 1) {
            pointer = PNX.vector.fromPolar(PNX.map(PNX.noise2D(offsetX + 2*Math.cos(i/width*2*Math.PI), 0.5*Math.sin(i/width*2*Math.PI) + time, 2), 0, 1, 0, 0.5*width), i/width*2*Math.PI).add(PNX.vector(0.5*width, 0.5*height));
            ctx.lineTo(pointer.x, pointer.y);
        }
        ctx.stroke();

        time += 0.005;

        lin = 0.5*(Math.sin(time) + 1);
    }
}