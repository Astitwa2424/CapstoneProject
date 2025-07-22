"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import dynamic from "next/dynamic"

// Dynamically import the routing machine component to ensure it only runs on the client
const RoutingMachine = dynamic(() => import("./routing-machine"), {
  ssr: false,
})

// Helper function to create custom SVG icons for markers
const createIcon = (svg: string, size: [number, number] = [40, 40]) => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -size[1]],
  })
}

const restaurantIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="%23EF4444"><path d="M16,6V4c0-1.11-0.89-2-2-2h-4C8.89,2,8,2.89,8,4v2H2v13c0,1.11,0.89,2,2,2h16c1.11,0,2-0.89,2-2V6H16z M10,4h4v2h-4V4z M20,19H4V8h16V19z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`
const homeIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="%233B82F6"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`

const restaurantIcon = createIcon(restaurantIconSvg)
const homeIcon = createIcon(homeIconSvg)

interface DeliveryMapProps {
  driverLocation: { lat: number; lng: number } | null
  restaurantLocation: { lat: number; lng: number }
  customerAddress: string
  onEtaChange: (eta: string) => void
}

export default function DeliveryMap({
  driverLocation,
  restaurantLocation,
  customerAddress,
  onEtaChange,
}: DeliveryMapProps) {
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Geocode customer address using OpenStreetMap's free Nominatim API
  useEffect(() => {
    if (customerAddress) {
      setIsLoading(true)
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customerAddress)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to geocode address")
          return res.json()
        })
        .then((data) => {
          if (data && data[0]) {
            setCustomerLocation({ 
              lat: Number.parseFloat(data[0].lat), 
              lng: Number.parseFloat(data[0].lon) 
            })
          } else {
            setError("Could not find location for the address.")
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false))
    }
  }, [customerAddress])

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading Map...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] bg-red-100 rounded-lg flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={[restaurantLocation.lat, restaurantLocation.lng]}
      zoom={13}
      style={{ height: "100%", minHeight: "400px", width: "100%", borderRadius: "0.5rem" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={restaurantLocation} icon={restaurantIcon} />
      {customerLocation && <Marker position={customerLocation} icon={homeIcon} />}

      {driverLocation && customerLocation && (
        <RoutingMachine
          driverLocation={L.latLng(driverLocation.lat, driverLocation.lng)}
          customerLocation={L.latLng(customerLocation.lat, customerLocation.lng)}
          onEtaChange={onEtaChange}
        />
      )}
    </MapContainer>
  )
}