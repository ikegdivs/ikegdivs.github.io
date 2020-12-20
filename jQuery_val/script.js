var baseSpeed;

// Get the duration of the animation
$(document).ready(function(){
    baseDuration = parseFloat($('.nachodrop').css('animation-duration'));

    // Update the duration output information
    $('#durationOutput').text(baseDuration.toFixed(2) + 's');

    // Set the value of the slider
    $('#formControlRange').val(baseDuration * 50);
})

// If the user changes the slider, change the duration (speed) of the nacho drop animation
$('#formControlRange').on('input', function(event){
    // Get the value of the slider
    sliderVal = $(event.currentTarget).val();
    
    // Change nacho drop's duration based upon the value of the slider
    newDuration = (baseDuration + (sliderVal - 50)/100).toFixed(2) + 's'
    $('.nachodrop').css('animation-duration', newDuration);

    // Update the duration output information
    $('#durationOutput').text(newDuration);
})