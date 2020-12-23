// Get the base offset and positions of maude
$(document).ready(function(){
    // Get the base positions and animation durations and add as a data item to the object.
    $.each($('.bgd, .chatbubble'), function(iteration, element){
        baseXpos = 100 * parseFloat($(element).css('left')) / parseFloat($(element).parent().css('width'));
        $(element).data('data-posx', baseXpos + '%');
        $(element).data('data-duration', $(element).css('animation-duration'));
    })
})

// Check for background objects in the panel, change the animation duration
function useHasClass(){
    // Look only in the panel for these background objects
    x = $(".inpanel *");
    $.each(x, function(index, object){
        // If the object has a class of 'bgd', change the animation duration in proportion to the slider value
        if(x.hasClass('bgd')){
            baseDur = $(object).data('data-duration');
            $(object).css('animation-duration', parseFloat(baseDur) * (1-parseFloat(event.currentTarget.value)/180) + 's' );
        }
    })
}

// If the user changes the X slider, move the boat and call the hasClass function
$('#formControlRangeX').on('input', function(event){
    // Change the boat's and chatbubble's position based upon the value of the slider
    $.each($('.bgd02, .chatbubble'), function(index, object){
        newXpos  = (parseFloat($(object).data('data-posx')) + parseFloat(event.currentTarget.value)/3.5).toFixed(2);
        $(object).css('left', newXpos + '%');
    })

    // for every animated object, change the animation duration by the percentage of the slider
    useHasClass();
})