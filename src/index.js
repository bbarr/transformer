
import { transform } from 'kourier-lang'
import createService from 'service-core'
import ks from 'kismatch'
import fs from 'fs'

const loadAdapter = id => {
  return fs.readFileSync(`${__dirname}/../adapters/${id}.kal`, 'utf-8')
}

const endpoints = [

  {

    pattern: {
      cmd: 'transform',
      from: ks.types.string,
      to: ks.types.string,
      data: ks.types.object,
      fromAdapter: ks.types.object,
      toAdapter: ks.types.object
    },
    
    action({ from, to, data, customFromAdapter, customToAdapter }) {

      try {
      const fromAdapter = customFromAdapter || loadAdapter(from)
      const toAdapter = customToAdapter || loadAdapter(to)
      
      const normalized = transform(fromAdapter, data, {
        dir: 'output'
      })

      //console.log('normalized', normalized)

      const transformed = transform(toAdapter, normalized, {
        dir: 'input'
      })

      //console.log('transformed', transformed)

      return transformed
      } catch(e) {
        console.log('e', e)
      }
    }
  }
]

export default (config) => {
  return createService(endpoints, config)
}
