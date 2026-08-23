import { redirect } from "next/navigation";

export const metadata = { title: "DNA records" };

export default function DnaPage() { redirect("/app/universe"); }
