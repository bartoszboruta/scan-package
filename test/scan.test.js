'use strict'

var expect = require('chai').expect
import scanner from '../src'

describe('Scanner', done => {
  it('should return error', () => {
    scanner('21', '2131', undefined, undefined)
      .then(url => {
        expect(result).to.equal('1')
      })
      .catch(error => {
        expect(error).to.equal('1')
      })
      .finally(done)
  })
})
