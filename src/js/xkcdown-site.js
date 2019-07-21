/**
Site-specific JavaScript file for xkc(down) (https://xkcdown.indevious.com).
@module xkcdown-site.js
@author James Devlin (james@indevious.com)
*/

(function( $, extrovert ) {

  var _numLoaded = 0;
  var _numFailed = 0;
  var xkcdown_opts = { };
  var options;

  $(document).ready( function() {
    var cookie = extrovert.utils.getCookie('xkcdown');
    if( cookie ) init();
    else prepare();
  });

  function prepare() {
    var dlgTempl = window.JST["src/_jst/dialog.html"]();
    $('body').append(dlgTempl);
    var msg = {
      warn: 'Warning',
      errWebGL: 'Warning: WebGL not detected',
      looksGood: '<p><strong>Great, looks like your browser supports WebGL.</strong> <span class="nowrap">xkc(down)</span> will (attempt to) run with full functionality.</p>',
      errWebGLVerbose: '<p><strong>Oops, looks like this browser doesn\'t support WebGL.</strong> <span class="nowrap">xkc(down)</span> will attempt to run in Canvas mode, but you may experience extremely slow framerates, graphical glitches, and all-around brokenness.</p><p class="footnote">For full functionality, we recommend recent versions of <a href="http://www.google.com/chrome/">Chrome</a>, <a href="https://www.mozilla.org/firefox/new/">Firefox</a>, or the OS X version (only) of <a href="https://www.apple.com/safari/">Safari</a>.</p>',
      errIE: 'Warning: Internet Explorer mode',
      errIEVerbose: '<p><strong>Hey, we noticed you\'re using Internet Explorer.</strong> That\'s cool, but Internet Explorer currently doesn\'t support some stuff our physics engine needs to run at top speed. <span class="nowrap">xkc(down)</span> will attempt to run with full functionality, but you may experience slower framerates and additional buffering.</p><p class="footnote">For full functionality, at least until IE adds support for transferable objects, we recommend recent versions of <a href="http://www.google.com/chrome/">Chrome</a>, <a href="https://www.mozilla.org/firefox/new/">Firefox</a>, or the OS X version (only) of <a href="https://www.apple.com/safari/">Safari</a>.</p>'
    };

    // Warn non-WebGL browsers
    var ua = window.navigator.userAgent;
    var supportsGL = extrovert.utils.detectWebGL();
    var browserIE = ~ua.indexOf('MSIE ') || ~ua.indexOf('Trident/');
    var statusMsg = msg.looksGood;
    var frag = "success";
    if( !supportsGL || browserIE ) {
      statusMsg = supportsGL ? msg.errIEVerbose : msg.errWebGLVerbose;
      $('header > h1').text( supportsGL ? msg.errIE : msg.errWebGL );
      frag = "warning";
    }

    // Display the popup and wait for acknowledgement
    displayModal( 'xkc(down)',
      '<p><span class="nowrap"><strong>xkc(down)</strong></span> is an <a href="http://xkcd.com">xkcd</a>-inspired visualization in three dimensions.</p>' +
      (statusMsg ? ('<div class="alert alert-' + frag + '" role="alert">' + statusMsg + '</div>') : '') +
      '<p>Instructions:</p>' +
      '<ul><li>Click: Push blocks</li>' +
      '<li>Click + Drag: Move camera</li>' +
      '<li>Refresh the page to get a new set of comics.</li>' +
      '</ul>' +
      '<p></p>');

      $('#go').click(function (e) {
        extrovert.utils.setCookie('xkcdown','1');
        init();
      });
  }

  function init() {

    // Fetch query params http://stackoverflow.com/a/7731878
    var urlParams = [], hash;
    var hashes = window.location.href.slice( window.location.href.indexOf('?') + 1 ).split( '&' );
    for( var idx = 0; idx < hashes.length; idx++ ) {
      hash = hashes[idx].split( '=' );
      urlParams.push( hash[0] );
      urlParams[hash[0]] = hash[1];
    }

    // Set up xkc(down) options
    xkcdown_opts = {
      qty: parseInt(urlParams.qty) || 100,
      scene: urlParams.scene || 'wall',
      seed: urlParams.seed || randomString(32)
    };

    $('#sc-' + xkcdown_opts.scene).addClass('active');

    // Seed the RNG with either a user-supplied seed or a pseudo-randomly
    // generated one. Each run of xkc(down) has to have a seed so it can be
    // re-run again later by specifying the same seed, or shared as a
    // permalink, etc.
    Math.seedrandom( xkcdown_opts.seed );

    // Display the simulation permalink
    $("#permalink").val( buildPermalink( xkcdown_opts ) )
      .click(function() {
        this.setSelectionRange(0, this.value.length);
      });

    // Set up common Extrovert options
    var common_options = {
      target: { container: '#target' },
      physics: {
        options: {
          worker: 'js/pjsw.js',
          ammo: 'ammo.js'
        }
      }
    };

    // Set up specific Extrovert options for each scene type
    var specific_options = null;
    if( xkcdown_opts.scene === 'wall' ) {
      specific_options = {
        lights: [ { type: 'hemisphere', color: 0xd6eeff, groundColor: 0xe3f7e1, intensity: 0.75 } ],
        bkcolor: 0x008cff,
        scene: { items: [ { type: 'box', pos: [0,0,0], dims: [40000,10,40000]/*, rot: [0.35,0,0]*/, mass: 0, color: 0x11cc00 } ] },
        transform: [
          { type: 'extrude', src: 'img', container: '#source', depth: 'height', align: 'mirror-y' }
        ],
        gravity: [0,-200,50],
        camera: {
          far: 200000,
          position: [0,55,2000],
          rotation: [0.25,0,0]
        },
        avatar: {
          enabled: true,
          type: 'box',
          dims: [100,100,100],
          pos: [0,55,2000],
          visible: false,
          color: 0x000000,
          opacity: 0.25,
          transparent: true,
          mass: 10
        },
        controls: { yFloor: 55.0 },
        init_cam_opts: { position: [0,2000,800] }
      };
    }
    else if( xkcdown_opts.scene === 'tower' ) {
      specific_options = {
        block: { depth: 'height' },
        lights: [ { type: 'hemisphere', color: 0xd6eeff, groundColor: 0xe3f7e1, intensity: 0.75 } ],
        bkcolor: 0x008cff,
        scene: { items: [ { type: 'box', pos: [0,0,0], dims: [40000,10,40000]/*, rot: [0.35,0,0]*/, mass: 0, color: 0x11cc00 } ] },
        transform: [
          { type: 'extrude', src: 'img', container: '#source' }
        ],
        gravity: [0,-200,50],
        camera: {
          far: 200000,
          position: [0,55,2000],
          rotation: [0.25,0,0]
        }
      };
    }
    else if( xkcdown_opts.scene === 'float' ) {
      specific_options = {
        lights: [
          { type: 'point', color: 0xff2323, intensity: 1, distance: 10000 },
          { type: 'point', color: 0xffffff, intensity: 0.25, distance: 1000, pos: [0,300,0] },
        ],
        transform: [
          { type: 'extrude', src: 'img', container: '#source' }
        ],
        // camera: {
          // //position: [0,300,200],
          // rotation: [-(Math.PI / 4),0,0]
        // }
      };
    }
    else {
      // Unknown scenario type.
      return;
    }

    // Merge common and scene-specific Extrovert options
    options = $.extend(true, {}, common_options, specific_options);

    // Set up a progress bar
    var progTempl = window.JST["src/_jst/progress.html"]();
    $('body').append(progTempl);

    // Render HTML for a random selection of comics
    // Use an array + Fischer-Yates shuffle for random selection
    // without duplicates. Could also use a linear congruential
    // generator or similar here
    // http://en.wikipedia.org/wiki/Linear_congruential_generator
    var iso = $('<div id="isotope">');
    if( $( '#isotope' ).length === 0 ) {
      var randArray = new Array( 1498 );
      for(var a = 0; a < randArray.length; a++) {
        randArray[a] = a + 1;
      }
      randArray = shuffle(randArray);
      var imgs = [];
      for(var i = 0; i < xkcdown_opts.qty; i++) {
        imgs.push( $('<img src="img/x/' + randArray[i] + '.png">') );
      }
      iso.css({ width: '0', height: '0', overflow: 'hidden' });
      iso.append( imgs );
      $( '#source' ).append( iso );
    }

    // Wait for images to load
    imagesLoaded( '#source' ).on( 'progress', onImgLoaded);
  }

  function onImgLoaded(inst, loadingImg) {
    _numLoaded++;
    if(!loadingImg.isLoaded) {
      _numFailed++;
      console.log('Image load failed for ' + loadingImg.img.src );
    }
    var percent = Math.round(( _numLoaded / xkcdown_opts.qty) * 100);
    setTimeout( function( pct, numLoad ) {
      var pbar = $('#progress .progress-bar');
      pbar.attr('aria-valuenow', pct);
      pbar.css('width', pct + '%');
      $('#progress span').text( pct + '%' );
      if( numLoad === xkcdown_opts.qty ) {
        setTimeout( function() {
          $('#progress span').text('3Difying comic imagery...');
          $('#isotope').css({ width: '7500px' });
          start( '#isotope' );
        }, 500);
      }
    }, 10, percent, _numLoaded);
  }

  function start( srcSelector ) {
    var $cont = $( srcSelector ).packery({ itemSelector: 'img', isOriginTop: true, isInitLayout: false });
    $cont.packery( 'once', 'layoutComplete', function( items ) {
      var ret = extrovert.init( '#target', options ); // Go!
      if( !ret ) {
        $('header > h1').text('Sorry, WebGL support is required to run this demo.');
      }
      else {
        $('#background, #progress').fadeOut(1000, function() {
          //$(this).remove();
        });
      }
    });
    $cont.packery();
  }

  function displayModal( title, msg ) {
    var modalElem = $('#popup');
    modalElem.find('.modal-title').text( title );
    modalElem.find('.modal-body').html( msg );
    modalElem.modal('show');
  }

  // Generate a random int between min - max
  function randomInt( min, max ) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  // http://stackoverflow.com/a/10727155
  function randomString( length ) {
      var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var result = '';
      for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
  }

  function buildPermalink( xopts ) {
    var hostName = window.location.hostname;
    if( hostName.indexOf('localhost') === 0 )
      hostName = window.location.host;
    var ret = hostName + '?seed=' + xopts.seed;
    if( xopts.qty != 100 )
      ret += '&qty=' + xopts.qty;
    return ret;
  }

  // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  function shuffle(array) {
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  // Google Analytics
  /* jshint ignore:start */
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-58879362-1', 'auto');
  ga('send', 'pageview');
  /* jshint ignore:end */

}($, extrovert));
