"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
//import * as google from "google.maps"

interface DriverDeliveryMapProps {
  driverLocation: { lat: number; lng: number } | null
  restaurantLocation: { lat: number; lng: number }
  customerAddress: string
  orderStatus: string
}

export default function DriverDeliveryMap({
  driverLocation,
  restaurantLocation,
  customerAddress,
  orderStatus,
}: DriverDeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null)
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)
  const driverMarkerRef = useRef<google.maps.Marker | null>(null)
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Geocode customer address
  useEffect(() => {
    if (!customerAddress) return

    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address: customerAddress + ", Australia" }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const location = results[0].geometry.location
        setCustomerLocation({
          lat: location.lat(),
          lng: location.lng(),
        })
      }
    })
  }, [customerAddress])

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
        libraries: ["places", "geometry"],
      })

      try {
        await loader.load()

        if (!mapRef.current) return

        // Center map on Sydney, Australia
        const map = new google.maps.Map(mapRef.current, {
          zoom: 12,
          center: { lat: -33.8688, lng: 151.2093 }, // Sydney
          styles: [
            {
              featureType: "all",
              elementType: "geometry.fill",
              stylers: [{ color: "#1f2937" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#ffffff" }],
            },
            {
              featureType: "water",
              elementType: "geometry.fill",
              stylers: [{ color: "#374151" }],
            },
            {
              featureType: "road",
              elementType: "geometry.fill",
              stylers: [{ color: "#4b5563" }],
            },
          ],
        })

        mapInstanceRef.current = map
        directionsServiceRef.current = new google.maps.DirectionsService()
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#10b981",
            strokeWeight: 4,
            strokeOpacity: 0.8,
          },
        })

        directionsRendererRef.current.setMap(map)
      } catch (error) {
        console.error("Error loading Google Maps:", error)
      }
    }

    initMap()
  }, [])

  // Update driver location and route
  useEffect(() => {
    if (!mapInstanceRef.current || !driverLocation || !customerLocation) return

    // Update or create driver marker
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setPosition(driverLocation)
    } else {
      driverMarkerRef.current = new google.maps.Marker({
        position: driverLocation,
        map: mapInstanceRef.current,
        title: "Driver Location",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#10b981" stroke="#ffffff" strokeWidth="3"/>
              <circle cx="16" cy="16" r="4" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16),
        },
      })
    }

    // Calculate and display route
    if (directionsServiceRef.current && directionsRendererRef.current) {
      directionsServiceRef.current.route(
        {
          origin: driverLocation,
          destination: customerLocation,
          travelMode: google.maps.TravelMode.DRIVING,
          region: "AU",
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRendererRef.current?.setDirections(result)
          }
        },
      )
    }

    // Add customer marker
    new google.maps.Marker({
      position: customerLocation,
      map: mapInstanceRef.current,
      title: "Delivery Location",
      icon: {
        url:
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 16 16 24 16 24s16-8 16-24c0-8.837-7.163-16-16-16z" fill="#ef4444"/>
            <circle cx="16" cy="16" r="6" fill="#ffffff"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 40),
        anchor: new google.maps.Point(16, 40),
      },
    })
  }, [driverLocation, customerLocation])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Status overlay */}
      <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">
            {orderStatus === "OUT_FOR_DELIVERY" ? "En Route to Customer" : "Delivering"}
          </span>
        </div>
      </div>

      {/* Destination info */}
      {customerAddress && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div>
              <p className="text-sm font-medium">Destination</p>
              <p className="text-xs text-slate-300">{customerAddress}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
