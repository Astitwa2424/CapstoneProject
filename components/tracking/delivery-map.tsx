"use client"

import { useState, useEffect, useMemo } from "react"
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api"
import { RouteInfoBox } from "./route-info-box"
//import { google } from "google-maps"

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
}

// Dark theme map styles optimized for delivery tracking
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", stylers: [{ visibility: "simplified" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c4043" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", stylers: [{ visibility: "simplified" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f1419" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
]

// Custom marker icons
const createMarkerIcon = (color: string) => ({
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
  fillColor: color,
  fillOpacity: 1,
  strokeColor: "#ffffff",
  strokeWeight: 2,
  scale: 1.5,
  labelOrigin: { x: 12, y: 9 },
})

const restaurantIcon = createMarkerIcon("#f87171")
const homeIcon = createMarkerIcon("#60a5fa")
const driverIcon = createMarkerIcon("#10b981")

interface DeliveryMapProps {
  driverLocation: { lat: number; lng: number } | null
  restaurantLocation: { lat: number; lng: number }
  customerAddress: string
  orderStatus?: string
}

// Enhanced geocoding function for Australian addresses
async function geocodeAustralianAddress(
  address: string,
  geocoder: google.maps.Geocoder,
): Promise<{ lat: number; lng: number } | null> {
  console.log("Starting geocoding for:", address)

  const queries = [
    address,
    address.toLowerCase().includes("australia") ? address : `${address}, Australia`,
    address.toLowerCase().includes("nsw") && !address.toLowerCase().includes("australia")
      ? `${address}, Australia`
      : null,
  ].filter(Boolean) as string[]

  for (const query of queries) {
    try {
      console.log(`Trying to geocode: ${query}`)

      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode(
          {
            address: query,
            componentRestrictions: { country: "AU" },
            region: "AU",
          },
          (results, status) => {
            if (status === "OK" && results) {
              resolve(results)
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          },
        )
      })

      if (result && result.length > 0) {
        const location = result[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()

        // Validate coordinates are in Australia
        if (lat >= -44 && lat <= -9 && lng >= 112 && lng <= 154) {
          console.log(`Found valid Australian location: ${lat}, ${lng}`)
          return { lat, lng }
        }
      }
    } catch (error) {
      console.error(`Error geocoding "${query}":`, error)
      continue
    }
  }

  console.log("All geocoding attempts failed")
  return null
}

export default function DeliveryMap({
  driverLocation,
  restaurantLocation,
  customerAddress,
  orderStatus,
}: DeliveryMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places", "geometry"],
  })

  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null)
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  // Geocode customer address
  useEffect(() => {
    if (!isLoaded || !customerAddress) return

    setIsLoading(true)
    setError(null)

    const geocoder = new google.maps.Geocoder()

    geocodeAustralianAddress(customerAddress, geocoder)
      .then((location) => {
        if (location) {
          console.log("Setting customer location:", location)
          setCustomerLocation(location)
          setError(null)
        } else {
          console.log("Geocoding failed, using fallback location")
          setError("Could not locate the exact delivery address")
          // Set a default location in Sydney as fallback
          setCustomerLocation({ lat: -33.8688, lng: 151.2093 })
        }
      })
      .catch((err) => {
        console.error("Geocoding error:", err)
        setError("Failed to load delivery location")
        // Set a default location in Sydney as fallback
        setCustomerLocation({ lat: -33.8688, lng: 151.2093 })
      })
      .finally(() => setIsLoading(false))
  }, [isLoaded, customerAddress])

  // Calculate directions when driver is active
  useEffect(() => {
    if (!isLoaded || !driverLocation || !customerLocation || orderStatus !== "OUT_FOR_DELIVERY") {
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
  }, [isLoaded, driverLocation, customerLocation, orderStatus])

  // Set map bounds to focus on 30km around delivery address (invisible restriction)
  useEffect(() => {
    if (!map || !customerLocation) return

    try {
      // Create bounds with 30km radius around customer location
      const center = new google.maps.LatLng(customerLocation.lat, customerLocation.lng)

      // Calculate bounds for 30km radius (approximately 0.27 degrees)
      const radiusInDegrees = 30000 / 111320 // Convert 30km to degrees (rough approximation)

      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(customerLocation.lat - radiusInDegrees, customerLocation.lng - radiusInDegrees),
        new google.maps.LatLng(customerLocation.lat + radiusInDegrees, customerLocation.lng + radiusInDegrees),
      )

      // Include restaurant and driver in bounds if they exist
      if (restaurantLocation.lat && restaurantLocation.lng) {
        bounds.extend(new google.maps.LatLng(restaurantLocation.lat, restaurantLocation.lng))
      }

      if (driverLocation) {
        bounds.extend(new google.maps.LatLng(driverLocation.lat, driverLocation.lng))
      }

      map.fitBounds(bounds, 50) // 50px padding

      // Set reasonable zoom limits
      const listener = google.maps.event.addListener(map, "bounds_changed", () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15)
        }
        if (map.getZoom() && map.getZoom()! < 8) {
          map.setZoom(8)
        }
        google.maps.event.removeListener(listener)
      })
    } catch (error) {
      console.error("Error setting map bounds:", error)
    }
  }, [map, customerLocation, driverLocation, restaurantLocation])

  // Map center calculation - prioritize customer location
  const mapCenter = useMemo(() => {
    if (customerLocation) {
      return customerLocation
    }
    if (restaurantLocation.lat && restaurantLocation.lng) {
      return restaurantLocation
    }
    return { lat: -33.8688, lng: 151.2093 } // Sydney CBD fallback
  }, [customerLocation, restaurantLocation])

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[600px] bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center rounded-lg">
        <div className="text-center text-red-600">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-semibold">Failed to load Google Maps</p>
          <p className="text-sm mt-1">Please check your internet connection</p>
        </div>
      </div>
    )
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="w-full h-full min-h-[600px] bg-gradient-to-br from-blue-100 to-indigo-100 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-center text-indigo-600">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading GPS tracking...</p>
          <p className="text-sm mt-1">Locating: {customerAddress}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={11}
        options={{
          styles: mapStyles,
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
        {/* Restaurant marker */}
        {restaurantLocation.lat && restaurantLocation.lng && (
          <Marker
            position={restaurantLocation}
            icon={restaurantIcon}
            title="Restaurant"
            label={{
              text: "🍽️",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          />
        )}

        {/* Customer location marker */}
        {customerLocation && (
          <Marker
            position={customerLocation}
            icon={homeIcon}
            title="Delivery Address"
            label={{
              text: "🏠",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          />
        )}

        {/* Driver marker */}
        {driverLocation && (
          <Marker
            position={driverLocation}
            icon={driverIcon}
            title="Driver Location"
            label={{
              text: "🚗",
              fontSize: "16px",
              fontWeight: "bold",
            }}
            animation={google.maps.Animation.BOUNCE}
          />
        )}

        {/* Directions renderer */}
        {directions && (
          <DirectionsRenderer
            options={{
              directions,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#10b981",
                strokeOpacity: 0.8,
                strokeWeight: 6,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Route information overlay */}
      <RouteInfoBox distance={routeInfo.distance} time={routeInfo.time} speed={routeInfo.speed} />

      {/* Error overlay */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-yellow-600/90 backdrop-blur-sm border border-yellow-500 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-100">Using approximate location - {error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delivery status overlay */}
      {orderStatus && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">{orderStatus}</span>
            </div>
          </div>
        </div>
      )}

      {/* Live tracking indicator */}
      {driverLocation && orderStatus === "OUT_FOR_DELIVERY" && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-green-600/90 backdrop-blur-sm border border-green-500 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-white">LIVE TRACKING</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
