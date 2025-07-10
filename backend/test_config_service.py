import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from config_service import ConfigService, OpenAIConfigRequest, OpenAIConfigResponse
import openai

class TestConfigService:
    """Tests pour le service de configuration OpenAI"""
    
    def setup_method(self):
        """Setup pour chaque test"""
        self.config_service = ConfigService()
    
    def test_is_valid_api_key_format_valid(self):
        """Test de validation du format de clé API valide"""
        valid_keys = [
            "sk-1234567890abcdef1234567890",
            "sk-proj-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
            "sk-test123456789012345678901234567890"
        ]
        
        for key in valid_keys:
            assert self.config_service._is_valid_api_key_format(key) == True
    
    def test_is_valid_api_key_format_invalid(self):
        """Test de validation du format de clé API invalide"""
        invalid_keys = [
            "invalid-key",
            "sk-short",
            "",
            None,
            "pk-1234567890abcdef1234567890",  # Wrong prefix
            "sk-" + "x" * 200,  # Too long
        ]
        
        for key in invalid_keys:
            if key is not None:
                assert self.config_service._is_valid_api_key_format(key) == False
    
    @pytest.mark.asyncio
    async def test_validate_openai_config_invalid_format(self):
        """Test de validation avec format de clé invalide"""
        config = OpenAIConfigRequest(api_key="invalid-key")
        
        result = await self.config_service.validate_openai_config(config)
        
        assert result.is_valid == False
        assert result.status == "invalid_format"
        assert "Format de clé API invalide" in result.message
    
    @pytest.mark.asyncio
    @patch('config_service.OpenAI')
    async def test_validate_openai_config_connection_success(self, mock_openai_class):
        """Test de validation avec connexion réussie"""
        # Mock du client OpenAI
        mock_client = Mock()
        mock_openai_class.return_value = mock_client
        
        # Mock de la réponse OpenAI
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "OK"
        mock_response.headers = {
            "x-ratelimit-remaining-requests": "100",
            "x-ratelimit-remaining-tokens": "10000"
        }
        
        mock_client.chat.completions.create.return_value = mock_response
        
        # Mock de la liste des organisations
        mock_org_response = Mock()
        mock_org_response.data = [Mock()]
        mock_org_response.data[0].name = "Test Organization"
        mock_client.organizations.list.return_value = mock_org_response
        
        config = OpenAIConfigRequest(api_key="sk-test1234567890abcdef1234567890")
        
        result = await self.config_service.validate_openai_config(config)
        
        assert result.is_valid == True
        assert result.status == "connected"
        assert result.model_available == True
        assert result.organization == "Test Organization"
    
    @pytest.mark.asyncio
    @patch('config_service.OpenAI')
    async def test_validate_openai_config_auth_error(self, mock_openai_class):
        """Test de validation avec erreur d'authentification"""
        mock_client = Mock()
        mock_openai_class.return_value = mock_client
        
        # Simuler une erreur d'authentification
        mock_client.chat.completions.create.side_effect = openai.AuthenticationError("Invalid API key")
        
        config = OpenAIConfigRequest(api_key="sk-test1234567890abcdef1234567890")
        
        result = await self.config_service.validate_openai_config(config)
        
        assert result.is_valid == False
        assert result.status == "connection_failed"
        assert "Clé API invalide" in result.message
    
    @pytest.mark.asyncio
    @patch('config_service.OpenAI')
    async def test_validate_openai_config_rate_limit_error(self, mock_openai_class):
        """Test de validation avec erreur de limite de taux"""
        mock_client = Mock()
        mock_openai_class.return_value = mock_client
        
        # Simuler une erreur de limite de taux
        mock_client.chat.completions.create.side_effect = openai.RateLimitError("Rate limit exceeded")
        
        config = OpenAIConfigRequest(api_key="sk-test1234567890abcdef1234567890")
        
        result = await self.config_service.validate_openai_config(config)
        
        assert result.is_valid == False
        assert result.status == "connection_failed"
        assert "Limite de taux atteinte" in result.message
        assert result.model_available == True  # Le modèle existe, mais limite atteinte
    
    @pytest.mark.asyncio
    @patch.dict('os.environ', {}, clear=True)
    async def test_test_current_config_no_api_key(self):
        """Test de la configuration actuelle sans clé API"""
        result = await self.config_service.test_current_config()
        
        assert result.is_valid == False
        assert result.status == "not_configured"
        assert "Aucune clé API OpenAI configurée" in result.message
    
    def test_get_client_not_configured(self):
        """Test d'obtention du client sans configuration"""
        with pytest.raises(Exception) as exc_info:
            self.config_service.get_client()
        
        assert "OpenAI n'est pas configuré" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    @patch('config_service.OpenAI')
    async def test_get_client_configured(self, mock_openai_class):
        """Test d'obtention du client avec configuration valide"""
        # Configurer d'abord le service
        mock_client = Mock()
        mock_openai_class.return_value = mock_client
        
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "OK"
        mock_client.chat.completions.create.return_value = mock_response
        mock_client.organizations.list.return_value = Mock(data=[])
        
        config = OpenAIConfigRequest(api_key="sk-test1234567890abcdef1234567890")
        await self.config_service.validate_openai_config(config)
        
        # Maintenant tester get_client
        client = self.config_service.get_client()
        assert client == mock_client

if __name__ == "__main__":
    # Exécuter les tests
    pytest.main([__file__, "-v"]) 