var ctx;

var width = 512;
var height = 512;

var i, j;

var offsetX, offsetY;

var time;

var lin;

var r1, g1, b1;
var r2, g2, b2;

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
    
    ctx.globalAlpha = 0.06;
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
        ctx.moveTo(0, PNX.map(PNX.noise2D(0, time)));
        for(i = 0; i < width; i += 1) {
            ctx.lineTo(i, PNX.map(PNX.noise2D(i*0.004 + offsetX, time), 0, 1, 0, height), 1, 1);
        }
        ctx.stroke();

        time += 0.008;

        lin = 0.5*(Math.sin(time) + 1);
    }
}