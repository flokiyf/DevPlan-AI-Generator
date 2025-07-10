from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import openai
from services import SchemaGeneratorService
from models import ProjectRequest, ProjectResponse
from config_service import config_service, OpenAIConfigRequest, OpenAIConfigResponse

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="DevPlan AI Generator API",
    description="API pour générer des schémas de projets full-stack avec l'IA",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="../frontend"), name="static")

# Initialize services
schema_service = SchemaGeneratorService()

@app.get("/")
async def root():
    """Endpoint racine"""
    return {
        "message": "DevPlan AI Generator API",
        "version": "0.1.0",
        "status": "active",
        "endpoints": {
            "generate_schema": "/api/generate-schema",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.post("/api/config/openai", response_model=OpenAIConfigResponse)
async def configure_openai(config: OpenAIConfigRequest):
    """
    Configure et valide la clé API OpenAI
    
    Args:
        config: Configuration OpenAI (clé API, organisation, modèle)
    
    Returns:
        OpenAIConfigResponse: Résultat de la validation
    """
    try:
        result = await config_service.validate_openai_config(config)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la configuration OpenAI: {str(e)}"
        )

@app.get("/api/config/openai/test", response_model=OpenAIConfigResponse)
async def test_openai_config():
    """
    Teste la configuration OpenAI actuelle
    
    Returns:
        OpenAIConfigResponse: État de la configuration
    """
    try:
        result = await config_service.test_current_config()
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du test de configuration: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Vérification de l'état de l'API avec test OpenAI amélioré"""
    try:
        # Tester la configuration OpenAI
        openai_status = await config_service.test_current_config()
        
        return {
            "status": "healthy",
            "timestamp": "2024-01-15T10:00:00Z",
            "services": {
                "openai": {
                    "status": openai_status.status,
                    "configured": openai_status.is_valid,
                    "model_available": openai_status.model_available,
                    "message": openai_status.message
                },
                "api": "running"
            }
        }
    except Exception as e:
        return {
            "status": "degraded",
            "timestamp": "2024-01-15T10:00:00Z",
            "services": {
                "openai": {
                    "status": "error",
                    "configured": False,
                    "message": f"Erreur: {str(e)}"
                },
                "api": "running"
            }
        }

@app.post("/api/generate-schema", response_model=ProjectResponse)
async def generate_project_schema(request: ProjectRequest):
    """
    Génère un schéma complet de projet full-stack
    
    Args:
        request: Données du projet (description, préférences, etc.)
    
    Returns:
        ProjectResponse: Schéma complet du projet
    """
    try:
        # Validate OpenAI API key
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key not configured"
            )
        
        # Generate schema using AI service
        schema = await schema_service.generate_schema(request)
        
        return ProjectResponse(
            success=True,
            data=schema,
            message="Schéma généré avec succès"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération du schéma: {str(e)}"
        )

@app.get("/api/stacks")
async def get_available_stacks():
    """Retourne les stacks technologiques disponibles"""
    return {
        "success": True,
        "data": {
            "frontend": [
                {
                    "name": "React",
                    "description": "Bibliothèque JavaScript populaire",
                    "pros": ["Écosystème riche", "Communauté active", "Flexibilité"],
                    "cons": ["Courbe d'apprentissage", "Configurations complexes"]
                },
                {
                    "name": "Vue.js",
                    "description": "Framework JavaScript progressif",
                    "pros": ["Facilité d'apprentissage", "Documentation excellente", "Performance"],
                    "cons": ["Écosystème plus petit", "Moins d'emplois"]
                },
                {
                    "name": "Vanilla JS",
                    "description": "JavaScript pur sans framework",
                    "pros": ["Performance maximale", "Pas de dépendances", "Contrôle total"],
                    "cons": ["Développement plus long", "Pas de structure imposée"]
                }
            ],
            "backend": [
                {
                    "name": "FastAPI",
                    "description": "Framework Python moderne et rapide",
                    "pros": ["Performance élevée", "Documentation automatique", "Type hints"],
                    "cons": ["Écosystème plus récent", "Moins de ressources"]
                },
                {
                    "name": "Node.js",
                    "description": "Runtime JavaScript côté serveur",
                    "pros": ["JavaScript partout", "NPM ecosystem", "Performance"],
                    "cons": ["Single-threaded", "Callback hell potentiel"]
                },
                {
                    "name": "Django",
                    "description": "Framework Python batteries included",
                    "pros": ["Fonctionnalités complètes", "Sécurité intégrée", "Admin interface"],
                    "cons": ["Peut être lourd", "Moins flexible"]
                }
            ],
            "database": [
                {
                    "name": "PostgreSQL",
                    "description": "Base de données relationnelle avancée",
                    "pros": ["ACID compliance", "Extensibilité", "Performance"],
                    "cons": ["Complexité", "Ressources nécessaires"]
                },
                {
                    "name": "MongoDB",
                    "description": "Base de données NoSQL documentaire",
                    "pros": ["Flexibilité du schéma", "Scalabilité", "JSON natif"],
                    "cons": ["Moins de consistance", "Requêtes complexes"]
                },
                {
                    "name": "SQLite",
                    "description": "Base de données légère embarquée",
                    "pros": ["Simplicité", "Pas de serveur", "Portable"],
                    "cons": ["Pas de concurrence", "Fonctionnalités limitées"]
                }
            ]
        }
    }

@app.get("/api/templates")
async def get_project_templates():
    """Retourne les templates de projets disponibles"""
    return {
        "success": True,
        "data": [
            {
                "id": "ecommerce",
                "name": "E-commerce",
                "description": "Plateforme de vente en ligne complète",
                "features": ["Catalogue produits", "Panier", "Paiement", "Gestion commandes"],
                "complexity": "high",
                "duration": "3-6 mois"
            },
            {
                "id": "blog",
                "name": "Blog/CMS",
                "description": "Système de gestion de contenu",
                "features": ["Articles", "Commentaires", "SEO", "Admin panel"],
                "complexity": "medium",
                "duration": "1-2 mois"
            },
            {
                "id": "saas",
                "name": "SaaS Platform",
                "description": "Application Software-as-a-Service",
                "features": ["Authentification", "Abonnements", "Dashboard", "API"],
                "complexity": "high",
                "duration": "4-8 mois"
            },
            {
                "id": "portfolio",
                "name": "Portfolio",
                "description": "Site vitrine personnel ou professionnel",
                "features": ["Présentation", "Projets", "Contact", "CV"],
                "complexity": "low",
                "duration": "2-4 semaines"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 