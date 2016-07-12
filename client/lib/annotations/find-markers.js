export default function (annotations) {
    
    let markers = {/*
        "set_id-item_id-find_index-type": {
            chapter: number, index: number
        }
    */};

    // Grab book files
    const files = epub.zip.zip.files;
    const zip = new JSZip();

    // Loop through all files in book
    Object.keys(files).forEach((file, chapter) => {
        // Convert file content into html string
        file = zip.utf8decode(files[file]._data.getContent());

        // Loop through all annotation sets
        annotations.forEach(set => {
            // Loop through all items in annotation set
            set.items.forEach(item => {
                // Loop through all find queries in item
                item.object.find((find, findIndex) => {
                    // If find query is global, it doesn't have a before or after range
                    if (!find.range.global) {
                        if (find.range.before) {
                            const index = file.indexOf(f.range.before);

                            if (index > -1) {
                                markers[`${set.id}-${item.id}-${findIndex}-1`] = {
                                    chapter, index
                                };
                            };
                        }
                        
                        if (find.range.after) {
                            const index = file.indexOf(f.range.after);

                            if (index > -1) {
                                markers[`${set.id}-${item.id}-${findIndex}-2`] = {
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