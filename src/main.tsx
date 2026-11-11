import "@fontsource/open-runde/400.css";
import "@fontsource/open-runde/500.css";
import "@fontsource/open-runde/600.css";
import "@fontsource/open-runde/700.css";
import "./theme.css";
import "./styles.css";
import "./stage/stage.css";
import "./phone/phone.css";
import { ConvexProvider } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AdminPage } from "./admin/AdminPage";
import { CaptionsPage } from "./captions/CaptionsPage";
import { ContentPage } from "./content/ContentPage";
import { EditorPage } from "./editor/EditorPage";
import { convex } from "./live/env";
import { OverviewPage } from "./overview/OverviewPage";
import { PhonePage } from "./phone/PhonePage";
import { PresenterPage } from "./presenter/PresenterPage";
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
} as const;
const path = window.location.pathname.replace(/\/+$/, "") || "/";
const Page = routes[path as keyof typeof routes] ?? PhonePage;

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <LiveSlides render={() => <Page />} />
    </ConvexProvider>
  </StrictMode>,
);
