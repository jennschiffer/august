/*
* august
* artist: jenn schiffer
*/

$(function() {

  /* var */

  var ctx, 
      historyPointer = 0,
      history = [];

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
  
  var resetCanvas = function() {
    ctx.clearRect(0, 0, $window.width(), $window.height());
    history = [];
    saveToLocalStorage();
  };

  var initpixel = function(size) {
    pixel.size = size;
  };

  var drawPixel = function(xPos, yPos, color, size, addToHistory) {
    
    // get color at this spot and compare to color
    var orig = ctx.getImageData(xPos, yPos, 1, 1).data;
    if ( orig[3] === 255) {
      return;
    }
    
    ctx.beginPath();
    xPos = ( Math.ceil(xPos/size) * size ) - size;
    yPos = ( Math.ceil(yPos/size) * size ) - size;
    ctx.moveTo (xPos, yPos);
    ctx.fillStyle = color;
    ctx.lineHeight = 0;

    
    ctx.fillRect(xPos,yPos,size,size);
    
    if ( addToHistory ) {
      history.push({
        xPos: xPos,
        yPos: yPos,
        color: color,
        size: size
      });
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
    historyPointer = 0;
    ctx.clearRect(0, 0, $window.width(), $window.height());
    
    var drawSlowly = function(){
      if ( !history[historyPointer] ) {
        return;
      }
      
      drawPixel(history[historyPointer].xPos, history[historyPointer].yPos, history[historyPointer].color, history[historyPointer].size, false);
      historyPointer++;
      
      if ( historyPointer == history.length) {
        clearInterval(interval);
      }
    };
    
    var interval = setInterval(drawSlowly, 60); 
  };



  /* drawing events */

  var onMouseDown = function(e) {
    e.preventDefault();
    
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
  
  
  
  /* key events */
  
  $body.keypress(function(e){
    
    switch (e.which) {
      case 114:
        // r
        resetCanvas();
        break;
      case 97:
        // a
        animateDrawing();
        break;
      default:
        console.log(e.which);
        break;
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
