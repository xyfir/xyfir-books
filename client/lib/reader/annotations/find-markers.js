export default function (annotations) {
    
    let markers = {/*
        "set_id-item_id-search_index-type": {
            chapter: number, index: number
        }
    */};

    // Grab book files
    const files = epub.zip.zip.files;
    const zip = new JSZip();

    // Loop through all files in book
    Object.keys(files).forEach((file, chapter) => {
        if (file.split('.')[1] != "html") return;
        
        // Convert file content into html string
        file = zip.utf8decode(files[file]._data.getContent());

        // Loop through all annotation sets
        annotations.forEach(set => {
            // Loop through all items in annotation set
            set.items.forEach(item => {
                // Loop through all search queries in item
                item.searches.forEach((search, searchIndex) => {
                    // If search query is global, it doesn't have a before or after range
                    if (!search.range.global) {
                        if (search.range.before) {
                            const index = file.indexOf(f.range.before);

                            if (index > -1) {
                                markers[`${set.id}-${item.id}-${searchIndex}-1`] = {
                                    chapter, index
                                };
                            };
                        }
                        
                        if (search.range.after) {
                            const index = file.indexOf(search.range.after);

                            if (index > -1) {
                                markers[`${set.id}-${item.id}-${searchIndex}-2`] = {
                                    chapter, index
                                };
                            };
                        }
                    }
                });
            });
        });
    });

    return markers;

}