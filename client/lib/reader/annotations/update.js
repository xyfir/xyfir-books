// Modules
import request from "lib/request/index";

// Constants
import { XYFIR_ANNOTATIONS } from "constants/config";

export default function(sets, key, fn) {

    if (!sets || !sets.length || !key) {
        fn([]);
        return;
    }

    if (!navigator.onLine) {
        fn(sets);
        return;
    }

    // annotations.xyfir.com/api/annotations?key=KEY&sets=SET|VERSION,...
    let url = XYFIR_ANNOTATIONS + "annotations?key=" + key + "&sets="
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

            fn(sets);
        }
    }});

}