//Saját készítésű kis könyvtárunk
var PNX = (function (window, document) {
    "use strict";
    
    var lib = {};
    
    var transitionList = [], transitionFunctions = {};
    
    var loadCount = 0;
    
    var i, j, k;
    
    var loop = true;
    
    //Input variables
    lib.keyIsPressed = false;
    lib.key = undefined;
    lib.keyCode = undefined;
    lib.keyIsDown = function (k) {
        if (keys.includes(k) || keyCodes.includes(k))
            return true;
        
        return false;
    };
    
    var keys = [];
    var keyCodes = [];
    
    lib.mouseX = 0;
    lib.mouseY = 0;
    lib.pmouseX = 0;
    lib.pmouseY = 0;
    lib.mouseButton = undefined;
    lib.mouseIsPressed = false;
    
    //Basic augmentations
    (function () {
        if (typeof Object.create !== 'function') {
            Object.create = function (parent) {
                var F = function () {};
                F.prototype = parent;
                return new F();
            };
        }

        if (typeof Function.prototype.method !== 'function') {
           Function.prototype.method = function (name, func, override) {
               if(!this.prototype[name] || override) {
                   this.prototype[name] = func;
               }

               return this;
           };
        }

        Array.dim = function (dimension, initial) {
            var a = [], i;

            for(i = 0; i < dimension; i += 1) {
                a[i] = initial;
            }

            return a;
        }

        Array.matrix = function (m, n, initial) {
            var a, i, j, mat = [];

            for(i = 0; i < m; i += 1) {
                a = [];
                for(j = 0; j < n; j += 1) {
                    a[j] = initial;
                }
                mat[i] = a;
            }
            
            mat.width = m;
            mat.height = n;

            return mat;
        };

        Array.identity = function (n) {
            var i, mat = new Array.matrix(n, n, 0);

            for(i = 0; i < n; i += 1) {
                mat[i][i] = 1;
            }

            return mat;
        };
        
        CanvasRenderingContext2D.method("drawRotatedImage", function (img, sx, sy, angle, swidth, sheight, x, y, width, height) {
            this.save();
            if(swidth === undefined) {
                this.translate(sx, sy);
                this.rotate(-angle);
                this.drawImage(img, -img.width/2, -img.height/2);
            } else if(x === undefined) {
                this.translate(sx, sy);
                this.rotate(-angle);
                this.drawImage(img, -swidth/2, -sheight/2, swidth, sheight);
            } else {
                this.translate(x, y);
                this.rotate(-angle);
                this.drawImage(img, sx, sy, swidth, sheight, -width/2, -height/2, width, height);
            }
            this.restore();
        });
        
        CanvasRenderingContext2D.method("fillColor", function (color) {
            if(this.globalAlpha !== color._roundA) {
                this.globalAlpha = color._roundA;
            }
            
            if(this.fillStyle !== color.toHexString()) {
                this.fillStyle = color.toHexString();
            }
        });
        
        CanvasRenderingContext2D.method("strokeColor", function (color) {
            if(this.globalAlpha !== color._roundA) {
                this.globalAlpha = color._roundA;
            }
            
            if(this.strokeStyle !== color.toHexString()) {
                this.strokeStyle = color.toHexString();
            }
        });
        
        CanvasRenderingContext2D.method("textProperties", function (format) {
            if(format.font && this.font !== format.font) {
                this.font = format.font;
            }
            
            if(format.textAlign && this.textAlign !== format.textAlign) {
                this.textAlign = format.textAlign;
            }
            
            if(format.textBaseline && this.textBaseline !== format.textBaseline) {
                this.textBaseline = format.textBaseline;
            }
        });
    }());
    
    //Utility functions
    (function () {
        lib.random = function (min, max) {
            max = max || 1;
            min = min || 0;

            return (max - min) * Math.random() + min;
        };
        
        lib.indToPos = function (ind, N) {
            return [ind % N, Math.floor(ind / N)];
        };
        
        lib.posToInd = function (x, y, N) {
            return x + N * y;
        };
        
        lib.coordinateToInd = function (pos, topLeft, bottomRight, nX, nY) {
            return pos.clone().substract(topLeft).divide(bottomRight.clone().substract(topLeft)).multiply(lib.vector(nX, nY)).floor();
        }
        
        lib.map = function (val, min1, max1, min2, max2) {
            return (val - min1) * (max2 - min2) / (max1 - min1) + min2;
        };
        
        lib.loadImage = function (src) {
            loadCount++;
            
            var img = new Image();
            img.addEventListener('load', function () { 
                loadCount--;
                if(loadCount === 0 && window.setup) {
                    window.setup();
                    innerLoop();
                }
            });
            img.addEventListener('error', function () {
                loadCount--;
                if(loadCount === 0 && window.setup) {
                    window.setup();
                    innerLoop();
                }
            });
            img.src = src;
            
            return img;
        }
    }());
    
    //Canvas stuff
    (function () {
        lib.surfaces = {};
    
        lib.createCanvas = function (htmlElement, params, layers) {
            layers = layers || 1;
            params = params || {};

            var canvases = [], ctx = [];

            for (i = 0; i < layers; i += 1) {
                canvases.push(document.createElement('canvas'));
                htmlElement.appendChild(canvases[i]);

                canvases[i].width = params.width || window.getComputedStyle(htmlElement, null).width;
                canvases[i].height = params.height || window.getComputedStyle(htmlElement, null).height;
                canvases[i].style.position = "absolute";
                canvases[i].style.top = 0;
                canvases[i].style.left = 0;
                canvases[i].style.width = window.getComputedStyle(htmlElement, null).width;
                canvases[i].style.height = window.getComputedStyle(htmlElement, null).height;
                if (lib.surfaces[htmlElement.getAttribute('id')]) {
                    canvases[i].style.zIndex = -(i + lib.surfaces[htmlElement.getAttribute('id')].layers);
                } else {
                    canvases[i].style.zIndex = -i;
                }
                canvases[i].style.backgroundColor = "transparent";

                ctx.push(canvases[i].getContext("2d"));
            }
            if (!lib.surfaces[htmlElement.getAttribute('id')]) {
                lib.surfaces[htmlElement.getAttribute('id')] = {};
                lib.surfaces[htmlElement.getAttribute('id')].canvases = canvases;
                lib.surfaces[htmlElement.getAttribute('id')].ctx =  ctx;
                lib.surfaces[htmlElement.getAttribute('id')].layers = layers;
                canvases[0].addEventListener("mousemove", function (e) {
                    lib.pmouseX = lib.mouseX;
                    lib.pmouseY = lib.mouseY;
                    
                    var rect = this.getBoundingClientRect();
                    lib.mouseX = Math.floor((e.clientX - rect.left)/(rect.right-rect.left) * this.width);
                    lib.mouseY = Math.floor((e.clientY - rect.top)/(rect.bottom-rect.top) * this.height);
                    
                    if(window.mouseMoved) {
                        window.mouseMoved();
                    }
                    
                    if(lib.mouseIsPressed && window.mouseDragged) {
                        window.mouseDragged();
                    }
                });
                
                canvases[0].addEventListener("mousedown", function (e) {
                    switch(e.button) {
                        case 0:
                            lib.mouseButton = "Left";
                            break;
                        case 1:
                            lib.mouseButton = "Center";
                            break;
                        case 2:
                            lib.mouseButton = "Right";
                            break;
                    }
                    
                    lib.mouseIsPressed = true;
                    
                    if(window.mousePressed) {
                        window.mousePressed();
                    }
                });
                
                canvases[0].addEventListener("mouseup", function (e) {
                    lib.mouseIsPressed = false;
                    
                    if(window.mouseReleased) {
                        window.mouseReleased();
                    }
                });
                
                canvases[0].addEventListener("click", function (e) {
                    if(window.mouseClicked) {
                        window.mouseClicked();
                    }
                });
            } else {
                lib.surfaces[htmlElement.getAttribute('id')].canvases = lib.surfaces[htmlElement.getAttribute('id')].canvases.concat(canvases);
                lib.surfaces[htmlElement.getAttribute('id')].ctx = lib.surfaces[htmlElement.getAttribute('id')].ctx.concat(ctx);
                lib.surfaces[htmlElement.getAttribute('id')].layers += layers;
            }
            
            return ctx;
        };
    }());
     
    //Base objects
    (function () {
        lib.point = function (ctx, position, color) {         
            return {
                ctx: ctx,
                position: position,
                color: color || lib.color("black"),
                draw: function () {
                    if(arguments[0]) {
                        arguments[0].fillColor(this.color);
                        arguments[0].fillRect(this.position.x, this.position.y, 1, 1);
                    } else {
                        this.ctx.fillColor(this.color);
                        this.ctx.fillRect(this.position.x, this.position.y, 1, 1);
                    }
                }
            };
        };
        
        lib.rectangle = function (ctx, position, sizeX, sizeY, color) {
            var obj = lib.point(ctx, position, color);
            obj.sizeX = sizeX;
            obj.sizeY = sizeY;
            
            obj.draw = function () {
                if(arguments[0]) {
                    arguments[0].fillColor(this.color);
                    arguments[0].fillRect(this.position.x, this.position.y, this.sizeX, this.sizeY);
                } else {
                    this.ctx.fillColor(this.color);
                    this.ctx.fillRect(this.position.x, this.position.y, this.sizeX, this.sizeY);
                }
            };
            
            return obj;
        };
        
        lib.circle = function (ctx, position, radius, color) {
            var obj = lib.point(ctx, position, color);
            obj.radius = radius;
            
            obj.draw = function () {
                if(arguments[0]) {
                    arguments[0].fillColor(this.color);
                    arguments[0].beginPath();
                    arguments[0].arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
                    arguments[0].fill();
                } else {
                    this.ctx.fillColor(this.color);
                    this.ctx.beginPath();
                    this.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
                    this.ctx.fill();
                }
            };
            
            return obj;
        };
        
        lib.particle = function (ctx, position, velocity, sizeX, sizeY, color) {
            
            var obj = lib.rectangle(ctx, position, sizeX, sizeY, color);
            
            obj.velocity = velocity;
            
            obj.update = function () {
                    position.add(velocity);
            };
            
            return obj;
        };
        
        lib.character = function (ctx, position, sizeX, sizeY, img, angle) {
            var obj = lib.rectangle(ctx, position, sizeX, sizeY);
            
            obj.angle = angle || 0;
            
            obj.draw = function () {
                if(arguments[0]) {
                    arguments[0].fillColor(this.color);
                    arguments[0].drawRotatedImage(img, this.position.x, this.position.y, this.angle, this.sizeX, this.sizeY);
                } else {
                    this.ctx.fillColor(this.color);
                    this.ctx.drawRotatedImage(img, this.position.x, this.position.y, this.angle, this.sizeX, this.sizeY);
                }
            };
            
            return obj;
        };     
        
        lib.grid = function (ctx, position, width, height, nX, nY, initial) {
            var i, j;
            
            var obj = lib.rectangle(ctx, position, width, height);
            
            obj.tSizeX = Math.ceil(width / nX);
            obj.tSizeY = Math.ceil(height / nY);
            
            obj.cells = Array.matrix(nX, nY, initial);
            
            obj.coordinateToInd = function (pos) {
                return pos.clone().substract(this.position).divide(PNX.vector(this.sizeX, this.sizeY)).multiply(lib.vector(nX, nY)).floor();
            };
            obj.draw = function () {
                for(i = 0; i < nX; i += 1) {
                    for(j = 0; j < nY; j += 1) {
                        this.ctx.strokeColor(this.color);
                        this.ctx.strokeRect(this.position.x + i*this.tSizeX, this.position.y + j*this.tSizeY, this.tSizeX, this.tSizeY);
                    }
                }
            };
            
            return obj;
        };
        
        lib.text = function (ctx, position, color, format, initial) {
            format = format || {};
            
            var obj = lib.point(ctx, position, color);
            
            format.font = format.font || "18px Arial";
            format.textAlign = format.textAlign || "center";
            format.textBaseline = format.textBaseline || "middle";
            
            obj.format = format;
            
            obj.value = initial || "";
            
            obj.draw = function () {
                    if(arguments[0]) {
                        arguments[0].textProperties(this.format);
                        arguments[0].fillColor(this.color);
                        arguments[0].fillText(this.value, this.position.x, this.position.y);
                    } else {
                        this.ctx.textProperties(this.format);
                        this.ctx.fillColor(this.color);
                        this.ctx.fillText(this.value, this.position.x, this.position.y);
                    }
                };
            
            return obj;
        };
    }());
    
    //Colors
    (function () {
        var trimLeft = /^\s+/;
        var trimRight = /^\s+$/;
        var counter = 0;
        
        lib.color = function (color, opts) {
            color = color || "";
            opts = opts || {};
            
            if(color instanceof lib.color) {
                return color;
            }
            
            var obj = Object.create(lib.color.prototype);
            var rgb = inputToRGB(color);
            obj._originalInput = color,
            obj._r = rgb.r,
            obj._g = rgb.g,
            obj._b = rgb.b,
            obj._a = rgb.a,
            obj._roundA = Math.round(100*obj._a) / 100,
            obj._format = opts.format || rgb.format;
            obj._gradientType = opts.gradientType;

            // Don't let the range of [0,255] come back in [0,1].
            // Potentially lose a little bit of precision here, but will fix issues where
            // .5 gets interpreted as half of the total, instead of half of 1
            // If it was supposed to be 128, this was already taken care of by `inputToRgb`
            if (obj._r < 1) { obj._r = Math.round(obj._r); }
            if (obj._g < 1) { obj._g = Math.round(obj._g); }
            if (obj._b < 1) { obj._b = Math.round(obj._b); }

            obj._ok = rgb.ok;
            obj._tc_id = counter++;
            
            return obj;
        }

        lib.color.prototype = {
            isDark: function() {
                return this.getBrightness() < 128;
            },
            isLight: function() {
                return !this.isDark();
            },
            isValid: function() {
                return this._ok;
            },
            getOriginalInput: function() {
              return this._originalInput;
            },
            getFormat: function() {
                return this._format;
            },
            getAlpha: function() {
                return this._a;
            },
            getBrightness: function() {
                //http://www.w3.org/TR/AERT#color-contrast
                var rgb = this.toRgb();
                return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            },
            getLuminance: function() {
                //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
                var rgb = this.toRgb();
                var RsRGB, GsRGB, BsRGB, R, G, B;
                RsRGB = rgb.r/255;
                GsRGB = rgb.g/255;
                BsRGB = rgb.b/255;

                if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
                if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
                if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
                return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
            },
            setAlpha: function(value) {
                this._a = boundAlpha(value);
                this._roundA = Math.round(100*this._a) / 100;
                return this;
            },
            toHsv: function() {
                var hsv = rgbToHsv(this._r, this._g, this._b);
                return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
            },
            toHsvString: function() {
                var hsv = rgbToHsv(this._r, this._g, this._b);
                var h = Math.round(hsv.h * 360), s = Math.round(hsv.s * 100), v = Math.round(hsv.v * 100);
                return (this._a == 1) ?
                  "hsv("  + h + ", " + s + "%, " + v + "%)" :
                  "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
            },
            toHsl: function() {
                var hsl = rgbToHsl(this._r, this._g, this._b);
                return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
            },
            toHslString: function() {
                var hsl = rgbToHsl(this._r, this._g, this._b);
                var h = Math.round(hsl.h * 360), s = Math.round(hsl.s * 100), l = Math.round(hsl.l * 100);
                return (this._a == 1) ?
                  "hsl("  + h + ", " + s + "%, " + l + "%)" :
                  "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
            },
            toHex: function(allow3Char) {
                return rgbToHex(this._r, this._g, this._b, allow3Char);
            },
            toHexString: function(allow3Char) {
                return '#' + this.toHex(allow3Char);
            },
            toHex8: function(allow4Char) {
                return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
            },
            toHex8String: function(allow4Char) {
                return '#' + this.toHex8(allow4Char);
            },
            toRgb: function() {
                return { r: Math.round(this._r), g: Math.round(this._g), b: Math.round(this._b), a: this._a };
            },
            toRgbString: function() {
                return (this._a == 1) ?
                  "rgb("  + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ")" :
                  "rgba(" + Math.round(this._r) + ", " + Math.round(this._g) + ", " + Math.round(this._b) + ", " + this._roundA + ")";
            },
            toPercentageRgb: function() {
                return { r: Math.round(bound01(this._r, 255) * 100) + "%", g: Math.round(bound01(this._g, 255) * 100) + "%", b: Math.round(bound01(this._b, 255) * 100) + "%", a: this._a };
            },
            toPercentageRgbString: function() {
                return (this._a == 1) ?
                  "rgb("  + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%)" :
                  "rgba(" + Math.round(bound01(this._r, 255) * 100) + "%, " + Math.round(bound01(this._g, 255) * 100) + "%, " + Math.round(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
            },
            toName: function() {
                if (this._a === 0) {
                    return "transparent";
                }

                if (this._a < 1) {
                    return false;
                }

                return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
            },
            toString: function(format) {
                var formatSet = !!format;
                format = format || this._format;

                var formattedString = false;
                var hasAlpha = this._a < 1 && this._a >= 0;
                var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name");

                if (needsAlphaFormat) {
                    // Special case for "transparent", all other non-alpha formats
                    // will return rgba when there is transparency.
                    if (format === "name" && this._a === 0) {
                        return this.toName();
                    }
                    return this.toRgbString();
                }
                if (format === "rgb") {
                    formattedString = this.toRgbString();
                }
                if (format === "prgb") {
                    formattedString = this.toPercentageRgbString();
                }
                if (format === "hex" || format === "hex6") {
                    formattedString = this.toHexString();
                }
                if (format === "hex3") {
                    formattedString = this.toHexString(true);
                }
                if (format === "hex4") {
                    formattedString = this.toHex8String(true);
                }
                if (format === "hex8") {
                    formattedString = this.toHex8String();
                }
                if (format === "name") {
                    formattedString = this.toName();
                }
                if (format === "hsl") {
                    formattedString = this.toHslString();
                }
                if (format === "hsv") {
                    formattedString = this.toHsvString();
                }

                return formattedString || this.toHexString();
            },
            clone: function() {
                return lib.color(this.toString());
            },

            _applyModification: function(fn, args) {
                var color = fn.apply(null, [this].concat([].slice.call(args)));
                this._r = color._r;
                this._g = color._g;
                this._b = color._b;
                this.setAlpha(color._a);
                return this;
            },
            lighten: function() {
                return this._applyModification(lighten, arguments);
            },
            brighten: function() {
                return this._applyModification(brighten, arguments);
            },
            darken: function() {
                return this._applyModification(darken, arguments);
            },
            desaturate: function() {
                return this._applyModification(desaturate, arguments);
            },
            saturate: function() {
                return this._applyModification(saturate, arguments);
            },
            greyscale: function() {
                return this._applyModification(greyscale, arguments);
            },
            spin: function() {
                return this._applyModification(spin, arguments);
            },
            
            _applyCombination: function(fn, args) {
                return fn.apply(null, [this].concat([].slice.call(args)));
            },
            analogous: function() {
                return this._applyCombination(analogous, arguments);
            },
            complement: function() {
                return this._applyCombination(complement, arguments);
            },
            monochromatic: function() {
                return this._applyCombination(monochromatic, arguments);
            },
            splitcomplement: function() {
                return this._applyCombination(splitcomplement, arguments);
            },
            triad: function() {
                return this._applyCombination(triad, arguments);
            },
            tetrad: function() {
                return this._applyCombination(tetrad, arguments);
            }
        };

        // If input is an object, force 1 into "1.0" to handle ratios properly
        // String input requires "1.0" as input, so 1 will be treated as 1
        lib.color.fromRatio = function(color, opts) {
            if (typeof color == "object") {
                var newColor = {};
                for (var i in color) {
                    if (color.hasOwnProperty(i)) {
                        if (i === "a") {
                            newColor[i] = color[i];
                        }
                        else {
                            newColor[i] = convertToPercentage(color[i]);
                        }
                    }
                }
                color = newColor;
            }

            return lib.color(color, opts);
        };

        // Given a string or object, convert that input to RGB
        // Possible string inputs:
        //
        //     "red"
        //     "#f00" or "f00"
        //     "#ff0000" or "ff0000"
        //     "#ff000000" or "ff000000"
        //     "rgb 255 0 0" or "rgb (255, 0, 0)"
        //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
        //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
        //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
        //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
        //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
        //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
        //
        function inputToRGB(color) {

            var rgb = { r: 0, g: 0, b: 0 };
            var a = 1;
            var s = null;
            var v = null;
            var l = null;
            var ok = false;
            var format = false;

            if (typeof color == "string") {
                color = stringInputToObject(color);
            }

            if (typeof color == "object") {
                if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
                    rgb = rgbToRgb(color.r, color.g, color.b);
                    ok = true;
                    format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
                }
                else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
                    s = convertToPercentage(color.s);
                    v = convertToPercentage(color.v);
                    rgb = hsvToRgb(color.h, s, v);
                    ok = true;
                    format = "hsv";
                }
                else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
                    s = convertToPercentage(color.s);
                    l = convertToPercentage(color.l);
                    rgb = hslToRgb(color.h, s, l);
                    ok = true;
                    format = "hsl";
                }

                if (color.hasOwnProperty("a")) {
                    a = color.a;
                }
            }

            a = boundAlpha(a);

            return {
                ok: ok,
                format: color.format || format,
                r: Math.min(255, Math.max(rgb.r, 0)),
                g: Math.min(255, Math.max(rgb.g, 0)),
                b: Math.min(255, Math.max(rgb.b, 0)),
                a: a
            };
        }


        // Conversion Functions
        // --------------------

        // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
        // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

        // `rgbToRgb`
        // Handle bounds / percentage checking to conform to CSS color spec
        // <http://www.w3.org/TR/css3-color/>
        // *Assumes:* r, g, b in [0, 255] or [0, 1]
        // *Returns:* { r, g, b } in [0, 255]
        function rgbToRgb(r, g, b){
            return {
                r: bound01(r, 255) * 255,
                g: bound01(g, 255) * 255,
                b: bound01(b, 255) * 255
            };
        }

        // `rgbToHsl`
        // Converts an RGB color value to HSL.
        // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
        // *Returns:* { h, s, l } in [0,1]
        function rgbToHsl(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;

            if(max == min) {
                h = s = 0; // achromatic
            }
            else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
            }

            return { h: h, s: s, l: l };
        }

        // `hslToRgb`
        // Converts an HSL color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
        function hslToRgb(h, s, l) {
            var r, g, b;

            h = bound01(h, 360);
            s = bound01(s, 100);
            l = bound01(l, 100);

            function hue2rgb(p, q, t) {
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            if(s === 0) {
                r = g = b = l; // achromatic
            }
            else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return { r: r * 255, g: g * 255, b: b * 255 };
        }

        // `rgbToHsv`
        // Converts an RGB color value to HSV
        // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
        // *Returns:* { h, s, v } in [0,1]
        function rgbToHsv(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, v = max;

            var d = max - min;
            s = max === 0 ? 0 : d / max;

            if(max == min) {
                h = 0; // achromatic
            }
            else {
                switch(max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h, s: s, v: v };
        }

        // `hsvToRgb`
        // Converts an HSV color value to RGB.
        // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
        // *Returns:* { r, g, b } in the set [0, 255]
         function hsvToRgb(h, s, v) {

            h = bound01(h, 360) * 6;
            s = bound01(s, 100);
            v = bound01(v, 100);

            var i = Math.floor(h),
                f = h - i,
                p = v * (1 - s),
                q = v * (1 - f * s),
                t = v * (1 - (1 - f) * s),
                mod = i % 6,
                r = [v, q, p, p, t, v][mod],
                g = [t, v, v, q, p, p][mod],
                b = [p, p, t, v, v, q][mod];

            return { r: r * 255, g: g * 255, b: b * 255 };
        }

        // `rgbToHex`
        // Converts an RGB color to hex
        // Assumes r, g, and b are contained in the set [0, 255]
        // Returns a 3 or 6 character hex
        function rgbToHex(r, g, b, allow3Char) {

            var hex = [
                pad2(Math.round(r).toString(16)),
                pad2(Math.round(g).toString(16)),
                pad2(Math.round(b).toString(16))
            ];

            // Return a 3 character hex if possible
            if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
                return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
            }

            return hex.join("");
        }

        // `rgbaToHex`
        // Converts an RGBA color plus alpha transparency to hex
        // Assumes r, g, b are contained in the set [0, 255] and
        // a in [0, 1]. Returns a 4 or 8 character rgba hex
        function rgbaToHex(r, g, b, a, allow4Char) {

            var hex = [
                pad2(Math.round(r).toString(16)),
                pad2(Math.round(g).toString(16)),
                pad2(Math.round(b).toString(16)),
                pad2(convertDecimalToHex(a))
            ];

            // Return a 4 character hex if possible
            if (allow4Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1) && hex[3].charAt(0) == hex[3].charAt(1)) {
                return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
            }

            return hex.join("");
        }

        // `rgbaToArgbHex`
        // Converts an RGBA color to an ARGB Hex8 string
        // Rarely used, but required for "toFilter()"
        function rgbaToArgbHex(r, g, b, a) {

            var hex = [
                pad2(convertDecimalToHex(a)),
                pad2(Math.round(r).toString(16)),
                pad2(Math.round(g).toString(16)),
                pad2(Math.round(b).toString(16))
            ];

            return hex.join("");
        }

        // `equals`
        // Can be called with any lib.color input
        lib.color.equals = function (color1, color2) {
            if (!color1 || !color2) { return false; }
            return lib.color(color1).toRgbString() == lib.color(color2).toRgbString();
        };

        lib.color.random = function() {
            return lib.color.fromRatio({
                r: Math.random(),
                g: Math.random(),
                b: Math.random()
            });
        };


        // Modification Functions
        // ----------------------
        // Thanks to less.js for some of the basics here
        // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

        function desaturate(color, amount) {
            amount = (amount === 0) ? 0 : (amount || 10);
            var hsl = lib.color(color).toHsl();
            hsl.s -= amount / 100;
            hsl.s = clamp01(hsl.s);
            return lib.color(hsl);
        }

        function saturate(color, amount) {
            amount = (amount === 0) ? 0 : (amount || 10);
            var hsl = lib.color(color).toHsl();
            hsl.s += amount / 100;
            hsl.s = clamp01(hsl.s);
            return lib.color(hsl);
        }

        function greyscale(color) {
            return lib.color(color).desaturate(100);
        }

        function lighten (color, amount) {
            amount = (amount === 0) ? 0 : (amount || 10);
            var hsl = lib.color(color).toHsl();
            hsl.l += amount / 100;
            hsl.l = clamp01(hsl.l);
            return lib.color(hsl);
        }

        function brighten(color, amount) {
            amount = (amount === 0) ? 0 : (amount || 10);
            var rgb = lib.color(color).toRgb();
            rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * - (amount / 100))));
            rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * - (amount / 100))));
            rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * - (amount / 100))));
            return lib.color(rgb);
        }

        function darken (color, amount) {
            amount = (amount === 0) ? 0 : (amount || 10);
            var hsl = lib.color(color).toHsl();
            hsl.l -= amount / 100;
            hsl.l = clamp01(hsl.l);
            return lib.color(hsl);
        }

        // Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
        // Values outside of this range will be wrapped into this range.
        function spin(color, amount) {
            var hsl = lib.color(color).toHsl();
            var hue = (hsl.h + amount) % 360;
            hsl.h = hue < 0 ? 360 + hue : hue;
            return lib.color(hsl);
        }

        // Combination Functions
        // ---------------------
        // Thanks to jQuery xColor for some of the ideas behind these
        // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

        function complement(color) {
            var hsl = lib.color(color).toHsl();
            hsl.h = (hsl.h + 180) % 360;
            return lib.color(hsl);
        }

        function triad(color) {
            var hsl = lib.color(color).toHsl();
            var h = hsl.h;
            return [
                lib.color(color),
                lib.color({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
                lib.color({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
            ];
        }

        function tetrad(color) {
            var hsl = lib.color(color).toHsl();
            var h = hsl.h;
            return [
                lib.color(color),
                lib.color({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
                lib.color({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
                lib.color({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
            ];
        }

        function splitcomplement(color) {
            var hsl = lib.color(color).toHsl();
            var h = hsl.h;
            return [
                lib.color(color),
                lib.color({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
                lib.color({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
            ];
        }

        function analogous(color, results, slices) {
            results = results || 6;
            slices = slices || 30;

            var hsl = lib.color(color).toHsl();
            var part = 360 / slices;
            var ret = [lib.color(color)];

            for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
                hsl.h = (hsl.h + part) % 360;
                ret.push(lib.color(hsl));
            }
            return ret;
        }

        function monochromatic(color, results) {
            results = results || 6;
            var hsv = lib.color(color).toHsv();
            var h = hsv.h, s = hsv.s, v = hsv.v;
            var ret = [];
            var modification = 1 / results;

            while (results--) {
                ret.push(lib.color({ h: h, s: s, v: v}));
                v = (v + modification) % 1;
            }

            return ret;
        }

        // Utility Functions
        // ---------------------

        lib.color.mix = function(color1, color2, amount) {
            amount = (amount === 0) ? 0 : (amount || 50);

            var rgb1 = lib.color(color1).toRgb();
            var rgb2 = lib.color(color2).toRgb();

            var p = amount / 100;

            var rgba = {
                r: ((rgb2.r - rgb1.r) * p) + rgb1.r,
                g: ((rgb2.g - rgb1.g) * p) + rgb1.g,
                b: ((rgb2.b - rgb1.b) * p) + rgb1.b,
                a: ((rgb2.a - rgb1.a) * p) + rgb1.a
            };

            return lib.color(rgba);
        };

        // Big List of Colors
        // ------------------
        // <http://www.w3.org/TR/css3-color/#svg-color>
        var names = lib.color.names = {
            aliceblue: "f0f8ff",
            antiquewhite: "faebd7",
            aqua: "0ff",
            aquamarine: "7fffd4",
            azure: "f0ffff",
            beige: "f5f5dc",
            bisque: "ffe4c4",
            black: "000",
            blanchedalmond: "ffebcd",
            blue: "00f",
            blueviolet: "8a2be2",
            brown: "a52a2a",
            burlywood: "deb887",
            burntsienna: "ea7e5d",
            cadetblue: "5f9ea0",
            chartreuse: "7fff00",
            chocolate: "d2691e",
            coral: "ff7f50",
            cornflowerblue: "6495ed",
            cornsilk: "fff8dc",
            crimson: "dc143c",
            cyan: "0ff",
            darkblue: "00008b",
            darkcyan: "008b8b",
            darkgoldenrod: "b8860b",
            darkgray: "a9a9a9",
            darkgreen: "006400",
            darkgrey: "a9a9a9",
            darkkhaki: "bdb76b",
            darkmagenta: "8b008b",
            darkolivegreen: "556b2f",
            darkorange: "ff8c00",
            darkorchid: "9932cc",
            darkred: "8b0000",
            darksalmon: "e9967a",
            darkseagreen: "8fbc8f",
            darkslateblue: "483d8b",
            darkslategray: "2f4f4f",
            darkslategrey: "2f4f4f",
            darkturquoise: "00ced1",
            darkviolet: "9400d3",
            deeppink: "ff1493",
            deepskyblue: "00bfff",
            dimgray: "696969",
            dimgrey: "696969",
            dodgerblue: "1e90ff",
            firebrick: "b22222",
            floralwhite: "fffaf0",
            forestgreen: "228b22",
            fuchsia: "f0f",
            gainsboro: "dcdcdc",
            ghostwhite: "f8f8ff",
            gold: "ffd700",
            goldenrod: "daa520",
            gray: "808080",
            green: "008000",
            greenyellow: "adff2f",
            grey: "808080",
            honeydew: "f0fff0",
            hotpink: "ff69b4",
            indianred: "cd5c5c",
            indigo: "4b0082",
            ivory: "fffff0",
            khaki: "f0e68c",
            lavender: "e6e6fa",
            lavenderblush: "fff0f5",
            lawngreen: "7cfc00",
            lemonchiffon: "fffacd",
            lightblue: "add8e6",
            lightcoral: "f08080",
            lightcyan: "e0ffff",
            lightgoldenrodyellow: "fafad2",
            lightgray: "d3d3d3",
            lightgreen: "90ee90",
            lightgrey: "d3d3d3",
            lightpink: "ffb6c1",
            lightsalmon: "ffa07a",
            lightseagreen: "20b2aa",
            lightskyblue: "87cefa",
            lightslategray: "789",
            lightslategrey: "789",
            lightsteelblue: "b0c4de",
            lightyellow: "ffffe0",
            lime: "0f0",
            limegreen: "32cd32",
            linen: "faf0e6",
            magenta: "f0f",
            maroon: "800000",
            mediumaquamarine: "66cdaa",
            mediumblue: "0000cd",
            mediumorchid: "ba55d3",
            mediumpurple: "9370db",
            mediumseagreen: "3cb371",
            mediumslateblue: "7b68ee",
            mediumspringgreen: "00fa9a",
            mediumturquoise: "48d1cc",
            mediumvioletred: "c71585",
            midnightblue: "191970",
            mintcream: "f5fffa",
            mistyrose: "ffe4e1",
            moccasin: "ffe4b5",
            navajowhite: "ffdead",
            navy: "000080",
            oldlace: "fdf5e6",
            olive: "808000",
            olivedrab: "6b8e23",
            orange: "ffa500",
            orangered: "ff4500",
            orchid: "da70d6",
            palegoldenrod: "eee8aa",
            palegreen: "98fb98",
            paleturquoise: "afeeee",
            palevioletred: "db7093",
            papayawhip: "ffefd5",
            peachpuff: "ffdab9",
            peru: "cd853f",
            pink: "ffc0cb",
            plum: "dda0dd",
            powderblue: "b0e0e6",
            purple: "800080",
            rebeccapurple: "663399",
            red: "f00",
            rosybrown: "bc8f8f",
            royalblue: "4169e1",
            saddlebrown: "8b4513",
            salmon: "fa8072",
            sandybrown: "f4a460",
            seagreen: "2e8b57",
            seashell: "fff5ee",
            sienna: "a0522d",
            silver: "c0c0c0",
            skyblue: "87ceeb",
            slateblue: "6a5acd",
            slategray: "708090",
            slategrey: "708090",
            snow: "fffafa",
            springgreen: "00ff7f",
            steelblue: "4682b4",
            tan: "d2b48c",
            teal: "008080",
            thistle: "d8bfd8",
            tomato: "ff6347",
            turquoise: "40e0d0",
            violet: "ee82ee",
            wheat: "f5deb3",
            white: "fff",
            whitesmoke: "f5f5f5",
            yellow: "ff0",
            yellowgreen: "9acd32"
        };

        // Make it easy to access colors via `hexNames[hex]`
        var hexNames = lib.color.hexNames = flip(names);


        // Utilities
        // ---------

        // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
        function flip(o) {
            var flipped = { };
            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    flipped[o[i]] = i;
                }
            }
            return flipped;
        }

        // Return a valid alpha value [0,1] with all invalid values being set to 1
        function boundAlpha(a) {
            a = parseFloat(a);

            if (isNaN(a) || a < 0 || a > 1) {
                a = 1;
            }

            return a;
        }

        // Take input from [0, n] and return it as [0, 1]
        function bound01(n, max) {
            if (isOnePointZero(n)) { n = "100%"; }

            var processPercent = isPercentage(n);
            n = Math.min(max, Math.max(0, parseFloat(n)));

            // Automatically convert percentage into number
            if (processPercent) {
                n = parseInt(n * max, 10) / 100;
            }

            // Handle floating point rounding errors
            if ((Math.abs(n - max) < 0.000001)) {
                return 1;
            }

            // Convert into [0, 1] range if it isn't already
            return (n % max) / parseFloat(max);
        }

        // Force a number between 0 and 1
        function clamp01(val) {
            return Math.min(1, Math.max(0, val));
        }

        // Parse a base-16 hex value into a base-10 integer
        function parseIntFromHex(val) {
            return parseInt(val, 16);
        }

        // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
        // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
        function isOnePointZero(n) {
            return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
        }

        // Check to see if string passed in is a percentage
        function isPercentage(n) {
            return typeof n === "string" && n.indexOf('%') != -1;
        }

        // Force a hex value to have 2 characters
        function pad2(c) {
            return c.length == 1 ? '0' + c : '' + c;
        }

        // Replace a decimal with it's percentage value
        function convertToPercentage(n) {
            if (n <= 1) {
                n = (n * 100) + "%";
            }

            return n;
        }

        // Converts a decimal to a hex value
        function convertDecimalToHex(d) {
            return Math.round(parseFloat(d) * 255).toString(16);
        }
        // Converts a hex value to a decimal
        function convertHexToDecimal(h) {
            return (parseIntFromHex(h) / 255);
        }

        var matchers = (function() {

            // <http://www.w3.org/TR/css3-values/#integers>
            var CSS_INTEGER = "[-\\+]?\\d+%?";

            // <http://www.w3.org/TR/css3-values/#number-value>
            var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

            // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
            var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

            // Actual matching.
            // Parentheses and commas are optional, but not required.
            // Whitespace can take the place of commas or opening paren
            var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
            var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

            return {
                CSS_UNIT: new RegExp(CSS_UNIT),
                rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
                rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
                hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
                hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
                hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
                hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
                hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
                hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
            };
        })();

        // `isValidCSSUnit`
        // Take in a single string / number and check to see if it looks like a CSS unit
        // (see `matchers` above for definition).
        function isValidCSSUnit(color) {
            return !!matchers.CSS_UNIT.exec(color);
        }

        // `stringInputToObject`
        // Permissive string parsing.  Take in a number of formats, and output an object
        // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
        function stringInputToObject(color) {

            color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
            var named = false;
            if (names[color]) {
                color = names[color];
                named = true;
            }
            else if (color == 'transparent') {
                return { r: 0, g: 0, b: 0, a: 0, format: "name" };
            }

            // Try to match string input using regular expressions.
            // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
            // Just return an object and let the conversion functions handle that.
            // This way the result will be the same whether the lib.color is initialized with string or object.
            var match;
            if ((match = matchers.rgb.exec(color))) {
                return { r: match[1], g: match[2], b: match[3] };
            }
            if ((match = matchers.rgba.exec(color))) {
                return { r: match[1], g: match[2], b: match[3], a: match[4] };
            }
            if ((match = matchers.hsl.exec(color))) {
                return { h: match[1], s: match[2], l: match[3] };
            }
            if ((match = matchers.hsla.exec(color))) {
                return { h: match[1], s: match[2], l: match[3], a: match[4] };
            }
            if ((match = matchers.hsv.exec(color))) {
                return { h: match[1], s: match[2], v: match[3] };
            }
            if ((match = matchers.hsva.exec(color))) {
                return { h: match[1], s: match[2], v: match[3], a: match[4] };
            }
            if ((match = matchers.hex8.exec(color))) {
                return {
                    r: parseIntFromHex(match[1]),
                    g: parseIntFromHex(match[2]),
                    b: parseIntFromHex(match[3]),
                    a: convertHexToDecimal(match[4]),
                    format: named ? "name" : "hex8"
                };
            }
            if ((match = matchers.hex6.exec(color))) {
                return {
                    r: parseIntFromHex(match[1]),
                    g: parseIntFromHex(match[2]),
                    b: parseIntFromHex(match[3]),
                    format: named ? "name" : "hex"
                };
            }
            if ((match = matchers.hex4.exec(color))) {
                return {
                    r: parseIntFromHex(match[1] + '' + match[1]),
                    g: parseIntFromHex(match[2] + '' + match[2]),
                    b: parseIntFromHex(match[3] + '' + match[3]),
                    a: convertHexToDecimal(match[4] + '' + match[4]),
                    format: named ? "name" : "hex8"
                };
            }
            if ((match = matchers.hex3.exec(color))) {
                return {
                    r: parseIntFromHex(match[1] + '' + match[1]),
                    g: parseIntFromHex(match[2] + '' + match[2]),
                    b: parseIntFromHex(match[3] + '' + match[3]),
                    format: named ? "name" : "hex"
                };
            }

            return false;
        }
    }());
    
    //2D Vectors
    (function () {
        var degrees = 180/Math.PI;
        //Constructor
        lib.vector = function (x, y) {
            var v = Object.create(lib.vector.prototype);
            
            v.x = x || 0;
            v.y = y || 0;
            
            return v;
        };
        
        lib.vector.fromPolar = function (r, theta) {
            return lib.vector(r*Math.cos(theta), r*Math.sin(theta));
        };
                              
        lib.vector.fromPolarDeg = function (r, deg) {
            return lib.vector(r*Math.cos(deg/degrees), r*Math.sin(deg/degrees));
        };
        
        lib.vector.fromArray = function (array) {
            return lib.vector(array[0], array[1]);
        };
        
        lib.vector.fromObject = function (object) {
            return lib.vector(object.x, object.y);
        };
        
        //Constants
        lib.vector.zero = lib.vector();
        
        //Utilities
        lib.vector.method("clone", function () {
            return lib.vector(this.x, this.y);
        });
        
        lib.vector.method("copyX", function (vec) {
            this.x = vec.x;
            return this;
        });
        
        lib.vector.method("copyY", function (vec) {
            this.y = vec.y;
            return this;
        });
        
        lib.vector.method("copy", function (vec) {
            this.x = vec.x;
            this.y = vec.y;
            return this;
        });
        
        lib.vector.method("toString", function () {
            return "x: " + this.x + ", y: " + this.y;
        }, true);
        
        lib.vector.method("toArray", function () {
            return [this.x, this.y];
        });
        
        lib.vector.method("toObject", function () {
            return { x: this.x, y: this.y};
        });
        
        //Manipulation
        lib.vector.method("addX", function (s) {
            this.x += s;
            return this;
        });
        
        lib.vector.method("addY", function (s) {
            this.y += s;
            return this;
        });
        
        lib.vector.method("add", function (vec) {
            this.x += vec.x;
            this.y += vec.y;
            return this;
        });
        
        lib.vector.method("substractX", function (s) {
            this.x -= s;
            return this;
        });
        
        lib.vector.method("substractY", function (s) {
            this.y -= s;
            return this;
        });
        
        lib.vector.method("substract", function (vec) {
            this.x -= vec.x;
            this.y -= vec.y;
            return this;
        });
        
        lib.vector.method("multiplyX", function (s) {
            this.x *= s;
            return this;
        });
        
        lib.vector.method("multiplyY", function (s) {
            this.y *= s;
            return this;
        });
        
        lib.vector.method("multiply", function (vec) {
            this.x *= vec.x;
            this.y *= vec.y;
            return this;
        });
        
        lib.vector.method("divideX", function (s) {
            if(s === 0) {
                this.x = 0;
            } else {
                this.x /= s;
            }
            return this;
        });
        
        lib.vector.method("divideY", function (s) {
            if(s === 0) {
                this.y = 0;
            } else {
                this.y /= s;
            }
            return this;
        });
        
        lib.vector.method("divide", function (vec) {
            this.divideX(vec.x);
            this.divideY(vec.y);
            return this;
        });
        
        lib.vector.method("invertX", function () {
            this.x *= -1;
            return this;
        });
        
        lib.vector.method("invertY", function () {
            this.y *= -1;
            return this;
        });
        
        lib.vector.method("invert", function () {
            this.x *= -1;
            this.y *= -1;
            return this;
        });
        
        lib.vector.method("normalize", function () {
            this.divide(lib.vector(this.length(), this.length()));
            return this;
        });
        
        lib.vector.method("unfloat", function () {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            return this;
        });
        
        lib.vector.method("floor", function () {
            this.x = Math.floor(this.x);
            this.y = Math.floor(this.y);
            return this;
        });
        
        lib.vector.method("ceil", function () {
            this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);
            return this;
        });
        
        lib.vector.method("rotateTo", function (angle) {
            var l = this.length();
            this.x = l*Math.cos(angle);
            this.y = l*Math.sin(angle);
            return this;
        });
        
        lib.vector.method("rotateToDeg", function (deg) {
            var l = this.length();
            this.x = l*Math.cos(deg/degrees);
            this.y = l*Math.sin(deg/degrees);
            return this;
        });
        
        lib.vector.method("rotate", function (angle) {
            var tempX = this.x*Math.cos(angle) - this.y*Math.sin(angle);
            var tempY = this.x*Math.sin(angle) + this.y*Math.cos(angle);
            this.x = tempX;
            this.y = tempY;
            return this;
        });
        
        lib.vector.method("rotateDeg", function (deg) {
            var tempX = this.x*Math.cos(deg/degrees) - this.y*Math.sin(deg/degrees);
            var tempY = this.x*Math.sin(deg/degrees) + this.y*Math.cos(deg/degrees);
            this.x = tempX;
            this.y = tempY;
            return this;
        });
        
        lib.vector.method("randomizeX", function (topLeft, bottomRight) {
            this.x = lib.random(topLeft.x, bottomRight.x);
            return this;
        });
        
        lib.vector.method("randomizeY", function (topLeft, bottomRight) {
            this.y = lib.random(topLeft.y, bottomRight.y);
            return this;
        });
        
        lib.vector.method("randomize", function (topLeft, bottomRight) {
            this.x = lib.random(topLeft.x, bottomRight.x);
            this.y = lib.random(topLeft.y, bottomRight.y);
            return this;
        });
        
        lib.vector.method("lerp", function (start, end, t) {
            this.x = lib.lerp(start.x, end.x, t);
            this.y = lib.lerp(start.y, end.y, t);
        });
        
        //Products
        lib.vector.method("dot", function (vec) {
            return this.x*vec.x + this.y*vec.y;
        });
        
        lib.vector.method("cross", function (vec) {
            return this.x*vec.y - this.y*vec.x;
        });
        
        lib.vector.method("length", function () {
            return Math.sqrt(this.x*this.x + this.y*this.y);
        });
        
        lib.vector.method("lengthSq", function () {
            return this.dot(this);
        });
        
        lib.vector.method("distanceX", function (vec) {
            return this.x-vec.x;
        });
        
        lib.vector.method("absDistanceX", function (vec) {
            return Math.abs(this.x-vec.x);
        });
        
        lib.vector.method("distanceY", function (vec) {
            return this.y-vec.y;
        });
        
        lib.vector.method("absDistanceY", function (vec) {
            return Math.abs(this.y-vec.y);
        });
        
        lib.vector.method("distance", function (vec) {
            return Math.sqrt((this.x - vec.x)*(this.x - vec.x) + (this.y - vec.y)*(this.y - vec.y));
        });
        
        lib.vector.method("distanceSq", function (vec) {
            return (this.x - vec.x)*(this.x - vec.x) + (this.y - vec.y)*(this.y - vec.y);
        });
        
        lib.vector.method("angle", function () {
            return Math.atan2(this.y, this.x);
        });
        
        lib.vector.method("angleDeg", function () {
            return Math.atan2(this.y, this.x)*degrees;
        });
        
        lib.vector.method("verticalAngle", function () {
            return Math.PI/2 - Math.atan2(this.y, this.x);
        });
        
        lib.vector.method("verticalAngleDeg", function () {
            return 90 - Math.atan2(this.y, this.x)*degrees;
        });
        
        lib.vector.method("isEqualTo", function (vec) {
            if (this.x === vec.x && this.y === vec.y) {
                return true;
            }
            
            return false;
        });
    }());
    
    //Transition engine
    (function () {
        lib.busy = false;
        
        transitionFunctions.linear = function (start, end, time) {
            return (end - start) * time + start;
        };

        transitionFunctions.inOutCubic = function (start, end, time) {
            return (end - start) * time * time * (-2 * time + 3) + start;
        };

        transitionFunctions.outElastic = function (start, end, time) {
            var ts = time * time, tc = time * ts;
            return (end - start) * time * (33 * ts * ts - 106 * tc + 126 * ts - 67 * time + 15) + start;
        };

        lib.transition = function (start, end, duration, setterFunc, type, behaviour) {
            var time = 0, transition = transitionFunctions[type];
            transitionList.push(
                {
                    finishFlag: false,
                    dir: 1,
                    step: function () {
                        setterFunc(transition(start, end, time));
                        time += this.dir / (60 * duration);
                        if (time > 1 || time < 0) {
                            if (behaviour === "repeat") {
                                time = 0;
                            } else if (behaviour === "oscillate") {
                                this.dir *= -1;
                            } else {
                                this.finishFlag = true;
                            }
                        }
                    }
                }
            );
            
            lib.busy = true;
        };
        
        lib.wait = function (duration) {
            var time = 0;
            transitionList.push(
                {
                    finishFlag: false,
                    step: function () {
                        time += 1 / (60 * duration);
                        if (time > 1) {
                            this.finishFlag = true;
                        }
                    }
                }
            );
            
            lib.busy = true;
        };
    }());
    
    //Perlin noise
    (function () {
        var seed = 0;
        
        var p = [
            151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
            140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
            247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
            57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
            74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
            211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65,
            25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200,
            135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
            226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
            59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248,
            152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
            39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246,
            97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51,
            145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84,
            204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114,
            67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180, 60, 196,
            151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
            140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
            247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
            57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
            74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
            211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65,
            25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200,
            135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
            226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
            59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248,
            152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
            39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246,
            97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51,
            145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84,
            204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114,
            67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180, 60, 196
        ];

        function fade(t) {
            return t * t * t * (t * (6 * t - 15) + 10);
        }

        function lerp(a, b, x) {
            return (b - a) * x + a;
        }
        
        lib.lerp = lerp;

        function grad1D(hash, x) {
            switch (hash & 0xF) {
            case 0x0:
                return x;
            case 0x1:
                return 7 * x / 8;
            case 0x2:
                return 6 * x / 8;
            case 0x3:
                return 5 * x / 8;
            case 0x4:
                return 4 * x / 8;
            case 0x5:
                return 3 * x / 8;
            case 0x6:
                return 2 * x / 8;
            case 0x7:
                return x / 8;
            case 0x8:
                return -x;
            case 0x9:
                return -7 * x / 8;
            case 0xA:
                return -6 * x / 8;
            case 0xB:
                return -5 * x / 8;
            case 0xC:
                return -4 * x / 8;
            case 0xD:
                return -3 * x / 8;
            case 0xE:
                return -2 * x / 8;
            case 0xF:
                return -x / 8;
            }
        }

        function grad2D(hash, x, y) {
            switch (hash & 0xF) {
            case 0x0:
                return x;
            case 0x1:
                return 0.5 * (Math.sqrt(3) * x + y);
            case 0x2:
                return 0.5 * Math.sqrt(2) * (x + y);
            case 0x3:
                return 0.5 * (x + Math.sqrt(3) * y);
            case 0x4:
                return y;
            case 0x5:
                return 0.5 * (-Math.sqrt(3) * x + y);
            case 0x6:
                return 0.5 * Math.sqrt(2) * (-x + y);
            case 0x7:
                return 0.5 * (-x + Math.sqrt(3) * y);
            case 0x8:
                return -x;
            case 0x9:
                return 0.5 * (Math.sqrt(3) * x - y);
            case 0xA:
                return 0.5 * Math.sqrt(2) * (x - y);
            case 0xB:
                return 0.5 * (x - Math.sqrt(3) * y);
            case 0xC:
                return -y;
            case 0xD:
                return -0.5 * (Math.sqrt(3) * x + y);
            case 0xE:
                return -0.5 * Math.sqrt(2) * (x + y);
            case 0xF:
                return -0.5 * (x + Math.sqrt(3) * y);
            }
        }

        function grad3D(hash, x, y, z) {
            switch (hash & 0xF) {
            case 0x0:
                return x + y;
            case 0x1:
                return -x + y;
            case 0x2:
                return x - y;
            case 0x3:
                return -x - y;
            case 0x4:
                return x + z;
            case 0x5:
                return -x + z;
            case 0x6:
                return x - z;
            case 0x7:
                return -x - z;
            case 0x8:
                return y + z;
            case 0x9:
                return -y + z;
            case 0xA:
                return y - z;
            case 0xB:
                return -y - z;
            case 0xC:
                return y + x;
            case 0xD:
                return -y + z;
            case 0xE:
                return y - x;
            case 0xF:
                return -y - z;
            }
        }

        function perlin1D(x) {
            var xi = Math.floor(x) & 255;
            var xf = x - Math.floor(x);

            var u = fade(xf);

            var a = p[xi    ];
            var b = p[xi + 1];

            return 0.5 * (lerp(grad1D(a, xf), grad1D(b, xf - 1), u) + 1);
        }

        function perlin2D(x, y) {
            var xi = Math.floor(x) & 255;
            var yi = Math.floor(y) & 255;
            var xf = x - Math.floor(x);
            var yf = y - Math.floor(y);

            var u = fade(xf);
            var v = fade(yf);

            var aa = p[p[xi    ] + yi    ];
            var ab = p[p[xi    ] + yi + 1];
            var ba = p[p[xi + 1] + yi    ];
            var bb = p[p[xi + 1] + yi + 1];

            var x1 = lerp(grad2D(aa, xf, yf), grad2D(ba, xf - 1, yf), u);
            var x2 = lerp(grad2D(ab, xf, yf - 1), grad2D(bb, xf - 1, yf - 1), u);

            return 0.5 * (lerp(x1, x2, v) + 1);
        }

        function perlin3D(x, y, z) {
            var xi = Math.floor(x) & 255;
            var yi = Math.floor(y) & 255;
            var zi = Math.floor(z) & 255;
            var xf = x - Math.floor(x);
            var yf = y - Math.floor(y);
            var zf = z - Math.floor(z);

            var u = fade(xf);
            var v = fade(yf);
            var w = fade(zf);

            var aaa = p[p[p[xi    ] + yi    ] + zi    ];
            var aab = p[p[p[xi    ] + yi    ] + zi + 1];
            var aba = p[p[p[xi    ] + yi + 1] + zi    ];
            var abb = p[p[p[xi    ] + yi + 1] + zi + 1];
            var baa = p[p[p[xi + 1] + yi    ] + zi    ];
            var bab = p[p[p[xi + 1] + yi    ] + zi + 1];
            var bba = p[p[p[xi + 1] + yi + 1] + zi    ];
            var bbb = p[p[p[xi + 1] + yi + 1] + zi + 1];

            var x1 = lerp(grad3D(aaa, xf, yf, zf), grad3D(baa, xf - 1, yf, zf), u);
            var x2 = lerp(grad3D(aba, xf, yf - 1, zf), grad3D(bba, xf - 1, yf - 1, zf), u);
            var y1 = lerp(x1, x2, v);

            x1 = lerp(grad3D(aab, xf, yf, zf - 1), grad3D(bab, xf - 1, yf, zf - 1), u);
            x2 = lerp(grad3D(abb, xf, yf - 1, zf - 1), grad3D(bbb, xf - 1, yf - 1, zf - 1), u);
            var y2 = lerp(x1, x2, v);

            return 0.5 * (lerp(y1, y2, w) + 1);
        }

        lib.noise1D = function (x, octaves, persistence) {
            persistence = persistence || 1;
            octaves = octaves || 1;
            
            x += seed;

            var total = 0;
            var frequency = 1;
            var amplitude = 1;
            var maxValue = 0;

            for(var i=0;i<octaves;i++) {
                total += perlin1D(x * frequency) * amplitude;

                maxValue += amplitude;

                amplitude *= persistence;
                frequency *= 2;
            }

            return total/maxValue;
        }

        lib.noise2D = function (x, y, octaves, persistence) {
            persistence = persistence || 1;
            octaves = octaves || 1;
            
            x += seed;
            y += seed;

            var total = 0;
            var frequency = 1;
            var amplitude = 1;
            var maxValue = 0;

            for(var i=0;i<octaves;i++) {
                total += perlin2D(x * frequency, y * frequency) * amplitude;

                maxValue += amplitude;

                amplitude *= persistence;
                frequency *= 2;
            }

            return total/maxValue;
        }

        lib.noise3D = function (x, y, z, octaves, persistence) {
            persistence = persistence || 1;
            octaves = octaves || 1;
            
            x += seed;
            y += seed;
            z += seed;

            var total = 0;
            var frequency = 1;
            var amplitude = 1;
            var maxValue = 0;

            for(var i=0;i<octaves;i++) {
                total += perlin3D(x * frequency, y * frequency, z * frequency) * amplitude;

                maxValue += amplitude;

                amplitude *= persistence;
                frequency *= 2;
            }

            return total/maxValue;
        }
        
        lib.seedNoise = function (s) {
            seed = s;
        };
    }());
    
    //Poisson Disk Sampling
    (function () {
        lib.blueNoise = function (position, width, height, r, t) {
            var tSize = r / Math.sqrt(2);
            var nX = Math.ceil(width / tSize);
            var nY = Math.ceil(height / tSize);
            
            var points = [];
            var active = [];
            
            var grid = Array.matrix(nX, nY, -1);
            var ind = 0;
            
            var current = lib.vector();
            current.randomize(position, lib.vector(position.x + width, position.y + height));
            
            points.push(current);
            setElement(current, ind);
            
            active.push(ind++);
            
            while(active.length > 0) {
                var selected = active[Math.floor(lib.random(0, active.length))];
                var found = false;

                for(i = 0; i < t; i += 1) {
                    current = lib.vector.fromPolar(lib.random(r, 2*r), lib.random(0, 2*Math.PI));

                    current.add(points[selected]);

                    //ctx.fillRect(current.x, current.y, 2, 2);

                    var valid = true;

                    if(grid[Math.floor((current.x - position.x)/width*nX)] && getElement(current) !== undefined) {
                        for(j = -2; j <= 2; j += 1) {
                            for(k = -2; k <= 2; k += 1) {
                               if(!(Math.abs(j) === 2 && Math.abs(k) === 2)) { 
                                  if(grid[Math.floor((current.x - position.x)/width*nX) + j] && grid[Math.floor((current.x - position.x)/width*nX) + j][Math.floor((current.y - position.y)/height*nY) + k] !== undefined && grid[Math.floor((current.x - position.x)/width*nX) + j][Math.floor((current.y - position.y)/height*nY) + k] !== -1) {
                                        if(current.distance(points[grid[Math.floor((current.x - position.x)/width*nX) + j][Math.floor((current.y - position.y)/height*nY) + k]]) < r) {
                                            valid = false;
                                            break;
                                        }
                                    }
                                }
                            }
                            if(!valid)
                                break;
                        }
                    } else {
                        valid = false;
                    }

                    if(valid) {
                        points.push(current);
                        setElement(current, ind);
                        active.push(ind++);

                        found = true;
                    }

                }
                if(!found) {
                    active.splice(active.indexOf(selected), 1);
                }
            }
            
            return points;
            
            function getElement(vec) {
                return grid[Math.floor((vec.x-position.x)/width*nX)][Math.floor((current.y-position.y)/height*nY)];
            }
            
            function setElement(vec, v) {
                grid[Math.floor((vec.x-position.x)/width*nX)][Math.floor((current.y-position.y)/height*nY)] = v;
            }
        };
    }());
    
    //A* pathfinding
    (function () {
        lib.findPath = function (grid, start, end) {
            var closedSet = [];
            var openSet = [start];
            
            var cameFrom = Array.matrix(grid.width, grid.height);
            
            var gScore = Array.matrix(grid.width, grid.height, Infinity);
            
            gScore[start.x][start.y] = 0;
            
            var fScore = Array.matrix(grid.width, grid.height, Infinity);
            
            fScore[start.x][start.y] = cost(start, end);
            
            var current;
            var neighbour;
            var pointer = lib.vector(0, -1);
            
            while (openSet.length !== 0) {
                current = openSet[0];
                for(i = 0; i < openSet.length; i += 1) {
                    if(fScore[openSet[i].x][openSet[i].y] < fScore[current.x][current.y]) {
                        current = openSet[i];
                    }
                }

                if(current.isEqualTo(end)) {
                    return reconstructPath(cameFrom, current);
                }

                openSet.splice(openSet.indexOf(current), 1);
                closedSet.push(current);

                for(i = 0; i < 4; i += 1) {
                    neighbour = current.clone().add(pointer);
                    pointer.rotateDeg(90).unfloat();

                    if(isInClosedSet(neighbour) || grid[neighbour.x] === undefined || grid[neighbour.x][neighbour.y] === undefined || grid[neighbour.x][neighbour.y] === false) {
                        continue;
                    }

                    if(!isInOpenSet(neighbour)) {
                        openSet.push(neighbour);
                    }

                    var tentativeG = gScore[current.x][current.y] + 1;

                    if(tentativeG >= gScore[neighbour.x][neighbour.y]) {
                        continue;
                    }

                    cameFrom[neighbour.x][neighbour.y] = current;
                    gScore[neighbour.x][neighbour.y] = tentativeG;
                    fScore[neighbour.x][neighbour.y] = tentativeG + cost(neighbour, end);
                }
            }
            
            return undefined;
            
            function isInClosedSet(element) {
                for(j = 0; j < closedSet.length; j += 1) {
                    if(closedSet[j].isEqualTo(element)) {
                        return true;
                    }
                }

                return false;
            }
            
            function isInOpenSet(element) {
                for(j = 0; j < openSet.length; j += 1) {
                    if(openSet[j].isEqualTo(element)) {
                        return true;
                    }
                }

                return false;
            }
        };
        
        function cost(a, b) {
            return a.distance(b);
        }
        
        function reconstructPath(cameFrom, current) {
            var path = [current];
            
            while(cameFrom[current.x][current.y]) {
                current = cameFrom[current.x][current.y];
                path.push(current);
            }
            
            return path;
        }
    }());
    
    //Main loop
    window.onload = function () {
        if(window.preload) {
            window.preload();
        }

        document.body.addEventListener("keydown", function (e) {
            if(!keyCodes.includes(e.code)) {
                keyCodes.push(e.code);
            }

            lib.keyIsPressed = true;
            lib.keyCode = e.code;
            if(window.keyPressed) {
                window.keyPressed();
            }
        });

        document.body.addEventListener("keypress", function (e) {
            if(!keys.includes(e.key)) {
                keys.push(e.key);
            }
            lib.key = e.key;
            if(window.keyTyped) {
                window.keyTyped();
            }
        });

        document.body.addEventListener("keyup", function (e) {
            while(keyCodes.includes(e.code)) {
                keyCodes.splice(keyCodes.indexOf(e.code), 1);
            }

            while(keys.includes(e.key)) {
                keys.splice(keys.indexOf(e.key), 1);
            }

            if(keys.length === 0 && keyCodes.length === 0) {
                lib.keyIsPressed = false;
            }

            if(window.keyReleased) {
                window.keyReleased();
            }
        });

        if(window.setup && loadCount === 0) {
            window.setup();
            innerLoop();
        }
    };

    function innerLoop () {
        for(i = 0; i < transitionList.length; i += 1) {
            transitionList[i].step();
            if(transitionList[i].finishFlag) {
                transitionList.splice(i, 1);
            }
        }

        if(transitionList.length === 0) {
            lib.busy = false;
        }

        if(window.loop) {
            window.loop();
            
            if(loop) {
                requestAnimationFrame(innerLoop);
            }
        }
    }
    
    lib.noLoop = function () {
        loop = false;
    }
    
    lib.loop = function () {
        loop = true;
        innerLoop();
    }
    
    return lib;
}(window, document));