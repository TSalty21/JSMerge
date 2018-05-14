projects.invK = (function() {
    var lib = {};
    
    var i, j;

    var offsetX, offsetY;

    var b;

    var angle;

    var roboArm = function (ctx, position, num, sLength) {
        var segments = [];
        var positions = [];

        var i;

        positions.push(position);
        segments.push(PNX.vector.fromPolar(sLength, PNX.random(-Math.PI/3, -2*Math.PI/3)));

        for(i = 1; i < num; i += 1) {
            positions.push(positions[i - 1].clone().add(segments[i - 1]));
            segments.push(PNX.vector.fromPolar(sLength, PNX.random(-Math.PI/3, -2*Math.PI/3)));
        }

        return {
            pointAt: function(point) {
                point.multiply(PNX.vector(0.10, 0.10)).add(positions[num - 1].clone().add(segments[num - 1]).multiply(PNX.vector(0.9, 0.9)));

                var angle = point.clone().substract(positions[num - 1]).angle();

                segments[num - 1].rotateTo(angle);
                positions[num - 1] = point.clone().substract(segments[num - 1]);

                for(i = num - 2; i >= 0; i -= 1) {
                    segments[i].rotateTo(positions[i + 1].clone().substract(positions[i]).angle());
                    positions[i] = positions[i + 1].clone().substract(segments[i]);
                }

                var offset = positions[0].clone().substract(position);

                for(i = 0; i < num; i += 1) {
                    //positions[i].substract(offset);
                }

            },
            draw: function () {
                ctx.beginPath();
                ctx.moveTo(positions[0].x, positions[0].y);

                for(i = 0; i < num; i += 1) {
                    ctx.lineTo(positions[i].x + segments[i].x, positions[i].y + segments[i].y);
                }
                ctx.stroke();
            }
        };
    }

    lib.setup = function() {
        ctx.strokeColor(PNX.color("#4075d8"));
        ctx.lineWidth = 15;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        //ctx.globalAlpha = 0.01;

        offsetX = 100*Math.random();
        offsetY = 100*Math.random();

        b = roboArm(ctx, PNX.vector(0.5*width, 0.5*height), 10, 40);

        angle = 0;
    }

    lib.loop = function () {
        ctx.clearRect(0,0,width, height);

        let p = PNX.vector.fromPolar(250, angle).add(PNX.vector(0.5*width, 0.5*height));
        if(PNX.mouseIsPressed || true) {
            b.pointAt(PNX.vector(PNX.mouseX, PNX.mouseY));
        }
        b.draw();
    }
    
    return lib;
}());