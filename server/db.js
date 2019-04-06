// main db entry
const pgp = require('pg-promise')()

const db = pgp(`postgres://${ process.env.NETSEC_WEB_DB_USER }:${ process.env.NETSEC_WEB_DB_PASS }@localhost:5432/netsec`)

module.exports = db
