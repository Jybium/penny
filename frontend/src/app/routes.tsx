import { createBrowserRouter } from "react-router"
import PennyApplication from "../App"

function RouteMarker() {
  return null
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PennyApplication,
    children: [
      { index: true, Component: RouteMarker },
      { path: "chat", Component: RouteMarker },
      { path: "review", Component: RouteMarker },
      { path: "checkout", Component: RouteMarker },
      { path: "payment", Component: RouteMarker },
      { path: "checkout/cancel", Component: RouteMarker },
      { path: "payment/cancel", Component: RouteMarker },
      { path: "order/success", Component: RouteMarker },
      { path: "orders/success", Component: RouteMarker },
      { path: "orders", Component: RouteMarker },
      { path: "order", Component: RouteMarker },
      { path: "order/*", Component: RouteMarker },
      { path: "orders/*", Component: RouteMarker },
      { path: "autonomy", Component: RouteMarker },
      { path: "*", Component: RouteMarker },
    ],
  },
])
