import { App } from "@nonla-agents/ui";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DOCS, type DocRecord } from "./catalog";
import "./index.css";
import { DocArticle } from "./layout/DocArticle";
import { DocsLayout } from "./layout/DocsLayout";
import { MarkdownDoc } from "./MarkdownDoc";
import { migrateLegacyLocation, resolveLegacyPath } from "./nav";
import { InputWhitePage } from "./pages/preview/InputWhitePage";

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

createRoot(rootEl).render(
  <App>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </App>,
);
