// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// API Service Class
class APIService {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const searchParams = new URLSearchParams(params);
        const url = searchParams.toString() ? `${endpoint}?${searchParams}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Generate project schema
    async generateSchema(projectData) {
        return this.post('/api/generate-schema', projectData);
    }

    // Get available stacks
    async getAvailableStacks() {
        return this.get('/api/stacks');
    }

    // Get project templates
    async getProjectTemplates() {
        return this.get('/api/templates');
    }

    // Health check
    async healthCheck() {
        return this.get('/health');
    }

    // OpenAI Configuration
    async validateOpenAIConfig(configData) {
        return this.post('/api/config/openai', configData);
    }

    // Test current OpenAI configuration
    async testOpenAIConfig() {
        return this.get('/api/config/openai/test');
    }
}

// Create API instance
const api = new APIService();

// Export for use in other files
window.api = api;

// Utility functions for API calls
const APIUtils = {
    // Handle API errors
    handleError(error) {
        console.error('API Error:', error);
        
        // Show user-friendly error messages
        if (error.message.includes('Failed to fetch')) {
            return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
        } else if (error.message.includes('OpenAI API key')) {
            return 'Clé API OpenAI non configurée. Contactez l\'administrateur.';
        } else if (error.message.includes('401')) {
            return 'Accès non autorisé. Veuillez vous reconnecter.';
        } else if (error.message.includes('429')) {
            return 'Trop de requêtes. Veuillez patienter quelques instants.';
        } else if (error.message.includes('500')) {
            return 'Erreur serveur. Veuillez réessayer plus tard.';
        }
        
        return error.message || 'Une erreur inattendue s\'est produite.';
    },

    // Validate project data before sending
    validateProjectData(data) {
        const errors = [];

        if (!data.description || data.description.trim().length < 10) {
            errors.push('La description doit contenir au moins 10 caractères.');
        }

        if (data.description && data.description.length > 2000) {
            errors.push('La description ne peut pas dépasser 2000 caractères.');
        }

        return errors;
    },

    // Format project data for API
    formatProjectData(formData) {
        const data = {
            description: formData.description.trim(),
        };

        // Add optional fields if they exist
        if (formData.project_type) {
            data.project_type = formData.project_type;
        }

        if (formData.complexity || formData.timeline || formData.frontend || formData.backend || formData.database) {
            data.preferences = {};

            if (formData.complexity) {
                data.preferences.complexity = formData.complexity;
            }

            if (formData.timeline) {
                data.preferences.timeline = formData.timeline;
            }

            if (formData.frontend || formData.backend || formData.database) {
                data.preferences.stack = {};
                
                if (formData.frontend) data.preferences.stack.frontend = formData.frontend;
                if (formData.backend) data.preferences.stack.backend = formData.backend;
                if (formData.database) data.preferences.stack.database = formData.database;
            }
        }

        // Add additional requirements if they exist
        if (formData.additional_requirements && formData.additional_requirements.length > 0) {
            data.additional_requirements = formData.additional_requirements;
        }

        return data;
    },

    // Retry API calls with exponential backoff
    async retryRequest(apiCall, maxRetries = 3, baseDelay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await apiCall();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                
                const delay = baseDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    },

    // Check if API is available
    async checkAPIAvailability() {
        try {
            await api.healthCheck();
            return true;
        } catch (error) {
            return false;
        }
    }
};

// Export utilities
window.APIUtils = APIUtils;

// Test API connection on load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const isAvailable = await APIUtils.checkAPIAvailability();
        if (!isAvailable) {
            console.warn('API is not available. Some features may not work.');
        }
    } catch (error) {
        console.warn('Could not check API availability:', error);
    }
}); 