-- Script de vérification de la colonne tokenVersion
-- À exécuter dans pgAdmin ou psql

-- 1. Vérifier si la colonne existe
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'User' 
  AND column_name = 'tokenVersion';

-- 2. Vérifier les données actuelles
SELECT id, name, email, "tokenVersion"
FROM "User"
LIMIT 5;

-- Résultat attendu :
-- La colonne tokenVersion devrait exister avec type integer et default 0
-- Tous les utilisateurs existants devraient avoir tokenVersion = 0
