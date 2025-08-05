"use client"

import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
import "leaflet-routing-machine"

// Enhanced vehicle icon with pulse animation
const vehicleIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#60a5fa" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><path d="M9 18h6"/><circle cx="6.5" cy="18.5" r="2.5"/><circle cx="16.5" cy="18.5" r="2.5"/></svg>',
  )}`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
})

interface RoutingProps {
  driverPosition: [number, number]
  waypoints: L.LatLng[]
  onRouteFound: (info: { distance: string; time: string; speed?: string }) => void
  bounds?: L.LatLngBounds
}

// Custom routing function using multiple services
async function getRouteFromAPI(start: L.LatLng, end: L.LatLng): Promise<L.LatLng[] | null> {
  const services = [
    // Primary: OSRM
    {
      name: "OSRM",
      url: `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
    },
    // Fallback: OpenRouteService (if available)
    {
      name: "GraphHopper",
      url: `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&vehicle=car&locale=en&calc_points=true&type=json`,
    },
  ]

  for (const service of services) {
    try {
      console.log(`Trying ${service.name} routing service...`)
      const response = await fetch(service.url)

      if (!response.ok) {
        console.warn(`${service.name} service returned ${response.status}`)
        continue
      }

      const data = await response.json()

      if (service.name === "OSRM") {
        if (data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates
          const routePoints = coordinates.map((coord: [number, number]) => L.latLng(coord[1], coord[0]))
          console.log(`${service.name} returned ${routePoints.length} route points`)
          return routePoints
        }
      } else if (service.name === "GraphHopper") {
        if (data.paths && data.paths.length > 0) {
          const points = data.paths[0].points
          if (points && points.coordinates) {
            const routePoints = points.coordinates.map((coord: [number, number]) => L.latLng(coord[1], coord[0]))
            console.log(`${service.name} returned ${routePoints.length} route points`)
            return routePoints
          }
        }
      }
    } catch (error) {
      console.error(`Error with ${service.name}:`, error)
      continue
    }
  }

  return null
}

const RoutingMachine = ({ driverPosition, waypoints, onRouteFound, bounds }: RoutingProps) => {
  const map = useMap()
  const routingControlRef = useRef<any>(null)
  const routeLineRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    if (!map || waypoints.length < 1) {
      console.log("RoutingMachine: Missing map or waypoints")
      return
    }

    // Validate driver position
    if (!driverPosition || driverPosition.length !== 2 || isNaN(driverPosition[0]) || isNaN(driverPosition[1])) {
      console.log("RoutingMachine: Invalid driver position", driverPosition)
      return
    }

    // Validate waypoints
    const validWaypoints = waypoints.filter(
      (waypoint) =>
        waypoint &&
        typeof waypoint.lat === "number" &&
        typeof waypoint.lng === "number" &&
        !isNaN(waypoint.lat) &&
        !isNaN(waypoint.lng),
    )

    if (validWaypoints.length === 0) {
      console.log("RoutingMachine: No valid waypoints")
      return
    }

    const driverLatLng = L.latLng(driverPosition[0], driverPosition[1])
    const fullWaypoints = [driverLatLng, ...validWaypoints]

    console.log(
      "RoutingMachine: Creating route with waypoints:",
      fullWaypoints.map((w) => [w.lat, w.lng]),
    )

    // Clean up existing elements
    if (routingControlRef.current && map) {
      try {
        map.removeControl(routingControlRef.current)
        routingControlRef.current = null
      } catch (e) {
        console.log("Error removing existing routing control:", e)
      }
    }

    if (routeLineRef.current && map) {
      try {
        map.removeLayer(routeLineRef.current)
        routeLineRef.current = null
      } catch (e) {
        console.log("Error removing existing route line:", e)
      }
    }

    // Add driver marker
    const driverMarker = L.marker([driverPosition[0], driverPosition[1]], {
      icon: vehicleIcon,
      draggable: false,
    }).addTo(map)

    // Try custom routing first
    const tryCustomRouting = async () => {
      try {
        console.log("Attempting custom routing...")
        const routePoints = await getRouteFromAPI(driverLatLng, validWaypoints[validWaypoints.length - 1])

        if (routePoints && routePoints.length > 2) {
          console.log("Custom routing successful, drawing route with", routePoints.length, "points")

          // Draw the route line
          routeLineRef.current = L.polyline(routePoints, {
            color: "#f59e0b", // Orange/amber color
            weight: 6,
            opacity: 0.9,
            dashArray: "12, 8",
          }).addTo(map)

          // Calculate route info
          let totalDistance = 0
          for (let i = 0; i < routePoints.length - 1; i++) {
            totalDistance += routePoints[i].distanceTo(routePoints[i + 1])
          }

          const distanceKm = (totalDistance / 1000).toFixed(1)
          const estimatedTime = Math.round((totalDistance / 1000 / 40) * 60) // 40 km/h average

          onRouteFound({
            distance: `${distanceKm} km`,
            time: `${estimatedTime} min`,
            speed: "40 km/h",
          })

          return true
        }
      } catch (error) {
        console.error("Custom routing failed:", error)
      }
      return false
    }

    // Try Leaflet Routing Machine as fallback
    const tryLeafletRouting = () => {
      try {
        console.log("Attempting Leaflet Routing Machine...")

        const routingControl = (L.Routing as any)
          .control({
            waypoints: fullWaypoints,
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: false,
            showAlternatives: false,
            createMarker: () => null, // Don't create markers, we handle them manually
            lineOptions: {
              styles: [
                {
                  color: "#f59e0b",
                  opacity: 0.9,
                  weight: 6,
                  dashArray: "12, 8",
                },
              ],
            },
            router: (L.Routing as any).osrmv1({
              serviceUrl: "https://router.project-osrm.org/route/v1",
              profile: "driving",
              timeout: 15000,
            }),
          })
          .on("routesfound", (e: any) => {
            console.log("Leaflet routing successful:", e)
            const routes = e.routes
            if (routes && routes.length > 0) {
              const summary = routes[0].summary
              const timeInMinutes = Math.round(summary.totalTime / 60)
              const distanceInKm = (summary.totalDistance / 1000).toFixed(1)
              const speedKmh =
                summary.totalTime > 0 ? Math.round(summary.totalDistance / 1000 / (summary.totalTime / 3600)) : 0

              onRouteFound({
                time: `${timeInMinutes} min`,
                distance: `${distanceInKm} km`,
                speed: speedKmh > 0 ? `${speedKmh} km/h` : undefined,
              })
            }
          })
          .on("routingerror", (e: any) => {
            console.error("Leaflet routing failed:", e.error)
            // Final fallback - draw estimated route
            drawFallbackRoute()
          })

        routingControl.addTo(map)
        routingControlRef.current = routingControl
        return true
      } catch (error) {
        console.error("Leaflet Routing Machine failed:", error)
        return false
      }
    }

    // Final fallback - draw an estimated route following major directions
    const drawFallbackRoute = () => {
      console.log("Drawing fallback route...")
      const start = driverLatLng
      const end = validWaypoints[validWaypoints.length - 1]

      // Create a more realistic route by adding intermediate points
      const latDiff = end.lat - start.lat
      const lngDiff = end.lng - start.lng

      // Create waypoints that simulate following major roads
      const intermediatePoints = []
      const steps = 8 // Number of intermediate points

      for (let i = 1; i < steps; i++) {
        const progress = i / steps
        // Add some variation to simulate road following
        const latOffset = Math.sin(progress * Math.PI) * 0.002 // Small offset for realism
        const lngOffset = Math.cos(progress * Math.PI * 2) * 0.002

        intermediatePoints.push(
          L.latLng(start.lat + latDiff * progress + latOffset, start.lng + lngDiff * progress + lngOffset),
        )
      }

      const routePoints = [start, ...intermediatePoints, end]

      routeLineRef.current = L.polyline(routePoints, {
        color: "#f59e0b",
        weight: 6,
        opacity: 0.8,
        dashArray: "15, 10", // Different dash pattern to indicate estimation
      }).addTo(map)

      // Calculate fallback route info
      const distance = start.distanceTo(end) / 1000
      const estimatedTime = Math.round((distance / 35) * 60)

      onRouteFound({
        distance: `~${distance.toFixed(1)} km`,
        time: `~${estimatedTime} min`,
        speed: "~35 km/h",
      })
    }

    // Execute routing strategy
    const executeRouting = async () => {
      const customSuccess = await tryCustomRouting()
      if (!customSuccess) {
        const leafletSuccess = tryLeafletRouting()
        if (!leafletSuccess) {
          drawFallbackRoute()
        }
      }
    }

    executeRouting()

    // Cleanup function
    return () => {
      if (routingControlRef.current && map) {
        try {
          map.removeControl(routingControlRef.current)
          routingControlRef.current = null
        } catch (error) {
          console.error("Error cleaning up routing control:", error)
        }
      }

      if (routeLineRef.current && map) {
        try {
          map.removeLayer(routeLineRef.current)
          routeLineRef.current = null
        } catch (error) {
          console.error("Error cleaning up route line:", error)
        }
      }

      if (driverMarker && map) {
        try {
          map.removeLayer(driverMarker)
        } catch (error) {
          console.error("Error cleaning up driver marker:", error)
        }
      }
    }
  }, [map, driverPosition, waypoints, onRouteFound, bounds])

  return null
}

export default RoutingMachine
