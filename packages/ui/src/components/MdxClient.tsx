'use client';

/**
 * Client-side renderer for MDX compiled with `next-mdx-remote/serialize`.
 *
 * Adapted from next-mdx-remote v5 `MDXRemote` (Copyright (c) HashiCorp, Inc.,
 * MPL-2.0, https://github.com/hashicorp/next-mdx-remote).
 *
 * Why this exists: next-mdx-remote v5 is an ESM-only package. Importing its
 * client entry (`next-mdx-remote`) from a client component breaks Next 14's
 * SSR client-reference resolution, so every page whose client bundle includes
 * it prerenders with "Element type is invalid ... got: undefined" and ships
 * an empty <body> in the static export. This local component has the same
 * rendering semantics but only imports `@mdx-js/react` and React's JSX
 * runtimes, which bundle correctly. The `lazy` prop of the upstream component
 * is intentionally not supported – articles must render during static
 * generation.
 */

import { useMemo } from 'react';
import type { ComponentProps, ElementType } from 'react';
import * as mdx from '@mdx-js/react';
import * as jsxRuntime from 'react/jsx-runtime';
import * as jsxDevRuntime from 'react/jsx-dev-runtime';

type MdxProviderComponents = ComponentProps<typeof mdx.MDXProvider>['components'];

export interface MdxClientProps {
  /** `compiledSource` from a `next-mdx-remote/serialize` result. */
  compiledSource: string;
  /** Front matter parsed during serialisation, exposed to the MDX scope. */
  frontmatter?: Record<string, unknown>;
  /** Arbitrary data passed via the `scope` option of `serialize`. */
  scope?: Record<string, unknown>;
  /** Custom components available to the MDX content. */
  components?: MdxProviderComponents;
}

export function MdxClient({ compiledSource, frontmatter, scope, components = {} }: MdxClientProps) {
  const Content: ElementType = useMemo(() => {
    // `serialize` compiles with the automatic JSX runtime; sources compiled in
    // development mode call jsxDEV, production sources call jsx/jsxs. Pick the
    // matching runtime by inspecting the compiled output.
    const runtime = compiledSource.includes('jsxDEV') ? jsxDevRuntime : jsxRuntime;
    const fullScope = Object.assign({ opts: { ...mdx, ...runtime } }, { frontmatter }, scope);
    const keys = Object.keys(fullScope);
    const values = Object.values(fullScope);

    // The compiled source is a function body expecting the scope entries as
    // arguments; executing it returns the MDX module, whose default export is
    // the content component.
    const hydrateFn = Reflect.construct(Function, keys.concat(`${compiledSource}`));
    return hydrateFn.apply(hydrateFn, values).default;
  }, [scope, compiledSource, frontmatter]);

  return (
    <mdx.MDXProvider components={components}>
      <Content />
    </mdx.MDXProvider>
  );
}
