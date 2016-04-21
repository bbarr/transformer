
import 'babel-polyfill'
import assert from 'assert'
import sinon from 'sinon'
import km from 'kismatch'

import createService from '../build/index'

describe('api', () => {

  describe('createService()', () => {

    it ('should return new service with process() function', () => {
      assert(createService([{}]).process)
    })
  })

  describe('process()', () => {

  })

  describe('call()', () => {

    it ("should invoke matched endpoint's action()", () => {

      const spy = sinon.spy()
      const endpoint = { action: spy }
      const service = createService([ endpoint ])

      service.call(null, null, endpoint)

      assert(spy.called)
    })

    it ('should pass along payload and all other endpoints', () => {

      const spy = sinon.spy()
      const endpoint = { action: spy }
      const service = createService([ endpoint ])

      const a = []
      const b = {}
      service.call(a, b, endpoint)

      assert(spy.calledWith(b, a))
    })
  })

  describe('validate()', () => {

    it ('should pass for good input', () => {

      const endpoint = { validations: { a: km.types.string } }
      const service = createService([ endpoint ])
      assert.equal(
        null, 
        service.validate([], { a: 'foo' }, endpoint)
      ) 
    })

    it ('should fail for bad input', () => {

      const endpoint = { validations: { a: km.types.string } }
      const service = createService([ endpoint ])
      assert.notEqual(
        null, 
        service.validate([], { a: [] }, endpoint)
      ) 
    })
  })

  describe('authorize()', () => {

    it ('should pass for authorized requests', (cb) => {
      
      const endpoint = { authorizations: { userNameMustBe: 'bbarr' } }
      const service = createService([ endpoint ], {
        authorizations: {
          userNameMustBe: (requirement, payload) => {
            return payload.userName === 'bbarr' ? null : 'uh oh'
          }
        }
      })

      service
        .authorize(service, { userName: 'bbarr' }, endpoint)
        .then(result => assert.equal(null, result))
        .then(cb, cb)
    })

    it ('should fail for unauthorized requests', (cb) => {
      
      const endpoint = { authorizations: { userNameMustNotBe: 'bbarr' } }
      const service = createService([ endpoint ], {
        authorizations: {
          userNameMustNotBe: (requirement, payload) => {
            return (payload.userName !== requirement) ? null : 'uh oh'
          }
        }
      })

      service
        .authorize(service, { userName: 'bbarr' }, endpoint)
        .then(result => assert.notEqual(null, result))
        .then(cb, cb)
    })
  })

  describe('match()', () => {

    it ('should find match for good input', () => {

      const endpoint = { pattern: { a: km.types.string } }
      const service = createService([ endpoint ])
      assert.equal(
        endpoint, 
        service.match(service, { a: 'foo' })
      ) 
    })

    it ('should not find match for bad input', () => {

      const endpoint = { pattern: { a: km.types.string } }
      const service = createService([ endpoint ])
      assert.notEqual(
        endpoint,
        service.match(service, { a: [] })
      ) 
    })
  })

  describe('process()', () => {

    it ('should return [ 404 ] if no match found', async () => {
      const endpoint = { pattern: { a: 'foo' } }
      const service = createService([ endpoint ])

      assert.deepEqual([ 404 ], await service.process({ a: 'bar' }))
    })

    it ('should return a 401 and error message if there are auth errors', async () => {

      const error = 'i dont know you'
      const endpoint = { authorizations: { be: 'brendan' }, pattern: { a: 'foo' } }
      const service = createService([ endpoint ], {
        authorizations: {
          be: (requirement, payload) => {
            return requirement === payload.user ? null : error
          }
        }
      })

      assert.deepEqual(
        [ 401, error ], 
        await service.process({ a: 'foo' })
      )
    })

    it ('should return a 400 if there are validation errors on payload', async () => {
      
      const endpoint = { pattern: { foo: 'bar' }, validations: { x: km.types.number } }
      const service = createService([ endpoint ])

      assert.deepEqual(
        [ 400, { x: 'x should be of type: number' } ],
        await service.process({ foo: 'bar', x: [] })
      )
    })

    it ('should return a 200 if all works correctly', async () => {

      const response = "Hello World!"
      const spy = sinon.spy()
      const endpoint = { 
        action: () => {
          spy()
          return response
        }, 
        pattern: { foo: 'bar' }, 
        validations: { x: km.types.number },
        authorizations: { loggedIn: true }
      }
      const service = createService([ endpoint ], {
        authorizations: {
          loggedIn: (requirement, payload) => {
            return (requirement === !!payload.user) ? null : 'Must be logged in'
          }
        }
      })

      assert.deepEqual(
        [ 200, response ],
        await service.process({ foo: 'bar', x: 2, user: {} })
      )
    })

    it ('should return 500 if anythign blows up', async () => {

      const endpoint = { pattern: { a: 1 }, action: () => x + y.zz.toString() }
      const service = createService([ endpoint ])

      assert.equal(
        500,
        (await service.process({ a: 1 }))[0]
      )
    })
  })
})
