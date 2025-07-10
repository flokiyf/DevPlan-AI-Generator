import os
import asyncio
from typing import Dict, Any, Optional, Tuple
import openai
from openai import OpenAI
from fastapi import HTTPException
from pydantic import BaseModel
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAIConfigRequest(BaseModel):
    """Modèle pour la configuration OpenAI"""
    api_key: str
    organization_id: Optional[str] = None
    model: Optional[str] = "gpt-4"

class OpenAIConfigResponse(BaseModel):
    """Réponse de validation de configuration OpenAI"""
    is_valid: bool
    status: str
    message: str
    model_available: bool
    organization: Optional[str] = None
    rate_limit_info: Optional[Dict[str, Any]] = None
    error_details: Optional[str] = None

class ConfigService:
    """Service de gestion de la configuration OpenAI"""
    
    def __init__(self):
        self.current_client: Optional[OpenAI] = None
        self.is_configured = False
        self.last_validation = None
        
    async def validate_openai_config(self, config: OpenAIConfigRequest) -> OpenAIConfigResponse:
        """
        Valide la configuration OpenAI et teste la connexion
        
        Args:
            config: Configuration OpenAI à valider
            
        Returns:
            OpenAIConfigResponse: Résultat de la validation
        """
        try:
            # Validation basique du format de la clé
            if not self._is_valid_api_key_format(config.api_key):
                return OpenAIConfigResponse(
                    is_valid=False,
                    status="invalid_format",
                    message="Format de clé API invalide",
                    model_available=False,
                    error_details="La clé API doit commencer par 'sk-' et contenir au moins 20 caractères"
                )
            
            # Créer le client OpenAI temporaire pour les tests
            test_client = OpenAI(
                api_key=config.api_key,
                organization=config.organization_id
            )
            
            # Test de connexion et validation
            connection_result = await self._test_openai_connection(test_client, config.model)
            
            if connection_result["success"]:
                # Mettre à jour le client actuel si la validation réussit
                self.current_client = test_client
                self.is_configured = True
                
                return OpenAIConfigResponse(
                    is_valid=True,
                    status="connected",
                    message="Configuration OpenAI validée avec succès",
                    model_available=connection_result["model_available"],
                    organization=connection_result.get("organization"),
                    rate_limit_info=connection_result.get("rate_limit_info")
                )
            else:
                return OpenAIConfigResponse(
                    is_valid=False,
                    status="connection_failed",
                    message=connection_result["error"],
                    model_available=False,
                    error_details=connection_result.get("details")
                )
                
        except Exception as e:
            logger.error(f"Erreur lors de la validation OpenAI: {str(e)}")
            return OpenAIConfigResponse(
                is_valid=False,
                status="error",
                message="Erreur interne lors de la validation",
                model_available=False,
                error_details=str(e)
            )
    
    async def test_current_config(self) -> OpenAIConfigResponse:
        """
        Teste la configuration OpenAI actuelle
        
        Returns:
            OpenAIConfigResponse: État de la configuration actuelle
        """
        if not self.current_client:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                return OpenAIConfigResponse(
                    is_valid=False,
                    status="not_configured",
                    message="Aucune clé API OpenAI configurée",
                    model_available=False
                )
            
            # Initialiser avec la clé d'environnement
            config = OpenAIConfigRequest(api_key=api_key)
            return await self.validate_openai_config(config)
        
        # Tester la configuration actuelle
        try:
            test_result = await self._test_openai_connection(self.current_client, "gpt-4")
            
            return OpenAIConfigResponse(
                is_valid=test_result["success"],
                status="connected" if test_result["success"] else "connection_failed",
                message=test_result.get("error", "Configuration testée avec succès"),
                model_available=test_result["model_available"],
                organization=test_result.get("organization"),
                rate_limit_info=test_result.get("rate_limit_info")
            )
            
        except Exception as e:
            logger.error(f"Erreur lors du test de configuration: {str(e)}")
            return OpenAIConfigResponse(
                is_valid=False,
                status="error",
                message="Erreur lors du test de configuration",
                model_available=False,
                error_details=str(e)
            )
    
    def get_client(self) -> OpenAI:
        """
        Retourne le client OpenAI configuré
        
        Returns:
            OpenAI: Client configuré
            
        Raises:
            HTTPException: Si aucun client n'est configuré
        """
        if not self.current_client or not self.is_configured:
            raise HTTPException(
                status_code=500,
                detail="OpenAI n'est pas configuré. Veuillez configurer votre clé API."
            )
        return self.current_client
    
    def _is_valid_api_key_format(self, api_key: str) -> bool:
        """
        Valide le format de base d'une clé API OpenAI
        
        Args:
            api_key: Clé API à valider
            
        Returns:
            bool: True si le format est valide
        """
        return (
            isinstance(api_key, str) and
            api_key.startswith("sk-") and
            len(api_key) >= 20 and
            len(api_key) <= 200
        )
    
    async def _test_openai_connection(self, client: OpenAI, model: str = "gpt-4") -> Dict[str, Any]:
        """
        Teste la connexion à OpenAI avec un appel simple
        
        Args:
            client: Client OpenAI à tester
            model: Modèle à tester
            
        Returns:
            Dict contenant le résultat du test
        """
        try:
            # Test simple avec un prompt minimal
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "Tu es un assistant utile."},
                    {"role": "user", "content": "Réponds juste 'OK' pour tester la connexion."}
                ],
                max_tokens=10,
                temperature=0
            )
            
            # Récupérer les informations de l'organisation si disponible
            organization = None
            try:
                # Tentative de récupération des informations d'organisation
                org_response = client.organizations.list()
                if org_response.data:
                    organization = org_response.data[0].name
            except:
                pass  # Pas grave si on ne peut pas récupérer l'organisation
            
            return {
                "success": True,
                "model_available": True,
                "organization": organization,
                "rate_limit_info": {
                    "requests_remaining": response.headers.get("x-ratelimit-remaining-requests"),
                    "tokens_remaining": response.headers.get("x-ratelimit-remaining-tokens")
                } if hasattr(response, 'headers') else None
            }
            
        except openai.AuthenticationError as e:
            return {
                "success": False,
                "model_available": False,
                "error": "Clé API invalide ou expirée",
                "details": str(e)
            }
        except openai.PermissionDeniedError as e:
            return {
                "success": False,
                "model_available": False,
                "error": "Permissions insuffisantes pour ce modèle",
                "details": str(e)
            }
        except openai.RateLimitError as e:
            return {
                "success": False,
                "model_available": True,
                "error": "Limite de taux atteinte",
                "details": str(e)
            }
        except openai.APIConnectionError as e:
            return {
                "success": False,
                "model_available": False,
                "error": "Erreur de connexion à l'API OpenAI",
                "details": str(e)
            }
        except Exception as e:
            return {
                "success": False,
                "model_available": False,
                "error": f"Erreur inattendue: {str(e)}",
                "details": str(e)
            }

# Instance globale du service de configuration
config_service = ConfigService() 