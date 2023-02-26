// @refresh reload
import { QueryClientProvider } from "@tanstack/solid-query";
import { queryClient } from "~/data";
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title
} from "solid-start";
import "./root.css";
import Nav from "./components/Nav";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Pre LF Loadouts</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <QueryClientProvider client={queryClient}>
          <Suspense>
            <ErrorBoundary>
              <Nav />
              <Routes>
                <FileRoutes />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </QueryClientProvider>
        <Scripts />
      </Body>
    </Html>
  );
}
