import { js as beautifyJs, css as beautifyCss } from 'js-beautify';

export function unminifyJs(input: string): string {
  return beautifyJs(input, {
    indent_size: 2,
    space_in_empty_paren: true
  });
}

export function unminifyCss(input: string): string {
  return beautifyCss(input, {
    indent_size: 2
  });
}
