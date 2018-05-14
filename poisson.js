var ctx, back;

var width = 512;
var height = 512;

var i, j;
var p;
var offsetX, offsetY;

var time;

var color, complement;

function setup() {
    var container = document.getElementById("container");
    
    var ctxA = PNX.createCanvas(container, {
        width: width,
        height: height,
    },
                           2
                          );
    
    ctx = ctxA[0];
    back = ctxA[1];
    
    color = PNX.color("#0b24ad");
    complement = color.complement().lighten(20).saturate(40);
    back.fillStyle = color.toHexString();
    ctx.fillStyle = complement.toHexString();
    
    var n = PNX.blueNoise(PNX.vector(0,0), width, height, 25, 30);
    
    offsetX = 100*Math.random();
    offsetY = 100*Math.random();
    
    p = [];
    
    for(i = 0; i < n.length; i += 1) {
        p.push(PNX.point(ctx, n[i]));
    }
    
    time = 0;
    
    back.fillRect(0, 0, width, height);
}

function loop() {
    back.fillRect(0, 0, width, height);
    ctx.clearRect(0, 0, width, height);
    
    for(i = 0; i < p.length; i += 1) {
        var noise = PNX.noise3D(p[i].position.x/width*2 + offsetX, p[i].position.y/height*2 + offsetY, time, 2, 0.8);
        
        if(noise > 0.3) {
            back.fillStyle = color.toHexString();
            ctx.fillStyle = PNX.color.mix(complement, color, Math.round(PNX.map(PNX.vector(PNX.mouseX, PNX.mouseY).distance(p[i].position), 0, 200, 0, 100)));
            ctx.beginPath();
            ctx.arc(p[i].position.x, p[i].position.y, PNX.map(noise, 0.3, 1, 0, 25), 0, 2*Math.PI);
            ctx.closePath();
            ctx.fill();
        }
    }  
    
    time += 1/120;
}

function keyPressed() {
    color.spin(PNX.random(20, 180));
    
    complement = color.complement().lighten(20).saturate(40);
}