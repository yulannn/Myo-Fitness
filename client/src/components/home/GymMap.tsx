import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, LatLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPinIcon } from '@heroicons/react/24/outline'

// Types
interface Gym {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  distance?: number
}

interface UserLocation {
  lat: number
  lng: number
}

// Composant pour recentrer la carte sur la position de l'utilisateur
function MapController({ center }: { center: LatLng }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])

  return null
}

// Icône personnalisée pour les marqueurs de gym
const gymIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#94fbdd" width="32" height="32">
      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

// Icône pour la position de l'utilisateur
const userIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24">
      <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
})

export default function GymMap() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Obtenir la position de l'utilisateur
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(userLoc)
          fetchNearbyGyms(userLoc)
        },
        (err) => {
          console.error('Erreur de géolocalisation:', err)
          // Position par défaut (Paris) si l'utilisateur refuse la géolocalisation
          const defaultLoc = { lat: 48.8566, lng: 2.3522 }
          setUserLocation(defaultLoc)
          setError('Impossible de récupérer votre position. Affichage de Paris par défaut.')
          fetchNearbyGyms(defaultLoc)
        }
      )
    } else {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.')
      const defaultLoc = { lat: 48.8566, lng: 2.3522 }
      setUserLocation(defaultLoc)
      fetchNearbyGyms(defaultLoc)
    }
  }, [])

  // Fonction pour calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Récupérer les salles de sport à proximité via Overpass API (OpenStreetMap)
  const fetchNearbyGyms = async (location: UserLocation) => {
    setLoading(true)
    try {
      // Requête Overpass pour trouver les salles de sport dans un rayon de 5km
      const radius = 5000 // 5km en mètres
      const query = `
        [out:json][timeout:25];
        (
          node["leisure"="fitness_centre"](around:${radius},${location.lat},${location.lng});
          way["leisure"="fitness_centre"](around:${radius},${location.lat},${location.lng});
          node["leisure"="sports_centre"](around:${radius},${location.lat},${location.lng});
          way["leisure"="sports_centre"](around:${radius},${location.lat},${location.lng});
        );
        out center;
      `

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données')
      }

      const data = await response.json()

      // Transformer les données en format utilisable
      const gymsData: Gym[] = data.elements.map((element: any) => {
        const lat = element.lat || element.center?.lat
        const lng = element.lon || element.center?.lon
        const distance = calculateDistance(location.lat, location.lng, lat, lng)

        return {
          id: element.id.toString(),
          name: element.tags?.name || 'Salle de sport',
          address: element.tags?.['addr:street']
            ? `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}`.trim()
            : 'Adresse non disponible',
          lat,
          lng,
          distance: Math.round(distance * 10) / 10, // Arrondir à 1 décimale
        }
      }).filter((gym: Gym) => gym.lat && gym.lng)

      // Trier par distance
      gymsData.sort((a, b) => (a.distance || 0) - (b.distance || 0))

      setGyms(gymsData)
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors de la récupération des salles de sport:', err)
      setError('Impossible de charger les salles de sport à proximité.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#252527] rounded-3xl border border-[#94fbdd]/20 p-8 h-[600px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#94fbdd]/20 border-t-[#94fbdd] mx-auto"></div>
          <p className="text-gray-400">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  if (!userLocation) {
    return (
      <div className="bg-[#252527] rounded-3xl border border-red-500/20 p-8 h-[600px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <MapPinIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-red-400">Impossible de récupérer votre position</p>
          {error && <p className="text-sm text-gray-400">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
          <MapPinIcon className="h-6 w-6 text-[#94fbdd]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Salles de sport à proximité</h2>
          <p className="text-sm text-gray-400">
            {gyms.length} salle{gyms.length > 1 ? 's' : ''} trouvée{gyms.length > 1 ? 's' : ''} dans un rayon de 5km
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      {/* Map Container */}
      <div className="bg-[#252527] rounded-3xl border border-[#94fbdd]/20 overflow-hidden shadow-xl shadow-[#94fbdd]/5">
        <div className="h-[600px] relative">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController center={new LatLng(userLocation.lat, userLocation.lng)} />

            {/* Marqueur de l'utilisateur */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-sm">Vous êtes ici</p>
                </div>
              </Popup>
            </Marker>

            {/* Marqueurs des salles de sport */}
            {gyms.map((gym) => (
              <Marker
                key={gym.id}
                position={[gym.lat, gym.lng]}
                icon={gymIcon}
              >
                <Popup>
                  <div className="space-y-2 min-w-[200px]">
                    <h3 className="font-bold text-base text-[#121214]">{gym.name}</h3>
                    <p className="text-sm text-gray-600">{gym.address}</p>
                    {gym.distance && (
                      <p className="text-sm font-semibold text-[#94fbdd]">
                        📍 {gym.distance} km
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Liste des salles en dessous */}
        {gyms.length > 0 && (
          <div className="p-6 bg-[#1a1a1c] border-t border-[#94fbdd]/10">
            <h3 className="text-lg font-bold text-white mb-4">Liste des salles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              {gyms.slice(0, 9).map((gym) => (
                <div
                  key={gym.id}
                  className="bg-[#252527] rounded-xl p-4 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all"
                >
                  <h4 className="font-semibold text-white text-sm mb-1">{gym.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{gym.address}</p>
                  {gym.distance && (
                    <p className="text-xs font-semibold text-[#94fbdd]">
                      {gym.distance} km
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
