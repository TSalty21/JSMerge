projects.CtoT = (function() {
    let lib = {};
    
    var radius = 0.4*height;

    var r;
    var noise;

    var coeff = [0.5, 0.2, 0.085, 0.034, 0.014];

    var time;

    var z;

    var i, j;
    var color, complement;

    lib.setup = function() {
        color = PNX.color("#00b1ff");
        complement = color.complement();

        ctx.lineWidth = 1;
        ctx.fillColor(PNX.color("rgb(0,0,0)"));
        ctx.fillRect(0,0, width, height);

        ctx.globalAlpha = 0.07;
        ctx.globalCompositeOperation = "lighter";

        z = 0;
        time = 0;
        
        lib.fadeOut();
    }

    lib.loop = function () { 
        if (time < 2*Math.PI) {
            ctx.strokeStyle = PNX.color.mix(color, complement, 100*time/(2*Math.PI)).toHexString();
            ctx.globalAlpha = 0.07;
            drawPerlinTransform();
            time += 1 / 120;
        } else {
            time = 0;
            let temp = color.clone();
            color = complement.clone();
            complement = temp;
        }
    }
    
    lib.fadeOut = function() {
        ctx.fillColor(PNX.color("rgba(0,0,0,0.05)"));
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillRect(0,0,width,height);
        ctx.globalCompositeOperation = "lighter";
        
        lib.tOut = setTimeout(lib.fadeOut, 50);
    }

    function drawPerlinTransform() {
        ctx.beginPath();
        for(i = -Math.PI / 2; i <= Math.PI / 6; i += 2*Math.PI / 400) {
            noise = calcNoise(i);
            r = lin()*line1(i) + circ()*radius + radius*perl()*noise;
            ctx.lineTo(Math.floor(0.5*width + r*Math.cos(i)), Math.floor(0.5*height - r*Math.sin(i)));
        }

        for(i = Math.PI / 6; i <= 5*Math.PI / 6; i += 2*Math.PI / 400) {
            noise = calcNoise(i);
            r = lin()*line2(i) + circ()*radius + radius*perl()*noise;
            ctx.lineTo(Math.floor(0.5*width + r*Math.cos(i)), Math.floor(0.5*height - r*Math.sin(i)));
        }

        for(i = 5*Math.PI / 6; i <= 3 * Math.PI / 2; i += 2*Math.PI / 400) {
            noise = calcNoise(i);
            r = lin()*line3(i) + circ()*radius + radius*perl()*noise;
            ctx.lineTo(Math.floor(0.5*width + r*Math.cos(i)), Math.floor(0.5*height - r*Math.sin(i)));
        }

        ctx.closePath();
        ctx.stroke();
    }

    function drawTaylorTransform() {
        ctx.beginPath();
        for(i = -Math.PI / 2; i <= Math.PI / 6; i += 2*Math.PI / 200) {
            noise = calcNoise(i);
            r = lin()*line1(i) + circ()*radius + radius*perl()*taylor(i, -Math.PI/6);
            ctx.lineTo(Math.floor(0.5*width + r*Math.cos(i)), Math.floor(0.5*height - r*Math.sin(i)));
        }

        for(i = Math.PI / 6; i <= 5*Math.PI / 6; i += 2*Math.PI / 200) {
            noise = calcNoise(i);
            r = lin()*line2(i) + circ()*radius + radius*perl()*taylor(i, Math.PI/2);
            ctx.lineTo(Math.floor(0.5*width + r*Math.cos(i)), Math.floor(0.5*height - r*Math.sin(i)));
        }

        for(i = 5*Math.PI / 6; i <= 3 * Math.PI / 2; i += 2*Math.PI / 200) {
            noise = calcNoise(i);
            r = lin()*line3(i) + circ()*radius + radius*perl()*taylor(i, 7*Math.PI/6);
            ctx.lineTo(Math.floor(0.5*width + r*Math.cos(i)), Math.floor(0.5*height - r*Math.sin(i)));
        }

        ctx.closePath();
        ctx.stroke();
    }

    function line1(i) {
        return 0.5*radius/Math.sin(i-Math.PI/3);
    }

    function line2(i) {
        return -0.5*radius/Math.sin(i);
    }

    function line3(i) {
        return 0.5*radius/Math.sin(i+Math.PI/3);
    }

    function lin() {
        return 0.25 * (1 + Math.cos(time) + Math.cos(2*time) + Math.cos(3*time));
    }

    function circ() {
        return 0.25 * (-1 + Math.cos(time) + Math.cos(2*time  + Math.PI) + Math.cos(3*time));
    }

    function perl() {
        return -0.5*(1 - Math.cos(2*time));
    }

    function calcNoise(i) {
        return PNX.map(PNX.noise3D(0.5*(Math.cos(3*i) + 1), time + 0.5*(Math.sin(2*i) + 1), z, 3, 0.6), 0, 1, 0, 2);
    }

    function taylor(theta, bias) {
        var res = 1;
        for(j = 2; j <= 10; j+= 2) {
            res += 8*(2*PNX.noise2D(j*10.123+0.5*Math.sin(3*theta), time, 2, 0.8)-1)*coeff[0.5*(j-2)]*Math.pow(theta-bias, j);
        }
        return 0.5*res; 
    }
    
    return lib;
}());