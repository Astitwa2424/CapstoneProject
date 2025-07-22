"use client"

import { useState, useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { updateDriverLocation } from "@/app/driver/actions"
import { useSocket } from "@/components/providers/socket-provider"

// Define custom icons
const driverIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRydWNrIj48cGF0aCBkPSJNMTQgMTZIMmEyIDIgMCAwIDEgLTItMlY0YTIgMiAwIDAgMSAyLTJoMTEuMThhMiAyIDAgMCAxIDEuNDEuNTlMMjIgMTIuODJWMTZhMiAyIDAgMCAxLTIgMnoiLz48cGF0aCBkPSJNMjIgMTZIMThhMiAyIDAgMCAxLTItMlY0YTIgMiAwIDAgMSAyLTJoMi4yOEExIDEgMCAwIDEgMjQgNVYxNWExIDEgMCAwIDEtMSAyLjcyeiIvPjxwYXRoIGQ9Ik0xMyA2djEwIi8+PGNpcmNsZSBjeD0iNyIgY3k9MTgiIHI9IjIiLz48Y2lyY2xlIGN4PSIxNyIgY3k9MTgiIHI9IjIiLz48L3N2Zz4=",
  iconSize: [38, 38],
  iconAnchor: [19, 19],
})

const restaurantIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXV0ZW5zaWxzIj48cGF0aCBkPSJNMzIgNnYxMWEyIDIgMCAwIDEgLTIgMkg3YTIgMiAwIDAgMSAtMiAtMlY2Ii8+PHBhdGggZD0iTTcgNlY0YTIgMiAwIDAgMSAyIC0yaDRhMiAyIDAgMCAxIDIgMnYyIi8+PHBhdGggZD0iTTIgMTJoMjAiLz48L3N2Zz4=",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

const customerIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWhvbWUiPjxwYXRoIGQ9Im0zIDkgOS03IDkgN3YxMWEyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnoiLz48cG9seWxpbmUgcG9pbnRzPSI5IDIyIDkgMTIgMTUgMTIgMTUgMjIiLz48L3N2Zz4=",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

const DriverMap = () => {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [activeOrder, setActiveOrder] = useState<any>(null)
  const { socket } = useSocket()

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setPosition(newPosition)
        updateDriverLocation(newPosition[0], newPosition[1])
      },
      (err) => {
        console.error(err)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on("order-update", (order) => {
      if (order.status === "OUT_FOR_DELIVERY") {
        setActiveOrder(order)
      } else if (order.status === "DELIVERED") {
        setActiveOrder(null)
      }
    })

    return () => {
      socket.off("order-update")
    }
  }, [socket])

  const center = useMemo(() => {
    return position || [51.505, -0.09] // Default to London if no position
  }, [position])

  if (!position) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p className="text-muted-foreground">Getting your location...</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} icon={driverIcon} />
      {activeOrder && (
        <>
          <Marker
            position={[activeOrder.restaurantProfile.lat, activeOrder.restaurantProfile.lng]}
            icon={restaurantIcon}
          />
          <Marker position={[activeOrder.customerLat, activeOrder.customerLng]} icon={customerIcon} />
          <Polyline
            positions={[position, [activeOrder.restaurantProfile.lat, activeOrder.restaurantProfile.lng]]}
            color="orange"
            dashArray="5, 10"
          />
          <Polyline
            positions={[
              [activeOrder.restaurantProfile.lat, activeOrder.restaurantProfile.lng],
              [activeOrder.customerLat, activeOrder.customerLng],
            ]}
            color="blue"
          />
        </>
      )}
    </MapContainer>
  )
}

export default DriverMap
