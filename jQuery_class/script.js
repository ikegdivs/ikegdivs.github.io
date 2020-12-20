
$('#widthBtn').on('click', function(){
    // Get the width of the 'foreground' class.
    widthText = $('.foreground').width();
    // Display the width of the 'foreground' class.
    $('.widthOutput').text(widthText + 'px');
})