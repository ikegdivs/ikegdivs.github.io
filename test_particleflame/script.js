// Prepare the html doc for the animation.
var c = document.getElementById('c'),
    ctx = c.getContext('2d'),
    // Set the size of the image.
    cw = c.width = 300,
    ch = c.height = 300,
    // Declare the lights (parts).
    parts = [],
    partCount = 200,   
    partsFull = false,    
    hueRange = 50,
    globalTick = 0,
    // Rewrite the random function.
    // Creates a random number between min and max.
    // Input:
    //   min: minimum value of the random results
    //   max: maximum value of the random results.
    rand = function(min, max){
        return Math.floor( (Math.random() * (max - min + 1) ) + min);
    };

var Part = function(){
  this.reset();
};

// Fundamental attributes of a light object
Part.prototype.reset = function(){
    // Size of light
    this.startRadius = rand(1, 25);
    this.radius = this.startRadius;
    // Position.
    this.x = cw/2 + (rand(0, 6) - 3);
    this.y = 250;      
    this.vx = 0;
    this.vy = 0;
    // Color
    // Assign a color within the spectrum decided by when the
    // light is spawned.
    //this.hue = rand(globalTick - hueRange, globalTick + hueRange);
    this.hue = rand(0 - hueRange, hueRange);
    this.saturation = rand(50, 100);
    this.lightness = rand(20, 70);
    this.startAlpha = rand(1, 10) / 100;
    this.alpha = this.startAlpha;
    // Aging attributes
    this.decayRate = .1;  
    this.startLife = 7;
    this.life = this.startLife;
    this.lineWidth = rand(1, 3);
}
    
Part.prototype.update = function(){  
  // Calculate the x velocity.
  this.vx += (rand(0, 200) - 100) / 1500;
  // Calculate the y velocity.
  this.vy -= this.life/50;  
  // Move in the x direction.
  this.x += this.vx;
  // Move in the y direction.
  this.y += this.vy;  
  // Set the brightness for the object.
  this.alpha = this.startAlpha * (this.life / this.startLife);
  // Set the size for the object.
  this.radius = this.startRadius * (this.life / this.startLife);
  // Age the object.
  this.life -= this.decayRate; 
  // Check to see if this object should be recycled 
  if(
    this.x > cw + this.radius || 
    this.x < -this.radius ||
    this.y > ch + this.radius ||
    this.y < -this.radius ||
    this.life <= this.decayRate
  ){
    // Recycle the object.
    this.reset();  
  }  
};
  
// Draw the image into a ctx.
Part.prototype.render = function(){
  ctx.beginPath();
  // Create a circle.
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
  // Fill using the hsa coloring values.
  ctx.fillStyle = ctx.strokeStyle = 'hsla('+this.hue+', '+this.saturation+'%, '+this.lightness+'%, '+this.alpha+')';
  // Set the width of the stroke
  ctx.lineWidth = this.lineWidth;
  ctx.fill();
  ctx.stroke();
};

// Create all of the light objects.
var createParts = function(){
  if(!partsFull){
    if(parts.length > partCount){
      partsFull = true;
    } else {
      parts.push(new Part()); 
    }
  }
};

//Update all of the light objects.
var updateParts = function(){
    var i = parts.length;
    while(i--){
        parts[i].update();
    }
};

// Draw all of the light objects.
var renderParts = function(){
    var i = parts.length;
    while(i--){
        parts[i].render();
    }   
};
    

var clear = function(){
    // Prepare to mask the ctx
    ctx.globalCompositeOperation = 'destination-out';
    // Create the mask 
    ctx.fillStyle = 'hsla(0, 0%, 0%, .3)';
    ctx.fillRect(0, 0, cw, ch);
    // Lighten the intersected ctx image.
    ctx.globalCompositeOperation = 'lighter';
};
     
// Lifecycle pattern.
var loop = function(){
    // Place this function in the animation frame queue
    window.requestAnimFrame(loop, c);
    // clear the parts
    clear();
    // If not all parts exist yet, create more.
    createParts();
    // Update the animation.
    updateParts();
    // Draw the images.
    renderParts();
    globalTick++;
};

window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)}}();

loop();