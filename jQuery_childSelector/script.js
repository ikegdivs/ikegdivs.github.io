var baseColor;

// Get the base color of the sprites
$(document).ready(function(){
    baseColor = $('.sprites > .sprite').css('background-color');
})

// If the user changes the slider, change the sprites' color
$('#formControlRange').on('input', function(event){
    // Change the sprites' color based upon the value of the slider
    sliderValue = event.currentTarget.value;
    newBlue = sliderValue * 2.55;
    newRed = (100-sliderValue) * 2.55;
    newColor = `radial-gradient( rgba(` + newRed + `, 230, ` + newBlue + `, 1) 0%,  
                                 rgba(` + newRed + `, 230, ` + newBlue + `, 0) 40%,  
                                 rgba(` + newRed + `, 230, ` + newBlue + `, 0) 100%)`;

    $('.sprites > .sprite').css('background-image', newColor);
})