from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum

class ProjectType(str, Enum):
    """Types de projets disponibles"""
    ECOMMERCE = "ecommerce"
    BLOG = "blog"
    SAAS = "saas"
    PORTFOLIO = "portfolio"
    MOBILE_APP = "mobile_app"
    DESKTOP_APP = "desktop_app"
    API = "api"
    CUSTOM = "custom"

class ComplexityLevel(str, Enum):
    """Niveaux de complexité"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TechStack(BaseModel):
    """Stack technologique"""
    frontend: Optional[str] = None
    backend: Optional[str] = None
    database: Optional[str] = None
    deployment: Optional[str] = None
    additional: Optional[List[str]] = []

class ProjectPreferences(BaseModel):
    """Préférences du projet"""
    stack: Optional[TechStack] = None
    complexity: Optional[ComplexityLevel] = None
    timeline: Optional[str] = None
    budget: Optional[str] = None
    team_size: Optional[int] = None
    experience_level: Optional[str] = None

class ProjectRequest(BaseModel):
    """Requête pour générer un schéma de projet"""
    description: str = Field(..., min_length=10, max_length=2000, description="Description du projet")
    project_type: Optional[ProjectType] = None
    preferences: Optional[ProjectPreferences] = None
    additional_requirements: Optional[List[str]] = []
    
    class Config:
        schema_extra = {
            "example": {
                "description": "Je veux créer une plateforme e-commerce pour vendre des produits artisanaux avec gestion des stocks, paiements sécurisés et interface d'administration",
                "project_type": "ecommerce",
                "preferences": {
                    "stack": {
                        "frontend": "React",
                        "backend": "FastAPI",
                        "database": "PostgreSQL"
                    },
                    "complexity": "medium",
                    "timeline": "3 mois",
                    "team_size": 2
                },
                "additional_requirements": ["SEO optimisé", "Responsive design", "Multilingue"]
            }
        }

class FileStructure(BaseModel):
    """Structure de fichiers du projet"""
    name: str
    type: str  # "file" ou "directory"
    children: Optional[List['FileStructure']] = None
    content: Optional[str] = None  # Pour les fichiers

class Architecture(BaseModel):
    """Architecture du projet"""
    overview: str
    components: List[Dict[str, Any]]
    data_flow: List[str]
    security: List[str]
    performance: List[str]

class Roadmap(BaseModel):
    """Roadmap de développement"""
    phases: List[Dict[str, Any]]
    milestones: List[Dict[str, Any]]
    estimated_duration: str
    team_recommendations: List[str]

class TechnologyRecommendation(BaseModel):
    """Recommandation technologique"""
    name: str
    description: str
    pros: List[str]
    cons: List[str]
    learning_curve: str
    community_support: str
    job_market: str

class RecommendedStack(BaseModel):
    """Stack recommandée"""
    frontend: TechnologyRecommendation
    backend: TechnologyRecommendation
    database: TechnologyRecommendation
    deployment: TechnologyRecommendation
    additional_tools: List[TechnologyRecommendation]
    justification: str

class ProjectSchema(BaseModel):
    """Schéma complet du projet"""
    project_name: str
    description: str
    project_type: str
    complexity: str
    estimated_duration: str
    recommended_stack: RecommendedStack
    architecture: Architecture
    file_structure: FileStructure
    roadmap: Roadmap
    features: List[str]
    technical_requirements: List[str]
    deployment_strategy: Dict[str, Any]
    testing_strategy: Dict[str, Any]
    monitoring_strategy: Dict[str, Any]
    documentation: List[str]
    potential_challenges: List[str]
    success_metrics: List[str]

class ProjectResponse(BaseModel):
    """Réponse de génération de projet"""
    success: bool
    data: Optional[ProjectSchema] = None
    message: str
    error: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "project_name": "ArtisanMarket",
                    "description": "Plateforme e-commerce pour produits artisanaux",
                    "project_type": "ecommerce",
                    "complexity": "medium",
                    "estimated_duration": "3-4 mois"
                },
                "message": "Schéma généré avec succès"
            }
        }

# Update forward references
FileStructure.model_rebuild() 