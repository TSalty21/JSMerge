let current = 0;
let titles = ["Triangle to Circle", "Fire", "Inverse Kinematics", "Snake"];
let names = ["CtoT", "Fire", "invK", "snake"];

let projects = {};

let ctx;

let width = 512;
let height = 512;

function preload() {
    for (let p in projects) {
       if(projects.hasOwnProperty(p) && projects[p].preload) {
           projects[p].preload();
       } 
    };
}

function setup() {
    let container = document.getElementById("container");
    
    ctx = PNX.createCanvas(container, {
        width: width,
        height: height,
    },
                           1
                          )[0];
    
    ctx.save();
    
    ready();
}

function loop() {
   projects[names[current]].loop();
}

function next() {
    if(current < names.length - 1) {
        if(projects[names[current]].tOut) {
               clearTimeout(projects[names[current]].tOut);
           }
        current++;
        if(current === 1)
            document.getElementById("backButton").style.visibility = "visible";
        else if(current === names.length - 1) {
            document.getElementById("forwardButton").style.visibility = "hidden"
        }
        ready();
    }
}

function prev() {
    if(current > 0) {
        if(projects[names[current]].tOut) {
               clearTimeout(projects[names[current]].tOut);
           }
        current--;
        if(current === names.length - 2)
            document.getElementById("forwardButton").style.visibility = "visible";
        else if(current === 0) {
            document.getElementById("backButton").style.visibility = "hidden"
        }
        ready();
    }
}

function ready() {
    ctx.restore();
    ctx.save();
    ctx.clearRect(0,0,width,height);
    
   projects[names[current]].setup();
    if(projects[names[current]].keyTyped)
        window.keyTyped = projects[names[current]].keyTyped;
    document.getElementById("title").innerHTML = titles[current];
}