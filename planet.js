let stars, sun, behindSun, beforeSun;

let width = 512;
let height = 512;

let starPos;

let planet;

let time;

let marsImg;

function preload() {
    marsImg = PNX.loadImage("mars.png");
}

function setup() {
    let container = document.getElementById("container");
    let ctxA = PNX.createCanvas(container, {
        width: width,
        height: height
    }, 4);
    
    beforeSun = ctxA[0];
    sun = ctxA[1];
    behindSun = ctxA[2];
    stars = ctxA[3];
    
    let sunColors = PNX.color("#fff500").analogous();
    
    stars.fillStyle = "#020207";
    
    stars.fillRect(0,0,width,height);
    
    stars.fillStyle = "#ffffff";
    
    starPos = Array.dim(1500, 0);
    
    starPos = starPos.map((e) => { return PNX.point(stars, PNX.vector().randomize(PNX.vector(0, 0), PNX.vector(width, height)))});
    
    starPos.forEach((e) => {
        e.draw(); 
        stars.globalAlpha = Math.random();
    });
    
    let r = 0.7*width;
    
    for(let i = 0; i < 4; i += 1) {
        sun.globalAlpha = i / 20;
        sun.fillStyle = sunColors[1].toHexString();
    
        sun.beginPath();
        sun.arc(width/2, height/2, (PNX.map(i, 0, 4, 0.32, 0.5))*r, 0, 2*Math.PI);
        sun.fill();
    }
    
    for(let i = 0; i < 4; i += 1) {
        sun.globalAlpha = i / 8;
        sun.fillStyle = sunColors[1].toHexString();
    
        sun.beginPath();
        sun.arc(width/2, height/2, (PNX.map(i, 0, 4, 0.23, 0.32))*r, 0, 2*Math.PI);
        sun.fill();
    }
    
    sun.globalAlpha = 1;
    
    sun.fillStyle = sunColors[2].toHexString();
    
    sun.beginPath();
    sun.arc(width/2, height/2, 0.23*r, 0, 2*Math.PI);
    sun.fill();
    
    sun.fillStyle = sunColors[0].toHexString();
    sun.beginPath();
    sun.arc(width/2, height/2, 0.22*r, 0, 2*Math.PI);
    sun.fill();
    
    sun.fillStyle = "white";
    sun.beginPath();
    sun.arc(width/2, height/2, 0.2*r, 0, 2*Math.PI);
    sun.fill();
    
    behindSun.fillStyle = "#aa1a00";
    beforeSun.fillStyle = "#aa1a00";
    
    planet = PNX.character(behindSun, PNX.vector(0,0), 50, 50, marsImg);
    
    time = 0;
}

function loop() {
    behindSun.clearRect(0,0,width, height);
    beforeSun.clearRect(0,0,width, height);
    
    planet.position = PNX.vector(width / 2, height / 2).add(PNX.vector(190*Math.cos(time), 50*Math.sin(time + Math.PI/3)));
    
    time += 0.01;
    
    if(time % (2*Math.PI) < Math.PI) {
        planet.draw(beforeSun);
    } else {
        planet.draw(behindSun);
    }
}