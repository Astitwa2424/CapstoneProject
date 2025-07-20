"use client"

import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api"
import { useState, useEffect, useRef, useCallback } from "react"
//import { google } from "googlemaps"

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px",
  borderRadius: "0.5rem",
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
  ],
}

const driverIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="%231F2937"><path d="M19.5,8.5c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5S20.33,8.5,19.5,8.5z M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`
const restaurantIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="%23EF4444"><path d="M16,6V4c0-1.11-0.89-2-2-2h-4C8.89,2,8,2.89,8,4v2H2v13c0,1.11,0.89,2,2,2h16c1.11,0,2-0.89,2-2V6H16z M10,4h4v2h-4V4z M20,19H4V8h16V19z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`
const homeIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="%233B82F6"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`

interface DeliveryMapProps {
  driverLocation: { lat: number; lng: number } | null
  restaurantLocation: { lat: number; lng: number }
  customerAddress: string
}

export default function DeliveryMap({ driverLocation, restaurantLocation, customerAddress }: DeliveryMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  })

  const mapRef = useRef<google.maps.Map | null>(null)
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null)

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  useEffect(() => {
    if (isLoaded && customerAddress) {
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ address: customerAddress }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const location = results[0].geometry.location
          setCustomerLocation({ lat: location.lat(), lng: location.lng() })
        } else {
          console.error(`Geocode was not successful for the following reason: ${status}`)
        }
      })
    }
  }, [isLoaded, customerAddress])

  useEffect(() => {
    if (mapRef.current) {
      const bounds = new google.maps.LatLngBounds()
      if (restaurantLocation) {
        bounds.extend(new google.maps.LatLng(restaurantLocation.lat, restaurantLocation.lng))
      }
      if (driverLocation) {
        bounds.extend(new google.maps.LatLng(driverLocation.lat, driverLocation.lng))
      }
      if (customerLocation) {
        bounds.extend(new google.maps.LatLng(customerLocation.lat, customerLocation.lng))
      }

      if (!bounds.isEmpty()) {
        if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
          mapRef.current.setCenter(bounds.getCenter())
          mapRef.current.setZoom(15)
        } else {
          mapRef.current.fitBounds(bounds, 100)
        }
      }
    }
  }, [driverLocation, restaurantLocation, customerLocation, isLoaded])

  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded)
    return (
      <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading Map...</p>
      </div>
    )

  return (
    <GoogleMap mapContainerStyle={containerStyle} options={mapOptions} onLoad={onMapLoad}>
      {restaurantLocation && (
        <MarkerF
          position={restaurantLocation}
          title="Restaurant"
          icon={{ url: restaurantIcon, scaledSize: new google.maps.Size(40, 40) }}
        />
      )}
      {driverLocation && (
        <MarkerF
          position={driverLocation}
          title="Driver"
          icon={{ url: driverIcon, scaledSize: new google.maps.Size(48, 48) }}
        />
      )}
      {customerLocation && (
        <MarkerF
          position={customerLocation}
          title="Your Location"
          icon={{ url: homeIcon, scaledSize: new google.maps.Size(40, 40) }}
        />
      )}
    </GoogleMap>
  )
}
