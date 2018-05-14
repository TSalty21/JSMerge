projects.Fire = (function() {
    let lib = {};
    
    var i, j;
    
    let source;

    lib.setup = function() {
        ctx.globalCompositeOperation = "lighter";

        source = pSystem(ctx, PNX.vector(width / 2, 0.8*height), PNX.vector(0, -1.5));
    }

    lib.loop = function () {
        ctx.clearRect(0,0,width,height);
        ctx.fillColor(PNX.color("black"));
        ctx.fillRect(0,0,width,height);
        
        source.position = PNX.vector(PNX.mouseX, PNX.mouseY);
        
        source.update();
        source.draw();
    }
    
    function fireParticle(ctx, position) {
        let startRadius = PNX.random(1, 25);
        let startColor = PNX.color("rgba(188, 96, 222, 0.15)");
        let endColor = PNX.color("rgba(60, 158, 230, 0.15)");
        let startLife = 7;
        let decayRate = 0.1;
        let obj = PNX.circle(ctx, position.clone(), startRadius, startColor);
        
        obj.velocity = PNX.vector(0,0);
        obj.life = startLife;
        
        obj.reset = function() {
            startRadius = PNX.random(1, 25);
            this.radius = startRadius;
            this.life = startLife;
            this.position = PNX.vector(PNX.mouseX, PNX.mouseY);
            this.velocity = PNX.vector(0,0);
            this.color = startColor.clone();
        }
        
        obj.update = function () {
            this.velocity.add(PNX.vector((PNX.random(0, 200) - 100) / 1500, -this.life/50));
            
            this.position.add(this.velocity);
            
            this.radius = startRadius*(this.life / startLife);
            this.color.a = startColor.a * (this.life / this.startLife);
            //this.color.desaturate(PNX.lerp(0.1, 0.5, this.life/startLife));
            this.color = PNX.color.mix(endColor, startColor, this.life/startLife*100);
            this.life -= decayRate;
            
            if(this.life < decayRate)
                this.reset();
        }
        
        return obj;
    }

    function pSystem(ctx, position) {
        let obj = {};

        let elements = [];
        
        let count = 200;

        obj.update = function () {
            if(elements.length < count)
                elements.push(fireParticle(ctx, this.position.clone()));
            elements.forEach((e) => { 
                e.update();
            });
        };

        obj.draw = function () {
            elements.forEach((e) => e.draw());
        };

        return obj;
    }
    
    return lib;
}());