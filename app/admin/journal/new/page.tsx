import type { Metadata } from "next";
import JournalPostForm from "@/components/admin/JournalPostForm";
import { emptyJournalPostFormValues } from "@/lib/admin/journal-form-defaults";

export const metadata: Metadata = {
  title: "New Journal Post",
};

export default function AdminNewJournalPostPage() {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
        Editorial
      </p>
      <h1 className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
        New post
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600">
        Create a Journal entry. Draft posts remain hidden from the public site
        until published.
      </p>

      <div className="mt-10">
        <JournalPostForm
          mode="create"
          initialValues={emptyJournalPostFormValues()}
        />
      </div>
    </div>
  );
}
