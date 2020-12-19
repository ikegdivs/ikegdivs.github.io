var baseXoffset;
var baseYoffset;
var baseXpos;
var baseYpos;

// Get the base offset and positions of the gnome
$(document).ready(function(){
    baseXoffset = parseFloat($('.gnome').offset().left);
    baseYoffset = parseFloat($('.gnome').offset().top);

    // Get the base positions in case the browser document is resized.
    baseYpos = 100 * parseFloat($('.gnome').css('top'))  / parseFloat($('.gnome').parent().css('height'));
    baseXpos = 100 * parseFloat($('.gnome').css('left')) / parseFloat($('.gnome').parent().css('width'));

    //Update the offset output information
    $('#Xoffset').text(baseXoffset.toFixed(2));
    $('#Yoffset').text(baseYoffset.toFixed(2));

    // Set the sliders to the current percentage of offset
    $('#formControlRangeX').val(100 * baseXoffset / parseFloat($(document).width()));
    $('#formControlRangeY').val(100 * baseYoffset / parseFloat($(document).height()));
})

// If the user changes the X slider, change the gnome's X offset
$('#formControlRangeX').on('input', function(event){
    // Get the new offset values for the gnome
    newXoffset  = (parseFloat($(document).width()) * event.currentTarget.value / 100).toFixed(2);
    Yoffset     = $('.gnome').offset().top;

    // Change the gnome's offset based upon the value of the slider
    $('.gnome').offset({top: Yoffset, left: newXoffset});

    //Update the offset output information
    $('#Xoffset').text(parseFloat(newXoffset).toFixed(2));
})

// If the user changes the Y slider, change the gnome's Y offset
$('#formControlRangeY').on('input', function(event){
    // Get the new offset values for the gnome
    newYoffset  = (parseFloat($(document).height()) * event.currentTarget.value / 100).toFixed(2);
    Yoffset     = $('.gnome').offset().left;

    // Change the gnome's offset based upon the value of the slider
    $('.gnome').offset({top: newYoffset, left: Xoffset});

    //Update the offset output information
    $('#Yoffset').text(parseFloat(newYoffset).toFixed(2));
})

// If the browser document is resized, reset the position of the gnome and the sliders
$(window).on('resize', function(){
    $('.gnome').css({'top':  baseYpos + '%','left': baseXpos + '%'});

    // reset the base offsets
    baseXoffset = $('.gnome').offset().left;
    baseYoffset = $('.gnome').offset().top;

    // Reset the sliders to the current percentage of offset
    $('#formControlRangeX').val(100 * baseXoffset / parseFloat($(document).width()));
    $('#formControlRangeY').val(100 * baseYoffset / parseFloat($(document).height()));
})