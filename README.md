# NextOne - Backend

NextOne est une application de gestion de file d’attente développée dans le cadre de notre formation. 
Ce projet a été réalisé en collaboration avec trois autres développeurs en alternance afin de mettre en pratique 
l’ensemble des compétences acquises tout au long de l’année.

---

## 🌟 Points forts de NextOne

- **🕒 Gain de temps** : plus de longues attentes, chaque visiteur sait exactement quand c’est son tour.  
- **⚙️ Organisation optimisée** : les opérateurs gèrent les files facilement grâce à une vision claire et actualisée.  
- **📡 Communication en temps réel** : les subscriptions assurent une synchronisation instantanée entre toutes les interfaces.  
- **💡 Expérience moderne et accessible** : solution adaptable à différents types de structures (mairies, banques, hôpitaux etc.).  

---

## ⚙️ Stack technique

- **Node.js**
- **Express.js** 
- **TypeScript** 
- **PostgreSQL** : base de données relationnelle robuste et performante.  
- **GraphQL** : API flexible pour les requêtes et mutations.  
- **Jest** : framework de tests pour assurer la fiabilité du code.  

---

## 🏗️ Architecture de l’application

NextOne utilise une **architecture en trois couches** pour garantir robustesse, évolutivité et maintenabilité :

### Couche présentation
- Sert d’interface avec le frontend.  
- **Resolvers** : gèrent les requêtes GraphQL et appellent les services correspondants.  

### Couche métier
- Contient la logique métier et les règles applicatives.  
- **Services** : implémentent les règles de gestion et vérifications.  
- **Subscribers** : réagissent aux événements de l’application.  

### Couche données
- Gère l’accès à la base de données.  
- **Repositories** : encapsulent toutes les opérations sur les entités.  
- **Entities** : définissent les schémas de données mappés aux tables PostgreSQL via TypeORM.  

---

## 🗄️ Gestion de la base de données

La conception de la base de données a été réalisée via la méthode Merise.

- **TypeORM + PostgreSQL** orchestré avec **Docker** :  
  - Base isolée et reproductible, indépendante des configurations locales.  
  - Fichier `DataSource` centralise la connexion et la déclaration des entités (tickets, services, managers, etc.).  
  - Repositories dédiés pour toutes les opérations CRUD.  
  - Services exploitent les repositories pour implémenter la logique métier.   

---

## 🔐 Configuration `.env`

Pour que le backend fonctionne correctement, créez un fichier `.env` à la racine du projet avec les variables suivantes :  

```env
# JWT
JWT_SECRET=your_jwt_secret_key

# PostgreSQL
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=nextone
```

---

## 🎉 Lancement du projet

### Avec Docker
docker-compose up (lancement du back et front en même temps)

### Sans Docker
npm i

npm start







