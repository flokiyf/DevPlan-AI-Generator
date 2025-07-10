// OpenAI Configuration Management
class OpenAIConfigManager {
    constructor() {
        this.isConfigured = false;
        this.currentConfig = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSavedConfig();
        this.testCurrentConfig();
    }

    bindEvents() {
        // Test configuration button
        document.getElementById('test-openai-config').addEventListener('click', () => {
            this.testConfiguration();
        });

        // Save configuration button
        document.getElementById('save-openai-config').addEventListener('click', () => {
            this.saveConfiguration();
        });

        // API key input change
        document.getElementById('openai-api-key').addEventListener('input', () => {
            this.onConfigChange();
        });

        // Model selection change
        document.getElementById('openai-model').addEventListener('change', () => {
            this.onConfigChange();
        });
    }

    onConfigChange() {
        // Reset status when configuration changes
        this.updateStatus('untested', 'Non testé', 'gray');
        document.getElementById('save-openai-config').disabled = true;
        this.hideDetails();
    }

    async loadSavedConfig() {
        // Load from localStorage if available
        const savedConfig = localStorage.getItem('openai-config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                document.getElementById('openai-api-key').value = config.api_key || '';
                document.getElementById('openai-model').value = config.model || 'gpt-4';
            } catch (error) {
                console.warn('Could not load saved OpenAI config:', error);
            }
        }
    }

    async testCurrentConfig() {
        try {
            this.showTestingState();
            const result = await api.testOpenAIConfig();
            this.handleTestResult(result);
        } catch (error) {
            this.updateStatus('error', 'Erreur de test', 'red');
            console.error('Error testing current config:', error);
        }
    }

    async testConfiguration() {
        const apiKey = document.getElementById('openai-api-key').value.trim();
        const model = document.getElementById('openai-model').value;

        if (!apiKey) {
            this.showError('Veuillez entrer une clé API OpenAI');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            this.showError('La clé API doit commencer par "sk-"');
            return;
        }

        try {
            this.showTestingState();

            const configData = {
                api_key: apiKey,
                model: model
            };

            const result = await api.validateOpenAIConfig(configData);
            this.handleTestResult(result);

        } catch (error) {
            this.updateStatus('error', 'Erreur de validation', 'red');
            this.showError(APIUtils.handleError(error));
            console.error('Configuration test failed:', error);
        }
    }

    handleTestResult(result) {
        if (result.is_valid) {
            this.updateStatus('connected', result.message, 'green');
            this.showDetails(result);
            this.enableSaveButton();
            this.isConfigured = true;
            this.currentConfig = result;
        } else {
            this.updateStatus('failed', result.message, 'red');
            this.showError(result.error_details || result.message);
            this.isConfigured = false;
        }
    }

    showTestingState() {
        this.updateStatus('testing', 'Test en cours...', 'yellow');
        document.getElementById('test-openai-config').disabled = true;
        document.getElementById('test-openai-config').innerHTML = `
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Test en cours...
        `;
    }

    updateStatus(status, message, color) {
        const indicator = document.querySelector('#openai-status-indicator .w-3');
        const text = document.getElementById('openai-status-text');
        
        // Reset button state
        const testButton = document.getElementById('test-openai-config');
        testButton.disabled = false;
        testButton.innerHTML = `
            <i data-lucide="check-circle" class="w-4 h-4 mr-2"></i>
            Tester la configuration
        `;

        // Update status indicator
        indicator.className = `w-3 h-3 rounded-full bg-${color}-400`;
        text.textContent = message;
        text.className = `text-sm text-${color}-600`;

        // Re-initialize lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    showDetails(result) {
        const detailsDiv = document.getElementById('openai-config-details');
        
        document.getElementById('openai-org').textContent = result.organization || 'Non disponible';
        document.getElementById('openai-model-available').textContent = result.model_available ? 'Oui' : 'Non';
        
        if (result.rate_limit_info && result.rate_limit_info.requests_remaining) {
            document.getElementById('openai-rate-limit').textContent = result.rate_limit_info.requests_remaining;
        } else {
            document.getElementById('openai-rate-limit').textContent = 'Non disponible';
        }

        detailsDiv.classList.remove('hidden');
    }

    hideDetails() {
        document.getElementById('openai-config-details').classList.add('hidden');
    }

    enableSaveButton() {
        const saveButton = document.getElementById('save-openai-config');
        saveButton.disabled = false;
        saveButton.classList.remove('opacity-50');
    }

    async saveConfiguration() {
        const apiKey = document.getElementById('openai-api-key').value.trim();
        const model = document.getElementById('openai-model').value;

        if (!this.isConfigured) {
            this.showError('Veuillez d\'abord tester la configuration');
            return;
        }

        try {
            // Save to localStorage
            const config = {
                api_key: apiKey,
                model: model,
                saved_at: new Date().toISOString()
            };

            localStorage.setItem('openai-config', JSON.stringify(config));
            
            this.showSuccess('Configuration sauvegardée avec succès');
            
            // Enable form submission
            this.enableProjectForm();

        } catch (error) {
            this.showError('Erreur lors de la sauvegarde');
            console.error('Save failed:', error);
        }
    }

    enableProjectForm() {
        // Enable the main project form
        const generateButton = document.getElementById('generate-btn');
        if (generateButton) {
            generateButton.disabled = false;
            generateButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 max-w-sm p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
        
        if (type === 'error') {
            notification.className += ' bg-red-500 text-white';
        } else if (type === 'success') {
            notification.className += ' bg-green-500 text-white';
        }

        notification.innerHTML = `
            <div class="flex items-center">
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button class="ml-3 text-white hover:text-gray-200">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);

        // Manual close
        notification.querySelector('button').addEventListener('click', () => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });

        // Re-initialize lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // Check if OpenAI is configured before allowing project generation
    isReadyForGeneration() {
        return this.isConfigured && this.currentConfig && this.currentConfig.is_valid;
    }

    // Get current configuration for API calls
    getCurrentConfig() {
        return this.currentConfig;
    }
}

// Initialize OpenAI Config Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.openAIConfigManager = new OpenAIConfigManager();
});

// Export for use in other files
window.OpenAIConfigManager = OpenAIConfigManager; 