"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { channelViewHref, resolveChannelView, type ChannelPageId } from "@/lib/studio/channel-views";

export function useChannelView(page: Exclude<ChannelPageId, "dashboard">) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = resolveChannelView(page, searchParams.get("view"));

  const setActiveView = useCallback(
    (viewId: string) => {
      const href = channelViewHref(pathname, searchParams.toString(), viewId);
      if (href) router.push(href, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return { activeView: activeView?.id ?? "", setActiveView };
}
