import generatePagination from "./book/generate-pagination";

export default function() {

    EPUBJS.Book.prototype.generatePagination
        = generatePagination;

}