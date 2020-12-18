var basewidth;

// Get the base width of Joe
$(document).ready(function(){
    basewidth = 100 * $('.joe').width() / $('.joe').parent().width()

    //Update the width output information
    $('#widthOutput').text(basewidth.toFixed(2) + '%');
})

// If the user changes the slider, change Joe's height
$('#formControlRange').on('input', function(event){
    // Change Joe's width based upon the value of the slider
    newWidth = (basewidth * event.currentTarget.value/50).toFixed(2) + '%'
    $('.joe').width(newWidth);

    // make the triangle-ray show up for a microsecond when the slider changes
    $('.triangleray').fadeTo(10, 0.4);
    $('.triangleray').fadeOut(300);

    //Update the width output information
    $('#widthOutput').text(newWidth);
})