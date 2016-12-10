export default function(el, fn) {

    el.addEventListener("click", event => {
        // User selected text
        if (!!epub.renderer.selectedRange.toString()) {
            return;
        }
        else {
            // Get book iframe window's size
            const wX = epub.renderer.doc.defaultView.innerWidth
                , wY = epub.renderer.doc.defaultView.innerHeight;
            
            // Get click location
            const cX = event.clientX
                , cY = event.clientY;
            
            // Click was in left 10% of page
            if (cX < wX * 0.10)
                fn("previous page");
            // Click was in right 10% of page
            else if (cX > wX - (wX * 0.10))
                fn("next page");
            // Click was in top 5% of page
            else if (cY < wY * 0.05)
                fn("show book info");
            // Click was in bottom 5% of page
            else if (cY > wY - (wY * 0.05))
                fn("cycle highlights");
            // Click was somewhere in middle
            else
                fn("toggle navbar");
        }
    }, false);

}