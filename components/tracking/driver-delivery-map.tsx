"use client"

import { useState, useEffect, useMemo } from "react"
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api"
import { RouteInfoBox } from "./route-info-box"
//import { google } from "googlemaps"

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
}

// Navigation-optimized map styles
const navigationMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", stylers: [{ visibility: "simplified" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c4043" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", stylers: [{ visibility: "simplified" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f1419" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
]

// Custom marker icons for navigation
const createNavigationIcon = (color: string) => ({
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
  fillColor: color,
  fillOpacity: 1,
  strokeColor: "#ffffff",
  strokeWeight: 3,
  scale: 2,
  labelOrigin: { x: 12, y: 9 },
})

const driverIcon = createNavigationIcon("#10b981")
const destinationIcon = createNavigationIcon("#ef4444")

interface DriverDeliveryMapProps {
  driverLocation: { lat: number; lng: number } | null
  customerLocation: { lat: number; lng: number }
  customerAddress: string
}

export default function DriverDeliveryMap({
  driverLocation,
  customerLocation,
  customerAddress,
}: DriverDeliveryMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places", "geometry"],
  })

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [routeInfo, setRouteInfo] = useState<{
    distance: string | null
    time: string | null
    speed?: string | null
  }>({
    distance: null,
    time: null,
    speed: null,
  })
  const [map, setMap] = useState<google.maps.Map | null>(null)

  // Calculate directions from driver to customer
  useEffect(() => {
    if (!isLoaded || !driverLocation || !customerLocation) {
      setDirections(null)
      return
    }

    const directionsService = new google.maps.DirectionsService()

    directionsService.route(
      {
        origin: driverLocation,
        destination: customerLocation,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result)

          // Extract route information
          const route = result.routes[0]
          if (route && route.legs[0]) {
            const leg = route.legs[0]
            setRouteInfo({
              distance: leg.distance?.text || null,
              time: leg.duration?.text || null,
              speed:
                leg.duration?.value && leg.distance?.value
                  ? `${Math.round(leg.distance.value / 1000 / (leg.duration.value / 3600))} km/h`
                  : null,
            })
          }
        } else {
          console.error(`Directions request failed: ${status}`)
          setDirections(null)
        }
      },
    )
  }, [isLoaded, driverLocation, customerLocation])

  // Set map bounds to show the route
  useEffect(() => {
    if (!map || !driverLocation || !customerLocation) return

    try {
      const bounds = new google.maps.LatLngBounds()
      bounds.extend(new google.maps.LatLng(driverLocation.lat, driverLocation.lng))
      bounds.extend(new google.maps.LatLng(customerLocation.lat, customerLocation.lng))

      map.fitBounds(bounds, 100) // 100px padding

      // Set navigation-friendly zoom limits
      const listener = google.maps.event.addListener(map, "bounds_changed", () => {
        if (map.getZoom() && map.getZoom()! > 16) {
          map.setZoom(16)
        }
        if (map.getZoom() && map.getZoom()! < 10) {
          map.setZoom(10)
        }
        google.maps.event.removeListener(listener)
      })
    } catch (error) {
      console.error("Error setting navigation bounds:", error)
    }
  }, [map, driverLocation, customerLocation])

  // Map center calculation - prioritize driver location for navigation
  const mapCenter = useMemo(() => {
    if (driverLocation) {
      return driverLocation
    }
    if (customerLocation) {
      return customerLocation
    }
    return { lat: -33.8688, lng: 151.2093 } // Sydney CBD fallback
  }, [driverLocation, customerLocation])

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[500px] bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center rounded-lg">
        <div className="text-center text-red-600">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-semibold">Failed to load navigation</p>
          <p className="text-sm mt-1">Please check your internet connection</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[500px] bg-gradient-to-br from-blue-100 to-indigo-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-center text-indigo-600">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading navigation...</p>
          <p className="text-sm mt-1">Preparing route to: {customerAddress}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12}
        options={{
          styles: navigationMapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: "greedy",
          restriction: {
            latLngBounds: {
              north: -9,
              south: -44,
              east: 154,
              west: 112,
            },
            strictBounds: false,
          },
        }}
        onLoad={(mapInstance) => {
          setMap(mapInstance)
        }}
      >
        {/* Driver marker */}
        {driverLocation && (
          <Marker
            position={driverLocation}
            icon={driverIcon}
            title="Your Location"
            label={{
              text: "🚗",
              fontSize: "20px",
              fontWeight: "bold",
            }}
            animation={google.maps.Animation.BOUNCE}
          />
        )}

        {/* Customer location marker */}
        <Marker
          position={customerLocation}
          icon={destinationIcon}
          title="Delivery Destination"
          label={{
            text: "📍",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        />

        {/* Directions renderer with enhanced styling for navigation */}
        {directions && (
          <DirectionsRenderer
            options={{
              directions,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#10b981",
                strokeOpacity: 0.9,
                strokeWeight: 8, // Thicker line for navigation
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Enhanced route information for navigation */}
      <RouteInfoBox distance={routeInfo.distance} time={routeInfo.time} speed={routeInfo.speed} />

      {/* Navigation status indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-green-600/95 backdrop-blur-sm border border-green-500 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-white">DRIVER NAVIGATION</span>
          </div>
        </div>
      </div>

      {/* Destination info */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-sm font-medium text-white">Destination: {customerAddress}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
