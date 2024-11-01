// src/types/gray-matter.d.ts
declare module 'gray-matter' {
  interface GrayMatterFile<I extends string | Buffer> {
    data: { [key: string]: any };
    content: string;
    excerpt?: string;
    orig: I;
  }

  interface Options {
    excerpt?: boolean;
    excerpt_separator?: string;
  }

  function matter(
    input: string | Buffer,
    options?: Options
  ): GrayMatterFile<string | Buffer>;

  export default matter;
}