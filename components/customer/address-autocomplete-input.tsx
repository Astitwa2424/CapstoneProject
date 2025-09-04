"use client"

import { useRef, useState, useEffect } from "react"
import { useLoadScript, Autocomplete } from "@react-google-maps/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, MapPin, AlertTriangle } from "lucide-react"
import type { google } from "google-maps"

export interface StructuredAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  fullAddress: string
}

interface AddressAutocompleteInputProps {
  value?: string
  onValueChange?: (value: string) => void
  onAddressSelect: (address: StructuredAddress) => void
}

const libraries: "places"[] = ["places"]

export default function AddressAutocompleteInput({
  value: externalValue,
  onValueChange,
  onAddressSelect,
}: AddressAutocompleteInputProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  useEffect(() => {
    const debug: string[] = []
    debug.push(`API Key Present: ${apiKey ? "YES" : "NO"}`)
    debug.push(`API Key Length: ${apiKey.length}`)
    debug.push(`API Key Prefix: ${apiKey.substring(0, 10)}...`)
    debug.push(`Environment: ${process.env.NODE_ENV}`)
    debug.push(`Domain: ${typeof window !== "undefined" ? window.location.hostname : "server"}`)

    console.log("[v0] Google Maps API Debug Info:", debug)
    setDebugInfo(debug)
  }, [apiKey])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
    preventGoogleFontsLoading: true,
    region: "AU",
    language: "en",
  })

  useEffect(() => {
    if (loadError) {
      console.error("[v0] Google Maps Load Error:", loadError)
      console.error("[v0] Error Details:", {
        message: loadError.message,
        stack: loadError.stack,
        apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING",
      })
    }
  }, [loadError, apiKey])

  const [internalValue, setInternalValue] = useState("")
  const value = externalValue !== undefined ? externalValue : internalValue
  const setValue = onValueChange || setInternalValue

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()
      console.log("[v0] Place selected:", place)

      if (place.formatted_address) {
        setValue(place.formatted_address)

        const structuredAddress: StructuredAddress = {
          street: place.name || "",
          city: "",
          state: "",
          zipCode: "",
          country: "Australia",
          fullAddress: place.formatted_address,
        }

        if (place.address_components) {
          place.address_components.forEach((component: any) => {
            const types = component.types
            if (types.includes("locality")) {
              structuredAddress.city = component.long_name
            } else if (types.includes("administrative_area_level_1")) {
              structuredAddress.state = component.short_name
            } else if (types.includes("postal_code")) {
              structuredAddress.zipCode = component.long_name
            } else if (types.includes("street_number") || types.includes("route")) {
              if (!structuredAddress.street) {
                structuredAddress.street = component.long_name
              } else {
                structuredAddress.street = `${component.long_name} ${structuredAddress.street}`
              }
            }
          })
        }

        onAddressSelect(structuredAddress)
      }
    }
  }

  const handleManualAddressChange = (address: string) => {
    setValue(address)
    const structuredAddress: StructuredAddress = {
      street: address,
      city: "",
      state: "",
      zipCode: "",
      country: "Australia",
      fullAddress: address,
    }
    onAddressSelect(structuredAddress)
  }

  if (!apiKey) {
    return (
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Delivery Address
        </Label>
        <Input
          id="address"
          type="text"
          placeholder="Enter your full delivery address (e.g., 123 Main St, Sydney NSW 2000)"
          value={value}
          onChange={(e) => handleManualAddressChange(e.target.value)}
          className="w-full"
        />
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium">Google Maps API Key Missing</p>
              <p className="mt-1">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loadError) {
    const errorMessage = loadError.message || "Unknown error"
    const isApiKeyError =
      errorMessage.includes("ApiNotActivatedMapError") ||
      errorMessage.includes("InvalidKeyMapError") ||
      errorMessage.includes("RefererNotAllowedMapError")

    return (
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Delivery Address
        </Label>
        <Input
          id="address"
          type="text"
          placeholder="Enter your full delivery address manually"
          value={value}
          onChange={(e) => handleManualAddressChange(e.target.value)}
          className="w-full"
        />
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-medium">Google Maps API Error</p>
              <p className="mt-1">{errorMessage}</p>
              {isApiKeyError && (
                <div className="mt-2 text-xs">
                  <p className="font-medium">Common fixes:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Enable Places API in Google Cloud Console</li>
                    <li>Add your domain to API key restrictions</li>
                    <li>Enable billing (required even for free tier)</li>
                    <li>Check API key is correctly set in environment variables</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="space-y-2">
        <Label htmlFor="address">Delivery Address</Label>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading Google Maps...</span>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-500 space-y-1">
            {debugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Autocomplete
      onLoad={(ref) => {
        autocompleteRef.current = ref
        console.log("[v0] Google Maps Autocomplete loaded successfully")
      }}
      onPlaceChanged={handlePlaceChanged}
      options={{
        types: ["address"],
        componentRestrictions: { country: "au" },
        fields: ["formatted_address", "address_components", "name", "geometry"],
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Delivery Address
        </Label>
        <Input
          id="address"
          type="text"
          placeholder="Start typing your delivery address..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full"
        />
        <p className="text-xs text-green-600 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Google Maps autocomplete active
        </p>
      </div>
    </Autocomplete>
  )
}
