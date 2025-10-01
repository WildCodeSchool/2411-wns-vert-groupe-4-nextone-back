#!/bin/sh

HEALTHCHECK_URL="http://localhost:4005/graphql?query=%7B__typename%7D"

echo "Seeding..."
npm run seed:script

echo "Démarrage du serveur backend..."
npm run start


echo "Attente que le conteneur devienne healthy..."

timeout=60
while ! curl -fs $HEALTHCHECK_URL -H 'Apollo-Require-Preflight: true'; do
    sleep 5
    timeout=$((timeout - 5))
    if [ $timeout -le 0 ]; then
        echo "Timeout: le conteneur n'est pas healthy après 60 secondes."
        exit 1
    fi
done

wait
exec"$@"