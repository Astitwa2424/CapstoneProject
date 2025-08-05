"use client"

import { useState, useCallback, useMemo } from "react"
import { GoogleMap, useLoadScript, Marker, DirectionsService, DirectionsRenderer } from "@react-google-maps/api"
import { RouteInfoBox } from "./route-info-box"
import type { google } from "googlemaps"

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px",
  borderRadius: "0.5rem",
}

// Custom map styles for a professional theme
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
]

// Custom SVG icons for map markers
const createMarkerIcon = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

const driverIcon = createMarkerIcon(
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#1e88e5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><path d="M9 18h6"/><circle cx="6.5" cy="18.5" r="2.5"/><circle cx="16.5" cy="18.5" r="2.5"/></svg>',
)
const restaurantIcon = createMarkerIcon(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="#e53935" stroke="#ffffff" strokeWidth="1"><path d="M16,6V4c0-1.11-.89-2-2-2h-4C8.89,2,8,2.89,8,4v2H2v13c0,1.11.89,2,2,2h16c1.11,0,2-.89,2-2V6H16z M10,4h4v2h-4V4z"/></svg>',
)
const homeIcon = createMarkerIcon(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="#43a047" stroke="#ffffff" strokeWidth="1"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
)

interface DriverMapProps {
  driverLocation: { lat: number; lng: number } | null
  restaurantLocation: { lat: number; lng: number }
  customerLocation: { lat: number; lng: number }
}

export default function DriverMap({ driverLocation, restaurantLocation, customerLocation }: DriverMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  })

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

  const directionsCallback = useCallback(
    (response: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
      if (status === "OK" && response) {
        setDirections(response)
      } else {
        console.error(`Directions request failed due to ${status}`)
      }
    },
    [],
  )

  const mapCenter = useMemo(() => {
    return driverLocation || restaurantLocation || { lat: -33.8688, lng: 151.2093 } // Default to Sydney
  }, [driverLocation, restaurantLocation])

  const waypoints = useMemo(() => {
    return [{ location: restaurantLocation, stopover: true }]
  }, [restaurantLocation])

  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded) return <div className="bg-gray-200 rounded-lg w-full h-full animate-pulse" />

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12}
        options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}
      >
        {/* Markers */}
        {driverLocation && (
          <Marker
            position={driverLocation}
            icon={{ url: driverIcon, scaledSize: new window.google.maps.Size(40, 40) }}
          />
        )}
        <Marker
          position={restaurantLocation}
          icon={{ url: restaurantIcon, scaledSize: new window.google.maps.Size(40, 40) }}
        />
        <Marker position={customerLocation} icon={{ url: homeIcon, scaledSize: new window.google.maps.Size(40, 40) }} />

        {/* Directions Service and Renderer */}
        {driverLocation && (
          <>
            <DirectionsService
              options={{
                destination: customerLocation,
                origin: driverLocation,
                waypoints: waypoints,
                travelMode: window.google.maps.TravelMode.DRIVING,
              }}
              callback={directionsCallback}
            />
            {directions && (
              <DirectionsRenderer
                options={{
                  directions,
                  suppressMarkers: true, // We use our own custom markers
                  polylineOptions: {
                    strokeColor: "#1e88e5",
                    strokeOpacity: 0.8,
                    strokeWeight: 6,
                  },
                }}
              />
            )}
          </>
        )}
      </GoogleMap>
      <RouteInfoBox directions={directions} />
    </div>
  )
}
