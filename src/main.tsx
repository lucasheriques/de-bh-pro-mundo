import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./theme.css";
import "./styles.css";
import "./stage/stage.css";
import "./phone/phone.css";
import { ConvexProvider } from "convex/react";
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { AdminPage } from "./admin/AdminPage";
import { CaptionsPage } from "./captions/CaptionsPage";
import { ContentPage } from "./content/ContentPage";
import { EditorPage } from "./editor/EditorPage";
import { startAudienceTheme } from "./live/audienceTheme";
import { convex } from "./live/env";
import { OverviewPage } from "./overview/OverviewPage";
import { PhonePage } from "./phone/PhonePage";
import { PresenterPage } from "./presenter/PresenterPage";
import { RemotePage } from "./remote/RemotePage";
import { StagePage } from "./stage/StagePage";
import { LiveSlides } from "./talk/LiveSlides";

const routes = {
  "/": PhonePage,
  "/stage": StagePage,
  "/presenter": PresenterPage,
  "/overview": OverviewPage,
  "/admin": AdminPage,
  "/legendas": CaptionsPage,
  "/conteudo": ContentPage,
  "/editor": EditorPage,
  "/remote": RemotePage,
  ...(import.meta.env.DEV ? { "/proto": lazy(() => import("./proto/ProtoPage")) } : {}),
} as const;
const path = window.location.pathname.replace(/\/+$/, "") || "/";

/** Stage and presenter keep their own T toggle; every other page is an audience page. */
if (path !== "/stage" && path !== "/presenter") startAudienceTheme();
const Page = routes[path as keyof typeof routes] ?? PhonePage;

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <LiveSlides
        render={() => (
          <Suspense>
            <Page />
          </Suspense>
        )}
      />
    </ConvexProvider>
  </StrictMode>,
);
