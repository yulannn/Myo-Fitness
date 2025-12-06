import { useQuery } from '@tanstack/react-query'
import { useFitnessProfilesByUser } from '../fitness-profile/useGetFitnessProfilesByUser'

interface Gym {
    id: string
    osmId: string
    name: string
    address: string
    lat: number
    lng: number
    distance?: number
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

const geocodeCity = async (cityName: string) => {
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
}

const fetchNearbyGyms = async (cityName: string): Promise<Gym[]> => {
    // Géocoder la ville
    let location = await geocodeCity(cityName)

    if (!location) {
        // Fallback sur Paris si géocodage échoue
        location = { lat: 48.8566, lng: 2.3522 }
    }

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

    // Filtres pour exclure les sports non-fitness
    const excludedSports = [
        'swimming', 'piscine', 'natation', 'bowling', 'sailing', 'voile',
        'tennis', 'golf', 'equestrian', 'équitation', 'ice_skating',
        'patinoire', 'climbing', 'escalade', 'soccer', 'football',
        'basketball', 'volleyball', 'baseball', 'rugby', 'hockey',
        'skating', 'martial_arts', 'archery', 'shooting', 'cycling'
    ]

    const fitnessKeywords = [
        'fitness', 'gym', 'musculation', 'crossfit', 'sport',
        'training', 'bodybuilding', 'coach', 'wellness'
    ]

    const gymsData: Gym[] = data.elements
        .map((element: any) => {
            const gymLat = element.lat || element.center?.lat
            const gymLng = element.lon || element.center?.lon
            const distance = calculateDistance(location.lat, location.lng, gymLat, gymLng)
            const name = element.tags?.name || 'Salle de sport'
            const sport = element.tags?.sport || ''
            const leisure = element.tags?.leisure || ''

            return {
                id: element.id.toString(),
                osmId: element.id.toString(), // OSM ID pour la liaison avec la DB
                name,
                address: element.tags?.['addr:street']
                    ? `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}`.trim()
                    : 'Adresse non disponible',
                lat: gymLat,
                lng: gymLng,
                distance: Math.round(distance * 10) / 10,
                sport,
                leisure,
            }
        })
        .filter((gym: any) => {
            if (!gym.lat || !gym.lng) return false
            if (gym.leisure === 'fitness_centre') return true

            const nameAndSport = `${gym.name} ${gym.sport}`.toLowerCase()
            const hasExcludedSport = excludedSports.some(sport =>
                nameAndSport.includes(sport)
            )
            if (hasExcludedSport) return false

            if (gym.leisure === 'sports_centre') {
                return fitnessKeywords.some(keyword =>
                    nameAndSport.includes(keyword)
                )
            }

            return true
        })
        .map(({ sport, leisure, ...gym }: any) => gym)

    gymsData.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    return gymsData
}

export const useNearbyGyms = () => {
    const { data: fitnessProfile } = useFitnessProfilesByUser()
    const city = fitnessProfile?.city || 'Paris' // Fallback sur Paris

    return useQuery({
        queryKey: ['nearbyGyms', city],
        queryFn: () => fetchNearbyGyms(city),
        enabled: !!city, // Ne s'exécute que si la ville existe
        staleTime: 1000 * 60 * 60 * 24, // 24 heures - les salles ne changent pas souvent
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 jours en cache
        retry: 2, // Réessayer 2 fois en cas d'échec
    })
}
