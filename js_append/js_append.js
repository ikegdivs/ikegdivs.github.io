screen_width = 360;
screen_height = 180;
paddle_width = 10;
paddle_height = 50;
paddle_buffer = 10;
ball_height = 10;
ball_width = 10;
update_interval = 30;
is_playing = 0;

/* Create an array of app screens */
a = document.getElementById('app-a').getContext('2d')
b = document.getElementById('app-b').getContext('2d')
c = document.getElementById('app-c').getContext('2d')
d = document.getElementById('app-d').getContext('2d')
appscreens = [[a, 'app-a'], [b, 'app-b'], [c, 'app-c'], [d, 'app-d']]
appscreens.forEach(function(object, index){
  object[0].fillStyle="#FFF"
  object[0].font="20px monospace"
})

/* Create array of player paddles */
p1 = new PongPaddle(paddle_buffer, screen_height/2 - paddle_height/2);
p2 = new PongPaddle(screen_width - paddle_buffer - paddle_width, screen_height/2 - paddle_height/2);
paddles = [p1, p2];


has_started = 1;
score_left = 0;
score_right = 0;

// Start the game out as automated
automated = 1;

/* Do not let paddles go beyond the boundaries of the playing field */
function enforcePaddlePositions(pos_y, screen_height, paddle_height){
  if(pos_y < 0){
    pos_y = 0;
  }
  if(pos_y > screen_height-paddle_height){
    pos_y = screen_height-paddle_height;
  }

  return pos_y;
}

/* Do not let the ball go beyond the vertical boundaries of the screen. */
function enforceVerticalBallPosition(ball, screen_height){
  /* If the ball has hit the top, don't let it go any farther */
  if(ball.pos_y <= 0){
    ball.pos_y = 0;
  }

  /* If the ball has hit the bottom, don't let it go any farther*/
  if(ball.pos_y >= screen_height - ball.height){
    ball.pos_y = screen_height - ball.height;
  }
}

function PongBall() {
  this.height = 10;
  this.width = 10;
  this.pos_x = 0;
  this.pos_y = 0;
  this.vel_x = 4;
  this.vel_y = 2;
  this.velocityToPosition = function(){
    this.pos_x = this.pos_x + this.vel_x;
    this.pos_y = this.pos_y + this.vel_y;
  }
}

function PongPaddle(pos_x, pos_y) {
  this.height = paddle_height;
  this.width = paddle_width;
  this.pos_x = pos_x;
  this.pos_y = pos_y;
  this.vel_y = 0;
  this.velocityToPosition = function(){
    this.pos_x = this.pos_x + this.vel_x;
    this.pos_y = this.pos_y + this.vel_y;
  }
}


function startPlaying(){
  // Initialize game objects
  theBall = new PongBall();
  theBall.pos_x = screen_width/2;
  theBall.pos_y = screen_height/2;

  setInterval(function(){
    if(is_playing == 0 && has_started == 0)
    {
      return;
    }

    /* On each screen, draw empy playing field. */
    appscreens.forEach(function(object, index){
      object[0].clearRect(0,0,screen_width,screen_height);
      /* Draw center divider stripes*/
      for(i=5;i<screen_height;i+=20){
        object[0].fillRect(screen_width/2,i,4,10)
      }
    })
    
    /* Designate y positions of paddles */
    paddles.forEach(function(object, index){
      object.velocityToPosition();
    })

    /* Do not let paddles go beyond the boundaries of the playing field */
    paddles[0].pos_y  = enforcePaddlePositions(paddles[0].pos_y,  screen_height, paddles[0].height);
    paddles[1].pos_y  = enforcePaddlePositions(paddles[1].pos_y,  screen_height, paddles[1].height);

    /* Update the position of the ball */
    theBall.velocityToPosition();
    
    /* Bounce the ball if it hits the top or bottom of the screen. */
    if(theBall.pos_y >= screen_height || theBall.pos_y <= 0){
      enforceVerticalBallPosition(theBall, screen_height);
      theBall.vel_y = -theBall.vel_y;
    }
    
    /* If the ball has hit a paddle, bounce it */
    //checkBounce(theBall.pos_x, theBall.pos_y, paddle_width, paddle_buffer, paddle_y, ball_height)
    /* If the ball has hit the left paddle, modify x velocity */
    if(theBall.pos_x  <= paddles[0].width + paddle_buffer           // If the ball has moved near the left paddle
      &&theBall.pos_x >= paddle_buffer                              // and the ball is not yet behind the left paddle
      &&theBall.pos_y <  paddles[0].pos_y + paddles[0].height       // and the ball is between the top and bottom of the left paddle 
      &&theBall.pos_y >  paddles[0].pos_y - theBall.height){                           
        theBall.vel_x = -(Math.abs(theBall.vel_x) + 0.2) * Math.sign(theBall.vel_x);
        theBall.vel_y += (theBall.pos_y - paddles[0].pos_y-45)/20   // Send the ball back to the right paddle
    }
    /* If the ball has hit the right paddle, modify x velocity */
    if(theBall.pos_x  + theBall.width <= screen_width - paddle_buffer                    // If the ball is not yet behind the right paddle
      &&theBall.pos_x + theBall.width >= screen_width - paddle_buffer - paddles[1].width // and the ball has moved near the right paddle
      &&theBall.pos_y <  paddles[1].pos_y + paddles[1].height                            // and the ball is between the top and bottom of the right paddle 
      &&theBall.pos_y >  paddles[1].pos_y - theBall.height ){
        theBall.vel_x =  -(Math.abs(theBall.vel_x) + 0.2) * Math.sign(theBall.vel_x);
        theBall.vel_y += (theBall.pos_y - paddles[1].pos_y - 45)/20                               // Send the ball back to the left paddle
    }

    //Don't let the ball go faster than 1/4 the width of the paddle
    if(Math.abs(theBall.vel_x) > paddle_width/4 ){
      theBall.vel_x = Math.sign(theBall.vel_x) * (paddle_width - 1 );
    }

    //Don't let the ball go faster than the 1/8 the height of the paddle
    if(Math.abs(theBall.vel_y) > paddle_height/8 ){
      theBall.vel_y = Math.sign(theBall.vel_y) * (paddle_height/8 - 1 );
    }

    /* If the ball has gone out of x bounds on the left side, give the right player a point */
    if(theBall.pos_x < 0){
      score_right++;
      theBall.pos_x = screen_width/2;
      theBall.pos_y = screen_height/2;
      theBall.vel_x = 4;
      is_playing = 1;
    }

    /* If the ball has gone out of x bounds on the right side, give the left player a point */
    if(theBall.pos_x > screen_width - (theBall.width + paddle_buffer)){
      score_left++;
      theBall.pos_x = screen_width/2;
      theBall.pos_y = screen_height/2;
      theBall.vel_x = -4;
      is_playing = 1;
    }

    /* If the ball is moving to the left, have the left paddle try to reach the y position of the ball */
    appscreens.forEach(function(object, index){
      /* Draw the score */
      object[0].fillText(score_left+" "+score_right, screen_width/2 - 15, 20)
      /* Draw the left paddle */
      object[0].fillRect(paddle_buffer, paddles[0].pos_y, paddles[0].width, paddles[0].height)
      /* Draw the right paddle */
      object[0].fillRect(screen_width - (paddle_buffer + paddles[1].width), paddles[1].pos_y, paddles[1].width, paddles[1].height)
      /* Draw the ball */
      object[0].fillRect(theBall.pos_x, theBall.pos_y, theBall.height, theBall.width) 
    })
    
    /* If the game is automated and */
    /* If the ball is moving to the left, have the left paddle try to reach the y position of the ball */
    if(automated == 1 && theBall.vel_x < 0){
      // If the ball is outside the middle of the paddle, accelerate in the direction of the ball's movement
      if(((theBall.pos_y + theBall.height/2) < (paddles[0].pos_y + paddles[0].height * 1/4)  // ball is above 25% of the top of the paddle
        ||(theBall.pos_y + theBall.height/2) > (paddles[0].pos_y + paddles[0].height * 3/4)) // or ball is below 25% of the bottom of the paddle
      ){
        // Adjust the velocity of the paddle to catch up with the ball
          paddles[0].vel_y = 1.0 * (Math.abs(theBall.vel_x) 
                            + Math.abs(theBall.vel_y)) * Math.sign((theBall.pos_y + theBall.height/2) - (paddles[0].pos_y + paddles[0].height/2))
      }
      // If the ball is within the middle of the paddle, match the y position of the ball */
      else{
        paddles[0].vel_y = 0;
        paddles[0].pos_y = (theBall.pos_y + theBall.height/2) - paddles[0].height/2;
      }
    }
    
    /* If the ball is moving to the right, have the right paddle try to reach the y position of the ball*/
    if(theBall.vel_x > 0){
      // If the game is automated
      if(automated == 1){
        // If the ball is outside the middle of the paddle, accelerate in the direction of the ball's movement
        if(((theBall.pos_y + theBall.height/2) < (paddles[1].pos_y + paddles[1].height * 1/4)  // ball is above 25% of the top of the paddle
          ||(theBall.pos_y + theBall.height/2) > (paddles[1].pos_y + paddles[1].height * 3/4)) // or ball is below 25% of the bottom of the paddle
        ){
          // Adjust the velocity of the paddle to catch up with the ball
            paddles[1].vel_y = 1.0 * (Math.abs(theBall.vel_x) 
                              + Math.abs(theBall.vel_x)) * Math.sign((theBall.pos_y + theBall.height/2) - (paddles[1].pos_y + paddles[1].height/2))
        }
        // If the ball is within the middle of the paddle, match the y position of the ball */
        else{
          paddles[1].vel_y = 0;
          paddles[1].pos_y = (theBall.pos_y + ball_height/2) - paddles[1].height/2;
        }
      // If the game has an active player, don't always intercept the ball
      }else{
        if(((theBall.pos_y + theBall.height/2) < (paddles[1].pos_y + paddles[1].height * 1/4)  // ball is above 25% of the top of the paddle
          ||(theBall.pos_y + theBall.height/2) > (paddles[1].pos_y + paddles[1].height * 3/4)) // or ball is below 25% of the bottom of the paddle
        ){
          paddles[1].vel_y = 0.4 * (Math.abs(theBall.vel_x)) 
                            * Math.sign((theBall.pos_y + theBall.height/2) - (paddles[1].pos_y + paddles[1].height/2))
        }
      }
    }

  }, update_interval)
}

startPlaying();

// If the user wants to play, no longer update the left paddle
document.onkeydown=function(e){
  automated = 0;
  k=(e||window.event).keyCode;
  if(k == '27'){
    score_left = 0;
    score_right = 0;
    automated = 0;
  }
  if(k == '83'){
    paddles[0].vel_y = 5;
  }
  if(k == '87'){
    paddles[0].vel_y = -5;
  }
}

document.onkeyup=function(e){
  k=(e||window.event).keyCode;
  if(k == '83'){
    paddles[0].vel_y = 0;
  }
  if(k == '87'){
    paddles[0].vel_y = 0;
  }
}

has_started = 0;
ball_v_y = 1;
is_playing = 1;
