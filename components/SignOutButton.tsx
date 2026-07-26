export default function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="inline-flex items-center justify-center border border-[#111111] bg-transparent px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors duration-300 hover:bg-[#111111] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
      >
        Sign Out
      </button>
    </form>
  );
}
