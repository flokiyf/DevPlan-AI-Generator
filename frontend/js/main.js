// Main Application Logic
class DevPlanApp {
    constructor() {
        this.additionalRequirements = [];
        this.currentResults = null;
        this.resultsDisplay = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupRequirementsInput();
        this.initializeIcons();
    }

    setupEventListeners() {
        // Form submission
        const projectForm = document.getElementById('project-form');
        if (projectForm) {
            projectForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Character count for description
        const descriptionInput = document.getElementById('description');
        if (descriptionInput) {
            descriptionInput.addEventListener('input', this.updateCharCount.bind(this));
        }

        // Navigation buttons
        const startGeneratingBtn = document.getElementById('start-generating');
        if (startGeneratingBtn) {
            startGeneratingBtn.addEventListener('click', () => {
                document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
            });
        }

        const viewExamplesBtn = document.getElementById('view-examples');
        if (viewExamplesBtn) {
            viewExamplesBtn.addEventListener('click', this.showExamples.bind(this));
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }

        // Close loading modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLoadingModal();
            }
        });
    }

    setupFormValidation() {
        const form = document.getElementById('project-form');
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    setupRequirementsInput() {
        const requirementsInput = document.getElementById('requirements-input');
        const requirementsTags = document.getElementById('requirements-tags');

        if (requirementsInput) {
            requirementsInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && requirementsInput.value.trim()) {
                    e.preventDefault();
                    this.addRequirement(requirementsInput.value.trim());
                    requirementsInput.value = '';
                }
            });
        }
    }

    initializeIcons() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    updateCharCount() {
        const descriptionInput = document.getElementById('description');
        const charCount = document.getElementById('char-count');
        
        if (descriptionInput && charCount) {
            const count = descriptionInput.value.length;
            charCount.textContent = count;
            
            // Change color based on length
            if (count > 1800) {
                charCount.className = 'text-red-500 font-medium';
            } else if (count > 1500) {
                charCount.className = 'text-yellow-500 font-medium';
            } else {
                charCount.className = 'text-gray-500';
            }
        }
    }

    addRequirement(requirement) {
        if (this.additionalRequirements.includes(requirement)) {
            window.notifications.warning('Cette exigence a déjà été ajoutée.');
            return;
        }

        this.additionalRequirements.push(requirement);
        this.renderRequirementsTags();
    }

    removeRequirement(requirement) {
        this.additionalRequirements = this.additionalRequirements.filter(req => req !== requirement);
        this.renderRequirementsTags();
    }

    renderRequirementsTags() {
        const container = document.getElementById('requirements-tags');
        if (!container) return;

        container.innerHTML = this.additionalRequirements.map(req => `
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                ${req}
                <button type="button" onclick="app.removeRequirement('${req}')" class="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200 transition-colors">
                    <i data-lucide="x" class="w-3 h-3"></i>
                </button>
            </span>
        `).join('');

        // Re-initialize icons for new elements
        lucide.createIcons();
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Validation rules
        switch (field.id) {
            case 'description':
                if (!value) {
                    isValid = false;
                    errorMessage = 'La description est requise.';
                } else if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'La description doit contenir au moins 10 caractères.';
                } else if (value.length > 2000) {
                    isValid = false;
                    errorMessage = 'La description ne peut pas dépasser 2000 caractères.';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
        
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Add additional requirements
        data.additional_requirements = this.additionalRequirements;

        // Validate form
        const validationErrors = this.validateForm(data);
        if (validationErrors.length > 0) {
            window.notifications.error(validationErrors[0]);
            return;
        }

        // Format data for API
        const apiData = window.APIUtils.formatProjectData(data);

        // Show loading modal
        this.showLoadingModal();

        try {
            // Call API
            const response = await window.api.generateSchema(apiData);
            
            // Hide loading modal
            this.hideLoadingModal();

            if (response.success) {
                this.displayResults(response);
                window.notifications.success('Schéma généré avec succès !');
            } else {
                throw new Error(response.error || 'Erreur lors de la génération');
            }

        } catch (error) {
            this.hideLoadingModal();
            const errorMessage = window.APIUtils.handleError(error);
            window.notifications.error(errorMessage);
            console.error('Generation error:', error);
        }
    }

    validateForm(data) {
        const errors = [];

        if (!data.description || data.description.trim().length < 10) {
            errors.push('La description doit contenir au moins 10 caractères.');
        }

        if (data.description && data.description.length > 2000) {
            errors.push('La description ne peut pas dépasser 2000 caractères.');
        }

        return errors;
    }

    showLoadingModal() {
        const modal = document.getElementById('loading-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideLoadingModal() {
        const modal = document.getElementById('loading-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    displayResults(response) {
        this.currentResults = response;
        window.currentResults = response; // Make available globally for export

        const resultsSection = document.getElementById('results');
        const resultsContent = document.getElementById('results-content');

        if (resultsSection && resultsContent) {
            // Initialize results display if not already done
            if (!this.resultsDisplay) {
                this.resultsDisplay = new window.ResultsDisplay(resultsContent);
            }

            // Render results
            this.resultsDisplay.render(response);

            // Show results section
            resultsSection.classList.remove('hidden');

            // Scroll to results
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }

    showExamples() {
        const exampleContent = `
            <div class="p-8">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-gray-900">Exemples de Projets</h3>
                    <button onclick="window.modal.close()" class="text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                
                <div class="space-y-6">
                    ${this.getExampleProjects().map(example => `
                        <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div class="flex items-center justify-between mb-3">
                                <h4 class="text-lg font-semibold text-gray-900">${example.title}</h4>
                                <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">${example.type}</span>
                            </div>
                            <p class="text-gray-600 mb-4">${example.description}</p>
                            <button onclick="app.useExample('${example.id}')" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                                Utiliser cet exemple
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        window.modal.create(exampleContent);
        lucide.createIcons();
    }

    getExampleProjects() {
        return [
            {
                id: 'ecommerce',
                title: 'Plateforme E-commerce',
                type: 'E-commerce',
                description: 'Je veux créer une plateforme e-commerce complète pour vendre des produits artisanaux avec gestion des stocks, paiements sécurisés, interface d\'administration, système de reviews, notifications email et tableau de bord analytique.'
            },
            {
                id: 'saas',
                title: 'Application SaaS',
                type: 'SaaS',
                description: 'Je souhaite développer une application SaaS de gestion de projets avec authentification multi-utilisateurs, tableaux de bord personnalisables, système d\'abonnements, API REST, notifications en temps réel et intégrations tierces.'
            },
            {
                id: 'blog',
                title: 'Blog Personnel',
                type: 'Blog',
                description: 'Je veux créer un blog personnel moderne avec système de gestion de contenu, commentaires, catégories, recherche, SEO optimisé, mode sombre et responsive design pour mobile et desktop.'
            },
            {
                id: 'portfolio',
                title: 'Portfolio Créatif',
                type: 'Portfolio',
                description: 'Je souhaite construire un portfolio créatif pour présenter mes projets avec galerie interactive, animations, formulaire de contact, intégration réseaux sociaux et optimisation pour les moteurs de recherche.'
            }
        ];
    }

    useExample(exampleId) {
        const example = this.getExampleProjects().find(ex => ex.id === exampleId);
        if (example) {
            // Fill form with example data
            const descriptionField = document.getElementById('description');
            const projectTypeField = document.getElementById('project-type');

            if (descriptionField) {
                descriptionField.value = example.description;
                this.updateCharCount();
            }

            if (projectTypeField) {
                projectTypeField.value = example.type.toLowerCase().replace(/\s+/g, '_');
            }

            // Close modal
            window.modal.close();

            // Scroll to form
            document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });

            window.notifications.success('Exemple appliqué avec succès !');
        }
    }

    toggleTheme() {
        // Theme toggle functionality (to be implemented)
        window.notifications.info('Changement de thème en cours de développement...');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DevPlanApp();
    
    // Show welcome notification
    setTimeout(() => {
        window.notifications.info('Bienvenue sur DevPlan AI Generator ! Décrivez votre projet pour commencer.', 8000);
    }, 1000);
});

// Handle page visibility for better UX
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Re-initialize icons when page becomes visible
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
});

// Handle errors globally
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.notifications) {
        window.notifications.error('Une erreur inattendue s\'est produite.');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (window.notifications) {
        window.notifications.error('Erreur de traitement asynchrone.');
    }
});

// Export app instance for debugging
window.DevPlanApp = DevPlanApp; 