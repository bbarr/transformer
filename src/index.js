
import { transform } from 'kourier-lang'
import createService from 'service-core'
import ks from 'kismatch'
import fs from 'fs'

const pg = require('pg-promise')()
let db;

const endpoints = [

  {

    pattern: {
      cmd: 'transform',
      from: ks.types.string,
      to: ks.types.string,
      data: ks.types.object
    },
    
    action: async ({ from, to, data }, { dbUrl }) => {

      const [ fromAdapter, toAdapter ] = await Promise.all([
        db.query(`SELECT text FROM adapters WHERE id='${from}'`),
        db.query(`SELECT text FROM adapters WHERE id='${to}'`)
      ])

      const normalized = transform(fromAdapter, data, { dir: 'output' })
      console.log('normalized', normalized)

      const transformed = transform(toAdapter, normalized, { dir: 'input' })
      console.log('transformed', transformed)

      return transformed
    }
  }
]

export default config => {
  db = pg(config.dbUrl)
  return createService(endpoints, config)
}

