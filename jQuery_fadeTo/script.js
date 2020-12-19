var baseOpacity;

// Get the base opacity of the ghost
$(document).ready(function(){
    baseOpacity = $('.ghost').css('opacity');

    //Update the width output information
    $('#opacityOutput').text(parseFloat(baseOpacity).toFixed(2));
})

// If the user changes the slider, change the ghost's opacity
$('#formControlRange').on('input', function(event){
    // Change the ghost's opacity based upon the value of the slider
    newOpacity = parseFloat((baseOpacity * event.currentTarget.value/50)).toFixed(2)
    $('.ghost').fadeTo(100, newOpacity)

    //Update the opcaity output information
    $('#opacityOutput').text(newOpacity);
})