import manifestJson from '../../../manifest.json'
import { describe, expect, it } from 'vite-plus/test'
import { clientRuntimeManifest } from '../manifest'

describe('client runtime manifest', () => {
  it('keeps the published JSON manifest aligned with the typed runtime contract', () => {
    expect(manifestJson).toEqual(clientRuntimeManifest)
  })
})
