/*
* august
* artist: jenn schiffer
*/

$(function() {

  /* var */

  var ctx, 
      historyPointer,
      undoRedoHistory = [];

  var $window = $(window),
      $body = $('body');

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

  var initpixel = function(size) {
    pixel.size = size;
  };

  var drawPixel = function(xPos, yPos, color, size) {
    ctx.beginPath();
    xPos = ( Math.ceil(xPos/size) * size ) - size;
    yPos = ( Math.ceil(yPos/size) * size ) - size;
    ctx.moveTo (xPos, yPos);
    ctx.fillStyle = color;
    ctx.lineHeight = 0;

    if ( color == 'rgba(0, 0, 0, 0)' ) {
      ctx.clearRect(xPos,yPos,size,size);
    }
    else {
      ctx.fillRect(xPos,yPos,size,size);
    }

  };

  var drawOnMove = function(e) {
    drawPixel(e.pageX, e.pageY, pixel.color, pixel.size);
  };

  var drawOnTouch = function(e) {
    for ( var i = 0; i < e.touches.length; i++ ) {
      drawOnMove(e.touches[i]);
    }
  };



  /* drawing events */

  var onMouseDown = function(e) {
    e.preventDefault();
    
    if ( e.which === 3 ) {
      return;
    }

    drawPixel(e.pageX, e.pageY, pixel.color, pixel.size);
    
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

        // save image
        saveToLocalStorage();

        $canvas
          .attr('width',newWidth)
          .attr('height',newHeight);
        console.log($canvas);
        // draw image
        drawFromLocalStorage();
      }

    }
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
      savedCanvas = $canvas[0].toDataURL('image/png');
      localStorage.august = savedCanvas;
    }
  };
  
  var drawFromLocalStorage = function() {
    var savedCanvas = localStorage.august;
    if ( savedCanvas ) {
      drawToCanvas(savedCanvas, 0, 0, true);
    }
  };


  /* init */
  generateCanvas();
  initpixel(15);

  historyPointer = -1;

  // mouse
  $canvas.mousedown(onMouseDown).mouseup(onMouseUp);
  $canvas.on('contextmenu', onRightClick);

  // touch
  $canvas[0].addEventListener('touchstart', onMouseDown, false);
  $canvas[0].addEventListener('touchend', onMouseUp, false);
  
});
