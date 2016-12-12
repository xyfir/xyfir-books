export default function(input) {
    
    return input.replace(
        new RegExp("[^0-9a-zA-Z ]", "g"), ""
    ).replace(
        new RegExp(" ", "g"), "-"
    ).substr(0, 30);
    
}