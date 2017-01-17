export default function(el, fn) {
    
    // Required min distance traveled to be considered swipe
    const threshold   = 100;
    // Maximum time allowed to travel that distance
    const allowedTime = 350;
    // Maximum distance allowed at the same time in perpendicular direction
    const restraint   = 100;
  
    let startX, startY, startTime;

    el.addEventListener("touchstart", e => {
        startX = e.changedTouches[0].pageX;
        startY = e.changedTouches[0].pageY;
        startTime = Date.now();
    }, false);
  
    el.addEventListener("touchend", e => {
        // Get distance traveled by finger while in contact with surface
        const distX = e.changedTouches[0].pageX - startX;
        const distY = e.changedTouches[0].pageY - startY;
        
        // Time elapsed since touchstart
        const elapsedTime = Date.now() - startTime;
        
        if (elapsedTime <= allowedTime) {
            // Horizontal swipe
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint)
                // If dist traveled is negative, it indicates left swipe
                fn((distX < 0) ? "left" : "right");
            // Vertical swipe
            else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint)
                // If dist traveled is negative, it indicates up swipe
                fn((distY < 0) ? "up" : "down");
            // Tap
            else {
                epub.renderer.doc.defaultView.getSelection().removeAllRanges();

                epub.renderer.doc.documentElement.dispatchEvent(
                    new MouseEvent("click", {
                        clientX: startX, clientY: startY
                    })
                );
                
                e.preventDefault();
            }
        }
    }, false);

}