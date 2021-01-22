var baseXpos;

// Get the base offset and positions of maude
$(document).ready(function(){
    // Get the base positions.
    baseXpos = 100 * parseFloat($('.maude').css('left')) / parseFloat($('.maude').parent().css('width'));
})

// If the user changes the X slider, move maude
$('#formControlRangeX').on('input', function(event){
    // Get the new position value for maude
    newXpos  = (parseFloat(baseXpos + parseFloat(event.currentTarget.value)/3.5)).toFixed(2);

    // Change maude's and maude's chatbubble's position based upon the value of the slider,
    // using next sibling selector:
    $('.maude, .maude ~ .chatbubble').css('left', newXpos + '%');
})