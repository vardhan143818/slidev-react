import 'plantuml-encoder/dist/plantuml-encoder.js'

interface PlantUmlEncoderGlobal {
  encode(source: string): string
}

declare global {
  interface Window {
    plantumlEncoder?: PlantUmlEncoderGlobal
  }
}

function getPlantUmlEncoder() {
  const encoder = globalThis.window?.plantumlEncoder

  if (!encoder) {
    throw new Error('PlantUML encoder failed to initialize in the browser runtime.')
  }

  return encoder
}

export function encodePlantUml(source: string) {
  return getPlantUmlEncoder().encode(source)
}
