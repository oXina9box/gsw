import { StudioNav } from "@/components/product/studio-nav";
import { getWorkspaceContext } from "@/lib/studio/workspace";

export default async function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { membership } = await getWorkspaceContext();
  const workspace = membership.workspaces as { name?: unknown } | null;
  const studioName = typeof workspace?.name === "string" ? workspace.name : "Gem Studio";
  return <><StudioNav studioName={studioName} orchestrationEnabled /><main>{children}</main></>;
}
