var navbar = `<nav class="navbar navbar-dark navbar-expand-sm fixed-top">
<div class="container">
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#Navbar">
        <span class="navbar-toggler-icon"></span>
    </button>
    <a class="navbar-brand mr-auto" href="#"><img src="/images/logo.png" height="30" width="41"></a>
    <div class="collapse navbar-collapse" id="Navbar">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item"><a class="nav-link" href="/index.html"><span class="fa fa-home fa-lg"></span> Home</a></li>
            <li class="nav-item"><a class="nav-link" href="/divs_pong/comic.html"><span class="fa fa-info fa-lg"></span> Divs</a></li>
            <li class="nav-item"><a class="nav-link" href="/jQuery_fadeto/comic.html"><span class="fa fa-list fa-lg"></span> Patch &amp; Maude</a></li>
            <li class="nav-item"><a class="nav-link" href="/viz_tables/comic.html"><span class="fa fa-address-card fa-lg"></span> Mini-Apps</a></li>
        </ul>
    </div>
</div>
</nav>`;

/* If this is not a key navigation window, just throw main nav locations */
if(location.pathname != '/index.html'){
    $('body').prepend(navbar);
}