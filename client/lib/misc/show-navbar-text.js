function isNavbarOverflowed() {
    if (sessionStorage.navbarOverflow == 1) return true;

    const el = document.querySelector("nav.navbar");

    if (el === null) return false;
    
    const isOverflowed =
        el.clientWidth < el.scrollWidth
        || el.clientHeight < el.scrollHeight;
    
    if (isOverflowed && !sessionStorage.navbarOverflow)
        sessionStorage.navbarOverflow = 1;
    
    return isOverflowed;
}

export default function() {

    if (window.innerHeight > window.innerWidth)
        return false;
    else
        return !isNavbarOverflowed();

}