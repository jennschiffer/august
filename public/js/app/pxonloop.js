/*
* pxonloop
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
      $inputExport = $('#export-pxon'),
      $pxonExportTextarea = $('#pxonExportTextarea'),
      $pxonImportTextarea = $('#pxonImportTextarea'),
      $pxonImportSubmit = $('#pxonImportSubmit'),
      $canvas,
      pxon;

  var windowCanvas = {
    height: $window.height(),
    width: $window.width(),
    background: '#fff'
  };

  var pixel = {
    color: 'rgba(0, 0, 0, 1)',
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

  var drawPixel = function(x, y, color, size, addToHistory) {    

    // get color at this spot and compare to color
    var orig = ctx.getImageData(x, y, 1, 1).data;

    if ( getRGBColor(orig) === color || !color && orig[3] === 0) {
      return;
    }
    
    if ( addToHistory ) {
      pxon.pxif.pixels.push({
        x: x,
        y: y,
        color: color,
        size: size,
        date: new Date()
      });
    }
    
    ctx.beginPath();
    x = ( Math.ceil(x/size) * size ) - size;
    y = ( Math.ceil(y/size) * size ) - size;
    ctx.moveTo (x, y);
    ctx.fillStyle = color;
    ctx.lineHeight = 0;
    
    if ( !color ) {
      ctx.clearRect(x, y, size, size);
    }
    else {
      ctx.fillRect(x, y, size, size);
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
      
      drawPixel(pxon.pxif.pixels[historyPointer].x, pxon.pxif.pixels[historyPointer].y, pxon.pxif.pixels[historyPointer].color, pxon.pxif.pixels[historyPointer].size, false);
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
    pxon.exif.dateTimeOriginal = ( pxon.exif.dateTimeOriginal ) ? pxon.exif.dateTimeOriginal : pxon.exif.dateTime;
    
    // pxif
    pxon.pxif.dataURL = $canvas[0].toDataURL('image/png');
    
    // add to textarea
    $pxonExportTextarea.removeClass('hidden').html(JSON.stringify(pxon))
  };
  
  var importPXON = function(data) {
    if (data) {
      pxon = JSON.parse(data.target.result);
            
      // prefill the export fields
      $('.exif.artist').val((pxon.exif.artist) ? pxon.exif.artist : '');
      $('.exif.imageDescription').val((pxon.exif.imageDescription) ? pxon.exif.imageDescription : '');
      $('.exif.userComment').val((pxon.exif.userComment) ? pxon.exif.userComment : '');
      $('.exif.copyright').val((pxon.exif.copyright) ? pxon.exif.copyright : '');
      
      $modals.addClass('hidden');
    }
  };
  
  var getFileData = function(file) {
    if ( window.FileReader ) {
      var fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = importPXON;
      fileReader.onerror = function() { alert('Unable to read file. Try again.'); };
    }
    else {
      alert('Your browser doesn\'t support FileReader, which is required for uploading custom palettes.');
    }
  };
  
  
  /* key and form events */
  
  $body.keyup(function(e){
    
    if ( !$('.modal.export').hasClass('hidden') ) {
      switch (e.keyCode) {
        case 27:
          $modals.addClass('hidden');
          break;
      }
      return;
    }
        
    switch (e.which) {
      case 68:
        // d - delete project
        pxon = {
          exif: {
            software: 'https://pxonloop.glitch.me'
          },
          pxif: {
            pixels: []
          }
        };
        $('.exif').val('');
        deleteCanvas();
        break;
      case 65:
        // a - play/pause animation
        toggleAnimation();
        break;
      case 83:
        // s - save png
        saveCanvas();
        break;
      case 69:
        // e - eraser tool
        pixel.color = null;
        break;
      case 80:
        // p - pen tool
        pixel.color = 'rgba(0, 0, 0, 1)';
        break;
      case 74:
        // j - export pxon
        $modals.addClass('hidden');
        $modalExport.removeClass('hidden');
        break;
      case 73:
        // i - import pxon
        $modals.addClass('hidden');
        $modalImport.removeClass('hidden');
        break;
      case 27:
        // esc
        $modals.addClass('hidden');
        break;
    }

  });
  
  $inputImport.change(function(e){
    var file = $(this).prop('files')[0];
    getFileData(file);
  });
  
  $pxonImportSubmit.click(function(e){
    var dataObject = {
      target: {
        result: $pxonImportTextarea.val()
      }
    };
    
    importPXON(dataObject);
  });
  
  $inputExport.click(function(e){
    $pxonExportTextarea.addClass('hidden');
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
      var localCanvas = $canvas[0].toDataURL('image/png');
      localStorage.pxonloop = localCanvas;
      localStorage.pxonloopHistory = JSON.stringify(pxon);
    }
  };
  
  var drawFromLocalStorage = function() {
    var localCanvas = localStorage.pxonloop;
    var localHistory = localStorage.pxonloopHistory;
    
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
