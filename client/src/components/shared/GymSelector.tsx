import { useState, useMemo } from 'react'
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Gym {
    id: string
    name: string
    address: string
    lat: number
    lng: number
    distance?: number
}

interface GymSelectorProps {
    gyms: Gym[]
    selectedGym: Gym | null
    onSelectGym: (gym: Gym | null) => void
    isLoading?: boolean
}

export default function GymSelector({ gyms, selectedGym, onSelectGym, isLoading }: GymSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const filteredGyms = useMemo(() => {
        if (!searchQuery.trim()) return gyms.slice(0, 10)

        const query = searchQuery.toLowerCase()
        return gyms
            .filter(gym =>
                gym.name.toLowerCase().includes(query) ||
                gym.address.toLowerCase().includes(query)
            )
            .slice(0, 10)
    }, [gyms, searchQuery])

    const handleSelect = (gym: Gym) => {
        onSelectGym(gym)
        setIsOpen(false)
        setSearchQuery('')
    }

    const handleClear = () => {
        onSelectGym(null)
        setSearchQuery('')
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
                Salle de sport (optionnel)
            </label>

            {selectedGym ? (
                <div className="flex items-center gap-2 p-3 bg-[#94fbdd]/10 border border-[#94fbdd]/30 rounded-xl">
                    <MapPinIcon className="h-5 w-5 text-[#94fbdd] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{selectedGym.name}</p>
                        <p className="text-xs text-gray-400 truncate">{selectedGym.address}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-white" />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full px-4 py-3 bg-[#121214] border border-gray-700 rounded-xl text-left text-gray-400 hover:border-[#94fbdd]/50 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <MapPinIcon className="h-5 w-5" />
                            <span className="text-sm">Sélectionner une salle...</span>
                        </div>
                    </button>

                    {isOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-[#1a1a1c] border border-[#94fbdd]/20 rounded-xl shadow-xl overflow-hidden">
                            <div className="p-3 border-b border-gray-700">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher une salle..."
                                        className="w-full pl-10 pr-4 py-2 bg-[#121214] border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd]"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-4 text-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#94fbdd]/30 border-t-[#94fbdd] mx-auto"></div>
                                        <p className="text-xs text-gray-400 mt-2">Chargement...</p>
                                    </div>
                                ) : filteredGyms.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400 text-sm">
                                        {searchQuery ? 'Aucune salle trouvée' : 'Aucune salle disponible'}
                                    </div>
                                ) : (
                                    filteredGyms.map((gym) => (
                                        <button
                                            key={gym.id}
                                            type="button"
                                            onClick={() => handleSelect(gym)}
                                            className="w-full p-3 hover:bg-[#94fbdd]/10 transition-colors text-left border-b border-gray-800 last:border-b-0"
                                        >
                                            <div className="flex items-start gap-3">
                                                <MapPinIcon className="h-5 w-5 text-[#94fbdd] flex-shrink-0 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">{gym.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{gym.address}</p>
                                                    {gym.distance !== undefined && (
                                                        <p className="text-xs text-[#94fbdd] mt-1">
                                                            {gym.distance < 1
                                                                ? `${Math.round(gym.distance * 1000)}m`
                                                                : `${gym.distance.toFixed(1)}km`
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="p-2 bg-[#121214] border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full p-2 text-xs text-gray-400 hover:text-white transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
