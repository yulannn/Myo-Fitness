import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { MapPinIcon, ListBulletIcon, MapIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useFitnessProfilesByUser } from '../../api/hooks/fitness-profile/useGetFitnessProfilesByUser'

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

// Icône pour les marqueurs
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

// Skeleton loader
const GymCardSkeleton = () => (
  <div className="bg-[#1a1a1c] rounded-2xl p-4 border border-[#94fbdd]/10 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 bg-[#94fbdd]/10 rounded-xl"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#94fbdd]/10 rounded w-3/4"></div>
        <div className="h-3 bg-[#94fbdd]/5 rounded w-full"></div>
        <div className="h-3 bg-[#94fbdd]/5 rounded w-1/2"></div>
      </div>
    </div>
  </div>
)

export default function GymMap() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceTimerRef = useRef<number | null>(null)

  const { data: fitnessProfile, isLoading: isLoadingProfile } = useFitnessProfilesByUser()

  // Debounce de la recherche pour optimiser les performances
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = window.setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery])

  const geocodeCity = useCallback(async (cityName: string): Promise<UserLocation | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(cityName)}&format=json&limit=1`
      )

      if (!response.ok) throw new Error('Erreur lors du géocodage de la ville')

      const data = await response.json()

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        }
      }

      return null
    } catch (err) {
      console.error('Erreur lors du géocodage:', err)
      return null
    }
  }, [])

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  const fetchNearbyGyms = useCallback(async (location: UserLocation) => {
    setLoading(true)
    try {
      const radius = 5000
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

      if (!response.ok) throw new Error('Erreur lors de la récupération des données')

      const data = await response.json()

      // Liste des sports/activités à exclure (pas des salles de fitness)
      const excludedSports = [
        'swimming', 'piscine', 'natation',
        'bowling',
        'sailing', 'voile',
        'tennis',
        'golf',
        'equestrian', 'équitation',
        'ice_skating', 'patinoire',
        'climbing', 'escalade',
        'soccer', 'football',
        'basketball',
        'volleyball',
        'baseball',
        'rugby',
        'hockey',
        'skating',
        'martial_arts',
        'archery',
        'shooting',
        'cycling'
      ]

      // Mots-clés positifs pour identifier les vraies salles de fitness
      const fitnessKeywords = [
        'fitness', 'gym', 'musculation', 'crossfit', 'sport',
        'training', 'bodybuilding', 'coach', 'wellness'
      ]

      const gymsData: Gym[] = data.elements
        .map((element: any) => {
          const lat = element.lat || element.center?.lat
          const lng = element.lon || element.center?.lon
          const distance = calculateDistance(location.lat, location.lng, lat, lng)
          const name = element.tags?.name || 'Salle de sport'
          const sport = element.tags?.sport || ''
          const leisure = element.tags?.leisure || ''

          return {
            id: element.id.toString(),
            name,
            address: element.tags?.['addr:street']
              ? `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}`.trim()
              : 'Adresse non disponible',
            lat,
            lng,
            distance: Math.round(distance * 10) / 10,
            sport,
            leisure,
          }
        })
        .filter((gym: any) => {
          // Vérifier que lat/lng existent
          if (!gym.lat || !gym.lng) return false

          // Si c'est explicitement un fitness_centre, on garde
          if (gym.leisure === 'fitness_centre') return true

          const nameAndSport = `${gym.name} ${gym.sport}`.toLowerCase()

          // Exclure si contient un sport non-fitness
          const hasExcludedSport = excludedSports.some(sport =>
            nameAndSport.includes(sport)
          )
          if (hasExcludedSport) return false

          // Si c'est un sports_centre, vérifier qu'il a des mots-clés fitness
          if (gym.leisure === 'sports_centre') {
            return fitnessKeywords.some(keyword =>
              nameAndSport.includes(keyword)
            )
          }

          return true
        })
        .map(({ sport, leisure, ...gym }: any) => gym) // Retirer les champs temporaires

      gymsData.sort((a, b) => (a.distance || 0) - (b.distance || 0))

      setGyms(gymsData)
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors de la récupération des salles de sport:', err)
      setError('Impossible de charger les salles de sport à proximité.')
      setLoading(false)
    }
  }, [calculateDistance])

  useEffect(() => {
    const loadLocation = async () => {
      if (isLoadingProfile) return

      if (fitnessProfile?.city) {
        const location = await geocodeCity(fitnessProfile.city)

        if (location) {
          setUserLocation(location)
          fetchNearbyGyms(location)
        } else {
          const defaultLoc = { lat: 48.8566, lng: 2.3522 }
          setUserLocation(defaultLoc)
          setError(`Impossible de localiser la ville "${fitnessProfile.city}". Affichage de Paris par défaut.`)
          fetchNearbyGyms(defaultLoc)
        }
      } else {
        const defaultLoc = { lat: 48.8566, lng: 2.3522 }
        setUserLocation(defaultLoc)
        setError('Veuillez ajouter une ville à votre profil fitness. Affichage de Paris par défaut.')
        fetchNearbyGyms(defaultLoc)
      }
    }

    loadLocation()
  }, [fitnessProfile, isLoadingProfile, geocodeCity, fetchNearbyGyms])

  // Filtrer les salles selon la recherche debouncée
  const filteredGyms = useMemo(() => {
    if (!debouncedSearch.trim()) return gyms

    const query = debouncedSearch.toLowerCase()
    return gyms.filter(gym =>
      gym.name.toLowerCase().includes(query) ||
      gym.address.toLowerCase().includes(query)
    )
  }, [gyms, debouncedSearch])

  // Salles à afficher selon le mode et la recherche
  const displayedGyms = useMemo(() => {
    // En mode carte, toujours afficher toutes les salles filtrées
    if (viewMode === 'map') return filteredGyms

    // En mode liste :
    // - Si recherche active : afficher toutes les salles correspondantes
    // - Sinon : limiter à 5 salles
    return debouncedSearch.trim() ? filteredGyms : filteredGyms.slice(0, 5)
  }, [filteredGyms, viewMode, debouncedSearch])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-[#94fbdd]/10 rounded-xl">
            <MapPinIcon className="h-6 w-6 text-[#94fbdd]" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              Salles de sport {fitnessProfile?.city ? `à ${fitnessProfile.city}` : ''}
            </h2>
            <p className="text-xs text-gray-400">
              {filteredGyms.length} salle{filteredGyms.length > 1 ? 's' : ''} trouvée{filteredGyms.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex bg-[#1a1a1c] rounded-xl p-1 border border-[#94fbdd]/10">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#94fbdd]/10 text-[#94fbdd]' : 'text-gray-400 hover:text-white'
              }`}
            aria-label="Voir en liste"
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-[#94fbdd]/10 text-[#94fbdd]' : 'text-gray-400 hover:text-white'
              }`}
            aria-label="Voir sur la carte"
          >
            <MapIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3">
          <p className="text-yellow-400 text-xs">{error}</p>
        </div>
      )}

      {/* Recherche */}
      {!loading && gyms.length > 0 && (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une salle..."
            className="w-full rounded-xl bg-[#1a1a1c] border border-[#94fbdd]/10 pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all text-sm"
          />
          {debouncedSearch !== searchQuery && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-[#94fbdd]/30 border-t-[#94fbdd] rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <GymCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredGyms.length === 0 ? (
        <div className="bg-[#252527] rounded-2xl p-12 border border-[#94fbdd]/10 text-center">
          <MapPinIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            {debouncedSearch ? 'Aucune salle ne correspond à votre recherche' : 'Aucune salle trouvée'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {displayedGyms.map((gym, index) => (
            <div
              key={gym.id}
              className="bg-[#252527] rounded-2xl p-4 border border-[#94fbdd]/10 hover:border-[#94fbdd]/30 transition-all group cursor-pointer"
              style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-[#94fbdd]/10 rounded-xl flex items-center justify-center group-hover:bg-[#94fbdd]/20 transition-colors">
                    <span className="text-[#94fbdd] font-bold text-lg">#{index + 1}</span>
                  </div>
                  {gym.distance && gym.distance < 1 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#252527]"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white mb-1 truncate group-hover:text-[#94fbdd] transition-colors">
                    {gym.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">
                    {gym.address}
                  </p>

                  {gym.distance !== undefined && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#94fbdd]/10 border border-[#94fbdd]/20">
                      <MapPinIcon className="h-3.5 w-3.5 text-[#94fbdd]" />
                      <span className="text-xs font-semibold text-[#94fbdd]">
                        {gym.distance < 1 ? `${Math.round(gym.distance * 1000)}m` : `${gym.distance.toFixed(1)}km`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-gray-600 group-hover:text-[#94fbdd] transition-all group-hover:translate-x-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
          {!debouncedSearch && filteredGyms.length > 5 && (
            <div className="text-center py-3">
              <p className="text-xs text-gray-500">
                +{filteredGyms.length - 5} autre{filteredGyms.length - 5 > 1 ? 's' : ''} salle{filteredGyms.length - 5 > 1 ? 's' : ''} à {fitnessProfile?.city}.
                <span className="text-[#94fbdd] ml-1">Recherchez pour voir plus</span>
              </p>
            </div>
          )}
        </div>
      ) : userLocation ? (
        <div className="bg-[#252527] rounded-2xl border border-[#94fbdd]/20 overflow-hidden h-[500px]">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {displayedGyms.map((gym) => (
              <Marker key={gym.id} position={[gym.lat, gym.lng]} icon={gymIcon}>
                <Popup>
                  <div className="space-y-2 min-w-[180px]">
                    <h3 className="font-bold text-sm">{gym.name}</h3>
                    <p className="text-xs text-gray-600">{gym.address}</p>
                    {gym.distance && (
                      <p className="text-xs font-semibold text-[#94fbdd]">
                        📍 {gym.distance}km
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : null}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Forcer le z-index de la carte Leaflet pour qu'elle reste sous la navbar */
        .leaflet-container,
        .leaflet-pane,
        .leaflet-map-pane {
          z-index: 1 !important;
        }
        
        /* Les contrôles de la carte doivent rester visibles mais sous la navbar */
        .leaflet-control-container {
          z-index: 10 !important;
        }
      `}</style>
    </div>
  )
}
