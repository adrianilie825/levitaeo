import Navbar from "@/components/Navbar";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function NavbarWithAuth() {
  const user = await getAuthenticatedUser();

  return <Navbar isAuthenticated={Boolean(user)} />;
}
