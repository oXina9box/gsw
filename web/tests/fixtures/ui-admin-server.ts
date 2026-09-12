// Local browser fixture: mounts the real StudioShell/channel clients without auth or Supabase.
import { createServer, type ViteDevServer } from "vite";
import path from "node:path";

const channel = { id: "channel-1", name: "Nebula Noir", status: "active", is_brand: false } as const;
const secondChannel = { id: "channel-2", name: "Orbit Kids", status: "draft", is_brand: false } as const;

export async function startUiAdminFixture(): Promise<{ server: ViteDevServer; url: string }> {
  const navigation = `import {useSyncExternalStore} from 'react';
    const listen=(cb)=>{window.addEventListener('popstate',cb);return()=>window.removeEventListener('popstate',cb)};
    const snapshot=()=>window.location.search;
    export function useSearchParams(){return new URLSearchParams(useSyncExternalStore(listen,snapshot,snapshot))}
    export function usePathname(){return window.location.pathname}
    export function useRouter(){return {replace:(url)=>{history.replaceState(null,'',url);window.dispatchEvent(new PopStateEvent('popstate'))},push:(url)=>{history.pushState(null,'',url);window.dispatchEvent(new PopStateEvent('popstate'))},refresh:()=>window.dispatchEvent(new Event('fixture-refresh'))}};`;
  const link = `import{createElement}from'react';export default function Link({children,...props}){return createElement('a',props,children)}`;
  const image = `import{createElement}from'react';export default function Image({priority,...props}){return createElement('img',props)}`;
  const actions = `export async function updateChannel(){return {ok:true}} export async function saveChannelMarketingBudget(){return {ok:true}} export async function setChannelStaffAction(){return {ok:true}} export async function markNotificationsReadAction(){return {ok:true}}`;
  const auth = `export function createClient(){return {auth:{signOut:async()=>({error:null})}}}`;
  const server = await createServer({
    configFile: false, root: path.resolve(process.cwd()), logLevel: "error",
    define: { "process.env": "{}" },
    resolve: { alias: { "@": path.resolve(process.cwd()) } },
    server: { host: "127.0.0.1", port: 0 },
    plugins: [{
      name: "ui-admin-local-fixture", enforce: "pre",
      resolveId(source) {
        if (source === "next/navigation") return "\0ui-navigation";
        if (source === "next/link") return "\0ui-link";
        if (source === "next/image") return "\0ui-image";
        if (source.endsWith("/(product)/actions")) return "\0ui-actions";
        if (source.endsWith("/lib/supabase/browser")) return "\0ui-auth";
        if (source.endsWith("/marketing/entry-actions")) return "\0ui-entry";
      },
      load(source) {
        if (source === "\0ui-navigation") return navigation;
        if (source === "\0ui-link") return link;
        if (source === "\0ui-image") return image;
        if (source === "\0ui-actions") return actions;
        if (source === "\0ui-auth") return auth;
        if (source === "\0ui-entry") return `import{createElement}from'react';export function EntryActions(){return createElement('a',{href:'/?auth=signup',className:'button button-primary'},'Create your Studio')}`;
      },
      configureServer(vite) {
        vite.middlewares.use((request, response, next) => {
          const route = request.url?.split("?")[0] ?? "/";
          if (route === "/public-review" || route === "/ui-admin-fixture" || route.startsWith("/app/channels/")) {
            response.setHeader("Content-Type", "text/html");
            void vite.transformIndexHtml(request.url!, '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/tests/fixtures/ui-admin-browser.tsx"></script></body></html>').then((html) => response.end(html));
          } else next();
        });
      },
    }],
  });
  await server.listen();
  return { server, url: `${server.resolvedUrls!.local[0].replace(/\/$/, "")}/app/channels/channel-1` };
}

export { channel, secondChannel };
