
import km from 'kismatch'
import { validate } from 'kisschema'
import R from 'ramda'

const mapcat = R.pipe(R.map, R.flatten)

const api = {

  // initialize new set of endpoints, returns new process function
  createService: (endpoints, config) => {
    if (!endpoints || !endpoints.length) throw new Error('Must pass non-empty array of endpoints to createService')
    const service = { config, endpoints }
    return Object.assign({}, service, api, {
      process: api.process.bind(null, service) 
    })
  },

  // tries to evaluate payload
  process: async (service, payload) => {

    try {

      const match = api.match(service, payload)
      if (!match) return [ 404 ]

      const authErrors = await api.authorize(service, payload, match)
      if (authErrors) return [ 401, authErrors ]

      const inputErrors = api.validate(service, payload, match)
      if (inputErrors) return [ 400, inputErrors ]

      const result = await api.call(service, payload, match)

      return [ 200, result ]
    } catch(e) {

      return [ 500, e ]
    }
  },

  // applies matched endpoint's action
  call(service, payload, match) {
    return match.action(payload, service)
  },

  // validates payload against matched endpoint
  validate(service, payload, { validations }) {
    if (!validations) return null
    return validate(validations, payload)
  },

  // match endpoint
  match(service, payload) {
    let pairs = mapcat(end => [ end.pattern, () => end ], service.endpoints)
    let matcher = km(...pairs)
    return matcher(payload)
  },

  // allows some basic auth to be applied per endpoint
  // TODO make this configurable
  authorize: async (service, payload, { authorizations: authRules }) => {

    if (!authRules) return null
    if (!service.config.authorizations) return null

    const promises = Object.keys(authRules).map(authName => {
      const auth = service.config.authorizations[authName]
      if (!auth) return "Looking for auth that isn't configured"
      return auth(authRules[authName], payload, service)
    })

    return Promise.all(promises).then(results => {
      return R.find(result => null !== result, results)
    })
  }
}

export default api.createService
