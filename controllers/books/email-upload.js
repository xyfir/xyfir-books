const request = require('superagent');
const config = require('config');
const MySQL = require('lib/mysql');

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

  const db = new MySQL;

  try {
    await db.getConnection();
    const rows = await db.query(
      'SELECT library_id FROM users WHERE email = ?',
      [req.body.sender]
    );
    db.release();

    if (!rows.length) throw 'No user exists with email';

    const library = rows[0].library_id;
    const files = JSON.parse(req.body.attachments);

    if (!Array.isArray(files)) throw 'No files uploaded';

    for (let file of files) {
      try {
        // Download attachment
        const dl = await request
          .get(`https://api:${config.keys.mailgun}@${file.url.substr(8)}`)
          .buffer(true)
          .parse(request.parse['application/octet-stream']);

        // Upload file to xyLibrary
        await request
          .post(`${config.addresses.library}libraries/${library}/books`)
          .attach('book', dl.body, file.name);
      }
      catch (err) {}
    }

    res.status(200).send();
  }
  catch (err) {
    db.release();
    res.status(406).send();
  }

};