import os
import json
from typing import Dict, Any
import openai
from models import ProjectRequest, ProjectSchema, Architecture, Roadmap, FileStructure, RecommendedStack, TechnologyRecommendation

class SchemaGeneratorService:
    """Service pour générer des schémas de projets avec OpenAI"""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
    async def generate_schema(self, request: ProjectRequest) -> ProjectSchema:
        """Génère un schéma complet de projet"""
        
        # Construire le prompt pour OpenAI
        prompt = self._build_prompt(request)
        
        try:
            # Appel à OpenAI
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,
                temperature=0.7
            )
            
            # Parser la réponse
            ai_response = response.choices[0].message.content
            schema_data = self._parse_ai_response(ai_response, request)
            
            return schema_data
            
        except Exception as e:
            # Fallback avec un schéma par défaut
            return self._generate_fallback_schema(request)
    
    def _get_system_prompt(self) -> str:
        """Prompt système pour OpenAI"""
        return """Tu es un expert en architecture de projets full-stack. 
        Ton rôle est de générer des schémas complets de projets basés sur les descriptions fournies.
        
        Tu dois retourner un JSON structuré avec :
        - Nom du projet
        - Description détaillée
        - Stack technologique recommandée avec justifications
        - Architecture complète
        - Structure de fichiers
        - Roadmap de développement
        - Fonctionnalités principales
        - Stratégies de déploiement, tests et monitoring
        - Défis potentiels et métriques de succès
        
        Sois précis, pratique et professionnel dans tes recommandations."""
    
    def _build_prompt(self, request: ProjectRequest) -> str:
        """Construit le prompt pour OpenAI"""
        prompt = f"""
        DESCRIPTION DU PROJET:
        {request.description}
        
        TYPE DE PROJET: {request.project_type or 'Non spécifié'}
        
        PRÉFÉRENCES:
        """
        
        if request.preferences:
            if request.preferences.stack:
                prompt += f"- Stack préférée: {request.preferences.stack.dict()}\n"
            if request.preferences.complexity:
                prompt += f"- Complexité: {request.preferences.complexity}\n"
            if request.preferences.timeline:
                prompt += f"- Timeline: {request.preferences.timeline}\n"
            if request.preferences.team_size:
                prompt += f"- Taille équipe: {request.preferences.team_size}\n"
        
        if request.additional_requirements:
            prompt += f"\nEXIGENCES SUPPLÉMENTAIRES:\n"
            for req in request.additional_requirements:
                prompt += f"- {req}\n"
        
        prompt += """
        
        Génère un schéma complet de projet professionnel avec toutes les informations nécessaires.
        Retourne uniquement un JSON valide sans texte supplémentaire.
        """
        
        return prompt
    
    def _parse_ai_response(self, ai_response: str, request: ProjectRequest) -> ProjectSchema:
        """Parse la réponse d'OpenAI et crée un ProjectSchema"""
        try:
            # Tenter de parser le JSON
            data = json.loads(ai_response)
            
            # Créer le schéma avec les données parsées
            return self._create_schema_from_data(data, request)
            
        except json.JSONDecodeError:
            # Si le parsing échoue, utiliser le fallback
            return self._generate_fallback_schema(request)
    
    def _create_schema_from_data(self, data: Dict[str, Any], request: ProjectRequest) -> ProjectSchema:
        """Crée un ProjectSchema à partir des données parsées"""
        
        # Créer les recommandations technologiques
        frontend_rec = TechnologyRecommendation(
            name=data.get("recommended_stack", {}).get("frontend", {}).get("name", "React"),
            description=data.get("recommended_stack", {}).get("frontend", {}).get("description", ""),
            pros=data.get("recommended_stack", {}).get("frontend", {}).get("pros", []),
            cons=data.get("recommended_stack", {}).get("frontend", {}).get("cons", []),
            learning_curve=data.get("recommended_stack", {}).get("frontend", {}).get("learning_curve", "Medium"),
            community_support=data.get("recommended_stack", {}).get("frontend", {}).get("community_support", "Excellent"),
            job_market=data.get("recommended_stack", {}).get("frontend", {}).get("job_market", "High")
        )
        
        backend_rec = TechnologyRecommendation(
            name=data.get("recommended_stack", {}).get("backend", {}).get("name", "FastAPI"),
            description=data.get("recommended_stack", {}).get("backend", {}).get("description", ""),
            pros=data.get("recommended_stack", {}).get("backend", {}).get("pros", []),
            cons=data.get("recommended_stack", {}).get("backend", {}).get("cons", []),
            learning_curve=data.get("recommended_stack", {}).get("backend", {}).get("learning_curve", "Medium"),
            community_support=data.get("recommended_stack", {}).get("backend", {}).get("community_support", "Good"),
            job_market=data.get("recommended_stack", {}).get("backend", {}).get("job_market", "High")
        )
        
        database_rec = TechnologyRecommendation(
            name=data.get("recommended_stack", {}).get("database", {}).get("name", "PostgreSQL"),
            description=data.get("recommended_stack", {}).get("database", {}).get("description", ""),
            pros=data.get("recommended_stack", {}).get("database", {}).get("pros", []),
            cons=data.get("recommended_stack", {}).get("database", {}).get("cons", []),
            learning_curve=data.get("recommended_stack", {}).get("database", {}).get("learning_curve", "Medium"),
            community_support=data.get("recommended_stack", {}).get("database", {}).get("community_support", "Excellent"),
            job_market=data.get("recommended_stack", {}).get("database", {}).get("job_market", "High")
        )
        
        deployment_rec = TechnologyRecommendation(
            name=data.get("recommended_stack", {}).get("deployment", {}).get("name", "Vercel"),
            description=data.get("recommended_stack", {}).get("deployment", {}).get("description", ""),
            pros=data.get("recommended_stack", {}).get("deployment", {}).get("pros", []),
            cons=data.get("recommended_stack", {}).get("deployment", {}).get("cons", []),
            learning_curve=data.get("recommended_stack", {}).get("deployment", {}).get("learning_curve", "Easy"),
            community_support=data.get("recommended_stack", {}).get("deployment", {}).get("community_support", "Good"),
            job_market=data.get("recommended_stack", {}).get("deployment", {}).get("job_market", "Medium")
        )
        
        recommended_stack = RecommendedStack(
            frontend=frontend_rec,
            backend=backend_rec,
            database=database_rec,
            deployment=deployment_rec,
            additional_tools=[],
            justification=data.get("recommended_stack", {}).get("justification", "")
        )
        
        # Créer l'architecture
        architecture = Architecture(
            overview=data.get("architecture", {}).get("overview", ""),
            components=data.get("architecture", {}).get("components", []),
            data_flow=data.get("architecture", {}).get("data_flow", []),
            security=data.get("architecture", {}).get("security", []),
            performance=data.get("architecture", {}).get("performance", [])
        )
        
        # Créer la structure de fichiers
        file_structure = FileStructure(
            name=data.get("file_structure", {}).get("name", "project-root"),
            type="directory",
            children=self._parse_file_structure(data.get("file_structure", {}).get("children", []))
        )
        
        # Créer la roadmap
        roadmap = Roadmap(
            phases=data.get("roadmap", {}).get("phases", []),
            milestones=data.get("roadmap", {}).get("milestones", []),
            estimated_duration=data.get("roadmap", {}).get("estimated_duration", ""),
            team_recommendations=data.get("roadmap", {}).get("team_recommendations", [])
        )
        
        return ProjectSchema(
            project_name=data.get("project_name", "Mon Projet"),
            description=data.get("description", request.description),
            project_type=data.get("project_type", str(request.project_type) if request.project_type else "custom"),
            complexity=data.get("complexity", "medium"),
            estimated_duration=data.get("estimated_duration", "2-3 mois"),
            recommended_stack=recommended_stack,
            architecture=architecture,
            file_structure=file_structure,
            roadmap=roadmap,
            features=data.get("features", []),
            technical_requirements=data.get("technical_requirements", []),
            deployment_strategy=data.get("deployment_strategy", {}),
            testing_strategy=data.get("testing_strategy", {}),
            monitoring_strategy=data.get("monitoring_strategy", {}),
            documentation=data.get("documentation", []),
            potential_challenges=data.get("potential_challenges", []),
            success_metrics=data.get("success_metrics", [])
        )
    
    def _parse_file_structure(self, children_data: list) -> list:
        """Parse récursivement la structure de fichiers"""
        children = []
        for child in children_data:
            file_struct = FileStructure(
                name=child.get("name", ""),
                type=child.get("type", "file"),
                children=self._parse_file_structure(child.get("children", [])) if child.get("children") else None,
                content=child.get("content")
            )
            children.append(file_struct)
        return children
    
    def _generate_fallback_schema(self, request: ProjectRequest) -> ProjectSchema:
        """Génère un schéma de base en cas d'échec de l'IA"""
        
        # Recommandations par défaut
        frontend_rec = TechnologyRecommendation(
            name="React",
            description="Bibliothèque JavaScript populaire pour interfaces utilisateur",
            pros=["Écosystème riche", "Communauté active", "Flexibilité"],
            cons=["Courbe d'apprentissage", "Configurations complexes"],
            learning_curve="Medium",
            community_support="Excellent",
            job_market="High"
        )
        
        backend_rec = TechnologyRecommendation(
            name="FastAPI",
            description="Framework Python moderne et performant",
            pros=["Performance élevée", "Documentation automatique", "Type hints"],
            cons=["Écosystème plus récent", "Moins de ressources"],
            learning_curve="Medium",
            community_support="Good",
            job_market="High"
        )
        
        database_rec = TechnologyRecommendation(
            name="PostgreSQL",
            description="Base de données relationnelle robuste",
            pros=["ACID compliance", "Extensibilité", "Performance"],
            cons=["Complexité", "Ressources nécessaires"],
            learning_curve="Medium",
            community_support="Excellent",
            job_market="High"
        )
        
        deployment_rec = TechnologyRecommendation(
            name="Vercel",
            description="Plateforme de déploiement moderne",
            pros=["Déploiement facile", "Performance", "Intégration Git"],
            cons=["Limitations gratuites", "Vendor lock-in"],
            learning_curve="Easy",
            community_support="Good",
            job_market="Medium"
        )
        
        recommended_stack = RecommendedStack(
            frontend=frontend_rec,
            backend=backend_rec,
            database=database_rec,
            deployment=deployment_rec,
            additional_tools=[],
            justification="Stack moderne et équilibrée pour un développement efficace"
        )
        
        architecture = Architecture(
            overview="Architecture moderne en microservices avec séparation frontend/backend",
            components=[
                {"name": "Frontend", "description": "Interface utilisateur React"},
                {"name": "Backend API", "description": "API REST avec FastAPI"},
                {"name": "Base de données", "description": "PostgreSQL pour la persistance"}
            ],
            data_flow=["Client → Frontend → API → Database"],
            security=["HTTPS", "JWT Authentication", "Input validation"],
            performance=["Caching", "CDN", "Database optimization"]
        )
        
        file_structure = FileStructure(
            name="project-root",
            type="directory",
            children=[
                FileStructure(name="frontend", type="directory"),
                FileStructure(name="backend", type="directory"),
                FileStructure(name="README.md", type="file"),
                FileStructure(name=".gitignore", type="file")
            ]
        )
        
        roadmap = Roadmap(
            phases=[
                {"name": "Phase 1", "description": "Setup et architecture", "duration": "1 semaine"},
                {"name": "Phase 2", "description": "Développement core", "duration": "4-6 semaines"},
                {"name": "Phase 3", "description": "Tests et déploiement", "duration": "1-2 semaines"}
            ],
            milestones=[
                {"name": "MVP", "description": "Version minimale viable", "date": "Semaine 4"},
                {"name": "Beta", "description": "Version de test", "date": "Semaine 6"},
                {"name": "Production", "description": "Version finale", "date": "Semaine 8"}
            ],
            estimated_duration="6-8 semaines",
            team_recommendations=["1 développeur full-stack", "1 designer (optionnel)"]
        )
        
        return ProjectSchema(
            project_name="Mon Projet",
            description=request.description,
            project_type=str(request.project_type) if request.project_type else "custom",
            complexity="medium",
            estimated_duration="2-3 mois",
            recommended_stack=recommended_stack,
            architecture=architecture,
            file_structure=file_structure,
            roadmap=roadmap,
            features=["Interface utilisateur", "API REST", "Base de données"],
            technical_requirements=["Python 3.8+", "Node.js 16+", "PostgreSQL"],
            deployment_strategy={"platform": "Vercel", "strategy": "Continuous deployment"},
            testing_strategy={"unit": "Jest/PyTest", "integration": "Cypress", "coverage": "80%+"},
            monitoring_strategy={"logging": "Structured logs", "metrics": "Custom metrics", "alerts": "Email/Slack"},
            documentation=["README", "API docs", "Architecture docs"],
            potential_challenges=["Scaling", "Performance", "Security"],
            success_metrics=["User adoption", "Performance metrics", "Error rates"]
        ) 