export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  libraries: ["places", "geometry"] as const,
  region: "AU",
  language: "en",
  preventGoogleFontsLoading: true,
}

export const validateGoogleMapsSetup = () => {
  const issues: string[] = []

  if (!GOOGLE_MAPS_CONFIG.apiKey) {
    issues.push("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable is missing")
  }

  if (GOOGLE_MAPS_CONFIG.apiKey && GOOGLE_MAPS_CONFIG.apiKey.length < 30) {
    issues.push("Google Maps API key appears to be invalid (too short)")
  }

  return {
    isValid: issues.length === 0,
    issues,
    config: GOOGLE_MAPS_CONFIG,
  }
}

export const logGoogleMapsDebugInfo = () => {
  const validation = validateGoogleMapsSetup()

  console.group("[v0] Google Maps Configuration")
  console.log("API Key Present:", !!GOOGLE_MAPS_CONFIG.apiKey)
  console.log("API Key Length:", GOOGLE_MAPS_CONFIG.apiKey.length)
  console.log("Environment:", process.env.NODE_ENV)
  console.log("Domain:", typeof window !== "undefined" ? window.location.hostname : "server")
  console.log("Validation:", validation)
  console.groupEnd()

  return validation
}
