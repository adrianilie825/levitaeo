import Link from "next/link";

export type EditorialBreadcrumbItem = {
  label: string;
  href?: string;
};

type EditorialBreadcrumbProps = {
  items: EditorialBreadcrumbItem[];
};

export default function EditorialBreadcrumb({
  items,
}: EditorialBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-neutral-400">
                &gt;
              </span>
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-[#111111]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[#111111]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
