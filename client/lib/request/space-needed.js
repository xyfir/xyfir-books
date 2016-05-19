// Modules
import request from "./index";

// Constants
import { URL } from "../../constants/config";

// Action creators
import { setLibraryAddress } from "../../actions/creators/account";

export default function (bytes, dispatch, fn) {
    
    ajax({
        url: URL + "api/library-manager/space",
        method: "PUT", data: {bytes},
        success: (res) => {
            if (res.error) {
                fn(true);
            }
            else if (res.libraryServerAddress !== undefined) {
                // Update state.account.library.address
                dispatch(setLibraryAddress(res.libraryServerAddress));
                
                fn(false, res.libraryServerAddress);
            }
            else {
                fn(false);
            }
        }
    });
    
}