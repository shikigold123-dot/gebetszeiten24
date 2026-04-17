/**
 * Single sanctioned renderer for JSON-LD structured data.
 *
 * Passes JSON as React children to the <script> element. React will
 * text-escape the content (&, <, >) which is safe for JSON-LD because
 * search engines parse the unescaped raw form from the DOM.
 *
 * We additionally escape `<` to `\u003c` inside the JSON itself as a
 * defense-in-depth so that even tools that unescape HTML entities cannot
 * find a closing `</script>` sequence.
 */
export function JsonLd({ data }: { data: unknown }) {
  const serialized = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json">{serialized}</script>;
}
