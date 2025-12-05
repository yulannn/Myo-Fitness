import { useState, useEffect, useRef } from 'react'
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CityAutocompleteProps {
    value: string | null
    onChange: (city: string | null) => void
    placeholder?: string
    required?: boolean
}

interface CityResult {
    place_id: number
    display_name: string
    name: string
    lat: string
    lon: string
    address?: any
    class?: string
    type?: string
}

export default function CityAutocomplete({
    value,
    onChange,
    placeholder = 'Rechercher une ville...',
    required = false,
}: CityAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value || '')
    const [suggestions, setSuggestions] = useState<CityResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const debounceTimerRef = useRef<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Synchroniser l'input avec la valeur externe
    useEffect(() => {
        setInputValue(value || '')
    }, [value])

    // Fermer les suggestions quand on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Rechercher les villes avec debounce
    const searchCities = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([])
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query)}&` +
                `format=json&` +
                `addressdetails=1&` +
                `limit=8&` +
                `accept-language=fr`
            )

            if (response.ok) {
                const data = await response.json()
                // Filtrer pour ne garder que les lieux de type "place" (villes, communes, villages)
                // ou les éléments avec une class "boundary" et type "administrative"
                const cities = data.filter((item: any) => {
                    const isPlace = item.class === 'place'
                    const isAdministrative = item.class === 'boundary' && item.type === 'administrative'
                    const hasCity = item.address?.city || item.address?.town || item.address?.village
                    return isPlace || isAdministrative || hasCity
                })
                setSuggestions(cities.slice(0, 5))
                setShowSuggestions(true)
            }
        } catch (error) {
            console.error('Erreur lors de la recherche de villes:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Gérer le changement d'input avec debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)

        // Annuler le timer précédent
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Créer un nouveau timer
        debounceTimerRef.current = window.setTimeout(() => {
            searchCities(newValue)
        }, 300) // 300ms de délai
    }

    // Sélectionner une ville
    const handleSelectCity = (city: CityResult) => {
        // Extraire le nom de la ville de display_name
        const cityName = city.name || city.display_name.split(',')[0]
        setInputValue(cityName)
        onChange(cityName)
        setShowSuggestions(false)
        setSuggestions([])
    }

    // Effacer la sélection
    const handleClear = () => {
        setInputValue('')
        onChange(null)
        setSuggestions([])
        setShowSuggestions(false)
    }

    return (
        <div className="space-y-2" ref={containerRef}>
            <label className="text-sm font-medium text-gray-300">
                Ville {required && <span className="text-red-400">*</span>}
            </label>

            <div className="relative">
                {/* Input avec icônes */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>

                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => inputValue.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder={placeholder}
                        required={required}
                        className="w-full rounded-xl bg-[#121214] border border-[#94fbdd]/20 pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all"
                    />

                    {/* Bouton pour effacer */}
                    {inputValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}

                    {/* Indicateur de chargement */}
                    {isLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-[#94fbdd]/30 border-t-[#94fbdd] rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {/* Liste des suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 rounded-xl bg-[#121214] border border-[#94fbdd]/20 shadow-xl overflow-hidden">
                        <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#94fbdd]/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {suggestions.map((city) => (
                                <button
                                    key={city.place_id}
                                    type="button"
                                    onClick={() => handleSelectCity(city)}
                                    className="w-full text-left px-4 py-3 hover:bg-[#94fbdd]/10 transition-colors border-b border-[#94fbdd]/5 last:border-b-0"
                                >
                                    <div className="flex items-start gap-2">
                                        <MapPinIcon className="h-4 w-4 text-[#94fbdd] mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {city.name || city.display_name.split(',')[0]}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">
                                                {city.display_name}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Message si aucune suggestion */}
                {showSuggestions && !isLoading && inputValue.length >= 2 && suggestions.length === 0 && (
                    <div className="absolute z-50 w-full mt-2 rounded-xl bg-[#121214] border border-[#94fbdd]/20 p-4">
                        <p className="text-sm text-gray-400 text-center">
                            Aucune ville trouvée. Veuillez vérifier l'orthographe.
                        </p>
                    </div>
                )}
            </div>

            {/* Aide */}
            <p className="text-xs text-gray-500">
                Tapez au moins 2 caractères pour rechercher une ville
            </p>
        </div>
    )
}
