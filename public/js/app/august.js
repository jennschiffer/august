/*
* august
* artist: jenn schiffer
*/

$(function() {

  /* var */

  var ctx, 
      currentHistoryLength = 0,
      historyPointer = 0,
      animating = 'new',
      interval;

  var $window = $(window),
      $body = $('body'),
      $link = $('.link'),
      $modals = $('.modal'),
      $modalImport = $('.import'),
      $modalExport = $('.export'),
      $modalAbout = $('.about'),
      $inputImport = $('#import-pxon'),
      $inputExport = $('#export-pxon');

  var windowCanvas = {
    height: $window.height(),
    width: $window.width(),
    background: '#fff'
  };

  var pixel = {
    color: 'rgba(0, 0, 0, 1)',
  };
  
  var pxon = {
    exif: {
      software: 'http://august.today'
    },
    pxif: {
      pixels: []
    }
  };


  /* canvas & drawing */

  var generateCanvas = function() {
    $canvas = $('<canvas id="canvas" width="' + windowCanvas.width + '" height="' + windowCanvas.height + '">Your browser doesn\'t support canvas.</canvas>');
    $body.prepend($canvas);
    ctx = $canvas[0].getContext('2d');
    
    // restore webstorage data
    if ( hasLocalStorage() ) {
      drawFromLocalStorage();
    }
  };
  
  var deleteCanvas = function() {
    ctx.clearRect(0, 0, $window.width(), $window.height());
    pxon.pxif.pixels = [];
    historyPointer = 0;
    animating = 'new';
    saveToLocalStorage();
    clearInterval(interval);
  };

  var initpixel = function(size) {
    pixel.size = size;
  };

  var drawPixel = function(xPos, yPos, color, size, addToHistory) {    

    // get color at this spot and compare to color
    var orig = ctx.getImageData(xPos, yPos, 1, 1).data;

    if ( getRGBColor(orig) === color || !color && orig[3] === 0) {
      return;
    }
    
    if ( addToHistory ) {
      pxon.pxif.pixels.push({
        xPos: xPos,
        yPos: yPos,
        color: color,
        size: size,
        date: new Date()
      });
    }
    
    ctx.beginPath();
    xPos = ( Math.ceil(xPos/size) * size ) - size;
    yPos = ( Math.ceil(yPos/size) * size ) - size;
    ctx.moveTo (xPos, yPos);
    ctx.fillStyle = color;
    ctx.lineHeight = 0;
    
    if ( !color ) {
      ctx.clearRect(xPos, yPos, size, size);
    }
    else {
      ctx.fillRect(xPos, yPos, size, size);
    }
  };

  var drawOnMove = function(e) {
    drawPixel(e.pageX, e.pageY, pixel.color, pixel.size, true);
  };

  var drawOnTouch = function(e) {
    for ( var i = 0; i < e.touches.length; i++ ) {
      drawOnMove(e.touches[i]);
    }
  };
  
  var animateDrawing = function() {
    if ( animating === 'new' ) {
      ctx.clearRect(0, 0, $window.width(), $window.height());
      currentHistoryLength = pxon.pxif.pixels.length - 1;
    }
    animating = true;
    
    var drawSlowly = function(){
      if ( !pxon.pxif.pixels[historyPointer] ) {
        return;
      }
      
      drawPixel(pxon.pxif.pixels[historyPointer].xPos, pxon.pxif.pixels[historyPointer].yPos, pxon.pxif.pixels[historyPointer].color, pxon.pxif.pixels[historyPointer].size, false);
      historyPointer++;
      
      if ( historyPointer > currentHistoryLength ) {
        ctx.clearRect(0, 0, $window.width(), $window.height());
        historyPointer = 0;
        currentHistoryLength = pxon.pxif.pixels.length - 1;
      }
    };
    
    interval = setInterval(drawSlowly, 60); 
  };
  
  var pauseAnimateDrawing = function() {
    animating = false;
    clearInterval(interval);
  };

  var toggleAnimation = function() {
    if ( !animating || animating === 'new' ) {
      animateDrawing();
    }
    else {
      pauseAnimateDrawing();
    }
  };
  
  

  /* drawing events */

  var onMouseDown = function(e) {
    e.preventDefault();
    
    var modalOpen = false;
    $modals.each(function(){
      if ( !$(this).hasClass('hidden') ) {
        modalOpen = true;
      }
    });
    
    if ( modalOpen ) {
      $modals.addClass('hidden');
      return;
    }
    
    if ( e.which === 3 ) {
      return;
    }

    drawPixel(e.pageX, e.pageY, pixel.color, pixel.size, true);
    
    $canvas.on('mousemove', drawOnMove);
    $canvas[0].addEventListener('touchmove', drawOnTouch, false);
  };

  var onMouseUp = function(e) {
    $canvas.off('mousemove');

    // save
    saveToLocalStorage();
  };
  
  var onRightClick = function(e) {
    alert('remember when we used to block right click to protect our art lmao');    
    return false;
  };



  /* viewport */
  
  $window.resize(function() {
    if ( $window.width() <= windowCanvas.width && $window.height() <= windowCanvas.height ) {
      return;
    }
    else {
      if ( !hasLocalStorage() ) {
        return;
      }
      else {
        var newWidth = $window.width();
        var newHeight = $window.height();
        windowCanvas.width = newWidth;
        windowCanvas.height = newHeight;

        saveToLocalStorage();

        $canvas
          .attr('width',newWidth)
          .attr('height',newHeight);

        drawFromLocalStorage();
      }

    }
  }); 
  
  $link.click(function() {
    $modals.addClass('hidden');
    $modalAbout.removeClass('hidden');
  });
  
  
  
  /* colors */
  
  var getRGBColor = function(imageData) {
    var opacity = imageData[3]/255;
    return 'rgba(' + imageData[0] + ', ' + imageData[1] + ', ' + imageData[2] + ', ' + opacity + ')';
  };
  
  
  
  /* import/export */
  
  var saveCanvas = function() {
    var png = $canvas[0].toDataURL('image/png');
    window.open(png, '_blank');
  };
  
  var exportPXON = function() {
    // save form fields
    pxon.exif.artist = $('.exif.artist').val();
    pxon.exif.imageDescription = $('.exif.imageDescription').val();
    pxon.exif.userComment = $('.exif.userComment').val();
    pxon.exif.copyright = $('.exif.copyright').val();
    
    // other exif info
    pxon.exif.dateTime = new Date();
    pxon.exif.dateTimeOriginal = ( exif.dateTimeOriginal ) ? exif.dateTimeOriginal : exif.dateTime;
    
    // pxif
    pxon.pxif.dataURL = $canvas[0].toDataURL('image/png');
        
    window.open('data:text/json,' + encodeURIComponent(JSON.stringify(pxon)), '_blank');
  };
  
  var importPXON = function(data) {
    if (data) {
      pxon = JSON.parse(data.target.result);
      
      // prefill the export fields
      $('.exif.artist').val(pxon.exif.artist);
      $('.exif.imageDescription').val(pxon.exif.imageDescription);
      $('.exif.userComment').val(pxon.exif.userComment);
      $('.exif.copyright').val(pxon.exif.copyright);
      
      $modals.addClass('hidden');
    }
  };
  
  var getFileData = function(file) {
    if ( window.FileReader ) {
      fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = importPXON;
      fileReader.onerror = function() { alert('Unable to read file. Try again.'); };
    }
    else {
      alert('Your browser doesn\'t support FileReader, which is required for uploading custom palettes.');
    }
  };
  
  
  /* key and form events */
  
  $body.keypress(function(e){
    
    if ( !$('.modal.export').hasClass('hidden') ) {
      switch (e.keyCode) {
        case 27:
          $modals.addClass('hidden');
          break;
      }
      return;
    }
    
    switch (e.which) {
      case 100:
        // d
        pxon = {
          exif: {
            software: 'http://august.today'
          },
          pxif: {
            pixels: []
          }
        };
        $('.exif').val('');
        deleteCanvas();
        break;
      case 97:
        // a
        toggleAnimation();
        break;
      case 115:
        // s
        saveCanvas();
        break;
      case 101:
        // e
        pixel.color = null;
        break;
      case 112:
        // p
        pixel.color = 'rgba(0, 0, 0, 1)';
        break;
      case 106:
        // j
        $modals.addClass('hidden');
        $modalExport.removeClass('hidden');
        break;
      case 105:
        // i
        $modals.addClass('hidden');
        $modalImport.removeClass('hidden');
        break;
      case 0:
        $modals.addClass('hidden');
        break;
      default:
        //console.log(e.which);
        break;
    }

  });
  
  $inputImport.change(function(e){
    var file = $(this).prop('files')[0];
    getFileData(file);
  });
  
  $inputExport.click(function(e){
    exportPXON();
    return false;
  });

  
  /* local storage */
  
  var hasLocalStorage = function() {
    try {
      return 'localStorage' in window && window.localStorage !== null;
    }
    catch (e) {
      return false;
    }
  };
  
  var drawToCanvas = function(src, x, y, clear) {
    if ( clear ) {
      ctx.clearRect(0, 0, $canvas.width(), $canvas.height());
    }
    
    var img = new Image();
    img.onload = function() {
      ctx.drawImage(img, x, y);
    };
    img.src = src;
  };
  
  var saveToLocalStorage = function() {
    if ( hasLocalStorage() ) {
      localCanvas = $canvas[0].toDataURL('image/png');
      localStorage.august = localCanvas;
      localStorage.augustHistory = JSON.stringify(pxon);
    }
  };
  
  var drawFromLocalStorage = function() {
    var localCanvas = localStorage.august;
    var localHistory = localStorage.augustHistory;
    
    if ( localHistory ) {
      pxon = JSON.parse(localHistory);
    }
    else {
      $.getJSON('/assets/welcome.json', function(data) {
        pxon = data;
        animateDrawing();
      });
    }
    
    if ( localCanvas ) {
      drawToCanvas(localCanvas, 0, 0, true);
    }
  };


  /* init */
  generateCanvas();
  initpixel(15);

  historyPointer = 0;

  // mouse
  $canvas.mousedown(onMouseDown).mouseup(onMouseUp);
  $canvas.on('contextmenu', onRightClick);

  // touch
  $canvas[0].addEventListener('touchstart', onMouseDown, false);
  $canvas[0].addEventListener('touchend', onMouseUp, false);
  
});
