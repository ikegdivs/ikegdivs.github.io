screen_width = 360;
screen_height = 180;
paddle_width = 10;
paddle_height = 50;
paddle_buffer = 10;
ball_height = 10;
ball_width = 10;
update_interval = 30;
ball_x = screen_width/2;
ball_y = screen_height/2;
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


has_started = 1;
score_left = 0;
score_right = 0;
velocity_left = 0;
velocity_right = 0;
pos_y_left=pos_y_right=screen_height/2;
x=screen_width/2;y=screen_height/2;

// Start the game out as automated
automated = 1;

// ball horizontal velocity
ball_v_x=-5;
ball_v_y= 3;
setInterval(function(){
  if(is_playing == 0 && has_started == 0)
  {
    return;
  }
  /* Draw empy playing field. */
  appscreens.forEach(function(object, index){
    object[0].clearRect(0,0,screen_width,screen_height);
    /* Draw center divider stripes*/
    for(i=5;i<screen_height;i+=20)object[0].fillRect(screen_width/2,i,4,10)
  })
  /* Designate y positions of paddles */
  pos_y_left  += velocity_left;
  pos_y_right += velocity_right;

  /* Do not let paddles go beyond the boundaries of the playing field */
  if(pos_y_left < 0){
    pos_y_left = 0;
  }
  if(pos_y_left > screen_height-paddle_height){
    pos_y_left = screen_height-paddle_height;
  }
  if(pos_y_right < 0){
    pos_y_right = 0;
  }
  if(pos_y_right > screen_height-paddle_height){
    pos_y_right = screen_height-paddle_height;
  }

  /* Update the position of the ball */
  ball_x += ball_v_x;
  ball_y += ball_v_y;
  
  /* If the ball has hit the top or the bottom, reverse y velocity */
  if(ball_y <= 0){
    ball_y = 0;
    ball_v_y = -ball_v_y
  }
  
  /* If the ball has hit the bottom, reverse y velocity */
  if(ball_y >= screen_height - ball_height){
    ball_y = screen_height - ball_height;
    ball_v_y = -ball_v_y;
  }
  
  /* If the ball has hit the left paddle, modify x velocity */
  if(ball_x  <= paddle_width + paddle_buffer      // If the ball has moved near the left paddle
    &&ball_x >= paddle_buffer                    // and the ball is not yet behind the left paddle
    &&ball_y <  pos_y_left + paddle_height       // and the ball is between the top and bottom of the left paddle 
    &&ball_y >  pos_y_left - ball_height){                           
      ball_v_x = -ball_v_x + 0.2;
      ball_v_y += (ball_y - pos_y_left-45)/20   // Send the ball back to the right paddle
  }
  /* If the ball has hit the right paddle, modify x velocity */
  if(ball_x  <= screen_width + ball_width - (paddle_width + paddle_buffer)     // If the ball is not yet behind the right paddle
    &&ball_x >= screen_width - ball_width - (paddle_width + paddle_buffer)     // and the ball has moved near the right paddle
    &&ball_y <  pos_y_right  + paddle_height                                   // and the ball is between the top and bottom of the right paddle 
    &&ball_y >  pos_y_right - ball_height ){
      ball_v_x =  -ball_v_x - 0.2;
      ball_v_y += (ball_y - pos_y_right - 45)/20                               // Send the ball back to the left paddle
  }

  //Don't let the ball go faster than 1/4 the width of the paddle
  if(Math.abs(ball_v_x) > paddle_width/4 ){
    ball_v_x = Math.sign(ball_v_x) * (paddle_width - 1 );
  }

  //Don't let the ball go faster than the 1/8 the height of the paddle
  if(Math.abs(ball_v_y) > paddle_height/8 ){
    ball_v_y = Math.sign(ball_v_y) * (paddle_height/8 - 1 );
  }

  /* If the ball has gone out of x bounds on the left side, give the right player a point */
  if(ball_x < 0){
    score_right++;
    ball_x = screen_width/2;
    ball_y = screen_height/2;
    ball_v_x = 5;
    is_playing = 1;
  }

  /* If the ball has gone out of x bounds on the right side, give the left player a point */
  if(ball_x > screen_width - (ball_width + paddle_buffer)){
    score_left++;
    ball_x = screen_width/2;
    ball_y = screen_height/2;
    ball_v_x = -5;
    is_playing = 1;
  }

  /* If the ball is moving to the left, have the left paddle try to reach the y position of the ball */
  appscreens.forEach(function(object, index){
    /* Draw the score */
    object[0].fillText(score_left+" "+score_right, screen_width/2 - 15, 20)
    /* Draw the left paddle */
    object[0].fillRect(paddle_buffer, pos_y_left, paddle_width, paddle_height)
    /* Draw the right paddle */
    object[0].fillRect(screen_width - (paddle_buffer + paddle_width), pos_y_right, paddle_width, paddle_height)
    /* Draw the ball */
    object[0].fillRect(ball_x, ball_y, ball_height, ball_width) 
  })
  
  /* If the game is automated and */
  /* If the ball is moving to the left, have the left paddle try to reach the y position of the ball */
  if(automated == 1 && ball_v_x < 0){
    // If the ball is outside the middle of the paddle, accelerate in the direction of the ball's movement
    if(((ball_y + ball_height/2) < (pos_y_left + paddle_height * 1/4)  // ball is above 25% of the top of the paddle
      ||(ball_y + ball_height/2) > (pos_y_left + paddle_height * 3/4)) // or ball is below 25% of the bottom of the paddle
    ){
        velocity_left = 1.0*(Math.abs(ball_v_x)+Math.abs(ball_v_y))*Math.sign((ball_y + ball_height/2) - (pos_y_left + paddle_height/2))
    }
    // If the ball is within the middle of the paddle, match the y position of the ball */
    else{
      velocity_left = 0;
      pos_y_left = (ball_y + ball_height/2) - paddle_height/2;
    }
  }
  
  /* If the ball is moving to the right, have the right paddle try to reach the y position of the ball*/
  if(ball_v_x > 0){
    // If the game is automated
    if(automated == 1){
      // If the ball is outside the middle of the paddle, accelerate in the direction of the ball's movement
      if(((ball_y + ball_height/2) < (pos_y_right + paddle_height * 1/4)  // ball is above 25% of the top of the paddle
        ||(ball_y + ball_height/2) > (pos_y_right + paddle_height * 3/4)) // or ball is below 25% of the bottom of the paddle
      ){
          velocity_right = 1.0*(Math.abs(ball_v_x)+Math.abs(ball_v_y))*Math.sign((ball_y + ball_height/2) - (pos_y_right + paddle_height/2))
      }
      // If the ball is within the middle of the paddle, match the y position of the ball */
      else{
        velocity_right = 0;
        pos_y_right = (ball_y + ball_height/2) - paddle_height/2;
      }
    // If the game has an active player
    }else{
      if(((ball_y + ball_height/2) < (pos_y_right + paddle_height * 1/4)  // ball is above 25% of the top of the paddle
        ||(ball_y + ball_height/2) > (pos_y_right + paddle_height * 3/4)) // or ball is below 25% of the bottom of the paddle
      ){
          velocity_right = 0.4*(Math.abs(ball_v_x))*Math.sign((ball_y + ball_height/2) - (pos_y_right + paddle_height/2))
      }
    }
  }

}, update_interval)

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
    velocity_left = 5;
  }
  if(k == '87'){
    velocity_left = -5;
  }
}

document.onkeyup=function(e){
  k=(e||window.event).keyCode;
  if(k == '83'){
    velocity_left = 0;
  }
  if(k == '87'){
    velocity_left = 0;
  }
}

has_started = 0;
ball_v_y = 1;
is_playing = 1;
