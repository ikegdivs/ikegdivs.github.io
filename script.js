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

// Add patch and maude items to the carousel
if(location.pathname == '/index.html' 
    || location.pathname =='/'){

    // Load mainpages.json into an object
    jQuery.getJSON('/data/mainpages.json', function(data){
        // For every item in mainpages.json, create a carousel-item
        data.forEach(function(page, index){
            let cItem = $('<div></div>')
            cItem.addClass('carousel-item');
            // If this is the first page, make it the active element
            if(index==0){
                cItem.addClass('active');
            }

            // Add the link
            href = $('<a></a>')
            href.attr('href', page.href);

            // Add the image
            img = $('<img />');
            img.addClass('d-block');
            img.addClass('img-fluid');
            img.attr('src', page.src);
            img.attr('alt', page.name);

            // Add the caption.
            cap = $('<div></div>');
            cap.addClass('carousel-caption');
            cap.addClass('d-none');
            cap.addClass('d-md-block');

            // Add the caption text
            h2 = $('<h2></h2>');
            h2.addClass('mt-0');
            h2.text(page.name);

            // Add the description
            desc = $('<p></p>');
            desc.addClass('d-none');
            desc.addClass('d-sm-block');
            desc.text(page.description);

            
            // Assemble the objects
            $('#patchmaudecarousel .carousel-inner').append(cItem);
            cItem.append(href);
            href.append(img);
            href.append(cap);
            cap.append(h2);
            cap.append(desc);
        });
    });

    // Add the controls to the carousel
    $('#patchmaudecarousel .carousel-inner').append(
        `<a class="carousel-control-prev" href="#patchmaudecarousel" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon"></span>
        </a>
        <a class="carousel-control-next" href="#patchmaudecarousel" role="button" data-slide="next">
        <span class="carousel-control-next-icon"></span>
        </a>`
    );
}

// Add the Divs items to the carousel
if(location.pathname == '/index.html' 
    || location.pathname =='/'){

    // Load mainpages.json into an object
    jQuery.getJSON('/data/divspages.json', function(data){
        // For every item in mainpages.json, create a carousel-item
        data.forEach(function(page, index){
            let cItem = $('<div></div>')
            cItem.addClass('carousel-item');
            // If this is the first page, make it the active element
            if(index==0){
                cItem.addClass('active');
            }

            // Add the link
            href = $('<a></a>')
            href.attr('href', page.href);

            // Add the image
            img = $('<img />');
            img.addClass('d-block');
            img.addClass('img-fluid');
            img.attr('src', page.src);
            img.attr('alt', page.name);

            // Add the caption.
            cap = $('<div></div>');
            cap.addClass('carousel-caption');
            cap.addClass('d-none');
            cap.addClass('d-md-block');

            // Add the caption text
            h2 = $('<h2></h2>');
            h2.addClass('mt-0');
            h2.text(page.name);

            // Add the description
            desc = $('<p></p>');
            desc.addClass('d-none');
            desc.addClass('d-sm-block');
            desc.text(page.description);

            
            // Assemble the objects
            $('#thedivscarousel .carousel-inner').append(cItem);
            cItem.append(href);
            href.append(img);
            href.append(cap);
            cap.append(h2);
            cap.append(desc);
        });
    });

    // Add the controls to the carousel
    $('#thedivscarousel .carousel-inner').append(
        `<a class="carousel-control-prev" href="#thedivscarousel" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon"></span>
        </a>
        <a class="carousel-control-next" href="#thedivscarousel" role="button" data-slide="next">
        <span class="carousel-control-next-icon"></span>
        </a>`
    );
}

// Add the don3ts items to the carousel
if(location.pathname == '/index.html' 
    || location.pathname =='/'){

    // Load mainpages.json into an object
    jQuery.getJSON('/data/don3tspages.json', function(data){
        // For every item in mainpages.json, create a carousel-item
        data.forEach(function(page, index){
            let cItem = $('<div></div>')
            cItem.addClass('carousel-item');
            // If this is the first page, make it the active element
            if(index==0){
                cItem.addClass('active');
            }

            // Add the link
            href = $('<a></a>')
            href.attr('href', page.href);

            // Add the image
            img = $('<img />');
            img.addClass('d-block');
            img.addClass('img-fluid');
            img.attr('src', page.src);
            img.attr('alt', page.name);

            // Add the caption.
            cap = $('<div></div>');
            cap.addClass('carousel-caption');
            cap.addClass('d-none');
            cap.addClass('d-md-block');

            // Add the caption text
            h2 = $('<h2></h2>');
            h2.addClass('mt-0');
            h2.text(page.name);

            // Add the description
            desc = $('<p></p>');
            desc.addClass('d-none');
            desc.addClass('d-sm-block');
            desc.text(page.description);

            
            // Assemble the objects
            $('#vizcarousel .carousel-inner').append(cItem);
            cItem.append(href);
            href.append(img);
            href.append(cap);
            cap.append(h2);
            cap.append(desc);
        });
    });

    // Add the controls to the carousel
    $('#vizcarousel .carousel-inner').append(
        `<a class="carousel-control-prev" href="#vizcarousel" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon"></span>
        </a>
        <a class="carousel-control-next" href="#vizcarousel" role="button" data-slide="next">
        <span class="carousel-control-next-icon"></span>
        </a>`
    );
}