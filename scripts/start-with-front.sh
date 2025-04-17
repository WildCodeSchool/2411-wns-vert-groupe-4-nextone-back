#!/bin/bash

# Vérifiez si le dossier frontend existe
if [ ! -d "./frontend" ]; then
  echo "Clonage du dépôt frontend..."
  git clone https://github.com/WildCodeSchool/2411-wns-vert-groupe-4-nextone-front.git frontend
else
  echo "Le dépôt frontend existe déjà. Mise à jour..."
  cd frontend && git pull && cd ..
fi

# Lancer docker-compose
echo "Lancement de docker-compose..."
docker-compose up --build