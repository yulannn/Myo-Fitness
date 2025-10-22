# Exercise recommendation summary

Les figures suivantes résument les analyses effectuées sur les jeux de données fournis et expliquent pourquoi certains exercices sont recommandés pour différents profils.

- **Figures générées** (dans le dossier `figures/`):
  - `calories_distribution.png`: distribution des calories brûlées
  - `calories_vs_duration.png`: calories vs durée (par genre)
  - `calories_bmi_kde.png`: distribution du BMI
  - `exercise_intensity_calories_box.png`: calories par niveau d'intensité
  - `top20_exercises.png`: top 20 exercices (par fréquence)
  - `gym_members_corr_heatmap.png`: heatmap des corrélations
  - `top10_age_<18_gender_Female.png`, `top10_age_18-30_gender_Male.png`, ... : top10 par tranche d'âge et genre

## Points clés

- **Utilité principale des données**: les datasets permettent d'estimer la dépense calorique moyenne par exercice, de mesurer l'intensité relative et de segmenter par profils (âge / genre / BMI). Ces éléments sont essentiels pour recommander des exercices adaptés à la capacité et aux objectifs d'un utilisateur.

- **Corrélations notables**: la heatmap (`gym_members_corr_heatmap.png`) montre des corrélations faibles entre la plupart des variables mesurées; les plus fortes relations trouvées (en valeur absolue) sont entre `Calories_Burned` et la fréquence cardiaque (Avg_BPM), et entre `Resting_BPM` et `Calories_Burned` (faible négatif). Ces relations indiquent qu'on peut affiner les recommandations en intégrant mesures cardiaques.

- **Top exercices globaux**: le fichier `top_exercises_overall.csv` contient les exercices classés selon un score heuristique (moyenne de calories et intensité). Le graphique `top20_exercises_overall.png` illustre les meilleurs candidats pour programmes orientés dépense calorique/haute intensité.

- **Recommandations par profil**: pour chaque tranche d'âge et genre nous avons généré un top10 (`top_exercises_age_<bucket>_gender_<Gender>.csv`) et une image associée. Ces listes favorisent:
  - **Jeunes (18-30)**: exercices à plus haute intensité et dépense calorique élevée
  - **Tranche 31-45**: exercices équilibrés intensité/durée
  - **Seniors (60+)**: exercices à intensité modérée, durée contrôlée et faible impact

## Fichiers produits

- `exercise_stats.csv` — stats par exercice (moyennes). 
- `top_exercises_overall.csv` — classement global.
- `top_exercises_age_..._gender_....csv` — classements par profil (âge x genre).
- Figures PNG dans `figures/`.

## Suites recommandées

1. Collecter des timestamps et historique utilisateur pour suivre progression et améliorer recommandations personnalisées (séances, sets/reps/charge, feedback).  
2. Enrichir les données d'exercice (mapping muscles, niveau de difficulté) pour affinage des programmes.  
3. Intégrer un endpoint API qui prend un profil utilisateur et renvoie un top N d'exercices (je peux l'implémenter dans `Myo-Fitness/api/src/ia`).

---

![Calories distribution](figures/calories_distribution.png)

![Calories vs Duration](figures/calories_vs_duration.png)

![Top 20 exercises](figures/top20_exercises.png)
