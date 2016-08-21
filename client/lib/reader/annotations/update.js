// Modules
import request from "lib/request/index";

// Constants
import { LIB_ANN } from "constants/config";

export default function(sets, key, fn) {

    if (!sets || !sets.length || !key) {
        fn([]);
        return;
    }

    if (!navigator.onLine) {
        fn(sets);
        return;
    }

    // annotations.libyq.com/api/annotations?key=KEY&sets=SET|VERSION,...
    let url = LIB_ANN + "annotations?key=" + key + "&sets="
        + sets.map(set => set.id + "|" + set.version).join(",");

    request({url, success: (res) => {
        if (res.error) {
            swal("Error", "Could not update annotations", "error");
            fn([]);
        }
        else {
            // Check if new version has been received
            sets.forEach((set, i) => {
                if (res[set.id] && res[set.id].version != set.version) {
                    // Update version / items
                    Object.assign(sets[i], res[set.id]);
                }
            });

            // Parse item objects
            sets.forEach((set, si) => {
                set.items.forEach((item, ii) => {
                    if (typeof item.object == "string") {
                        sets[si].items[ii].object = JSON.parse(item.object);
                    }
                });
            });

            fn(sets);
        }
    }});

}