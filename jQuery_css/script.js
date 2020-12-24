// Get the base positions of the characters and chatbubbles
$(document).ready(function(){
    // Get the base positions and add as a data item to the object.
    $.each($('.character, .chatbubble'), function(iteration, element){
        baseXpos = 100 * parseFloat($(element).css('left')) / parseFloat($(element).parent().css('width'));
        $(element).data('data-posx', baseXpos + '%');

        baseYpos = 100 * parseFloat($(element).css('top')) / parseFloat($(element).parent().css('height'));
        $(element).data('data-posy', baseYpos + '%');
    })
})

// If the user changes the X slider, move the characters and the chatbubbles
$('#formControlRangeX').on('input', function(event){
    // Change the character's and chatbubble's position based upon the value of the slider
    $.each($('.character, .chatbubble'), function(index, object){
        newXpos  = (parseFloat($(object).data('data-posx')) + parseFloat(event.currentTarget.value)/8).toFixed(2);
        $(object).css('left', newXpos + '%');

        newYpos  = (parseFloat($(object).data('data-posy')) - parseFloat(event.currentTarget.value)/25).toFixed(2);
        $(object).css('top', newYpos + '%');
    })
})