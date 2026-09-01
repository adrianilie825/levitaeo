import { serializeJsonLd } from "@/lib/seo/json-ld-utils";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export default function JsonLd({ data }: JsonLdProps) {
  const json = serializeJsonLd(data);

  if (!json) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[JsonLd] Skipping malformed structured data payload.", data);
    }

    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
