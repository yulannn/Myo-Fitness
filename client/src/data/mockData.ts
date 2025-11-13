import type {
  AiRecommendation,
  EquipmentItem,
  Exercise,
  FitnessProfile,
  Friend,
  FriendRequest,
  SessionSetPerformance,
  TrainingProgram,
  User,
} from '../types'

import avatarAlice from '../assets/react.svg'

const now = new Date()
const iso = (date: Date) => date.toISOString()

export const mockUser: User = {
  id: 1,
  name: 'Alicia Martin',
  email: 'alicia.martin@example.com',
  avatarUrl: avatarAlice,
  joinedAt: iso(new Date(now.getFullYear(), now.getMonth() - 5, 12)),
  streak: 12,
  totalWorkouts: 146,
  totalVolume: 18750,
  currentGoal: 'MUSCLE_GAIN',
  fitnessProfiles: [],
}

export const mockFitnessProfiles: FitnessProfile[] = [
  {
    id: 1,
    nickname: 'Strength & Hypertrophy',
    userId: 1,
    age: 28,
    height: 172,
    currentWeight: 68,
    trainingFrequency: 5,
    experienceLevel: 'INTERMEDIATE',
    goals: ['MUSCLE_GAIN', 'ENDURANCE'],
    gender: 'FEMALE',
    bodyWeight: false,
    weightHistory: Array.from({ length: 12 }).map((_, index) => ({
      date: iso(new Date(now.getFullYear(), now.getMonth() - (11 - index), 1)),
      weight: 64 + index * 0.35,
    })),
    activeProgramId: 1,
  },
]

mockUser.fitnessProfiles = mockFitnessProfiles

export const mockPrograms: TrainingProgram[] = [
  {
    id: 1,
    name: 'PPL + Upper Lower',
    description: 'Programme hybride axé sur la force haut du corps et l’endurance jambes.',
    template: 'PUSH_PULL_LEGS_UPPER_LOWER',
    status: 'ACTIVE',
    createdAt: iso(new Date(now.getFullYear(), now.getMonth() - 1, 3)),
    lastUpdated: iso(now),
    sessions: [
      {
        id: 101,
        name: 'Push Day - Puissance',
        focus: 'Chest & Shoulders',
        notes: 'Accent sur tempo contrôlé et amplitude complète.',
        scheduledDate: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)),
        durationMinutes: 70,
        exercices: [
          {
            id: 1,
            name: 'Développé couché barre',
            sets: 4,
            reps: 6,
            weight: 45,
            muscleGroups: ['Pectoraux', 'Épaules'],
            equipment: ['Barre', 'Banc'],
            difficulty: 4,
            tempo: '3-1-1',
          },
          {
            id: 2,
            name: 'Développé militaire haltères',
            sets: 3,
            reps: 10,
            weight: 18,
            muscleGroups: ['Épaules', 'Triceps'],
            equipment: ['Haltères'],
            difficulty: 3,
          },
          {
            id: 3,
            name: 'Pompes déclinées',
            sets: 3,
            reps: 15,
            muscleGroups: ['Pectoraux', 'Triceps'],
            equipment: [],
            difficulty: 2,
          },
        ],
      },
      {
        id: 102,
        name: 'Pull Day - Volume',
        focus: 'Dos & biceps',
        notes: 'Prioriser contraction scapulaire et écart entre les séries.',
        scheduledDate: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3)),
        durationMinutes: 65,
        exercices: [
          {
            id: 4,
            name: 'Tractions pronation assistées',
            sets: 4,
            reps: 8,
            muscleGroups: ['Dos', 'Biceps'],
            equipment: ['Machine assistée'],
            difficulty: 3,
          },
          {
            id: 5,
            name: 'Rowing unilatéral haltère',
            sets: 3,
            reps: 12,
            weight: 22,
            muscleGroups: ['Dos'],
            equipment: ['Haltères', 'Banc'],
            difficulty: 3,
          },
        ],
      },
      {
        id: 103,
        name: 'Legs - Force & Plyo',
        focus: 'Jambes complètes',
        notes: 'Superset force + pliométrie.',
        scheduledDate: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5)),
        durationMinutes: 75,
        exercices: [
          {
            id: 6,
            name: 'Squat avant',
            sets: 5,
            reps: 5,
            weight: 60,
            muscleGroups: ['Quadriceps', 'Tronc'],
            equipment: ['Barre'],
            difficulty: 4,
          },
          {
            id: 7,
            name: 'Fentes sautées',
            sets: 3,
            reps: 12,
            muscleGroups: ['Quadriceps', 'Fessiers'],
            equipment: [],
            difficulty: 3,
            notes: 'Mettre l’accent sur la stabilité.',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Full Body Express',
    description: 'Programme minimaliste orienté mobilité + cardio léger.',
    template: 'FULL_BODY',
    status: 'ARCHIVED',
    createdAt: iso(new Date(now.getFullYear(), now.getMonth() - 3, 18)),
    lastUpdated: iso(new Date(now.getFullYear(), now.getMonth() - 1, 2)),
    sessions: [
      {
        id: 201,
        name: 'Full Body A',
        focus: 'Mobilité + Force',
        scheduledDate: iso(new Date(now.getFullYear(), now.getMonth() - 2, 5)),
        exercices: [
          {
            id: 8,
            name: 'Soulevé de terre kettlebell',
            sets: 3,
            reps: 12,
            weight: 28,
            muscleGroups: ['Dos', 'Fessiers'],
            equipment: ['Kettlebell'],
            difficulty: 2,
          },
          {
            id: 9,
            name: 'Planche dynamique',
            sets: 4,
            reps: 40,
            muscleGroups: ['Core'],
            equipment: [],
            difficulty: 2,
          },
        ],
      },
    ],
  },
]

export const mockExercises: Exercise[] = [
  {
    id: 1,
    name: 'Développé couché barre',
    type: 'COMPOUND',
    difficulty: 4,
    description:
      'Mouvement polyarticulaire ciblant la chaîne antérieure, idéal pour développer la force des pectoraux.',
    isDefault: true,
    muscleGroups: ['Pectoraux', 'Triceps', 'Épaules'],
    equipment: ['Barre', 'Banc'],
    bodyWeight: false,
    materials: true,
    tips: [
      'Coudes à 45°',
      'Pieds bien ancrés dans le sol',
      'Utiliser un spotter sur charges lourdes',
    ],
  },
  {
    id: 2,
    name: 'Tractions pronation',
    type: 'COMPOUND',
    difficulty: 3,
    description: 'Excellent mouvement pour renforcer le dos et améliorer la posture.',
    isDefault: true,
    muscleGroups: ['Grand dorsal', 'Biceps', 'Épaules'],
    equipment: ['Barre de traction'],
    bodyWeight: true,
    materials: false,
    tips: ['Gainage actif', 'Trajectoire verticale', 'Descendre en contrôle'],
  },
  {
    id: 3,
    name: 'Hip Thrust',
    type: 'COMPOUND',
    difficulty: 3,
    description: 'Cesarte un pic de contraction sur les fessiers tout en protégeant le bas du dos.',
    isDefault: false,
    muscleGroups: ['Fessiers', 'Ischio-jambiers'],
    equipment: ['Barre', 'Banc'],
    bodyWeight: false,
    materials: true,
    tips: ['Menton vers la poitrine', 'Pause en haut', 'Utiliser ceinture si besoin'],
  },
  {
    id: 4,
    name: 'Mountain climbers',
    type: 'CARDIO',
    difficulty: 2,
    description: 'Idéal pour le cardio et le gainage dynamique.',
    isDefault: true,
    muscleGroups: ['Core', 'Épaules'],
    equipment: [],
    bodyWeight: true,
    materials: false,
    tips: ['Alignement épaules-poignets', 'Rythme contrôlé', 'Respiration régulière'],
  },
]

export const mockEquipment: EquipmentItem[] = [
  {
    id: 1,
    name: 'Barre olympique 15kg',
    description: 'Parfaite pour les athlètes intermédiaires recherchant précision et grip fiable.',
    category: 'Force',
  },
  {
    id: 2,
    name: 'Kettlebell 20kg',
    description: 'Format compétition, poignée texturée pour les circuits de conditioning.',
    category: 'Conditioning',
  },
  {
    id: 3,
    name: 'Banc inclinable',
    description: 'Réglages multipositions, idéal pour la stabilité lors des presses.',
    category: 'Accessoires',
  },
  {
    id: 4,
    name: 'Élastique de résistance',
    description: 'Différentes tensions pour activation musculaire et mobilité.',
    category: 'Mobilité',
  },
]

export const mockFriendRequests: FriendRequest[] = [
  {
    id: 'req-1',
    from: 'Lucas P.',
    mutualWorkouts: 4,
    status: 'PENDING',
    message: 'On s’est croisés aux HIIT du mardi, partant pour un entrainement commun ?',
    sentAt: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)),
  },
  {
    id: 'req-2',
    from: 'Mélanie S.',
    mutualWorkouts: 2,
    status: 'PENDING',
    message: 'Je cherche une partenaire pour le prochain challenge 10k steps.',
    sentAt: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5)),
  },
]

export const mockFriends: Friend[] = [
  {
    id: 11,
    name: 'Omar',
    goal: 'MUSCLE_GAIN',
    streak: 23,
    avatarUrl: avatarAlice,
    lastWorkout: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)),
  },
  {
    id: 12,
    name: 'Léa',
    goal: 'ENDURANCE',
    streak: 8,
    avatarUrl: avatarAlice,
    lastWorkout: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3)),
  },
  {
    id: 13,
    name: 'Noah',
    goal: 'WEIGHT_LOSS',
    streak: 15,
    avatarUrl: avatarAlice,
    lastWorkout: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)),
  },
]

export const mockPerformances: SessionSetPerformance[] = [
  {
    id: 1,
    exerciceName: 'Développé couché barre',
    sessionName: 'Push Day - Puissance',
    date: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)),
    repsCompleted: 7,
    repsTarget: 6,
    weight: 47.5,
    rpe: 9,
    success: true,
  },
  {
    id: 2,
    exerciceName: 'Tractions pronation assistées',
    sessionName: 'Pull Day - Volume',
    date: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4)),
    repsCompleted: 8,
    repsTarget: 8,
    weight: 0,
    rpe: 8,
    success: true,
  },
  {
    id: 3,
    exerciceName: 'Squat avant',
    sessionName: 'Legs - Force & Plyo',
    date: iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)),
    repsCompleted: 4,
    repsTarget: 5,
    weight: 62.5,
    rpe: 10,
    success: false,
  },
]

export const mockRecommendations: AiRecommendation[] = [
  {
    id: 'ai-1',
    title: 'Session focus tronc',
    summary:
      'Intègre un bloc core de 10 minutes en fin de séance pour stabiliser tes charges lourdes.',
    focusArea: 'Core',
    actions: ['3x Pallof press', '3x Dead bug tempo', '2x Farmer carry lourd'],
  },
  {
    id: 'ai-2',
    title: 'Récupération active',
    summary:
      'Ton RPE moyen sur les derniers entraînements dépasse 8. Ajoute une séance mobilité longue.',
    focusArea: 'Recovery',
    actions: ['Séance mobilité 30min', 'Respiration diaphragmatique', 'Bain froid 3 min'],
  },
]

