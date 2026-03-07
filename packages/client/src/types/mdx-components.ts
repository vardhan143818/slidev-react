import { MDXProvider } from '@mdx-js/react'
import type { ComponentProps } from 'react'

type MDXProviderComponents = ComponentProps<typeof MDXProvider>['components']
type MDXMergeComponents = Extract<MDXProviderComponents, (...args: never[]) => unknown>

export type MDXComponents = Exclude<MDXProviderComponents, MDXMergeComponents | null | undefined>
