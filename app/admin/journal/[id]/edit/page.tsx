import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JournalPostForm from "@/components/admin/JournalPostForm";
import { getAdminJournalPostById } from "@/lib/admin/journal";
import { journalPostRowToFormValues } from "@/lib/admin/journal-form-defaults";

export const metadata: Metadata = {
  title: "Edit Journal Post",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditJournalPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getAdminJournalPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
        Editorial
      </p>
      <h1 className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
        Edit post
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600">
        Update {post.title}. Slug changes affect the public article URL.
      </p>

      <div className="mt-10">
        <JournalPostForm
          mode="edit"
          postId={post.id}
          initialValues={journalPostRowToFormValues(post)}
        />
      </div>
    </div>
  );
}
