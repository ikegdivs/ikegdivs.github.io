var navbar = `<nav class="navbar navbar-dark navbar-expand-sm navbar-static-top">
<div class="container">
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#Navbar">
        <span class="navbar-toggler-icon"></span>
    </button>
    <a class="navbar-brand mr-auto" href="#"><img src="/images/logo.PNG" height="30" width="30" style="margin-bottom: 0.2vw"></a>
    <div class="collapse navbar-collapse" id="Navbar">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item"><a class="nav-link" href="/index.html"><span class="fa fa-home fa-lg"></span> Home</a></li>
            <li class="nav-item"><a class="nav-link" href="/divs_index.html"><span class="fa fa-info fa-lg"></span> Divs</a></li>
            <li class="nav-item"><a class="nav-link" href="/patchandmaude_index.html"><span class="fa fa-list fa-lg"></span> Patch &amp; Maude</a></li>
            <li class="nav-item"><a class="nav-link" href="/don3ts_index.html"><span class="fa fa-address-card fa-lg"></span> don3ts</a></li>
            <li class="nav-item"><a class="nav-link" href="/def_assetmanagement_terms/comic.html"><span class="fa fa-address-card fa-lg"></span> Asset Management</a></li>
        </ul>
    </div>
</div>`;

/* If this is not a key navigation window, just throw main nav locations */
console.log('location.pathname: ' + location.pathname);
if(location.pathname != '/' 
    && location.pathname != '/index.html'
    && location.pathname != '/patchandmaude_index.html'
    && location.pathname != '/divs_index.html'
    && location.pathname != '/don3ts_index.html'
    && location.pathname != '/def_assetmanagement_terms/comic.html' ){
        $('body').prepend(navbar);
}