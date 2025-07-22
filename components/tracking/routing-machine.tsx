"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
import "leaflet-routing-machine"

// Custom vehicle icon
const vehicleIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmNsZS1kb3QtZGFzaGVkIj48cGF0aCBkPSJNMTAtN2wyLjgtMi44Ii8+PHBhdGggZD0iTTcgN2wyLjgtMi44Ii8+PHBhdGggZD0iTTcgMTBsMi44IDIuOCIvPjxwYXRoIGQ9Ik0xMCAxN2wyLjggMi44Ii8+PHBhdGggZD0iTTE0IDdsMi44LTIuOCIvPjxwYXRoIGQ9Ik0xNyAxbDIuOC0yLjgiLz48cGF0aCBkPSJNMTcgMTBsMi44IDIuOCIvPjxwYXRoIGQ9Ik0xNCAxN2wyLjggMi44Ii8+PC9zdmc+",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

interface RoutingProps {
  driverPosition: [number, number]
  restaurantPosition: [number, number]
  customerPosition: [number, number]
  onEtaChange: (eta: string) => void
}

const RoutingMachine = ({ driverPosition, restaurantPosition, customerPosition, onEtaChange }: RoutingProps) => {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const routingControl = (L.Routing as any)
      .control({
        waypoints: [
          L.latLng(driverPosition[0], driverPosition[1]),
          L.latLng(restaurantPosition[0], restaurantPosition[1]),
          L.latLng(customerPosition[0], customerPosition[1]),
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: (i: number, waypoint: any, n: number) => {
          // Use vehicle icon for the driver (first waypoint)
          if (i === 0) {
            return L.marker(waypoint.latLng, {
              icon: vehicleIcon,
              draggable: false,
            })
          }
          // Hide markers for restaurant and customer as they are handled by the parent component
          return false
        },
        lineOptions: {
          styles: [{ color: "#1e40af", opacity: 0.8, weight: 6 }],
        },
      })
      .on("routesfound", (e: any) => {
        const routes = e.routes
        const summary = routes[0].summary
        // Calculate ETA in minutes
        const etaMinutes = Math.round(summary.totalTime / 60)
        onEtaChange(`${etaMinutes} min`)
      })
      .addTo(map)

    return () => {
      map.removeControl(routingControl)
    }
  }, [map, driverPosition, restaurantPosition, customerPosition, onEtaChange])

  return null
}

export default RoutingMachine
