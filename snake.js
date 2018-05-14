projects.snake = (function (){
    let lib = {};
    
    let food = [];
    
    let sneaky;
    
    let grid;
    
    let color;
    
    let LEFT = PNX.vector(-1, 0);
    let RIGHT = PNX.vector(1, 0);
    let UP = PNX.vector(0, -1);
    let DOWN = PNX.vector(0, 1);
    
    lib.setup = function() {
        ctx.fillRect(0,0, width, height);
        
        color = PNX.color("rgb(0, 128, 255)");
        
        grid = createGrid(9);
        lib.grid = grid;
        
        //food.push(makeFood(ctx, PNX.vector(256,256), 32, color.complement()));
        
        sneaky = snake(ctx, width/9, color);
        
        lib.fadeOut();
    }

    lib.loop = function() {
        food.forEach(f => {
            f.update();
            f.draw();
        });
        
        ctx.globalCompositeOperation = "source-atop";
        
        grid.update();
        grid.draw();
        
        sneaky.update();
        sneaky.draw();
        
        ctx.globalCompositeOperation = "lighter";
    }
    
    lib.eat = function () {
        food[0].eat();
    }
    
    lib.fadeOut = function() {
        ctx.fillColor(PNX.color("rgba(0,0,0,0.15)"));
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillRect(0,0,width,height);
        ctx.globalCompositeOperation = "lighter";
        
        lib.tOut = setTimeout(lib.fadeOut, 50);
    }
    
    function makeFood(ctx, id, size, col) {
        let obj = {};
        
        let r = 0;
        let r2 = 0;
        let t = 0;
        
        let n = Math.round(PNX.random(3, 6));
        let n2 = Math.round(PNX.random(3, 6));
        
        let a = 0;
        let da = 0.003;
        
        let color = col.clone();
        color.setAlpha(a);
        
        let dead = false;
        
        obj.eat = function () {
            da *= -1;
        }
        
        obj.update = function() {
            t += 0.06;
            r = 0.5*size*(0.4*Math.sin(t) + 0.6);
            r2 = 0.5*size*(0.4*Math.sin(t + 0.7*Math.PI) + 0.6);
            
            if((a < 0.1 - da && da > 0) || (a > da && da < 0)) {
                color.setAlpha(a);
                a += da;
            }
            
            if(a < da) {
                dead = true;
                a = 0;
                color.setAlpha(a);
            }
        }
        
        obj.draw = function () {
            ctx.strokeColor(color);
            ctx.beginPath();
            ctx.moveTo(position.x + r*Math.cos(-t), position.y + r*Math.sin(-t));
            for(let i = 0; i < n; i += 1) {
                ctx.lineTo(position.x + r*Math.cos(2*Math.PI*i/n - t), position.y + r*Math.sin(2*Math.PI*i/n - t));
            }
            ctx.lineTo(position.x + r*Math.cos(-t), position.y + r*Math.sin(-t));
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(position.x + r2*Math.cos(t), position.y + r2*Math.sin(t));
            for(let i = 0; i < n2; i += 1) {
                ctx.lineTo(position.x + r2*Math.cos(2*Math.PI*i/n2 + t), position.y + r2*Math.sin(2*Math.PI*i/n2 + t));
            }
            ctx.lineTo(position.x + r2*Math.cos(t), position.y + r2*Math.sin(t));
            ctx.stroke();
        }
        
        return obj;
    }
    
    function body(ctx, id, size, col, prev, next) {
        let obj = {};
        
        obj.id = id;
        let pos = grid.getPos(id);
        
        let palette = col.monochromatic(5);
        
        let LeftPoints = [PNX.vector(-size/2, size/4), PNX.vector(-size/2, 0), PNX.vector(-size/2, -size/4)];
        let MiddlePoints = [PNX.vector(0, size/3), PNX.vector(0, -size/3)];
        let RightPoints = [PNX.vector(size/2, size/4), PNX.vector(size/2, 0), PNX.vector(size/2, -size/4)];
        
        let leftPoints = LeftPoints.map(v => v.clone());
        let middlePoints = MiddlePoints.map(v => v.clone());
        let rightPoints = RightPoints.map(v => v.clone());
        
        let angle = 0;
        
        let disp = [0,0,0];
        
        let prevDisp = [];
        
        obj.prev = prev;
        obj.next = next;
        
        obj.setDisp = function(d) {
            prevDisp.push(disp);
            disp = d;
        }
        
        obj.getDisp = function() {
            return disp;
        }
        
        obj.update = function() {
            pos = grid.getPos(this.id);
            
            leftPoints.forEach((v, i) => v.rotateTo(angle + LeftPoints[i].angle()));
            middlePoints.forEach((v, i) => v.rotateTo(angle + MiddlePoints[i].angle()));
            rightPoints.forEach((v, i) => v.rotateTo(angle + RightPoints[i].angle()));
            
             if(prevDisp.length > 50) {
                this.next.setDisp(prevDisp.shift());
             }
        };
        
        obj.draw = function() {
            let pDisp = this.prev.getDisp();
            
            ctx.fillColor(palette[4]);
            ctx.beginPath();
            ctx.moveTo(pos.x + leftPoints[0].x, pos.y + leftPoints[0].y + disp[0]);
            ctx.lineTo(pos.x + middlePoints[0].x + disp[2], pos.y + middlePoints[0].y);
            ctx.lineTo(pos.x + leftPoints[1].x, pos.y + leftPoints[1].y + disp[1]);
            ctx.fill();
            
            ctx.fillColor(palette[1]);
            ctx.beginPath();
            ctx.moveTo(pos.x + leftPoints[2].x, pos.y + leftPoints[2].y + disp[2]);
            ctx.lineTo(pos.x + middlePoints[1].x + disp[0], pos.y + middlePoints[1].y);
            ctx.lineTo(pos.x + leftPoints[1].x, pos.y + leftPoints[1].y + disp[1]);
            ctx.fill();
            
            ctx.fillColor(palette[2]);
            ctx.beginPath();
            ctx.moveTo(pos.x + rightPoints[0].x, pos.y + rightPoints[0].y + pDisp[0]);
            ctx.lineTo(pos.x + middlePoints[0].x + disp[2], pos.y + middlePoints[0].y);
            ctx.lineTo(pos.x + rightPoints[1].x, pos.y + rightPoints[1].y + pDisp[1]);
            ctx.fill();
            
            ctx.fillColor(palette[3]);
            ctx.beginPath();
            ctx.moveTo(pos.x + rightPoints[2].x, pos.y + rightPoints[2].y + pDisp[2]);
            ctx.lineTo(pos.x + middlePoints[1].x + disp[0], pos.y + middlePoints[1].y);
            ctx.lineTo(pos.x + rightPoints[1].x, pos.y + rightPoints[1].y + pDisp[1]);
            ctx.fill();
            
            ctx.fillColor(palette[0]);
            ctx.beginPath();
            ctx.moveTo(pos.x + leftPoints[1].x, pos.y + leftPoints[1].y + disp[1]);
            ctx.lineTo(pos.x + middlePoints[0].x + disp[2], pos.y + middlePoints[0].y);
            ctx.lineTo(pos.x + rightPoints[1].x, pos.y + rightPoints[1].y + pDisp[1]);
            ctx.lineTo(pos.x + middlePoints[1].x + disp[0], pos.y + middlePoints[1].y);
            ctx.fill();
        };
        
        return obj;
    }

    function tail(ctx, id, size, col, prev) {
        let obj = {};
        
        obj.id = id;
        let pos = grid.getPos(id);
        
        let palette = col.monochromatic(3);
        
        let LeftPoints = [PNX.vector(-size/2, 0)];
        let MiddlePoints = [PNX.vector(0, size/5), PNX.vector(0, -size/5)];
        let RightPoints = [PNX.vector(size/2, size/4), PNX.vector(size/2, 0), PNX.vector(size/2, -size/4)];
        
        let leftPoints = LeftPoints.map(v => v.clone());
        let middlePoints = MiddlePoints.map(v => v.clone());
        let rightPoints = RightPoints.map(v => v.clone());
        
        let angle = 0;
        
        let disp = [0,0,0];
        
        obj.prev = prev;
        
        obj.setDisp = function(d) {
            disp = d;
        }
        
        obj.getDisp = function() {
            return disp;
        }
        
        obj.update = function() {
            pos = grid.getPos(this.id);
            
            leftPoints.forEach((v, i) => v.rotateTo(angle + LeftPoints[i].angle()));
            middlePoints.forEach((v, i) => v.rotateTo(angle + MiddlePoints[i].angle()));
            rightPoints.forEach((v, i) => v.rotateTo(angle + RightPoints[i].angle()));
        };
        
        obj.draw = function() {
            let pDisp = this.prev.getDisp();
            
            ctx.fillColor(palette[1]);
            ctx.beginPath();
            ctx.moveTo(pos.x + rightPoints[0].x, pos.y + rightPoints[0].y + pDisp[0]);
            ctx.lineTo(pos.x + middlePoints[0].x + disp[2], pos.y + middlePoints[0].y);
            ctx.lineTo(pos.x + rightPoints[1].x, pos.y + rightPoints[1].y + pDisp[1]);
            ctx.fill();
            
            ctx.fillColor(palette[2]);
            ctx.beginPath();
            ctx.moveTo(pos.x + rightPoints[2].x, pos.y + rightPoints[2].y + pDisp[2]);
            ctx.lineTo(pos.x + middlePoints[1].x + disp[0], pos.y + middlePoints[1].y);
            ctx.lineTo(pos.x + rightPoints[1].x, pos.y + rightPoints[1].y + pDisp[1]);
            ctx.fill();
            
            ctx.fillColor(palette[0]);
            ctx.beginPath();
            ctx.moveTo(pos.x + leftPoints[0].x, pos.y + leftPoints[0].y + disp[1]);
            ctx.lineTo(pos.x + middlePoints[0].x + disp[2], pos.y + middlePoints[0].y);
            ctx.lineTo(pos.x + rightPoints[1].x, pos.y + rightPoints[1].y + pDisp[1]);
            ctx.lineTo(pos.x + middlePoints[1].x + disp[0], pos.y + middlePoints[1].y);
            ctx.fill();
        };
        
        return obj;
    }
    
    function head(ctx, id, size, col, next) {
        let obj = {};
        
        obj.id = id;
        let pos = grid.getPos(id);
        
        let palette = col.monochromatic(5);
        
        let eyeColor = col.complement();
        eyeColor.setAlpha(0.8);
        
        let LeftPoints = [PNX.vector(-size/2, size/4), PNX.vector(-size/2, 0), PNX.vector(-size/2, -size/4)];
        let MiddlePoints = [PNX.vector(-size/4, size/3), PNX.vector(-size/4, -size/3), PNX.vector(size/5, size/4), PNX.vector(size/5, -size/4)];
        let RightPoints = [PNX.vector(size/2, size/6), PNX.vector(size/2, 0), PNX.vector(size/2, -size/6)];
        
        let leftPoints = LeftPoints.map(v => v.clone());
        let middlePoints = MiddlePoints.map(v => v.clone());
        let rightPoints = RightPoints.map(v => v.clone());
        
        let angle = 0;
        
        let disp = [0,0,0];
        
        let prevDisp = [];
        
        obj.next = next;
        
        obj.setDisp = function(d) {
            prevDisp.push(disp);
            disp = d;
        }
        
        obj.getDisp = function() {
            return disp;
        }
        
        obj.update = function() {
            pos = grid.getPos(this.id);
            
            if(prevDisp.length > 50) {
                this.next.setDisp(prevDisp.shift());
            }
            
            leftPoints.forEach((v, i) => v.rotateTo(angle + LeftPoints[i].angle()));
            middlePoints.forEach((v, i) => v.rotateTo(angle + MiddlePoints[i].angle()));
            rightPoints.forEach((v, i) => v.rotateTo(angle + RightPoints[i].angle()));
        };
        
        obj.draw = function() {
            ctx.fillColor(palette[4]);
            ctx.beginPath();
            ctx.moveTo(pos.x + leftPoints[0].x, pos.y + leftPoints[0].y + disp[0]);
            ctx.lineTo(pos.x + middlePoints[0].x, pos.y + middlePoints[0].y);
            ctx.lineTo(pos.x + leftPoints[1].x, pos.y + leftPoints[1].y + disp[1]);
            ctx.fill();
            
            ctx.fillColor(palette[1]);
            ctx.beginPath();
            ctx.moveTo(pos.x + leftPoints[2].x, pos.y + leftPoints[2].y + disp[2]);
            ctx.lineTo(pos.x + middlePoints[1].x, pos.y + middlePoints[1].y);
            ctx.lineTo(pos.x + leftPoints[1].x, pos.y + leftPoints[1].y + disp[1]);
            ctx.fill();
            
            ctx.fillColor(palette[2]);
            ctx.beginPath();
            ctx.moveTo(pos.x + rightPoints[0].x, pos.y + rightPoints[0].y);
            ctx.moveTo(pos.x + middlePoints[2].x, pos.y + middlePoints[2].y);
            ctx.lineTo(pos.x + middlePoints[0].x, pos.y + middlePoints[0].y);
            ctx.lineTo(pos.x + rightPoints[1].x, pos.y + rightPoints[1].y);
            ctx.fill();
            
            ctx.fillColor(palette[3]);
            ctx.beginPath();
            ctx.moveTo(pos.x + rightPoints[2].x, pos.y + rightPoints[2].y);
            ctx.moveTo(pos.x + middlePoints[3].x, pos.y + middlePoints[3].y);
            ctx.lineTo(pos.x + middlePoints[1].x, pos.y + middlePoints[1].y);
            ctx.lineTo(pos.x + rightPoints[1].x, pos.y + rightPoints[1].y);
            ctx.fill();
            
            ctx.fillColor(eyeColor);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 0.23*size, 0, 2*Math.PI);
            ctx.fill();
            
            ctx.fillColor(palette[0]);
            ctx.beginPath();
            ctx.moveTo(pos.x + leftPoints[1].x, pos.y + leftPoints[1].y + disp[1]);
            ctx.lineTo(pos.x + middlePoints[0].x, pos.y + middlePoints[0].y);
            ctx.lineTo(pos.x + rightPoints[1].x, pos.y + rightPoints[1].y);
            ctx.lineTo(pos.x + middlePoints[1].x, pos.y + middlePoints[1].y);
            ctx.fill();
        };
        
        return obj;
    }
    
    function snake(ctx, size, col) {
        let obj = {};
        
        let speed = 0.5;
        let dir = RIGHT;
        
        let velocity = dir.clone().multiply(PNX.vector(speed, speed));
        
        let H = head(ctx, 2, size, col);
        
        let B = [];
        
        B.push(body(ctx, 1, size, col, H, undefined));
        
        let T = tail(ctx, 0, size, col, B[0]);
        
        H.next = B[0];
        B[0].next = T;
        
        let t = 0;
        
        obj.setDirection = function (d) {
            dir = d;
            grid.setPath(H.id, dir);
        };
        
        obj.getDirection = function () {
            return dir;
        };
        
        obj.advance = function(n) {
            T.id = B[B.length - 1].id;
            B.forEach((b, i) => {
                if(i > 0)
                    b.id = B[i-1].id;
            });
            B[0].id = H.id;
            H.id += n;
            
            grid.reset(H.id);
            grid.setPath(H.id, dir);
        };
        
        obj.update = function() {
           let d1 = PNX.map(PNX.noise1D(t), 0, 1, -0.2*size, 0.2*size);
           let d2 = PNX.map(PNX.noise1D(t+0.1), 0, 1, -0.2*size, 0.2*size);
           let d3 = PNX.map(PNX.noise1D(t+0.2), 0, 1, -0.2*size, 0.2*size);
            H.setDisp([d1, d2, d3]);
            
            H.update();
            B.forEach(b => b.update());
            T.update(); 
            
            t += 0.015;
        };
        
        obj.draw = function () {
            H.draw();
            B.forEach(b => b.draw());
            T.draw();
        };
        
        return obj;
    }
    
    function cell(id, position, size) {
        let obj = {};

        obj.set = false;
        obj.active = true;
        let startPos;
        let prevStartPos;
        let endPos;
        
        obj.pos = position;
        
        obj.setPath = function(dir) {
            if(!this.set && this.active) {
                startPos = dir.clone().invert();
                endPos = dir.clone();
                this.set = true;
            } else if(this.active) {
                prevStartPos = startPos.clone();
                startPos = grid.getPos(id).substract(position).divide(PNX.vector(size/2, size/2));
                endPos = dir.clone();
                this.active = false;
                console.log(startPos);
            }
        };
        
        obj.reset = function () {
            this.set = false;
            this.active = true;
        };
        
        obj.getPos = function(t) {
            return PNX.vector((endPos.x-startPos.x)*t+startPos.x,
            (endPos.y-startPos.y)*t+startPos.y).multiply(PNX.vector(size/2, size/2)).add(position);
        };
        
        obj.getAngle = function(t) {
            return ((endPos.x*startPos.y - startPos.x*endPos.y)*Math.PI/2*t+startPos.angle()) % (2*Math.PI);
        };
        
        obj.draw = function() {
            ctx.strokeColor(PNX.color("white"));
            ctx.strokeRect(position.x-size/2, position.y-size/2, size, size);
        };
        
        return obj;
    }
    
    function createGrid(n) {
        let obj = {};
        
        let cells = [];
        for(let i = 0; i < n; i += 1) {
            for(let j = 0; j < n; j += 1) {
                cells.push(cell(i*n+j, PNX.vector(width/n*(j+0.5), height/n*(i+0.5)), width/n));
                cells[i*n+j].setPath(RIGHT);
            }
        }
        
        let t = 0, dt = 0.005;
        
        obj.setPath = function(ind, dir) {
            cells[ind].setPath(dir);
        };
        
        obj.cellPos = function(id) {
            return cells[id].pos;
        };
        
        obj.getPos = function (ind) {
            return cells[ind].getPos(t);
        };
        
        obj.getAngle = function (ind) {
            return cells[ind].getAngle(t);
        };
        
        obj.reset = function(id) {
            cells[id].reset();
        };
        
        obj.update = function() {
            if(t < 1 - dt) {
                t += dt;
            } else {
                t = 0;
                let d = sneaky.getDirection();
                sneaky.advance(d.x + n*d.y);
            }
        };
        
        obj.draw = function() {
            cells.forEach(c => c.draw());
        }
        
        return obj;
    }
    
    lib.keyTyped = function() {
        if(PNX.key === "d" && !sneaky.getDirection().isEqualTo(LEFT)) {
            sneaky.setDirection(RIGHT);
        }
        if(PNX.key === "a" && !sneaky.getDirection().isEqualTo(RIGHT)) {
            sneaky.setDirection(LEFT);
        }
        if(PNX.key === "w" && !sneaky.getDirection().isEqualTo(DOWN)) {
            sneaky.setDirection(UP);
        }
        if(PNX.key === "s" && !sneaky.getDirection().isEqualTo(UP)) {
            sneaky.setDirection(DOWN);
        }
    }
    
    return lib;
}());