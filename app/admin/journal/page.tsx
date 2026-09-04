import type { Metadata } from "next";
import Link from "next/link";
import { listAdminJournalPosts } from "@/lib/admin/journal";
import { journalStatusLabel } from "@/lib/admin/journal-constants";

export const metadata: Metadata = {
  title: "Journal",
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminJournalPage() {
  const posts = await listAdminJournalPosts();

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">
            Journal
          </p>
          <h1 className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl">
            Journal
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-neutral-600">
            Manage editorial posts.
          </p>
        </div>

        <Link
          href="/admin/journal/new"
          className="inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111]"
        >
          New post
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto border border-[#ECE8E2] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#ECE8E2] text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            <tr>
              <th className="px-4 py-4 font-normal">Title</th>
              <th className="px-4 py-4 font-normal">Status</th>
              <th className="px-4 py-4 font-normal">Category</th>
              <th className="px-4 py-4 font-normal">Published</th>
              <th className="px-4 py-4 font-normal">Updated</th>
              <th className="px-4 py-4 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-[#ECE8E2] last:border-b-0"
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-[#111111]">{post.title}</p>
                  <p className="mt-1 font-mono text-xs text-neutral-500">
                    {post.slug}
                  </p>
                </td>
                <td className="px-4 py-4 text-neutral-600">
                  {journalStatusLabel(post.status)}
                </td>
                <td className="px-4 py-4 text-neutral-600">
                  {post.category.trim() || "—"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-neutral-600">
                  {formatDate(post.published_at)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-neutral-600">
                  {formatDate(post.updated_at)}
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/journal/${post.id}/edit`}
                    className="text-[11px] uppercase tracking-[0.18em] text-neutral-600 transition-colors hover:text-[#111111]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-[15px] text-neutral-600">No journal posts yet.</p>
            <p className="mt-2 text-[14px] leading-7 text-neutral-500">
              Create the first editorial post for Levitaeo.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
