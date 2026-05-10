// Tiny JSON-LD <script> wrapper. Renders structured data that search
// engines parse to populate rich snippets (Organization name, product
// offers, etc.). Safe for both server and client components.
//
// We use dangerouslySetInnerHTML because <script type="application/ld+json">
// must contain literal JSON — JSX text-content escaping would mangle it.

export default function StructuredData({ data }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
