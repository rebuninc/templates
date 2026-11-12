import { createRouter } from "@tanstack/react-router"

import { AppError, NotFound } from "./components/status-page"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: () => <NotFound />,
    defaultErrorComponent: AppError,
  })
}
