export default function(width, height, flag) {
    
    const book = this; // For readability (EPUBJS.Book)
	const defered = new RSVP.defer();

    const lfKey = "pagination-"
        + this.settings.bookKey + "-"
        + (width || window.innerWidth) + "-"
        + (height || window.innerHeight);

    const setPageList = (pageList) => {
        book.pageList = book.contents.pageList = pageList;
        book.pagination.process(pageList);
        book.ready.pageList.resolve(book.pageList);

        defered.resolve(book.pageList);

        localforage.setItem(lfKey, pageList);
    };

    const generatePageList = () => {
        book.ready.spine.promise.then(() => {
            book.generatePageList(width, height, flag)
            .then(setPageList, (reason) => {
                defered.reject(reason);
            });
        });
    };

    // Get page list from local storage if already generated
    // for book and window size
    localforage.getItem(lfKey).then((pageList) => {
        if (!pageList)
            generatePageList()
        else
            setPageList(pageList);
    }).catch(() => generatePageList());

	return defered.promise;

}