import { redirect } from "next/navigation";

export const metadata = { title: "GenPlay" };

export default function GenPlayPage() { redirect("/app/studio"); }
