import { App } from "@nonla-agents/ui";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DOCS, type DocRecord } from "./catalog";
import "./index.css";
import { DocArticle } from "./layout/DocArticle";
import { DocsLayout } from "./layout/DocsLayout";
import { MarkdownDoc } from "./MarkdownDoc";
import { migrateLegacyLocation, resolveLegacyPath } from "./nav";
import { InputWhitePage } from "./pages/preview/InputWhitePage";
import { SortableTreePage } from "./pages/preview/SortableTreePage";

/**
 * Local scratch pages: `pages/preview/drafts/<Name>Page.tsx` is served at `/preview/<name>`.
 * The folder is git-ignored, so a fresh clone (and CI) simply has none.
 */
const drafts = Object.entries(import.meta.glob<Record<string, ComponentType>>("./pages/preview/drafts/*.tsx", { eager: true })).flatMap(([file, mod]) => {
  const name = file.match(/\/(\w+?)Page\.tsx$/)?.[1];
  const Page = name ? mod[`${name}Page`] : undefined;
  return name && Page ? [{ path: `preview/${name.replace(/[A-Z]/g, (c, i) => (i ? "-" : "") + c.toLowerCase())}`, Page }] : [];
});

migrateLegacyLocation();

function LegacyRedirect() {
  const { pathname } = useLocation();
  const next = resolveLegacyPath(pathname);
  return <Navigate to={next ?? "/introduction"} replace />;
}

function DocsPrefixRedirect() {
  const { pathname, search } = useLocation();
  const rest = pathname.replace(/^\/docs\/?/, "");
  return <Navigate to={`${rest ? `/${rest}` : "/introduction"}${search}`} replace />;
}

function DocRoute({ doc }: { doc: DocRecord }) {
  return (
    <DocArticle title={doc.title} flush={doc.flush} wide={doc.wide} className={doc.className}>
      <MarkdownDoc value={doc.body} />
    </DocArticle>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="preview/input" element={<InputWhitePage />} />
      {drafts.map(({ path, Page }) => (
        <Route key={path} path={path} element={<Page />} />
      ))}
      <Route path="preview/sortable-tree" element={<SortableTreePage />} />
      <Route path="docs" element={<Navigate to="/introduction" replace />} />
      <Route path="docs/*" element={<DocsPrefixRedirect />} />
      <Route element={<DocsLayout />}>
        <Route index element={<Navigate to="introduction" replace />} />
        {DOCS.map((doc) => (
          <Route key={doc.path} path={doc.path.slice(1)} element={<DocRoute doc={doc} />} />
        ))}
        <Route path="*" element={<LegacyRedirect />} />
      </Route>
    </Routes>
  );
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(rootEl).render(
  <App>
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  </App>,
);
