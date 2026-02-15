# Guide de Validation - Compatibilité Coolify

Ce guide vous permet de valider que le projet OmniTools est parfaitement compatible avec Coolify.

## Prérequis

- Docker Desktop installé et en cours d'exécution
- Git installé
- Accès à un serveur Coolify (ou instance locale)

## 1. Test de Build Docker Local

### Étape 1 : Build de l'image

```bash
cd A:\projets\Tools\Tools
docker build -t omni-tools:test .
```

**Vérifications :**
- ✅ Le build doit se terminer sans erreur
- ✅ Temps de build : environ 2-5 minutes
- ✅ Taille de l'image finale : ~28-35 MB

### Étape 2 : Lancement du conteneur

```bash
docker run -d --name omni-tools-test -p 8080:80 omni-tools:test
```

### Étape 3 : Tests fonctionnels

1. **Test de l'application :**
   ```bash
   # Ouvrir dans le navigateur
   http://localhost:8080
   ```
   - ✅ La page doit se charger correctement
   - ✅ Tous les outils doivent être accessibles
   - ✅ Pas d'erreurs dans la console

2. **Test du healthcheck :**
   ```bash
   curl http://localhost:8080/health
   ```
   - ✅ Doit retourner "OK"
   - ✅ Status code: 200

3. **Test du routing SPA :**
   ```bash
   # Accéder à une route directe
   http://localhost:8080/tools/image/resize
   ```
   - ✅ Doit charger l'application sans erreur 404

4. **Vérification du healthcheck Docker :**
   ```bash
   docker inspect --format='{{json .State.Health}}' omni-tools-test
   ```
   - ✅ Status doit être "healthy"

### Étape 4 : Nettoyage

```bash
docker stop omni-tools-test
docker rm omni-tools-test
docker rmi omni-tools:test
```

## 2. Test avec Docker Compose

```bash
cd A:\projets\Tools\Tools
docker-compose up -d
```

**Vérifications :**
- ✅ Service démarre sans erreur
- ✅ Application accessible sur http://localhost:8080
- ✅ Healthcheck passe (visible avec `docker-compose ps`)

**Nettoyage :**
```bash
docker-compose down
```

## 3. Déploiement sur Coolify

### Configuration dans Coolify

1. **Créer une nouvelle application**
   - Type : Application
   - Source : Public Repository
   - URL : `https://github.com/iib0011/omni-tools`

2. **Configuration du Build**
   - Build Pack : Dockerfile
   - Dockerfile Path : `./Dockerfile`
   - Port : 80

3. **Healthcheck**
   - Path : `/health`
   - Interval : 30s
   - Timeout : 3s
   - Retries : 3

4. **Variables d'environnement (optionnelles)**
   - `NODE_ENV=production`
   - `LOCIZE_API_KEY=<your-key>` (si nécessaire)

### Tests après déploiement

1. **Vérifier le déploiement :**
   - ✅ Build réussi dans les logs Coolify
   - ✅ Container en état "running"
   - ✅ Healthcheck vert dans le dashboard

2. **Test de l'application :**
   - ✅ Application accessible via l'URL Coolify
   - ✅ SSL fonctionne (si domaine configuré)
   - ✅ Tous les outils fonctionnent correctement

3. **Vérifier les performances :**
   - ✅ Temps de chargement < 2s
   - ✅ Gzip compression active (vérifier headers)
   - ✅ Cache des assets statiques actif

## 4. Checklist de Compatibilité Coolify

- ✅ **Dockerfile** optimisé avec multi-stage build
- ✅ **Healthcheck** configuré dans Dockerfile
- ✅ **nginx.conf** personnalisé avec :
  - Routing SPA (try_files)
  - Endpoint /health
  - Gzip compression
  - Security headers
  - Cache des assets
- ✅ **docker-compose.yml** fourni
- ✅ **.dockerignore** optimisé
- ✅ **.env.example** documenté
- ✅ **README.md** avec instructions Coolify
- ✅ **Port 80** exposé correctement
- ✅ **Image Alpine** pour taille minimale
- ✅ **Labels OCI** pour métadonnées

## Troubleshooting

### Build échoue avec "npm install failed"
**Solution :** Augmenter la mémoire allouée au build dans Coolify (minimum 1GB)

### Healthcheck échoue
**Solution :** 
- Vérifier que nginx est démarré : `docker logs <container-id>`
- Tester manuellement : `curl http://localhost/health` depuis le container

### Routes SPA retournent 404
**Solution :** Vérifier que `nginx.conf` est bien copié dans le Dockerfile

### Application lente
**Solution :** 
- Vérifier que gzip est actif : `curl -H "Accept-Encoding: gzip" -I <url>`
- Augmenter les ressources CPU/RAM dans Coolify

## Résultat Attendu

✅ **Build Time :** 2-5 minutes  
✅ **Image Size :** ~28-35 MB  
✅ **Memory Usage :** ~50-100 MB au runtime  
✅ **Healthcheck :** Passe en < 3s  
✅ **Application :** Complètement fonctionnelle  

---

**Date de validation :** À compléter après tests  
**Version testée :** 0.1.0  
**Status :** ✅ Compatible Coolify
