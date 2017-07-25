const request = require('superagent');
const mysql = require('lib/mysql');
const path = require('path');
const fs = require('fs');

const config = require('config');

/*
  POST api/books/email-upload
  REQUIRED
    sender: string, attachments: json-string
  RETURNS
    HTTP STATUS - 200: Success, 406: Error
  DESCRIPTION
    Update book's word count
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();

    const sql = `
      SELECT library_id FROM users WHERE email = ?
    `,
    vars = [
      req.body.sender
    ],
    rows = await db.query(sql, vars);

    db.release();

    if (!rows.length) throw 'No user exists with email';

    const files = JSON.parse(req.body.attachments);

    if (!Array.isArray(files)) throw 'No files uploaded';

    for (let file of files) {
      const fpath = path.resolve(
        __dirname, '../../../uploads/', Date.now() + ' - ' + file.name
      );

      try {
        // Download attachment
        const dl = await request
          .get(`https://api:${config.keys.mailgun}@${file.url.substr(8)}`)
          .buffer(true)
          .parse(request.parse['application/octet-stream']);

        // Write to file so path can be passed to superagent
        await (new Promise((resolve, reject) =>
          fs.writeFile(
            fpath, dl.body, err => err ? reject(err) : resolve()
          )
        ));

        // Upload file to xyLibrary
        await request
          .post(
            config.addresses.library + 'libraries/' +
            rows[0].library_id + '/books'
          )
          .attach('book', fpath);
      }
      catch (err) { }

      // Delete downloaded file
      await (new Promise( r => fs.unlink(fpath, () => r()) ));
    }

    res.status(200).send();
  }
  catch (err) {
    db.release();
    res.status(406).send();
  }
  
};