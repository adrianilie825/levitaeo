import Footer from "@/components/Footer";
import NavbarWithAuth from "@/components/NavbarWithAuth";

type BrandPageShellProps = {
  children: React.ReactNode;
};

export default function BrandPageShell({ children }: BrandPageShellProps) {
  return (
    <main className="bg-[#FAFAF8] text-[#111111]">
      <NavbarWithAuth />
      {children}
      <Footer />
    </main>
  );
}
