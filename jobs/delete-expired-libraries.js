const request = require("request");
const db = require("../lib/db");

/*
    Delete libraries over a week expired
*/
module.exports = function(fn) {

    db(cn => {
        let sql = `
            SELECT user_id, library_id, library_server_id FROM users
            WHERE UNIX_TIMESTAMP() > subscription + (7 * 86400000)
        `;
        
        cn.query(sql, (err, rows) => {
            if (err) {
                cn.release();
                fn(true);
            }
            else if (!rows.length) {
                cn.release();
                fn(false);
            }
            else {
                let update = {
                    // Servers to update free space / library count
                    servers: {/* id: { freeSpace: number, libDecrement: number } */},
                    // User ids of users whose libraries were deleted
                    users: []
                };
                
                let vars = [];
                
                // Update Libyq database to reflect changes on library-manager servers
                const updateDatabase = (index) => {
                    const id = Object.keys(update.servers)[index];
                    
                    // All servers finished
                    if (id === undefined) {
                        // Wipe library_server_id and library_id in users
                        sql = "UPDATE users SET library_server_id = 0, library_id = '' WHERE user_id IN (?)";
                        
                        cn.query(sql, [update.users], (err, result) => {
                            // Delete books from users who had libraries wiped
                            sql = "DELETE FROM books WHERE user_id IN (?)"
                            
                            cn.query(sql, [update.users], (err, result) => {
                                cn.release();
                                fn(false);
                            });
                        });
                    }
                    else {
                        // Update space_free and library_count for server
                        sql = `
                            UPDATE servers SET space_free = ?, library_count = library_count - ?
                            WHERE server_id = ?
                        `;
                        vars = [
                            update.servers[id].freeSpace, update.servers[id].libDecrement,
                            id
                        ];
                        
                        cn.query(sql, vars, (err, result) => {
                            updateDatabase(index + 1);
                        });
                    }
                };
                
                // Delete libraries from library-manager servers
                const deleteLibrary = (servers, index) => {
                    // All libraries finished
                    if (rows[index] === undefined) {
                        updateDatabase(0);
                    }
                    // Attempt to delete library at rows[index]
                    else {
                        const url = servers.find(s => {
                            return s.server_id == rows[index].library_server_id
                        }).address + "library/" + rows[index].library_id;
                        
                        request.del(url, (err, response, body) => {
                            if (err) {
                                cn.release();
                                fn(true);
                            }
                            else {
                                body = JSON.parse(body);
                                
                                if (body.error) {
                                    deleteLibrary(servers, index + 1);
                                }
                                // Update data in update.servers[id]
                                else if (update.servers[rows[index].library_server_id]) {
                                    update.servers[rows[index].library_server_id]
                                        .freeSpace = body.freeSpace;
                                    update.servers[rows[index].library_server_id]
                                        .libDecrement++;
                                    update.users.push(rows[index].user_id);
                                    
                                    deleteLibrary(servers, index + 1);
                                }
                                // Add data to update.servers[id]
                                else {
                                    update.servers[rows[index].library_server_id] = {
                                        freeSpace: body.freeSpace, libDecrement: 1
                                    };
                                    update.users.push(rows[index].user_id);
                                    
                                    deleteLibrary(servers, index + 1);
                                }
                            }
                        });
                    }
                };
                
                // Get addresses of servers that contain libraries to be deleted
                sql = "SELECT server_id, address FROM servers WHERE server_id IN (?)";
                vars = [rows.map(r => r.library_server_id)];
                
                cn.query(sql, vars, (err, rows2) => {
                    deleteLibrary(rows2, 0);
                });
            }
        });
    });

};