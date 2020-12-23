baseSetting = 1;

$('#toggleBtn').on('click', function(){
    // Use the prev + next selector to select the lightning and change the color between white and yellow.
    if(baseSetting){
        $('.background + .lightning').css('background-color', 'rgba(255, 255, 180, 0.6)');
    } else {
        $('.background + .lightning').css('background-color', 'rgba(255, 255, 255, 1)');
    }

    // Toggle the basesetting
    baseSetting = !baseSetting;
})