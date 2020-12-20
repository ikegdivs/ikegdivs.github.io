
$('#toggleBtn').on('click', function(){
    // Stop or start the chatbubble animation
    //$('.dogcontainer, .dog2').toggleClass('dogrun');

    if($('.dogcontainer').css('-webkit-animation-play-state') == 'paused'){
        $('.dogcontainer, .dog2').css('-webkit-animation-play-state', 'running');
    } else {
        $('.dogcontainer, .dog2').css('-webkit-animation-play-state', 'paused');
    }
})