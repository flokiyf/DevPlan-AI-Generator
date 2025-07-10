# 🚀 DevPlan AI Generator - Flask Edition

Générateur de schémas full-stack alimenté par l'intelligence artificielle. Créez des architectures de projets professionnelles en quelques minutes grâce à OpenAI GPT.

## ✨ Fonctionnalités

- 🤖 **Génération IA** : Schémas créés par OpenAI GPT
- ⚡ **Ultra-rapide** : Résultats en moins de 60 secondes
- 📱 **Interface moderne** : Design responsive avec Bootstrap 5
- 📄 **Export multi-formats** : PDF, Markdown, JSON
- 🔧 **Configuração facile** : Interface web de configuration
- 🛡️ **Sécurisé** : Protection CSRF et validation des données

## 🏗️ Architecture

```
DevPlan-Flask/
├── app/                        # Application Flask
│   ├── __init__.py            # Factory pattern
│   ├── config.py              # Configuration centralisée
│   ├── routes/                # Routes/Blueprints
│   │   ├── main.py           # Routes principales
│   │   └── __init__.py
│   └── templates/             # Templates Jinja2
│       ├── base.html         # Template de base
│       ├── index.html        # Page d'accueil
│       ├── generator.html    # Générateur IA
│       ├── status.html       # Statut système
│       ├── config.html       # Configuration
│       └── about.html        # À propos
├── exports/                   # Dossier d'export (auto-créé)
├── logs/                      # Logs application (auto-créé)
├── tests/                     # Tests (à venir)
├── requirements.txt           # Dépendances Python
├── run.py                     # Point d'entrée
├── env.example               # Variables d'environnement
└── README.md                 # Documentation
```

## 🚀 Installation Rapide

### 1. Cloner le projet

```bash
git clone <your-repo-url>
cd DevPlan-Flask
```

### 2. Créer l'environnement virtuel

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Configuration

```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer le fichier .env avec vos paramètres
# OPENAI_API_KEY=your-openai-api-key-here
```

### 5. Lancer l'application

```bash
python run.py
```

L'application sera accessible à : **http://127.0.0.1:5000**

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `FLASK_ENV` | Environnement Flask | `development` |
| `FLASK_DEBUG` | Mode debug | `True` |
| `SECRET_KEY` | Clé secrète Flask | `your-secret-key` |
| `OPENAI_API_KEY` | Clé API OpenAI | `sk-proj-...` |
| `OPENAI_MODEL` | Modèle OpenAI | `gpt-3.5-turbo` |
| `EXPORT_FOLDER` | Dossier d'export | `exports` |

### Configuration via interface

1. Accédez à `/config` pour voir la configuration actuelle
2. Utilisez `/status` pour vérifier l'état des services
3. Le health check est disponible à `/health`

## 🛠️ Stack Technologique

### Backend
- **Flask 3.0** - Framework web
- **Python 3.9+** - Langage principal
- **Jinja2** - Moteur de templates
- **OpenAI API** - Intelligence artificielle

### Frontend
- **Bootstrap 5** - Framework CSS
- **JavaScript ES6+** - Interactivité
- **Bootstrap Icons** - Icônes
- **Inter Font** - Typographie moderne

### Export
- **ReportLab** - Génération PDF
- **Markdown** - Export Markdown
- **JSON** - Export structuré

## 📋 Roadmap des Pull Requests

### ✅ PR #1: Setup Initial & Configuration (Actuel)
- [x] Structure Flask avec Factory pattern
- [x] Configuration centralisée multi-environnements
- [x] Interface utilisateur Bootstrap 5
- [x] Routes de base et health checks
- [x] Templates responsives modernes

### 🔄 PR #2: Service OpenAI & Validation
- [ ] Intégration complète OpenAI API
- [ ] Validation et test de connexion
- [ ] Gestion sécurisée des clés API
- [ ] Interface de configuration dynamique

### 🔄 PR #3: Générateur de Schémas Core
- [ ] Service de génération avec prompts optimisés
- [ ] Templates de prompts par type de projet
- [ ] Gestion des sessions et état
- [ ] Prévisualisation des schémas

### 🔄 PR #4: Interface Utilisateur Avancée
- [ ] Validation côté client temps réel
- [ ] Loading states et feedback utilisateur
- [ ] Animations et micro-interactions
- [ ] Tests d'accessibilité

### 🔄 PR #5-6: Système d'Export
- [ ] Export PDF professionnel (ReportLab)
- [ ] Export Markdown avec TOC
- [ ] Export JSON structuré
- [ ] Interface d'export unifiée

### 🔄 PR #7-10: Fonctionnalités Avancées
- [ ] Gestion des projets et historique
- [ ] Optimisations et production
- [ ] Tests complets et qualité
- [ ] Features bonus (auth, API, etc.)

## 🧪 Tests

### Lancer les tests (à venir dans PR #9)

```bash
# Tests unitaires
pytest tests/unit/

# Tests d'intégration
pytest tests/integration/

# Couverture
pytest --cov=app tests/
```

## 📊 Statut du Système

Vérifiez l'état de l'application :

- **Interface web** : `/status`
- **API JSON** : `/health`
- **Configuration** : `/config`

## 🔧 Développement

### Structure des commits

```bash
git commit -m "feat: ajout du service OpenAI"
git commit -m "fix: correction validation formulaire"
git commit -m "docs: mise à jour README"
```

### Standards de code

- **Formatage** : Black
- **Linting** : Flake8
- **Documentation** : Docstrings
- **Tests** : Pytest (>85% couverture)

## 🚀 Déploiement

### Environnement de production

1. **Variables d'environnement** :
   ```bash
   FLASK_ENV=production
   FLASK_DEBUG=False
   SECRET_KEY=production-secret-key
   OPENAI_API_KEY=production-openai-key
   ```

2. **Serveur WSGI** :
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app('production')"
   ```

3. **Docker** (à venir) :
   ```bash
   docker build -t devplan-flask .
   docker run -p 5000:5000 devplan-flask
   ```

## 📝 Contributing

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'feat: nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Issues** : [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation** : `/about` dans l'application
- **Status** : `/status` pour l'état du système

## 🎯 Métriques de Réussite

- ⚡ **Performance** : < 2s de chargement
- 🤖 **IA** : < 10s de génération
- 📱 **Mobile** : 100% responsive
- 🧪 **Tests** : > 85% couverture
- 🔒 **Sécurité** : 0 vulnérabilités

---

**🚀 DevPlan AI Generator - Révolutionnez votre développement avec l'IA !**

*Version actuelle : 1.0.0 | PR #1 Terminé* 