import { UsersIcon } from '@heroicons/react/24/outline';
import { getImageUrl } from '../../utils/imageUtils';

interface AvatarProps {
    imageUrl?: string | null;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
};

const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
};

export default function Avatar({ imageUrl, name, size = 'md', className = '' }: AvatarProps) {
    const sizeClass = sizeClasses[size];
    const iconSize = iconSizeClasses[size];

    // Générer une couleur basée sur la première lettre du nom
    const getColorFromName = (name: string) => {
        const colors = [
            'from-purple-500 to-pink-500',
            'from-blue-500 to-cyan-500',
            'from-green-500 to-teal-500',
            'from-yellow-500 to-orange-500',
            'from-pink-500 to-rose-500',
            'from-indigo-500 to-purple-500',
            'from-red-500 to-pink-500',
            'from-teal-500 to-green-500',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const firstLetter = (name || 'U')[0].toUpperCase();
    const gradientColor = getColorFromName(name);

    return (
        <div className={`${sizeClass} rounded-full bg-[#252527] overflow-hidden border-2 border-purple-500/20 flex-shrink-0 ${className}`}>
            {imageUrl ? (
                <img
                    src={getImageUrl(imageUrl)}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Si l'image ne charge pas, afficher le fallback
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                            parent.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br ${gradientColor}">
                  <span class="text-white font-bold text-${size === 'sm' ? 'sm' : size === 'md' ? 'base' : 'lg'}">${firstLetter}</span>
                </div>
              `;
                        }
                    }}
                />
            ) : (
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradientColor}`}>
                    <span className={`text-white font-bold ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}`}>
                        {firstLetter}
                    </span>
                </div>
            )}
        </div>
    );
}
