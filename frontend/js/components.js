// UI Components and Utilities

// Notification System
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
        document.body.appendChild(this.container);
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('translate-x-0', 'opacity-100');
            notification.classList.remove('translate-x-full', 'opacity-0');
        }, 100);

        // Auto remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `transform transition-all duration-300 translate-x-full opacity-0 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`;

        const colors = {
            success: 'bg-green-50 border-green-200 text-green-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800'
        };

        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        notification.innerHTML = `
            <div class="p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i data-lucide="${icons[type]}" class="w-5 h-5 text-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-500"></i>
                    </div>
                    <div class="ml-3 w-0 flex-1">
                        <p class="text-sm font-medium text-gray-900">${message}</p>
                    </div>
                    <div class="ml-4 flex-shrink-0 flex">
                        <button class="notification-close bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <span class="sr-only">Close</span>
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.remove(notification));

        // Initialize lucide icons
        lucide.createIcons();

        return notification;
    }

    remove(notification) {
        notification.classList.add('translate-x-full', 'opacity-0');
        notification.classList.remove('translate-x-0', 'opacity-100');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Create global notification instance
window.notifications = new NotificationSystem();

// Modal System
class ModalSystem {
    constructor() {
        this.activeModal = null;
    }

    create(content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 opacity-0 transition-opacity duration-300';
        
        const modalContent = document.createElement('div');
        modalContent.className = `bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto transform scale-95 transition-transform duration-300 ${options.className || ''}`;
        
        if (typeof content === 'string') {
            modalContent.innerHTML = content;
        } else {
            modalContent.appendChild(content);
        }

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Add close functionality
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close(modal);
            }
        });

        // Animate in
        setTimeout(() => {
            modal.classList.add('opacity-100');
            modalContent.classList.add('scale-100');
            modalContent.classList.remove('scale-95');
        }, 10);

        this.activeModal = modal;
        return modal;
    }

    close(modal) {
        if (!modal) modal = this.activeModal;
        if (!modal) return;

        const modalContent = modal.querySelector('div');
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        modalContent.classList.add('scale-95');
        modalContent.classList.remove('scale-100');

        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            if (this.activeModal === modal) {
                this.activeModal = null;
            }
        }, 300);
    }
}

// Create global modal instance
window.modal = new ModalSystem();

// Results Display Component
class ResultsDisplay {
    constructor(container) {
        this.container = container;
    }

    render(data) {
        if (!data || !data.data) {
            this.container.innerHTML = '<p class="text-red-600">Aucune donnée à afficher</p>';
            return;
        }

        const schema = data.data;
        this.container.innerHTML = `
            <div class="space-y-8">
                ${this.renderProjectOverview(schema)}
                ${this.renderRecommendedStack(schema.recommended_stack)}
                ${this.renderArchitecture(schema.architecture)}
                ${this.renderRoadmap(schema.roadmap)}
                ${this.renderFileStructure(schema.file_structure)}
                ${this.renderFeatures(schema.features)}
                ${this.renderExportOptions(schema)}
            </div>
        `;

        // Initialize lucide icons
        lucide.createIcons();
    }

    renderProjectOverview(schema) {
        return `
            <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-gray-900 flex items-center">
                        <i data-lucide="folder" class="w-6 h-6 mr-3 text-primary-600"></i>
                        ${schema.project_name}
                    </h3>
                    <div class="flex items-center space-x-2">
                        <span class="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                            ${schema.project_type}
                        </span>
                        <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                            ${schema.complexity}
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <i data-lucide="clock" class="w-8 h-8 text-gray-600 mx-auto mb-2"></i>
                        <p class="text-sm text-gray-600">Durée estimée</p>
                        <p class="font-semibold text-gray-900">${schema.estimated_duration}</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <i data-lucide="layers" class="w-8 h-8 text-gray-600 mx-auto mb-2"></i>
                        <p class="text-sm text-gray-600">Complexité</p>
                        <p class="font-semibold text-gray-900">${schema.complexity}</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <i data-lucide="target" class="w-8 h-8 text-gray-600 mx-auto mb-2"></i>
                        <p class="text-sm text-gray-600">Type</p>
                        <p class="font-semibold text-gray-900">${schema.project_type}</p>
                    </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Description</h4>
                    <p class="text-gray-700">${schema.description}</p>
                </div>
            </div>
        `;
    }

    renderRecommendedStack(stack) {
        return `
            <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <i data-lucide="layers" class="w-6 h-6 mr-3 text-primary-600"></i>
                    Stack Technologique Recommandée
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    ${this.renderTechCard('Frontend', stack.frontend, 'monitor')}
                    ${this.renderTechCard('Backend', stack.backend, 'server')}
                    ${this.renderTechCard('Base de données', stack.database, 'database')}
                    ${this.renderTechCard('Déploiement', stack.deployment, 'cloud')}
                </div>
                
                <div class="bg-blue-50 rounded-lg p-4">
                    <h4 class="font-semibold text-blue-900 mb-2">Justification</h4>
                    <p class="text-blue-800">${stack.justification}</p>
                </div>
            </div>
        `;
    }

    renderTechCard(title, tech, icon) {
        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center mb-3">
                    <i data-lucide="${icon}" class="w-5 h-5 text-primary-600 mr-2"></i>
                    <h4 class="font-semibold text-gray-900">${title}</h4>
                </div>
                <p class="font-medium text-primary-600 mb-2">${tech.name}</p>
                <p class="text-sm text-gray-600 mb-3">${tech.description}</p>
                
                <div class="space-y-2">
                    <div>
                        <p class="text-xs font-medium text-green-600 mb-1">Avantages:</p>
                        <ul class="text-xs text-gray-600">
                            ${tech.pros.slice(0, 2).map(pro => `<li>• ${pro}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="flex justify-between text-xs">
                        <span class="text-gray-500">Courbe d'apprentissage: <span class="font-medium">${tech.learning_curve}</span></span>
                        <span class="text-gray-500">Marché: <span class="font-medium">${tech.job_market}</span></span>
                    </div>
                </div>
            </div>
        `;
    }

    renderArchitecture(architecture) {
        return `
            <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <i data-lucide="git-branch" class="w-6 h-6 mr-3 text-primary-600"></i>
                    Architecture du Projet
                </h3>
                
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-900 mb-3">Vue d'ensemble</h4>
                    <p class="text-gray-700 bg-gray-50 rounded-lg p-4">${architecture.overview}</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                            <i data-lucide="box" class="w-4 h-4 mr-2"></i>
                            Composants
                        </h4>
                        <div class="space-y-2">
                            ${architecture.components.map(comp => `
                                <div class="border border-gray-200 rounded-lg p-3">
                                    <p class="font-medium text-gray-900">${comp.name}</p>
                                    <p class="text-sm text-gray-600">${comp.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                            <i data-lucide="arrow-right" class="w-4 h-4 mr-2"></i>
                            Flux de données
                        </h4>
                        <div class="space-y-2">
                            ${architecture.data_flow.map(flow => `
                                <div class="bg-gray-50 rounded-lg p-3">
                                    <p class="text-sm text-gray-700">${flow}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRoadmap(roadmap) {
        return `
            <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <i data-lucide="map" class="w-6 h-6 mr-3 text-primary-600"></i>
                    Roadmap de Développement
                </h3>
                
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-semibold text-gray-900">Durée estimée: ${roadmap.estimated_duration}</h4>
                        <span class="text-sm text-gray-600">${roadmap.phases.length} phases</span>
                    </div>
                </div>
                
                <div class="space-y-4">
                    ${roadmap.phases.map((phase, index) => `
                        <div class="border border-gray-200 rounded-lg p-4">
                            <div class="flex items-center mb-2">
                                <div class="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                                    ${index + 1}
                                </div>
                                <h5 class="font-semibold text-gray-900">${phase.name}</h5>
                                <span class="ml-auto text-sm text-gray-600">${phase.duration}</span>
                            </div>
                            <p class="text-gray-700 ml-11">${phase.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderFileStructure(structure) {
        return `
            <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <i data-lucide="folder-tree" class="w-6 h-6 mr-3 text-primary-600"></i>
                    Structure de Fichiers
                </h3>
                
                <div class="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    ${this.renderFileTree(structure, 0)}
                </div>
            </div>
        `;
    }

    renderFileTree(item, depth) {
        const indent = '  '.repeat(depth);
        const icon = item.type === 'directory' ? '📁' : '📄';
        
        let html = `${indent}${icon} ${item.name}\n`;
        
        if (item.children && item.children.length > 0) {
            html += item.children.map(child => this.renderFileTree(child, depth + 1)).join('');
        }
        
        return html;
    }

    renderFeatures(features) {
        return `
            <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <i data-lucide="check-circle" class="w-6 h-6 mr-3 text-primary-600"></i>
                    Fonctionnalités Principales
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${features.map(feature => `
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <i data-lucide="check" class="w-5 h-5 text-green-500 mr-3"></i>
                            <span class="text-gray-700">${feature}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderExportOptions(schema) {
        return `
            <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <i data-lucide="download" class="w-6 h-6 mr-3 text-primary-600"></i>
                    Options d'Export
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="exportToPDF()" class="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <i data-lucide="file-text" class="w-5 h-5 mr-2 text-red-500"></i>
                        <span class="font-medium">Export PDF</span>
                    </button>
                    
                    <button onclick="exportToMarkdown()" class="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <i data-lucide="file-code" class="w-5 h-5 mr-2 text-blue-500"></i>
                        <span class="font-medium">Export Markdown</span>
                    </button>
                    
                    <button onclick="exportToJSON()" class="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <i data-lucide="file-json" class="w-5 h-5 mr-2 text-green-500"></i>
                        <span class="font-medium">Export JSON</span>
                    </button>
                </div>
            </div>
        `;
    }
}

// Export functions
window.exportToPDF = function() {
    window.notifications.info('Export PDF en cours de développement...');
};

window.exportToMarkdown = function() {
    window.notifications.info('Export Markdown en cours de développement...');
};

window.exportToJSON = function() {
    const resultsData = window.currentResults;
    if (resultsData) {
        const dataStr = JSON.stringify(resultsData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'project-schema.json';
        link.click();
        URL.revokeObjectURL(url);
        window.notifications.success('Schéma exporté en JSON avec succès !');
    }
};

// Make ResultsDisplay available globally
window.ResultsDisplay = ResultsDisplay; 