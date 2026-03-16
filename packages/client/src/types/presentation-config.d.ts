declare module 'virtual:slidev-react/presentation-config' {
  export interface SlidevReactPresentationConfig {
    relay: {
      enabledByDefault: boolean
      url: string | null
      port: number
      path: string
    }
  }

  const presentationConfig: SlidevReactPresentationConfig

  export default presentationConfig
}
