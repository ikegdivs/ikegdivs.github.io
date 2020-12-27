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
        newXpos  = (parseFloat($(object).data('data-posx')) + parseFloat($(event.currentTarget).prop('value'))/8).toFixed(2);
        $(object).css('left', newXpos + '%');

        newYpos  = (parseFloat($(object).data('data-posy')) - parseFloat($(event.currentTarget).prop('value'))/25).toFixed(2);
        $(object).css('top', newYpos + '%');
    })

    // If the slider is at 100, change the source attribute of the hexagon to hex-a-gone.svg
    if(event.currentTarget.value=="100"){
        $('#heximg').attr('src', '/svg/Hex-a-gone.svg')
    }
    // If the slider is at 0, change the source attribute of the hexagon to hexagon.svg
    if(event.currentTarget.value=="0"){
        $('#heximg').attr('src', '/svg/Hexagon.svg')
    }
})