import { redirect } from "next/navigation";

export default function Home() {
  redirect("/polls");
  return null; // This won't be rendered as redirect will take effect first
}
