// Haptic Feedback Utility
const HapticFeedback = {
    // Light impact (for taps)
    light() {
        if (window.TapticEngine) {
            window.TapticEngine.impact({ style: 'light' });
        } else if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    },
    
    // Medium impact (for button presses)
    medium() {
        if (window.TapticEngine) {
            window.TapticEngine.impact({ style: 'medium' });
        } else if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    },
    
    // Heavy impact (for important actions)
    heavy() {
        if (window.TapticEngine) {
            window.TapticEngine.impact({ style: 'heavy' });
        } else if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    },
    
    // Success feedback
    success() {
        if (window.TapticEngine) {
            window.TapticEngine.notification({ type: 'success' });
        } else if (navigator.vibrate) {
            navigator.vibrate([20, 10, 20]);
        }
    },
    
    // Warning feedback
    warning() {
        if (window.TapticEngine) {
            window.TapticEngine.notification({ type: 'warning' });
        } else if (navigator.vibrate) {
            navigator.vibrate([30, 10, 30]);
        }
    },
    
    // Error feedback
    error() {
        if (window.TapticEngine) {
            window.TapticEngine.notification({ type: 'error' });
        } else if (navigator.vibrate) {
            navigator.vibrate([40, 20, 40, 20, 40]);
        }
    }
};

// Main App Logic
class HomeManagerApp {
    constructor() {
        this.currentView = 'home';
        this.currentTab = 'main';
        this.editingItem = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50; // Minimum distance for a swipe
        this.maxVerticalDistance = 100; // Max vertical movement to still count as horizontal swipe
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHome();
        this.updateCategoryCounts();
        this.updateNotificationBadge();
        this.initNotifications();
        this.checkNotificationPermission();
        this.startNotificationChecker();
    }

    openSettings() {
        const overlay = document.getElementById('settings-overlay');
        overlay.classList.add('active');
        // Update notification UI when opening settings
        this.checkNotificationPermission();
    }

    closeSettings() {
        const overlay = document.getElementById('settings-overlay');
        overlay.classList.remove('active');
    }

    showExportMenu() {
        const menu = document.createElement('div');
        menu.className = 'export-menu-overlay';
        menu.innerHTML = `
            <div class="export-menu">
                <div class="export-menu-header">
                    <h3 class="export-menu-title">Export Data</h3>
                    <button class="export-menu-close" onclick="this.closest('.export-menu-overlay').remove()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="export-menu-body">
                    <div class="export-format-section">
                        <h4 class="export-section-title">Export Format</h4>
                        <div class="export-format-options">
                            <label class="export-format-option">
                                <input type="radio" name="export-format" value="csv" checked>
                                <span>CSV</span>
                            </label>
                            <label class="export-format-option">
                                <input type="radio" name="export-format" value="pdf">
                                <span>PDF</span>
                            </label>
                        </div>
                    </div>
                    <div class="export-category-section">
                        <h4 class="export-section-title">Categories</h4>
                        <div class="export-category-options">
                            <label class="export-category-option">
                                <input type="checkbox" name="export-category" value="all" checked>
                                <span>All Categories</span>
                            </label>
                            <label class="export-category-option">
                                <input type="checkbox" name="export-category" value="todos">
                                <span>Tasks</span>
                            </label>
                            <label class="export-category-option">
                                <input type="checkbox" name="export-category" value="cars">
                                <span>Cars</span>
                            </label>
                            <label class="export-category-option">
                                <input type="checkbox" name="export-category" value="bills">
                                <span>Bills</span>
                            </label>
                            <label class="export-category-option">
                                <input type="checkbox" name="export-category" value="finances">
                                <span>Finance</span>
                            </label>
                            <label class="export-category-option">
                                <input type="checkbox" name="export-category" value="insurances">
                                <span>Insurances</span>
                            </label>
                            <label class="export-category-option">
                                <input type="checkbox" name="export-category" value="savings">
                                <span>Savings</span>
                            </label>
                        </div>
                    </div>
                    <div class="export-action-section">
                        <button class="export-action-btn primary" onclick="HapticFeedback.medium(); app.handleExport()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            <span>Export</span>
                        </button>
                        <button class="export-action-btn secondary" onclick="HapticFeedback.medium(); app.handleEmailExport()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <span>Email</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Handle "All Categories" checkbox
        const allCheckbox = menu.querySelector('input[value="all"]');
        const categoryCheckboxes = menu.querySelectorAll('input[value!="all"]');
        
        allCheckbox.addEventListener('change', (e) => {
            categoryCheckboxes.forEach(cb => {
                cb.checked = e.target.checked;
                cb.disabled = e.target.checked;
            });
        });
        
        categoryCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const allChecked = Array.from(categoryCheckboxes).every(c => c.checked);
                allCheckbox.checked = allChecked;
            });
        });
        
        // Close on overlay click
        menu.addEventListener('click', (e) => {
            if (e.target === menu) {
                menu.remove();
            }
        });
    }

    handleExport() {
        const menu = document.querySelector('.export-menu-overlay');
        if (!menu) return;
        
        const format = menu.querySelector('input[name="export-format"]:checked')?.value || 'csv';
        const selectedCategories = Array.from(menu.querySelectorAll('input[name="export-category"]:checked'))
            .map(cb => cb.value)
            .filter(v => v !== 'all');
        
        if (selectedCategories.length === 0) {
            alert('Please select at least one category to export.');
            return;
        }
        
        if (format === 'csv') {
            this.exportToCSV(selectedCategories);
        } else {
            this.exportToPDF(selectedCategories);
        }
        
        menu.remove();
    }

    handleEmailExport() {
        const menu = document.querySelector('.export-menu-overlay');
        if (!menu) return;
        
        const format = menu.querySelector('input[name="export-format"]:checked')?.value || 'csv';
        const selectedCategories = Array.from(menu.querySelectorAll('input[name="export-category"]:checked'))
            .map(cb => cb.value)
            .filter(v => v !== 'all');
        
        if (selectedCategories.length === 0) {
            alert('Please select at least one category to export.');
            return;
        }
        
        if (format === 'csv') {
            this.emailCSV(selectedCategories);
        } else {
            this.emailPDF(selectedCategories);
        }
        
        menu.remove();
    }

    exportToCSV(categories) {
        const data = storage.getData();
        if (!data) return;
        
        let csvContent = '';
        const timestamp = new Date().toISOString().split('T')[0];
        
        categories.forEach(category => {
            const items = data[category] || [];
            if (items.length === 0) return;
            
            const categoryName = this.getCategoryDisplayName(category);
            csvContent += `\n${categoryName}\n`;
            csvContent += '='.repeat(50) + '\n';
            
            if (items.length > 0) {
                // Get headers from first item
                const headers = Object.keys(items[0]);
                csvContent += headers.join(',') + '\n';
                
                // Add rows
                items.forEach(item => {
                    const row = headers.map(header => {
                        const value = item[header];
                        if (value === null || value === undefined) return '';
                        if (typeof value === 'object') return JSON.stringify(value);
                        return String(value).replace(/"/g, '""');
                    });
                    csvContent += row.map(v => `"${v}"`).join(',') + '\n';
                });
            }
            csvContent += '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `home-manager-export-${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportToPDF(categories) {
        // For PDF, we'll create a simple text-based PDF or use a library
        // Since we don't have a PDF library, we'll create a formatted text file that can be converted
        const data = storage.getData();
        if (!data) return;
        
        let pdfContent = 'Home Manager Data Export\n';
        pdfContent += 'Generated: ' + new Date().toLocaleString() + '\n';
        pdfContent += '='.repeat(60) + '\n\n';
        
        const timestamp = new Date().toISOString().split('T')[0];
        
        categories.forEach(category => {
            const items = data[category] || [];
            if (items.length === 0) return;
            
            const categoryName = this.getCategoryDisplayName(category);
            pdfContent += `\n${categoryName}\n`;
            pdfContent += '-'.repeat(60) + '\n';
            
            items.forEach((item, index) => {
                pdfContent += `\nItem ${index + 1}:\n`;
                Object.keys(item).forEach(key => {
                    if (key !== 'id') {
                        const value = item[key];
                        if (value !== null && value !== undefined) {
                            pdfContent += `  ${key}: ${value}\n`;
                        }
                    }
                });
            });
            pdfContent += '\n';
        });
        
        const blob = new Blob([pdfContent], { type: 'text/plain' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `home-manager-export-${timestamp}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    emailCSV(categories) {
        const data = storage.getData();
        if (!data) return;
        
        let csvContent = '';
        const timestamp = new Date().toISOString().split('T')[0];
        
        categories.forEach(category => {
            const items = data[category] || [];
            if (items.length === 0) return;
            
            const categoryName = this.getCategoryDisplayName(category);
            csvContent += `\n${categoryName}\n`;
            csvContent += '='.repeat(50) + '\n';
            
            if (items.length > 0) {
                const headers = Object.keys(items[0]);
                csvContent += headers.join(',') + '\n';
                
                items.forEach(item => {
                    const row = headers.map(header => {
                        const value = item[header];
                        if (value === null || value === undefined) return '';
                        if (typeof value === 'object') return JSON.stringify(value);
                        return String(value).replace(/"/g, '""');
                    });
                    csvContent += row.map(v => `"${v}"`).join(',') + '\n';
                });
            }
            csvContent += '\n';
        });
        
        // Create and download the file first, then open email
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `home-manager-export-${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Open email client with instructions
        setTimeout(() => {
            const subject = encodeURIComponent(`Home Manager Export - ${timestamp}`);
            const body = encodeURIComponent(`Please find the exported data file "home-manager-export-${timestamp}.csv" attached.\n\nThis file contains your ${categories.map(c => this.getCategoryDisplayName(c)).join(', ')} data from Home Manager.`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
        }, 500);
    }

    emailPDF(categories) {
        // Similar to emailCSV but for PDF format
        this.emailCSV(categories); // For now, use CSV format for email
    }

    getCategoryDisplayName(category) {
        const names = {
            'todos': 'Tasks',
            'cars': 'Cars',
            'bills': 'Bills',
            'finances': 'Finance',
            'insurances': 'Insurances',
            'savings': 'Savings'
        };
        return names[category] || category;
    }

    setupEventListeners() {
        // Tab switching - use event delegation for better reliability
        document.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn) {
                const tab = tabBtn.getAttribute('data-tab');
                if (tab) {
                    e.preventDefault();
                    e.stopPropagation();
                    HapticFeedback.light();
                    this.switchTab(tab);
                }
            }
        });

        // Swipe gesture detection for tab switching
        this.setupSwipeGestures();

        // View switching (bottom nav)
        document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.nav-item').getAttribute('data-view');
                this.switchView(view);
            });
        });

        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.getAttribute('data-category');
                this.openCategory(category);
            });
        });

        // Add button
        document.getElementById('open-add-modal')?.addEventListener('click', () => {
            this.openAddModal();
        });

        // Notifications button
        document.getElementById('notifications-btn')?.addEventListener('click', () => {
            this.openNotifications();
        });

        // Settings button
        document.querySelector('.settings-btn')?.addEventListener('click', () => {
            this.openSettings();
        });

        // Close settings
        document.getElementById('close-settings')?.addEventListener('click', () => {
            HapticFeedback.light();
            this.closeSettings();
        });

        // Settings overlay click outside
        document.getElementById('settings-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'settings-overlay') {
                this.closeSettings();
            }
        });

        // Close overlay buttons
        document.getElementById('close-overlay')?.addEventListener('click', () => {
            this.closeOverlay();
        });
        document.getElementById('close-overlay-2')?.addEventListener('click', () => {
            this.closeOverlay();
        });

        // Back button
        document.getElementById('back-to-category')?.addEventListener('click', () => {
            this.goToCategorySelection();
        });

        // Category selection
        document.querySelectorAll('.category-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.getAttribute('data-category');
                this.selectCategory(category);
            });
        });

        // Overlay form submit
        document.getElementById('overlay-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(e.target);
        });

        // Click outside overlay to close
        document.getElementById('overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'overlay') {
                this.closeOverlay();
            }
        });

        // View toggle buttons (delegated event listener)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-toggle-btn')) {
                const btn = e.target.closest('.view-toggle-btn');
                const mode = btn.getAttribute('data-view');
                if (mode) {
                    this.setCardViewMode(mode);
                }
            }
        });
    }

    setupSwipeGestures() {
        const mainContent = document.getElementById('main-content-view');
        if (!mainContent) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        mainContent.addEventListener('touchstart', (e) => {
            // Don't trigger swipe if touching a scrollable element
            if (e.target.closest('.calendar-grid') || 
                e.target.closest('.action-items-list') || 
                e.target.closest('.recent-updates-list') ||
                e.target.closest('.tasks-list') ||
                e.target.closest('.items-grid') ||
                e.target.closest('.overlay')) {
                return;
            }
            
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        mainContent.addEventListener('touchend', (e) => {
            // Don't trigger swipe if touching a scrollable element
            if (e.target.closest('.calendar-grid') || 
                e.target.closest('.action-items-list') || 
                e.target.closest('.recent-updates-list') ||
                e.target.closest('.tasks-list') ||
                e.target.closest('.items-grid') ||
                e.target.closest('.overlay')) {
                return;
            }

            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Check if it's a horizontal swipe (more horizontal than vertical)
        if (absDeltaX > this.minSwipeDistance && absDeltaX > absDeltaY && absDeltaY < this.maxVerticalDistance) {
            // Only allow swiping when on home view with tabs
            if (this.currentView !== 'home') return;

            // Get all tabs in order
            const tabs = Array.from(document.querySelectorAll('.tab-btn'))
                .map(btn => btn.getAttribute('data-tab'))
                .filter(tab => tab);

            if (tabs.length === 0) return;

            // Find current tab index
            const currentIndex = tabs.indexOf(this.currentTab);
            if (currentIndex === -1) return;

            // Swipe left = next tab, Swipe right = previous tab
            if (deltaX < 0) {
                // Swipe left - go to next tab
                const nextIndex = (currentIndex + 1) % tabs.length;
                HapticFeedback.light();
                this.switchTab(tabs[nextIndex]);
            } else {
                // Swipe right - go to previous tab
                const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                HapticFeedback.light();
                this.switchTab(tabs[prevIndex]);
            }
        }
    }

    switchTab(tab) {
        if (!tab) return;
        
        this.currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
        });
        
        // Always switch to home view first - tabs are part of home view
        if (this.currentView !== 'home') {
            this.currentView = 'home';
            
            // Hide all content views
            document.querySelectorAll('.content-view').forEach(view => {
                view.classList.remove('active');
            });
            
            // Show main content view (this is the home view container)
            const mainContentView = document.getElementById('main-content-view');
            if (mainContentView) {
                mainContentView.classList.add('active');
            }
            
            // Update bottom navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.getAttribute('data-view') === 'home');
            });
        }
        
        // Render appropriate content based on tab
        if (tab === 'main') {
            this.renderHome();
        } else if (tab === 'tasks') {
            this.renderTasks();
        } else if (tab === 'insurances') {
            this.renderInsurances();
        } else if (tab === 'subscriptions') {
            this.renderSubscriptions();
        } else if (tab === 'categories') {
            this.renderCategories();
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Update nav items
        document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === view);
        });

        // Update content views
        const mainContentView = document.getElementById('main-content-view');
        if (mainContentView) {
            mainContentView.classList.add('active');
        }

        if (view === 'home') {
            this.renderHome();
            this.switchTab('main');
        } else if (view === 'cars') {
            this.renderCars();
        } else if (view === 'finance') {
            this.renderFinance();
        } else if (view === 'bills') {
            this.renderBills();
        } else if (view === 'insurances') {
            this.renderInsurances();
        }
    }

    openCategory(category) {
        // For now, switch to tasks view and filter by category
        this.switchView('tasks');
        this.switchTab('tasks');
        // TODO: Implement category filtering
        console.log('Opening category:', category);
    }

    openAddModal(category = null, item = null) {
        const overlay = document.getElementById('overlay');
        this.editingItem = item;
        this.selectedCategory = category;

        if (item || category) {
            // If editing or category is pre-selected, go directly to form
            if (category) {
                this.selectCategory(category);
            } else {
                this.selectCategory(item.category || 'todos');
                this.populateForm(item);
            }
        } else {
            // Start with category selection
            this.goToCategorySelection();
        }

        overlay.classList.add('active');
    }

    goToCategorySelection() {
        const categorySlide = document.getElementById('slide-category');
        const formSlide = document.getElementById('slide-form');
        
        categorySlide.classList.add('active');
        formSlide.classList.remove('active');
        
        this.selectedCategory = null;
        this.editingItem = null;
        document.getElementById('overlay-form').reset();
        // Clear the ID field
        const idInput = document.getElementById('edit-id');
        if (idInput) {
            idInput.value = '';
        }
    }

    selectCategory(category) {
        this.selectedCategory = category;
        const categorySlide = document.getElementById('slide-category');
        const formSlide = document.getElementById('slide-form');
        
        // Generate form based on category
        this.generateForm(category);
        
        // Slide transition
        categorySlide.classList.remove('active');
        formSlide.classList.add('active');
    }

    generateForm(category) {
        const formFields = document.getElementById('form-fields');
        const formTitle = document.getElementById('form-title');
        const submitBtn = document.querySelector('.submit-btn');
        const categoryInput = document.getElementById('selected-category');
        
        categoryInput.value = category;
        
        const categoryNames = {
            todos: 'To-Do',
            cars: 'Car',
            bills: 'Bill',
            insurances: 'Insurance',
            finances: 'Finance',
            savings: 'Savings Goal',
            checking: 'Checking',
            subscriptions: 'Subscription'
        };

        formTitle.textContent = this.editingItem ? `Edit ${categoryNames[category] || 'Item'}` : `Add ${categoryNames[category] || 'Item'}`;
        submitBtn.textContent = this.editingItem ? 'Update' : 'Add';
        
        // Clear ID field if adding new item
        if (!this.editingItem) {
            const idInput = document.getElementById('edit-id');
            if (idInput) {
                idInput.value = '';
            }
        }

        let formHTML = '';

        switch(category) {
            case 'todos':
                formHTML = `
                    <div class="form-group">
                        <label for="item-title">Enter Task</label>
                        <input type="text" id="item-title" name="title" placeholder="Enter task name" required>
                    </div>
                    <div class="form-group">
                        <label for="item-date">For or Due Date</label>
                        <input type="date" id="item-date" name="date" required>
                    </div>
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="notify-me" name="notify">
                            <span>Notify Me</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" id="give-priority" name="priority">
                            <span>Give Priority</span>
                        </label>
                    </div>
                `;
                break;
            case 'cars':
                formHTML = `
                    <div class="form-group">
                        <label for="item-make">Make</label>
                        <input type="text" id="item-make" name="make" placeholder="e.g., Toyota" required>
                    </div>
                    <div class="form-group">
                        <label for="item-model">Model</label>
                        <input type="text" id="item-model" name="model" placeholder="e.g., Camry" required>
                    </div>
                    <div class="form-group">
                        <label for="item-year">Year</label>
                        <input type="number" id="item-year" name="year" placeholder="e.g., 2020" min="1900" max="2100" required>
                    </div>
                    <div class="form-group">
                        <label for="item-vin">VIN (Optional)</label>
                        <input type="text" id="item-vin" name="vin" placeholder="Vehicle Identification Number">
                    </div>
                    <div class="form-group">
                        <label for="item-mileage">Current Mileage (Optional)</label>
                        <input type="number" id="item-mileage" name="mileage" placeholder="e.g., 50000" min="0">
                    </div>
                    <div class="form-section-divider">Insurance</div>
                    <div class="form-group">
                        <label for="item-insuranceProvider">Insurance Provider (Optional)</label>
                        <input type="text" id="item-insuranceProvider" name="insuranceProvider" placeholder="e.g., State Farm">
                    </div>
                    <div class="form-group">
                        <label for="item-insurancePolicy">Policy Number (Optional)</label>
                        <input type="text" id="item-insurancePolicy" name="insurancePolicy" placeholder="Policy number">
                    </div>
                    <div class="form-group">
                        <label for="item-insuranceExp">Insurance Expiration (Optional)</label>
                        <input type="date" id="item-insuranceExp" name="insuranceExp">
                    </div>
                    <div class="form-section-divider">Service</div>
                    <div class="form-group">
                        <label for="item-lastServiceDate">Last Service Date (Optional)</label>
                        <input type="date" id="item-lastServiceDate" name="lastServiceDate">
                    </div>
                    <div class="form-group">
                        <label for="item-lastServiceType">Last Service Type (Optional)</label>
                        <input type="text" id="item-lastServiceType" name="lastServiceType" placeholder="e.g., Oil Change, Tire Rotation">
                    </div>
                    <div class="form-section-divider">Registration & Inspection</div>
                    <div class="form-group">
                        <label for="item-registrationExp">Registration Expiration (Optional)</label>
                        <input type="date" id="item-registrationExp" name="registrationExp">
                    </div>
                    <div class="form-group">
                        <label for="item-inspectionExp">Inspection Expiration (Optional)</label>
                        <input type="date" id="item-inspectionExp" name="inspectionExp">
                    </div>
                    <div class="form-section-divider">Vehicle Payment</div>
                    <div class="form-group">
                        <label for="item-amountOwed">Total Amount Owed (Optional)</label>
                        <input type="number" id="item-amountOwed" name="amountOwed" placeholder="0.00" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label for="item-monthlyPayment">Monthly Payment Amount (Optional)</label>
                        <input type="number" id="item-monthlyPayment" name="monthlyPayment" placeholder="0.00" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label for="item-paymentDueDate">Monthly Payment Due Date (Optional)</label>
                        <input type="date" id="item-paymentDueDate" name="paymentDueDate">
                    </div>
                `;
                break;
            case 'bills':
                formHTML = `
                    <div class="form-group">
                        <label for="item-name">Bill Name</label>
                        <input type="text" id="item-name" name="name" placeholder="e.g., Electricity Bill" required>
                    </div>
                    <div class="form-group">
                        <label for="item-amount">Amount</label>
                        <input type="number" id="item-amount" name="amount" placeholder="0.00" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="item-dueDate">Due Date</label>
                        <input type="date" id="item-dueDate" name="dueDate" required>
                    </div>
                    <div class="form-group">
                        <label for="item-frequency">Frequency</label>
                        <select id="item-frequency" name="frequency">
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                            <option value="yearly">Yearly</option>
                            <option value="one-time">One-time</option>
                        </select>
                    </div>
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="auto-pay" name="autoPay">
                            <span>Auto-pay Enabled</span>
                        </label>
                    </div>
                `;
                break;
            case 'insurances':
                formHTML = `
                    <div class="form-group">
                        <label for="item-type">Insurance Type</label>
                        <select id="item-type" name="type" required>
                            <option value="car">Car</option>
                            <option value="home">Home</option>
                            <option value="health">Health</option>
                            <option value="life">Life</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="item-name">Insured Item/Person</label>
                        <input type="text" id="item-name" name="name" placeholder="e.g., Car name, Person name, Property address" required>
                    </div>
                    <div class="form-group">
                        <label for="item-provider">Provider</label>
                        <input type="text" id="item-provider" name="provider" placeholder="Insurance company name" required>
                    </div>
                    <div class="form-group">
                        <label for="item-policyNumber">Policy Number</label>
                        <input type="text" id="item-policyNumber" name="policyNumber" placeholder="Policy number" required>
                    </div>
                    <div class="form-group">
                        <label for="item-premium">Premium Amount</label>
                        <input type="number" id="item-premium" name="premium" placeholder="0.00" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="item-renewalDate">Renewal Date</label>
                        <input type="date" id="item-renewalDate" name="renewalDate" required>
                    </div>
                `;
                break;
            case 'finances':
                formHTML = `
                    <div class="form-group">
                        <label for="item-financeCategory">Finance Category</label>
                        <select id="item-financeCategory" name="financeCategory" required>
                            <option value="">Select a category</option>
                            <option value="cash">Cash</option>
                            <option value="stocks">Worth of Stocks</option>
                            <option value="401k">401k</option>
                            <option value="savings">Savings</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="item-amount">Amount</label>
                        <input type="number" id="item-amount" name="amount" placeholder="0.00" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="item-description">Description (Optional)</label>
                        <input type="text" id="item-description" name="description" placeholder="Additional notes">
                    </div>
                `;
                break;
            case 'savings':
                formHTML = `
                    <div class="form-group">
                        <label for="item-name">Savings Goal Name</label>
                        <input type="text" id="item-name" name="name" placeholder="e.g., Emergency Fund" required>
                    </div>
                    <div class="form-group">
                        <label for="item-targetAmount">Target Amount</label>
                        <input type="number" id="item-targetAmount" name="targetAmount" placeholder="0.00" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="item-currentAmount">Current Amount</label>
                        <input type="number" id="item-currentAmount" name="currentAmount" placeholder="0.00" step="0.01" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label for="item-targetDate">Target Date</label>
                        <input type="date" id="item-targetDate" name="targetDate" required>
                    </div>
                `;
                break;
            case 'checking':
                formHTML = `
                    <div class="form-group">
                        <label for="item-balance">Checking Account Balance</label>
                        <input type="number" id="item-balance" name="balance" placeholder="0.00" step="0.01" required>
                    </div>
                `;
                break;
            case 'subscriptions':
                formHTML = `
                    <div class="form-group">
                        <label for="item-name">Subscription Name</label>
                        <input type="text" id="item-name" name="name" placeholder="e.g., Netflix, Spotify" required>
                    </div>
                    <div class="form-group">
                        <label for="item-amount">Monthly Amount</label>
                        <input type="number" id="item-amount" name="amount" placeholder="0.00" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="item-billingDate">Billing Date</label>
                        <input type="date" id="item-billingDate" name="billingDate" required>
                    </div>
                    <div class="form-group">
                        <label for="item-frequency">Frequency</label>
                        <select id="item-frequency" name="frequency">
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" id="auto-renew" name="autoRenew">
                            <span>Auto-renew</span>
                        </label>
                    </div>
                `;
                break;
        }

        formFields.innerHTML = formHTML;

        // Populate if editing
        if (this.editingItem) {
            this.populateForm(this.editingItem);
        }
    }

    populateForm(item) {
        // Set the ID field for editing
        const idInput = document.getElementById('edit-id');
        if (idInput && item.id) {
            idInput.value = item.id;
        }
        
        Object.keys(item).forEach(key => {
            const input = document.getElementById(`item-${key}`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = item[key] || false;
                } else if (input.type === 'date') {
                    // Format date for date inputs (YYYY-MM-DD)
                    if (item[key]) {
                        const date = new Date(item[key]);
                        if (!isNaN(date.getTime())) {
                            input.value = date.toISOString().split('T')[0];
                        }
                    }
                } else if (input.tagName === 'SELECT') {
                    // Handle select dropdowns
                    input.value = item[key] || '';
                    // For finances, handle both financeCategory and category
                    if (key === 'financeCategory' && !item.financeCategory && item.category) {
                        // Check if old category matches one of our new categories
                        const categoryMap = {
                            'cash': 'cash',
                            'stocks': 'stocks',
                            '401k': '401k',
                            'savings': 'savings'
                        };
                        const normalizedCategory = item.category.toLowerCase();
                        if (categoryMap[normalizedCategory]) {
                            input.value = categoryMap[normalizedCategory];
                        }
                    }
                } else {
                    input.value = item[key] || '';
                }
            }
        });
        // Handle special cases for todos
        if (item.date && document.getElementById('item-date')) {
            const date = new Date(item.date);
            if (!isNaN(date.getTime())) {
                document.getElementById('item-date').value = date.toISOString().split('T')[0];
            }
        } else if (item.dueDate && document.getElementById('item-date')) {
            const date = new Date(item.dueDate);
            if (!isNaN(date.getTime())) {
                document.getElementById('item-date').value = date.toISOString().split('T')[0];
            }
        }
    }

    openAddModalWithDate(category = 'todos', dateStr = null) {
        this.openAddModal(category, null);
        // Wait for form to be generated, then set date
        setTimeout(() => {
            if (dateStr) {
                const dateInput = document.getElementById('item-date') || document.getElementById('item-dueDate');
                if (dateInput) {
                    dateInput.value = dateStr;
                }
            }
        }, 100);
    }

    showDateEntryMenu(dateStr) {
        const formattedDate = new Date(dateStr).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });

        // Create menu overlay
        const menu = document.createElement('div');
        menu.className = 'date-entry-menu-overlay';
        menu.innerHTML = `
            <div class="date-entry-menu">
                <div class="date-entry-menu-header">
                    <h3 class="date-entry-menu-title">Add Entry for</h3>
                    <p class="date-entry-menu-date">${formattedDate}</p>
                    <button class="date-entry-menu-close" onclick="this.closest('.date-entry-menu-overlay').remove()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="date-entry-menu-options">
                    <button class="date-entry-option" onclick="HapticFeedback.medium(); app.openAddModalWithDate('todos', '${dateStr}'); this.closest('.date-entry-menu-overlay').remove();">
                        <div class="date-entry-option-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                        </div>
                        <div class="date-entry-option-content">
                            <div class="date-entry-option-title">Task</div>
                            <div class="date-entry-option-subtitle">Add a task for this date</div>
                        </div>
                    </button>
                    <button class="date-entry-option" onclick="HapticFeedback.medium(); app.openAddModalWithDate('bills', '${dateStr}'); this.closest('.date-entry-menu-overlay').remove();">
                        <div class="date-entry-option-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
                                <path d="M9 8h6" />
                                <path d="M9 12h6" />
                                <path d="M9 16h4" />
                            </svg>
                        </div>
                        <div class="date-entry-option-content">
                            <div class="date-entry-option-title">Bill</div>
                            <div class="date-entry-option-subtitle">Add a bill due on this date</div>
                        </div>
                    </button>
                    <button class="date-entry-option" onclick="HapticFeedback.medium(); app.openAddModalWithDate('finances', '${dateStr}'); this.closest('.date-entry-menu-overlay').remove();">
                        <div class="date-entry-option-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 3v18" />
                                <path d="M16 7.5c0-1.9-1.8-3.5-4-3.5s-4 1.6-4 3.5 1.8 3.5 4 3.5 4 1.6 4 3.5-1.8 3.5-4 3.5-4-1.6-4-3.5" />
                            </svg>
                        </div>
                        <div class="date-entry-option-content">
                            <div class="date-entry-option-title">Finance</div>
                            <div class="date-entry-option-subtitle">Add a transaction for this date</div>
                        </div>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Close on overlay click
        menu.addEventListener('click', (e) => {
            if (e.target === menu) {
                menu.remove();
            }
        });
    }

    closeOverlay() {
        const overlay = document.getElementById('overlay');
        overlay.classList.remove('active');
        this.editingItem = null;
        this.selectedCategory = null;
        document.getElementById('overlay-form').reset();
        // Clear the ID field
        const idInput = document.getElementById('edit-id');
        if (idInput) {
            idInput.value = '';
        }
        this.goToCategorySelection();
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const id = formData.get('id');
        const category = formData.get('category') || this.selectedCategory || 'todos';
        
        // Build item data from form
        const itemData = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'id' && key !== 'category') {
                if (value === 'on') {
                    itemData[key] = true;
                } else if (value === '') {
                    // Skip empty values
                } else {
                    itemData[key] = value;
                }
            }
        }

        // Category-specific defaults
        if (category === 'todos') {
            // Only set completed to false for new todos, preserve existing for edits
            if (!id) {
                itemData.completed = false;
            } else if (this.editingItem && this.editingItem.completed !== undefined) {
                itemData.completed = this.editingItem.completed;
            }
            itemData.dueDate = itemData.date || itemData.dueDate;
            itemData.priority = itemData.priority || false;
            itemData.notify = itemData.notify || false;
        } else if (category === 'bills') {
            itemData.paid = itemData.paid || false;
        } else if (category === 'savings') {
            itemData.currentAmount = itemData.currentAmount || 0;
        } else if (category === 'finances') {
            // Preserve existing type and date when editing, or set defaults for new items
            if (id && this.editingItem) {
                // Preserve existing type if not being changed
                if (!itemData.type && this.editingItem.type) {
                    itemData.type = this.editingItem.type;
                }
                // Preserve existing date if not being changed
                if (!itemData.date && this.editingItem.date) {
                    itemData.date = this.editingItem.date;
                }
            } else {
                // Set defaults for new items
                if (!itemData.type) {
                    itemData.type = 'income';
                }
                if (!itemData.date) {
                    itemData.date = new Date().toISOString().split('T')[0];
                }
            }
        }

        if (id) {
            // Update existing - preserve existing completed status for todos if not being changed
            if (category === 'todos' && this.editingItem && this.editingItem.completed !== undefined && itemData.completed === undefined) {
                itemData.completed = this.editingItem.completed;
            }
            storage.update(category, id, itemData);
        } else {
            // Add new
            storage.add(category, itemData);
        }

        this.closeOverlay();
        
        // If adding a new item (not editing), navigate to the relevant view
        if (!id) {
            // Map category to view
            const categoryToView = {
                'todos': 'home',
                'cars': 'cars',
                'bills': 'bills',
                'finances': 'finance',
                'checking': 'finance',
                'insurances': 'insurances',
                'subscriptions': 'insurances',
                'savings': 'home'
            };
            
            const targetView = categoryToView[category] || 'home';
            
            // Switch to the relevant view
            if (targetView === 'home') {
                this.switchView('home');
                // If it's a task, switch to tasks tab
                if (category === 'todos') {
                    const tasksTab = document.querySelector('.tab-btn[data-tab="tasks"]');
                    if (tasksTab) {
                        tasksTab.click();
                    }
                } else if (category === 'insurances') {
                    const insurancesTab = document.querySelector('.tab-btn[data-tab="insurances"]');
                    if (insurancesTab) {
                        insurancesTab.click();
                    }
                } else if (category === 'subscriptions') {
                    const subscriptionsTab = document.querySelector('.tab-btn[data-tab="subscriptions"]');
                    if (subscriptionsTab) {
                        subscriptionsTab.click();
                    }
                }
            } else if (targetView === 'insurances') {
                // For insurances or subscriptions, switch to home view and then to appropriate tab
                this.switchView('home');
                if (category === 'insurances') {
                    const insurancesTab = document.querySelector('.tab-btn[data-tab="insurances"]');
                    if (insurancesTab) {
                        insurancesTab.click();
                    }
                } else if (category === 'subscriptions') {
                    const subscriptionsTab = document.querySelector('.tab-btn[data-tab="subscriptions"]');
                    if (subscriptionsTab) {
                        subscriptionsTab.click();
                    }
                }
            } else {
                this.switchView(targetView);
            }
        } else {
            // If editing, refresh current view
            if (this.currentView === 'home') {
                this.renderHome();
                // Check if we need to render tasks tab
                const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
                if (activeTab === 'tasks') {
                    this.renderTasks();
                }
            } else if (this.currentView === 'cars') {
                this.renderCars();
            } else if (this.currentView === 'finance') {
                this.renderFinance();
            } else if (this.currentView === 'bills') {
                this.renderBills();
            } else if (this.currentView === 'insurances') {
                this.renderInsurances();
            } else if (this.currentView === 'subscriptions') {
                this.renderSubscriptions();
            }
        }
        
        this.updateCategoryCounts();
        this.setupCardClickHandlers();
        this.updateNotificationBadge();
    }

    setupCardClickHandlers() {
        // Setup click handlers for item cards
        setTimeout(() => {
            document.querySelectorAll('.item-card[data-category]').forEach(card => {
                card.addEventListener('click', (e) => {
                    const category = card.getAttribute('data-category');
                    const index = parseInt(card.getAttribute('data-index'));
                    const items = category === 'cars' ? storage.getCars() :
                                 category === 'finances' ? storage.getFinances() :
                                 category === 'bills' ? storage.getBills() :
                                 category === 'subscriptions' ? storage.getAll('subscriptions') || [] :
                                 category === 'insurances' ? storage.getAll('insurances') || [] : [];
                    if (items[index]) {
                        this.openAddModal(category, items[index]);
                    }
                });
            });
        }, 100);
    }

    getRecentActivity() {
        const data = storage.getData();
        if (!data) return [];

        // Get the last cleared timestamp
        const lastCleared = localStorage.getItem('recentUpdatesLastCleared');
        const lastClearedDate = lastCleared ? new Date(lastCleared) : null;

        const activities = [];
        const categories = ['todos', 'cars', 'bills', 'insurances', 'finances', 'savings'];
        const categoryNames = {
            todos: 'Task',
            cars: 'Car',
            bills: 'Bill',
            insurances: 'Insurance',
            finances: 'Finance',
            savings: 'Savings'
        };

        categories.forEach(category => {
            const items = data[category] || [];
            items.forEach(item => {
                // Add created activity
                if (item.createdAt) {
                    const createdTimestamp = new Date(item.createdAt);
                    // Only include if it's after the last cleared date
                    if (!lastClearedDate || createdTimestamp > lastClearedDate) {
                        activities.push({
                            type: 'added',
                            category: category,
                            categoryName: categoryNames[category],
                            item: item,
                            timestamp: createdTimestamp,
                            id: item.id + '_created'
                        });
                    }
                }
                // Add updated activity (if updated after creation)
                if (item.updatedAt && item.createdAt) {
                    const created = new Date(item.createdAt);
                    const updated = new Date(item.updatedAt);
                    // Only show update if it's at least 1 second after creation
                    if (updated.getTime() - created.getTime() > 1000) {
                        // Only include if it's after the last cleared date
                        if (!lastClearedDate || updated > lastClearedDate) {
                            activities.push({
                                type: 'updated',
                                category: category,
                                categoryName: categoryNames[category],
                                item: item,
                                timestamp: updated,
                                id: item.id + '_updated'
                            });
                        }
                    }
                }
            });
        });

        // Sort by most recent first
        return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    toggleRecentUpdates() {
        const list = document.getElementById('recent-updates-list');
        const btn = document.getElementById('expand-updates-btn');
        if (!list || !btn) return;
        
        const expandText = btn.querySelector('.expand-text');
        const expandIcon = btn.querySelector('.expand-icon');
        
        if (list.classList.contains('expanded')) {
            list.classList.remove('expanded');
            expandText.textContent = 'Show More';
            expandIcon.style.transform = 'rotate(0deg)';
        } else {
            list.classList.add('expanded');
            expandText.textContent = 'Show Less';
            expandIcon.style.transform = 'rotate(180deg)';
        }
    }

    toggleRecentUpdatesSection() {
        const container = document.getElementById('recent-updates-container');
        const indicator = document.getElementById('recent-updates-indicator');
        if (!container || !indicator) return;
        
        const isCollapsed = container.classList.contains('collapsed');
        
        if (isCollapsed) {
            container.classList.remove('collapsed');
            indicator.style.transform = 'rotate(0deg)';
            localStorage.setItem('recentUpdatesCollapsed', 'false');
        } else {
            container.classList.add('collapsed');
            indicator.style.transform = 'rotate(-90deg)';
            localStorage.setItem('recentUpdatesCollapsed', 'true');
        }
    }

    loadRecentUpdatesState() {
        const container = document.getElementById('recent-updates-container');
        const indicator = document.getElementById('recent-updates-indicator');
        if (!container || !indicator) return;
        
        const isCollapsed = localStorage.getItem('recentUpdatesCollapsed') === 'true';
        if (isCollapsed) {
            container.classList.add('collapsed');
            indicator.style.transform = 'rotate(-90deg)';
        }
    }

    confirmClearRecentUpdates() {
        // Create confirmation dialog
        const dialog = document.createElement('div');
        dialog.className = 'delete-confirm-overlay';
        dialog.innerHTML = `
            <div class="delete-confirm-dialog">
                <div class="delete-confirm-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                </div>
                <h3 class="delete-confirm-title">Clear Recent Updates?</h3>
                <p class="delete-confirm-message">Are you sure you want to clear all recent updates? This will hide all current updates from the list. New updates will still appear.</p>
                <div class="delete-confirm-actions">
                    <button class="delete-confirm-btn cancel-btn" onclick="this.closest('.delete-confirm-overlay').remove()">Cancel</button>
                    <button class="delete-confirm-btn delete-btn" onclick="HapticFeedback.error(); app.clearRecentUpdates(); this.closest('.delete-confirm-overlay').remove();">Clear All</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        
        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    clearRecentUpdates() {
        // Store current timestamp as the last cleared date
        localStorage.setItem('recentUpdatesLastCleared', new Date().toISOString());
        
        // Refresh the home view to update recent updates
        if (this.currentView === 'home') {
            this.renderHome();
        }
    }

    confirmClearActionItems() {
        // Create confirmation dialog
        const dialog = document.createElement('div');
        dialog.className = 'delete-confirm-overlay';
        dialog.innerHTML = `
            <div class="delete-confirm-dialog">
                <div class="delete-confirm-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                </div>
                <h3 class="delete-confirm-title">Clear Action Items?</h3>
                <p class="delete-confirm-message">Are you sure you want to mark all action items as done? This will resolve all bills, tasks, and car expirations shown in the action items list.</p>
                <div class="delete-confirm-actions">
                    <button class="delete-confirm-btn cancel-btn" onclick="this.closest('.delete-confirm-overlay').remove()">Cancel</button>
                    <button class="delete-confirm-btn delete-btn" onclick="HapticFeedback.error(); app.clearActionItems(); this.closest('.delete-confirm-overlay').remove();">Clear All</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        
        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    clearActionItems() {
        const actionItems = this.getActionItems();
        
        // Mark all action items as done
        actionItems.forEach(item => {
            this.markActionItemDone(item.type, item.id);
        });
        
        // Refresh the home view
        if (this.currentView === 'home') {
            this.renderHome();
        }
    }

    toggleActionItemsSection() {
        const container = document.getElementById('action-items-container');
        const indicator = document.getElementById('action-items-indicator');
        if (!container || !indicator) return;
        
        const isCollapsed = container.classList.contains('collapsed');
        
        if (isCollapsed) {
            container.classList.remove('collapsed');
            indicator.style.transform = 'rotate(0deg)';
            localStorage.setItem('actionItemsCollapsed', 'false');
        } else {
            container.classList.add('collapsed');
            indicator.style.transform = 'rotate(-90deg)';
            localStorage.setItem('actionItemsCollapsed', 'true');
        }
    }

    loadActionItemsState() {
        const container = document.getElementById('action-items-container');
        const indicator = document.getElementById('action-items-indicator');
        if (!container || !indicator) return;
        
        const isCollapsed = localStorage.getItem('actionItemsCollapsed') === 'true';
        if (isCollapsed) {
            container.classList.add('collapsed');
            indicator.style.transform = 'rotate(-90deg)';
        }
    }

    renderCalendar() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Get all tasks and bills for this month
        const todos = storage.getTodos();
        const bills = storage.getBills();
        
        // Create a map of dates with items
        const dateItems = {};
        
        todos.forEach(task => {
            const taskDate = task.date || task.dueDate;
            if (taskDate) {
                const date = new Date(taskDate);
                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    const dateKey = date.getDate();
                    if (!dateItems[dateKey]) {
                        dateItems[dateKey] = { tasks: 0, bills: 0 };
                    }
                    dateItems[dateKey].tasks++;
                }
            }
        });
        
        bills.forEach(bill => {
            if (bill.dueDate) {
                const date = new Date(bill.dueDate);
                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    const dateKey = date.getDate();
                    if (!dateItems[dateKey]) {
                        dateItems[dateKey] = { tasks: 0, bills: 0 };
                    }
                    dateItems[dateKey].bills++;
                }
            }
        });
        
        const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        let calendarHTML = `
            <div class="calendar-header">
                <div class="calendar-month">${monthName}</div>
            </div>
            <div class="calendar-weekdays">
                ${weekDays.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
            </div>
            <div class="calendar-grid">
        `;
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            const hasItems = dateItems[day];
            const totalItems = hasItems ? (hasItems.tasks || 0) + (hasItems.bills || 0) : 0;
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasItems ? 'has-items' : ''}" 
                     data-day="${day}" 
                     data-month="${currentMonth}" 
                     data-year="${currentYear}">
                    <div class="calendar-day-number">${day}</div>
                    ${hasItems ? `
                        <div class="calendar-day-indicators">
                            ${hasItems.tasks > 0 ? `<span class="calendar-indicator task-indicator"></span>` : ''}
                            ${hasItems.bills > 0 ? `<span class="calendar-indicator bill-indicator"></span>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        
        return calendarHTML;
    }

    confirmDelete(category, id, itemName) {
        // Create confirmation dialog
        const dialog = document.createElement('div');
        dialog.className = 'delete-confirm-overlay';
        dialog.innerHTML = `
            <div class="delete-confirm-dialog">
                <div class="delete-confirm-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                </div>
                <h3 class="delete-confirm-title">Delete Item?</h3>
                <p class="delete-confirm-message">Are you sure you want to delete "${itemName}"? This action cannot be undone.</p>
                <div class="delete-confirm-actions">
                    <button class="delete-confirm-btn cancel-btn" onclick="this.closest('.delete-confirm-overlay').remove()">Cancel</button>
                    <button class="delete-confirm-btn delete-btn" onclick="app.deleteItem('${category}', '${id}'); this.closest('.delete-confirm-overlay').remove();">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        
        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }

    deleteItem(category, id) {
        HapticFeedback.medium();
        // Delete from storage
        const success = storage.delete(category, id);
        
        if (success) {
            // Re-render current view
            if (this.currentView === 'cars') {
                this.renderCars();
            } else if (this.currentView === 'finance') {
                this.renderFinance();
            } else if (this.currentView === 'bills') {
                this.renderBills();
            } else if (this.currentView === 'insurances') {
                this.renderInsurances();
            } else if (this.currentView === 'home') {
                this.renderHome();
                // Also check if we need to re-render tasks tab
                const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
                if (activeTab === 'tasks') {
                    this.renderTasks();
                } else if (activeTab === 'insurances') {
                    this.renderInsurances();
                } else if (activeTab === 'subscriptions') {
                    this.renderSubscriptions();
                }
            } else if (this.currentView === 'tasks') {
                this.renderTasks();
            }
            
            // Update category counts
            this.updateCategoryCounts();
            this.updateNotificationBadge();
        }
    }

    getActionItems() {
        const actionItems = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextMonth = new Date(today);
        nextMonth.setDate(nextMonth.getDate() + 30);
        const daysBeforeDue = new Date(today);
        daysBeforeDue.setDate(daysBeforeDue.getDate() + 5); // Show notifications 5 days before due

        // Check bills
        const bills = storage.getBills();
        bills.forEach(bill => {
            if (!bill.paid && bill.dueDate) {
                const dueDate = new Date(bill.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                if (dueDate < today) {
                    // Overdue
                    actionItems.push({
                        type: 'bill',
                        id: bill.id,
                        title: `Pay ${bill.name || 'Bill'}`,
                        subtitle: `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} - $${parseFloat(bill.amount || 0).toFixed(2)}`,
                        urgent: true,
                        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
                            <path d="M9 8h6" />
                            <path d="M9 12h6" />
                            <path d="M9 16h4" />
                        </svg>`
                    });
                } else if (dueDate <= nextWeek) {
                    // Due soon
                    actionItems.push({
                        type: 'bill',
                        id: bill.id,
                        title: `Pay ${bill.name || 'Bill'}`,
                        subtitle: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} - $${parseFloat(bill.amount || 0).toFixed(2)}`,
                        urgent: daysUntilDue <= 3,
                        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
                            <path d="M9 8h6" />
                            <path d="M9 12h6" />
                            <path d="M9 16h4" />
                        </svg>`
                    });
                }
            }
        });

        // Check incomplete tasks
        const todos = storage.getTodos();
        todos.forEach(task => {
            if (!task.completed) {
                const taskDate = task.date || task.dueDate;
                if (taskDate) {
                    const dueDate = new Date(taskDate);
                    dueDate.setHours(0, 0, 0, 0);
                    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (dueDate < today) {
                        // Overdue task
                        actionItems.push({
                            type: 'task',
                            id: task.id,
                            title: task.title || 'Task',
                            subtitle: `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`,
                            urgent: true,
                            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>`
                        });
                    } else if (dueDate <= nextWeek) {
                        // Task due soon
                        actionItems.push({
                            type: 'task',
                            id: task.id,
                            title: task.title || 'Task',
                            subtitle: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
                            urgent: daysUntilDue <= 3,
                            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>`
                        });
                    }
                } else {
                    // Task without a due date (still pending)
                    actionItems.push({
                        type: 'task',
                        id: task.id,
                        title: task.title || 'Task',
                        subtitle: 'No due date',
                        urgent: false,
                        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>`
                    });
                }
            }
        });

        // Check cars for expirations
        const cars = storage.getCars();
        cars.forEach(car => {
            const carName = `${car.make || ''} ${car.model || ''}`.trim() || 'Vehicle';
            
            // Insurance expiration
            if (car.insuranceExp) {
                const expDate = new Date(car.insuranceExp);
                expDate.setHours(0, 0, 0, 0);
                const daysUntilExp = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
                
                if (expDate < today) {
                    actionItems.push({
                        type: 'car-insurance',
                        id: car.id,
                        title: `${carName} - Insurance Expired`,
                        subtitle: `Expired ${Math.abs(daysUntilExp)} day${Math.abs(daysUntilExp) !== 1 ? 's' : ''} ago`,
                        urgent: true,
                        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>`
                    });
                } else if (expDate <= nextMonth) {
                    actionItems.push({
                        type: 'car-insurance',
                        id: car.id,
                        title: `${carName} - Insurance Expiring`,
                        subtitle: `Expires in ${daysUntilExp} day${daysUntilExp !== 1 ? 's' : ''}`,
                        urgent: daysUntilExp <= 7,
                        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>`
                    });
                }
            }

            // Registration expiration
            if (car.registrationExp) {
                const expDate = new Date(car.registrationExp);
                expDate.setHours(0, 0, 0, 0);
                const daysUntilExp = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
                
                if (expDate < today) {
                    actionItems.push({
                        type: 'car-registration',
                        id: car.id,
                        title: `${carName} - Registration Expired`,
                        subtitle: `Expired ${Math.abs(daysUntilExp)} day${Math.abs(daysUntilExp) !== 1 ? 's' : ''} ago`,
                        urgent: true,
                        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>`
                    });
                } else if (expDate <= nextMonth) {
                    actionItems.push({
                        type: 'car-registration',
                        id: car.id,
                        title: `${carName} - Registration Expiring`,
                        subtitle: `Expires in ${daysUntilExp} day${daysUntilExp !== 1 ? 's' : ''}`,
                        urgent: daysUntilExp <= 7,
                        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>`
                    });
                }
            }

            // Inspection expiration
            if (car.inspectionExp) {
                const expDate = new Date(car.inspectionExp);
                expDate.setHours(0, 0, 0, 0);
                const daysUntilExp = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
                
                if (expDate < today) {
                    actionItems.push({
                        type: 'car-inspection',
                        id: car.id,
                        title: `${carName} - Inspection Expired`,
                        subtitle: `Expired ${Math.abs(daysUntilExp)} day${Math.abs(daysUntilExp) !== 1 ? 's' : ''} ago`,
                        urgent: true,
                        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>`
                    });
                } else if (expDate <= nextMonth) {
                    actionItems.push({
                        type: 'car-inspection',
                        id: car.id,
                        title: `${carName} - Inspection Expiring`,
                        subtitle: `Expires in ${daysUntilExp} day${daysUntilExp !== 1 ? 's' : ''}`,
                        urgent: daysUntilExp <= 7,
                        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>`
                    });
                }
            }

            // Car payment due date - only show if there's still an amount owed
            const amountOwed = parseFloat(car.amountOwed) || 0;
            if (car.paymentDueDate && car.monthlyPayment && amountOwed > 0) {
                const dueDate = new Date(car.paymentDueDate);
                dueDate.setHours(0, 0, 0, 0);
                const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                const monthlyPayment = parseFloat(car.monthlyPayment) || 0;
                
                // Show notification if overdue, due today, or within 5 days
                if (dueDate < today) {
                    // Overdue
                    actionItems.push({
                        type: 'car-payment',
                        id: car.id,
                        title: `${carName} - Payment Overdue`,
                        subtitle: `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} - $${monthlyPayment.toFixed(2)}`,
                        urgent: true,
                        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 3v18"/>
                            <path d="M16 7.5c0-1.9-1.8-3.5-4-3.5s-4 1.6-4 3.5 1.8 3.5 4 3.5 4 1.6 4 3.5-1.8 3.5-4 3.5-4-1.6-4-3.5" />
                        </svg>`
                    });
                } else if (dueDate <= daysBeforeDue) {
                    // Due soon (within 5 days) or due today
                    actionItems.push({
                        type: 'car-payment',
                        id: car.id,
                        title: `${carName} - Payment ${daysUntilDue === 0 ? 'Due Today' : 'Due Soon'}`,
                        subtitle: `${daysUntilDue === 0 ? 'Due today' : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`} - $${monthlyPayment.toFixed(2)}`,
                        urgent: daysUntilDue <= 3,
                        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 3v18"/>
                            <path d="M16 7.5c0-1.9-1.8-3.5-4-3.5s-4 1.6-4 3.5 1.8 3.5 4 3.5 4 1.6 4 3.5-1.8 3.5-4 3.5-4-1.6-4-3.5" />
                        </svg>`
                    });
                }
            }
        });

        // Sort by urgency (overdue first, then by days until due)
        return actionItems.sort((a, b) => {
            if (a.urgent && !b.urgent) return -1;
            if (!a.urgent && b.urgent) return 1;
            return 0;
        });
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        if (!badge) return;
        
        const actionItems = this.getActionItems();
        const count = actionItems.length;
        
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    openNotifications() {
        // Switch to home view if not already there
        if (this.currentView !== 'home') {
            this.switchView('home');
        }
        
        // Switch to main tab if not already there
        const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
        if (activeTab !== 'main') {
            this.switchTab('main');
        }
        
        // Wait for render to complete, then scroll
        setTimeout(() => {
            const actionItemsCard = document.querySelector('.action-items-card');
            let actionItemsSection = null;
            
            // Find the parent section containing action items
            if (actionItemsCard) {
                actionItemsSection = actionItemsCard.closest('.home-section');
            }
            
            if (actionItemsCard || actionItemsSection) {
                const target = actionItemsSection || actionItemsCard;
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Add a highlight effect
                if (actionItemsCard) {
                    actionItemsCard.style.animation = 'none';
                    setTimeout(() => {
                        actionItemsCard.style.animation = 'pulse 0.5s ease-in-out';
                    }, 10);
                }
            } else {
                // No action items - scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);
    }

    scrollToActionItems() {
        const actionItemsCard = document.querySelector('.action-items-card');
        if (actionItemsCard) {
            actionItemsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // If no action items, just scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    renderViewToggle() {
        return `
            <div class="view-toggle">
                <button class="view-toggle-btn ${this.cardViewMode === 'compact' ? 'active' : ''}" data-view="compact" title="Compact View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                </button>
                <button class="view-toggle-btn ${this.cardViewMode === 'normal' ? 'active' : ''}" data-view="normal" title="Normal View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="9" y1="3" x2="9" y2="21"/>
                    </svg>
                </button>
                <button class="view-toggle-btn ${this.cardViewMode === 'detailed' ? 'active' : ''}" data-view="detailed" title="Detailed View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="3" y1="3" x2="21" y2="3"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="21" x2="21" y2="21"/>
                    </svg>
                </button>
            </div>
        `;
    }

    setCardViewMode(mode) {
        this.cardViewMode = mode;
        localStorage.setItem('cardViewMode', mode);
        
        // Update all view toggle buttons
        document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-view') === mode) {
                btn.classList.add('active');
            }
        });
        
        // Update grid class
        document.querySelectorAll('.items-grid').forEach(grid => {
            grid.className = grid.className.replace(/view-mode-\w+/g, '');
            grid.classList.add(`view-mode-${mode}`);
        });
        
        // Re-render current view to apply changes
        if (this.currentView === 'cars') {
            this.renderCars();
        } else if (this.currentView === 'finance') {
            this.renderFinance();
        } else if (this.currentView === 'bills') {
            this.renderBills();
        }
    }

    renderCarMetrics(cars) {
        if (cars.length === 0) return '';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextMonth = new Date(today);
        nextMonth.setDate(nextMonth.getDate() + 30);
        
        let expiringSoon = 0;
        let expired = 0;
        let totalMileage = 0;
        
        cars.forEach(car => {
            if (car.insuranceExp) {
                const exp = new Date(car.insuranceExp);
                if (exp < today) expired++;
                else if (exp <= nextMonth) expiringSoon++;
            }
            if (car.registrationExp) {
                const exp = new Date(car.registrationExp);
                if (exp < today) expired++;
                else if (exp <= nextMonth) expiringSoon++;
            }
            if (car.inspectionExp) {
                const exp = new Date(car.inspectionExp);
                if (exp < today) expired++;
                else if (exp <= nextMonth) expiringSoon++;
            }
            if (car.mileage) {
                totalMileage += parseFloat(car.mileage) || 0;
            }
        });
        
        return `
            <div class="category-metrics-grid">
                <div class="category-metric-card">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 16v-3l2-5h14l2 5v3" />
                            <path d="M5 16h14" />
                            <circle cx="7.5" cy="16.5" r="1.5" />
                            <circle cx="16.5" cy="16.5" r="1.5" />
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${cars.length}</div>
                        <div class="category-metric-label">Total Vehicles</div>
                    </div>
                </div>
                <div class="category-metric-card ${expired > 0 ? 'urgent' : ''}">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${expired}</div>
                        <div class="category-metric-label">Expired</div>
                    </div>
                </div>
                <div class="category-metric-card ${expiringSoon > 0 ? 'warning' : ''}">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${expiringSoon}</div>
                        <div class="category-metric-label">Expiring Soon</div>
                    </div>
                </div>
                ${totalMileage > 0 ? `
                <div class="category-metric-card">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14"/>
                            <path d="M12 5l7 7-7 7"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${(totalMileage / 1000).toFixed(0)}k</div>
                        <div class="category-metric-label">Total Miles</div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    renderFinanceMetrics(finances) {
        // Get checking balance
        const checking = storage.getAll('checking') || [];
        const totalCheckingBalance = checking
            .reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);
        
        if (finances.length === 0 && totalCheckingBalance === 0) return '';
        
        const totalIncome = finances
            .filter(f => f.type === 'income')
            .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
        
        const totalExpense = finances
            .filter(f => f.type === 'expense')
            .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
        
        const balance = totalIncome - totalExpense;
        
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const thisMonthIncome = finances
            .filter(f => f.type === 'income' && f.date && new Date(f.date) >= thisMonth)
            .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
        
        const thisMonthExpense = finances
            .filter(f => f.type === 'expense' && f.date && new Date(f.date) >= thisMonth)
            .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
        
        return `
            <div class="category-metrics-grid">
                <div class="category-metric-card">
                    <div class="category-metric-icon positive">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="2" x2="12" y2="22"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value positive">$${totalIncome.toFixed(0)}</div>
                        <div class="category-metric-label">Total Income</div>
                    </div>
                </div>
                <div class="category-metric-card">
                    <div class="category-metric-icon negative">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="2" x2="12" y2="22"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value negative">$${totalExpense.toFixed(0)}</div>
                        <div class="category-metric-label">Total Expenses</div>
                    </div>
                </div>
                <div class="category-metric-card ${balance >= 0 ? 'positive' : 'negative'}">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="2" x2="12" y2="22"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value ${balance >= 0 ? 'positive' : 'negative'}">$${balance.toFixed(0)}</div>
                        <div class="category-metric-label">Balance</div>
                    </div>
                </div>
                <div class="category-metric-card">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <line x1="6" y1="8" x2="18" y2="8"/>
                            <line x1="6" y1="12" x2="18" y2="12"/>
                            <line x1="6" y1="16" x2="14" y2="16"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">$${totalCheckingBalance.toFixed(2)}</div>
                        <div class="category-metric-label">Checking</div>
                    </div>
                </div>
                <div class="category-metric-card">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">$${(thisMonthIncome - thisMonthExpense).toFixed(0)}</div>
                        <div class="category-metric-label">This Month</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderBillMetrics(bills) {
        if (bills.length === 0) return '';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const overdue = bills.filter(bill => {
            if (bill.paid) return false;
            if (!bill.dueDate) return false;
            const dueDate = new Date(bill.dueDate);
            return dueDate < today;
        });
        
        const dueSoon = bills.filter(bill => {
            if (bill.paid) return false;
            if (!bill.dueDate) return false;
            const dueDate = new Date(bill.dueDate);
            return dueDate >= today && dueDate <= nextWeek;
        });
        
        const unpaid = bills.filter(bill => !bill.paid);
        const totalDue = unpaid.reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);
        const overdueAmount = overdue.reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);
        
        return `
            <div class="category-metrics-grid">
                <div class="category-metric-card">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
                            <path d="M9 8h6" />
                            <path d="M9 12h6" />
                            <path d="M9 16h4" />
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${unpaid.length}</div>
                        <div class="category-metric-label">Unpaid Bills</div>
                    </div>
                </div>
                <div class="category-metric-card ${overdue.length > 0 ? 'urgent' : ''}">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${overdue.length}</div>
                        <div class="category-metric-label">Overdue</div>
                    </div>
                </div>
                <div class="category-metric-card ${dueSoon.length > 0 ? 'warning' : ''}">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${dueSoon.length}</div>
                        <div class="category-metric-label">Due Soon</div>
                    </div>
                </div>
                <div class="category-metric-card">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="2" x2="12" y2="22"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">$${totalDue.toFixed(0)}</div>
                        <div class="category-metric-label">Total Due</div>
                    </div>
                </div>
            </div>
        `;
    }

    createTaskFromAction(type, id) {
        const actionItems = this.getActionItems();
        const actionItem = actionItems.find(item => item.type === type && item.id === id);
        
        if (!actionItem) return;

        // Create task based on action item
        const taskTitle = actionItem.title;
        const taskDescription = actionItem.subtitle;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1); // Due tomorrow by default
        
        // Try to get actual due date from the source item
        if (type === 'bill') {
            const bill = storage.getBills().find(b => b.id === id);
            if (bill && bill.dueDate) {
                dueDate.setTime(new Date(bill.dueDate).getTime());
            }
        } else if (type.startsWith('car-')) {
            const car = storage.getCars().find(c => c.id === id);
            if (car) {
                if (type === 'car-insurance' && car.insuranceExp) {
                    dueDate.setTime(new Date(car.insuranceExp).getTime());
                } else if (type === 'car-registration' && car.registrationExp) {
                    dueDate.setTime(new Date(car.registrationExp).getTime());
                } else if (type === 'car-inspection' && car.inspectionExp) {
                    dueDate.setTime(new Date(car.inspectionExp).getTime());
                } else if (type === 'car-payment' && car.paymentDueDate) {
                    dueDate.setTime(new Date(car.paymentDueDate).getTime());
                }
            }
        }

        const task = {
            title: taskTitle,
            description: taskDescription,
            date: dueDate.toISOString().split('T')[0],
            priority: actionItem.urgent,
            completed: false
        };

        storage.addTodo(task);
        this.renderHome();
        this.renderTasks();
        this.updateCategoryCounts();
        this.updateNotificationBadge();
    }

    markActionItemDone(type, id) {
        if (type === 'task') {
            // Mark task as completed
            const task = storage.getTodos().find(t => t.id === id);
            if (task) {
                storage.updateTodo(id, { completed: true });
            }
        } else if (type === 'bill') {
            // Mark bill as paid
            const bill = storage.getBills().find(b => b.id === id);
            if (bill) {
                storage.updateBill(id, { paid: true });
            }
        } else if (type === 'car-insurance') {
            // Extend insurance expiration by 1 year
            const car = storage.getCars().find(c => c.id === id);
            if (car && car.insuranceExp) {
                const newExpDate = new Date(car.insuranceExp);
                newExpDate.setFullYear(newExpDate.getFullYear() + 1);
                storage.updateCar(id, { insuranceExp: newExpDate.toISOString().split('T')[0] });
            }
        } else if (type === 'car-registration') {
            // Extend registration expiration by 1 year
            const car = storage.getCars().find(c => c.id === id);
            if (car && car.registrationExp) {
                const newExpDate = new Date(car.registrationExp);
                newExpDate.setFullYear(newExpDate.getFullYear() + 1);
                storage.updateCar(id, { registrationExp: newExpDate.toISOString().split('T')[0] });
            }
        } else if (type === 'car-inspection') {
            // Extend inspection expiration by 1 year
            const car = storage.getCars().find(c => c.id === id);
            if (car && car.inspectionExp) {
                const newExpDate = new Date(car.inspectionExp);
                newExpDate.setFullYear(newExpDate.getFullYear() + 1);
                storage.updateCar(id, { inspectionExp: newExpDate.toISOString().split('T')[0] });
            }
        } else if (type === 'car-payment') {
            // Mark payment as paid: deduct monthly payment from amount owed and extend due date by 1 month
            const car = storage.getCars().find(c => c.id === id);
            if (car && car.paymentDueDate && car.monthlyPayment) {
                const monthlyPayment = parseFloat(car.monthlyPayment) || 0;
                const currentAmountOwed = parseFloat(car.amountOwed) || 0;
                
                // Deduct monthly payment from amount owed (don't go below 0)
                const newAmountOwed = Math.max(0, currentAmountOwed - monthlyPayment);
                
                // Extend payment due date by 1 month
                const newDueDate = new Date(car.paymentDueDate);
                newDueDate.setMonth(newDueDate.getMonth() + 1);
                
                // Update car with new amount owed and new due date
                storage.updateCar(id, { 
                    amountOwed: newAmountOwed.toFixed(2),
                    paymentDueDate: newDueDate.toISOString().split('T')[0] 
                });
            }
        }

        // Refresh the home view to update action items
        if (this.currentView === 'home') {
            this.renderHome();
        }
        
        // Update other views if needed
        if (this.currentView === 'cars') {
            this.renderCars();
        } else if (this.currentView === 'bills') {
            this.renderBills();
        } else if (this.currentView === 'insurances') {
            this.renderInsurances();
        } else if (this.currentView === 'tasks') {
            this.renderTasks();
        }
        
        // Update notification badge and category counts
        this.updateNotificationBadge();
        this.updateCategoryCounts();
    }

    renderHome() {
        const container = document.getElementById('tasks-container');
        if (!container) return;

        const counts = storage.getCounts();
        const todos = storage.getTodos();
        const bills = storage.getBills();
        const finances = storage.getFinances();
        const cars = storage.getCars();
        const insurances = storage.getAll('insurances') || [];
        const savings = storage.getAll('savings') || [];
        const checking = storage.getAll('checking') || [];
        const subscriptions = storage.getAll('subscriptions') || [];
        
        // Get upcoming tasks (next 7 days)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        // Get all open (incomplete) tasks
        const openTasks = todos.filter(todo => !todo.completed);
        
        // Get pending counts for summary cards
        const pendingTasks = todos.filter(todo => !todo.completed).length;
        const unpaidBills = bills.filter(bill => !bill.paid).length;

        // Get upcoming bills
        const upcomingBills = bills.filter(bill => {
            if (bill.paid) return false;
            const dueDate = new Date(bill.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today && dueDate <= nextWeek;
        }).slice(0, 3);

        // Calculate total income/expense
        const totalIncome = finances
            .filter(f => f.type === 'income')
            .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
        const totalExpense = finances
            .filter(f => f.type === 'expense')
            .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
        
        // Calculate total checking balance (sum of all checking entries)
        const totalCheckingBalance = checking
            .reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);
        
        // Calculate total car loan amount (sum of all amountOwed from cars)
        const totalCarLoan = cars
            .reduce((sum, car) => sum + (parseFloat(car.amountOwed) || 0), 0);
        
        // Calculate total monthly subscriptions
        const totalSubscriptions = subscriptions
            .reduce((sum, sub) => {
                const amount = parseFloat(sub.amount) || 0;
                if (sub.frequency === 'yearly') {
                    return sum + (amount / 12);
                } else if (sub.frequency === 'weekly') {
                    return sum + (amount * 4.33);
                } else {
                    return sum + amount;
                }
            }, 0);

        container.innerHTML = `
            <!-- Summary Cards -->
            <div class="home-summary-grid">
                <div class="summary-card">
                    <div class="summary-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                    </div>
                    <div class="summary-card-content">
                        <div class="summary-card-value">${pendingTasks}</div>
                        <div class="summary-card-label">Pending Tasks</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
                            <path d="M9 8h6" />
                            <path d="M9 12h6" />
                            <path d="M9 16h4" />
                        </svg>
                    </div>
                    <div class="summary-card-content">
                        <div class="summary-card-value">${unpaidBills}</div>
                        <div class="summary-card-label">Unpaid Bills</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 3v18" />
                            <path d="M16 7.5c0-1.9-1.8-3.5-4-3.5s-4 1.6-4 3.5 1.8 3.5 4 3.5 4 1.6 4 3.5-1.8 3.5-4 3.5-4-1.6-4-3.5" />
                        </svg>
                    </div>
                    <div class="summary-card-content">
                        <div class="summary-card-value">$${(totalIncome - totalExpense).toFixed(0)}</div>
                        <div class="summary-card-label">Balance</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <line x1="6" y1="8" x2="18" y2="8"/>
                            <line x1="6" y1="12" x2="18" y2="12"/>
                            <line x1="6" y1="16" x2="14" y2="16"/>
                        </svg>
                    </div>
                    <div class="summary-card-content">
                        <div class="summary-card-value">$${totalCheckingBalance.toFixed(2)}</div>
                        <div class="summary-card-label">Checking</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 16v-3l2-5h14l2 5v3" />
                            <path d="M5 16h14" />
                            <circle cx="7.5" cy="16.5" r="1.5" />
                            <circle cx="16.5" cy="16.5" r="1.5" />
                        </svg>
                    </div>
                    <div class="summary-card-content">
                        <div class="summary-card-value">$${totalCarLoan.toFixed(2)}</div>
                        <div class="summary-card-label">Car Loan</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div class="summary-card-content">
                        <div class="summary-card-value">$${totalSubscriptions.toFixed(2)}</div>
                        <div class="summary-card-label">Subscriptions</div>
                    </div>
                </div>
            </div>

            <!-- Quick Access Cards -->
            <div class="home-section">
                <h2 class="home-section-title">Quick Access</h2>
                <div class="quick-access-grid">
                    <button class="quick-access-card" onclick="HapticFeedback.medium(); app.switchView('cars')">
                        <div class="quick-access-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 16v-3l2-5h14l2 5v3" />
                                <path d="M5 16h14" />
                                <circle cx="7.5" cy="16.5" r="1.5" />
                                <circle cx="16.5" cy="16.5" r="1.5" />
                            </svg>
                        </div>
                        <div class="quick-access-label">Cars</div>
                        <div class="quick-access-count">${counts.cars}</div>
                    </button>
                    <button class="quick-access-card" onclick="HapticFeedback.medium(); app.switchView('finance')">
                        <div class="quick-access-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 3v18" />
                                <path d="M16 7.5c0-1.9-1.8-3.5-4-3.5s-4 1.6-4 3.5 1.8 3.5 4 3.5 4 1.6 4 3.5-1.8 3.5-4 3.5-4-1.6-4-3.5" />
                            </svg>
                        </div>
                        <div class="quick-access-label">Finance</div>
                        <div class="quick-access-count">${counts.finances}</div>
                    </button>
                    <button class="quick-access-card" onclick="HapticFeedback.medium(); app.switchView('bills')">
                        <div class="quick-access-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
                                <path d="M9 8h6" />
                                <path d="M9 12h6" />
                                <path d="M9 16h4" />
                            </svg>
                        </div>
                        <div class="quick-access-label">Bills</div>
                        <div class="quick-access-count">${counts.bills}</div>
                    </button>
                    <button class="quick-access-card" onclick="HapticFeedback.medium(); app.openAddModal()">
                        <div class="quick-access-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 8v8" />
                                <path d="M8 12h8" />
                            </svg>
                        </div>
                        <div class="quick-access-label">Add New</div>
                    </button>
                </div>
            </div>

            <!-- Action Items / Notifications -->
            ${(() => {
                const actionItems = this.getActionItems();
                return `
                <div class="home-section">
                    <h2 class="home-section-title collapsible-title">
                        <span onclick="app.toggleActionItemsSection()" style="flex: 1; display: flex; align-items: center; gap: 8px;">
                            <span>Action Items${actionItems.length > 0 ? `<span class="section-count-badge">${actionItems.length}</span>` : ''}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-indicator" id="action-items-indicator">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </span>
                        ${actionItems.length > 0 ? `
                        <button class="clear-updates-btn" onclick="app.confirmClearActionItems()" title="Clear Action Items">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"/>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            </svg>
                        </button>
                        ` : ''}
                    </h2>
                    <div class="action-items-container" id="action-items-container">
                    ${actionItems.length > 0 ? `
                    <div class="action-items-card">
                        ${actionItems.map(item => `
                            <div class="action-item" data-type="${item.type}" data-id="${item.id}">
                                <div class="action-item-icon ${item.urgent ? 'urgent' : ''}">
                                    ${item.icon}
                                </div>
                                <div class="action-item-content">
                                    <div class="action-item-title">${item.title}</div>
                                    <div class="action-item-subtitle">${item.subtitle}</div>
                                </div>
                                <div class="action-item-actions">
                                    <button class="action-item-btn" onclick="HapticFeedback.medium(); app.createTaskFromAction('${item.type}', '${item.id}')" title="Create Task">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="12" r="9" />
                                            <path d="M12 8v8" />
                                            <path d="M8 12h8" />
                                        </svg>
                                    </button>
                                    <button class="action-item-btn action-item-done-btn" onclick="HapticFeedback.success(); app.markActionItemDone('${item.type}', '${item.id}')" title="Mark as Done">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M20 6L9 17l-5-5"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ` : `
                    <div class="action-items-card empty">
                        <div class="action-items-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            <p>All caught up! No action items needed.</p>
                            <p class="action-items-empty-hint">Action items will appear here for upcoming bills, car expirations, and other important reminders.</p>
                        </div>
                    </div>
                    </div>
                    `}
                </div>
                `;
            })()}

            <!-- Calendar View -->
            <div class="home-section">
                <h2 class="home-section-title">Calendar</h2>
                <div class="calendar-container">
                    ${this.renderCalendar()}
                </div>
            </div>


            <!-- Recent Updates -->
            ${(() => {
                const recentActivity = this.getRecentActivity();
                const isCollapsed = recentActivity.length === 0 || localStorage.getItem('recentUpdatesCollapsed') === 'true';
                return `
                <div class="home-section">
                    <h2 class="home-section-title collapsible-title">
                        <span onclick="app.toggleRecentUpdatesSection()" style="flex: 1; display: flex; align-items: center; gap: 8px;">
                            <span>Recent Updates</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-indicator" id="recent-updates-indicator" style="transform: ${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </span>
                        ${recentActivity.length > 0 ? `
                        <button class="clear-updates-btn" onclick="app.confirmClearRecentUpdates()" title="Clear Recent Updates">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"/>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            </svg>
                        </button>
                        ` : ''}
                    </h2>
                    <div class="recent-updates-container ${isCollapsed ? 'collapsed' : ''}" id="recent-updates-container">
                        <div class="recent-updates-list ${isCollapsed ? '' : 'expanded'}" id="recent-updates-list">
                            ${recentActivity.length > 0 ? recentActivity.map((activity, index) => {
                            const timeAgo = this.getTimeAgo(activity.timestamp);
                            let title = '';
                            let subtitle = '';
                            
                            if (activity.category === 'todos') {
                                title = activity.item.title || 'Task';
                                subtitle = activity.item.date || activity.item.dueDate ? new Date(activity.item.date || activity.item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                            } else if (activity.category === 'cars') {
                                title = `${activity.item.make || ''} ${activity.item.model || ''}`.trim() || 'Car';
                                subtitle = activity.item.year || '';
                            } else if (activity.category === 'bills') {
                                title = activity.item.name || 'Bill';
                                subtitle = activity.item.amount ? `$${parseFloat(activity.item.amount).toFixed(2)}` : '';
                            } else if (activity.category === 'finances') {
                                title = activity.item.category || activity.item.description || 'Transaction';
                                const amount = parseFloat(activity.item.amount || 0);
                                subtitle = `${activity.item.type === 'income' ? '+' : '-'}$${Math.abs(amount).toFixed(2)}`;
                            } else if (activity.category === 'insurances') {
                                title = activity.item.provider || 'Insurance';
                                subtitle = activity.item.type || '';
                            } else if (activity.category === 'savings') {
                                title = activity.item.name || 'Savings Goal';
                                subtitle = activity.item.targetAmount ? `$${parseFloat(activity.item.targetAmount).toFixed(2)}` : '';
                            }
                            
                            return `
                                <div class="recent-update-item" data-category="${activity.category}" data-item-id="${activity.item.id}" data-activity-type="${activity.type}">
                                    <div class="recent-update-icon ${activity.type}">
                                        ${activity.type === 'added' ? `
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <circle cx="12" cy="12" r="9" />
                                                <path d="M12 8v8" />
                                                <path d="M8 12h8" />
                                            </svg>
                                        ` : `
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        `}
                                    </div>
                                    <div class="recent-update-content">
                                        <div class="recent-update-title">${title}</div>
                                        <div class="recent-update-meta">
                                            <span class="recent-update-category">${activity.categoryName}</span>
                                            ${subtitle ? `<span class="recent-update-subtitle">• ${subtitle}</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="recent-update-time">${timeAgo}</div>
                                </div>
                            `;
                            }).join('') : `
                            <div style="text-align: center; padding: 20px; color: var(--text-gray);">
                                <p>No recent updates</p>
                            </div>
                            `}
                        </div>
                        ${recentActivity.length > 5 ? `
                        <button class="expand-updates-btn" id="expand-updates-btn" onclick="app.toggleRecentUpdates()">
                            <span class="expand-text">Show More</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-icon">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </button>
                        ` : ''}
                    </div>
                </div>
                `;
            })()}

            <!-- Upcoming Bills -->
            ${upcomingBills.length > 0 ? `
            <div class="home-section">
                <h2 class="home-section-title">Upcoming Bills</h2>
                <div class="upcoming-list">
                    ${upcomingBills.map((bill, index) => {
                        const dueDate = new Date(bill.dueDate);
                        const isToday = dueDate.toDateString() === today.toDateString();
                        const isOverdue = dueDate < today;
                        return `
                            <div class="upcoming-item" data-category="bills" data-bill-id="${bill.id}">
                                <div class="upcoming-item-content">
                                    <div class="upcoming-item-title">${bill.name}</div>
                                    <div class="upcoming-item-date ${isOverdue ? 'overdue' : ''}">${isToday ? 'Due Today' : isOverdue ? 'Overdue' : dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                </div>
                                <div class="upcoming-item-amount">$${parseFloat(bill.amount || 0).toFixed(2)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}

        `;

        // Load recent updates and action items collapsed state
        setTimeout(() => {
            this.loadRecentUpdatesState();
            this.loadActionItemsState();
        }, 100);
        
        // Update notification badge
        this.updateNotificationBadge();

        // Setup event listeners for upcoming items and open tasks
        setTimeout(() => {
            // Calendar day clicks
            document.querySelectorAll('.calendar-day[data-day]').forEach(day => {
                day.addEventListener('click', () => {
                    const dayNum = day.getAttribute('data-day');
                    const month = day.getAttribute('data-month');
                    const year = day.getAttribute('data-year');
                    const dateStr = `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    this.showDateEntryMenu(dateStr);
                });
            });
            
            // Open task checkboxes
            document.querySelectorAll('.open-task-checkbox').forEach(checkbox => {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const taskId = checkbox.getAttribute('data-task-id');
                    const task = todos.find(t => t.id === taskId);
                    if (task) {
                        storage.updateTodo(taskId, { completed: !task.completed });
                        this.renderHome();
                        this.updateCategoryCounts();
                        this.updateNotificationBadge();
                    }
                });
            });

            // Open task items (click to edit)
            document.querySelectorAll('.open-task-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.open-task-checkbox')) return;
                    const taskId = item.getAttribute('data-task-id');
                    const task = todos.find(t => t.id === taskId);
                    if (task) {
                        this.openAddModal('todos', task);
                    }
                });
            });

            // Recent update items
            document.querySelectorAll('.recent-update-item').forEach(item => {
                item.addEventListener('click', () => {
                    const category = item.getAttribute('data-category');
                    const itemId = item.getAttribute('data-item-id');
                    const allItems = {
                        todos: todos,
                        cars: cars,
                        bills: bills,
                        finances: finances,
                        insurances: insurances,
                        savings: savings
                    };
                    const itemList = allItems[category] || [];
                    const foundItem = itemList.find(i => i.id === itemId);
                    if (foundItem) {
                        this.openAddModal(category, foundItem);
                    }
                });
            });

            // Upcoming bill items
            document.querySelectorAll('.upcoming-item[data-bill-id]').forEach(item => {
                item.addEventListener('click', () => {
                    const billId = item.getAttribute('data-bill-id');
                    const bill = bills.find(b => b.id === billId);
                    if (bill) {
                        this.openAddModal('bills', bill);
                    }
                });
            });
        }, 100);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    renderCategories() {
        const container = document.getElementById('tasks-container');
        if (!container) return;

        const counts = storage.getCounts();
        
        container.innerHTML = `
            <div class="home-section">
                <h2 class="home-section-title">All Categories</h2>
                <div class="category-cards-grid">
                    <button class="category-card" onclick="HapticFeedback.medium(); app.openAddModal('todos')">
                        <div class="category-card-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                        </div>
                        <div class="category-card-content">
                            <div class="category-card-title">To-Do</div>
                            <div class="category-card-count">${counts.todos} items</div>
                        </div>
                    </button>
                    <button class="category-card" onclick="HapticFeedback.medium(); app.switchView('cars')">
                        <div class="category-card-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 16v-3l2-5h14l2 5v3" />
                                <path d="M5 16h14" />
                                <circle cx="7.5" cy="16.5" r="1.5" />
                                <circle cx="16.5" cy="16.5" r="1.5" />
                            </svg>
                        </div>
                        <div class="category-card-content">
                            <div class="category-card-title">Cars</div>
                            <div class="category-card-count">${counts.cars} items</div>
                        </div>
                    </button>
                    <button class="category-card" onclick="HapticFeedback.medium(); app.switchView('bills')">
                        <div class="category-card-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
                                <path d="M9 8h6" />
                                <path d="M9 12h6" />
                                <path d="M9 16h4" />
                            </svg>
                        </div>
                        <div class="category-card-content">
                            <div class="category-card-title">Bills</div>
                            <div class="category-card-count">${counts.bills} items</div>
                        </div>
                    </button>
                    <button class="category-card" onclick="HapticFeedback.medium(); app.openAddModal('insurances')">
                        <div class="category-card-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M9 12l2 2 4-4" />
                            </svg>
                        </div>
                        <div class="category-card-content">
                            <div class="category-card-title">Insurances</div>
                            <div class="category-card-count">${counts.insurances} items</div>
                        </div>
                    </button>
                    <button class="category-card" onclick="HapticFeedback.medium(); app.switchView('finance')">
                        <div class="category-card-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 3v18" />
                                <path d="M16 7.5c0-1.9-1.8-3.5-4-3.5s-4 1.6-4 3.5 1.8 3.5 4 3.5 4 1.6 4 3.5-1.8 3.5-4 3.5-4-1.6-4-3.5" />
                            </svg>
                        </div>
                        <div class="category-card-content">
                            <div class="category-card-title">Finances</div>
                            <div class="category-card-count">${counts.finances} items</div>
                        </div>
                    </button>
                    <button class="category-card" onclick="HapticFeedback.medium(); app.openAddModal('savings')">
                        <div class="category-card-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                        </div>
                        <div class="category-card-content">
                            <div class="category-card-title">Savings</div>
                            <div class="category-card-count">${counts.savings} items</div>
                        </div>
                    </button>
                </div>
            </div>
        `;
    }

    renderInsurances() {
        const container = document.getElementById('tasks-container');
        if (!container) return;
        
        const insurances = storage.getAll('insurances') || [];
        const sortedInsurances = [...insurances].sort((a, b) => {
            const dateA = new Date(a.renewalDate || 0);
            const dateB = new Date(b.renewalDate || 0);
            return dateA - dateB;
        });
        
        if (insurances.length === 0) {
            container.innerHTML = `
                <div class="category-view-header">
                    <div>
                        <h2 class="category-view-title">Insurances</h2>
                        <p class="category-view-subtitle">0 policies</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('insurances')" title="Add Insurance">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 8v8" />
                                <path d="M8 12h8" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
                            <path d="M32 56s16-8 16-20V10l-16-6-16 6v26c0 12 16 20 16 20z"/>
                            <path d="M24 24l8 8 16-16"/>
                        </svg>
                    </div>
                    <div class="empty-state-title">No insurance policies yet</div>
                    <div class="empty-state-text">Tap the + button to add your first insurance policy</div>
                </div>
            `;
            return;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextMonth = new Date(today);
        nextMonth.setDate(nextMonth.getDate() + 30);
        
        // Calculate metrics
        const totalPremium = insurances.reduce((sum, ins) => sum + (parseFloat(ins.premium) || 0), 0);
        const expiringSoon = insurances.filter(ins => {
            if (!ins.renewalDate) return false;
            const renewalDate = new Date(ins.renewalDate);
            renewalDate.setHours(0, 0, 0, 0);
            return renewalDate >= today && renewalDate <= nextMonth;
        }).length;
        const expired = insurances.filter(ins => {
            if (!ins.renewalDate) return false;
            const renewalDate = new Date(ins.renewalDate);
            renewalDate.setHours(0, 0, 0, 0);
            return renewalDate < today;
        }).length;
        
        const formatDate = (date) => {
            if (!date) return 'No date';
            return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };
        
        const getTypeColor = (type) => {
            const colors = {
                'car': '#3b82f6',
                'home': '#10b981',
                'health': '#f59e0b',
                'life': '#8b5cf6'
            };
            return colors[type] || '#6b7280';
        };
        
        container.innerHTML = `
            <div class="category-view-header">
                <div>
                    <h2 class="category-view-title">Insurances</h2>
                    <p class="category-view-subtitle">${insurances.length} polic${insurances.length !== 1 ? 'ies' : 'y'}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${this.renderViewToggle()}
                    <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('insurances')" title="Add Insurance">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v8" />
                            <path d="M8 12h8" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="category-metrics-grid">
                <div class="category-metric-card">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${insurances.length}</div>
                        <div class="category-metric-label">Total Policies</div>
                    </div>
                </div>
                <div class="category-metric-card ${expired > 0 ? 'urgent' : ''}">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${expired}</div>
                        <div class="category-metric-label">Expired</div>
                    </div>
                </div>
                <div class="category-metric-card ${expiringSoon > 0 ? 'warning' : ''}">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${expiringSoon}</div>
                        <div class="category-metric-label">Expiring Soon</div>
                    </div>
                </div>
                <div class="category-metric-card">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="2" x2="12" y2="22"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">$${totalPremium.toFixed(0)}</div>
                        <div class="category-metric-label">Total Premium</div>
                    </div>
                </div>
            </div>
            <div class="items-grid view-mode-${this.cardViewMode}">
                ${sortedInsurances.map((insurance, index) => {
                    const renewalDate = insurance.renewalDate ? new Date(insurance.renewalDate) : null;
                    const isExpired = renewalDate && renewalDate < today;
                    const isExpiringSoon = renewalDate && renewalDate >= today && renewalDate <= nextMonth;
                    const typeColor = getTypeColor(insurance.type);
                    const typeDisplay = insurance.type ? insurance.type.charAt(0).toUpperCase() + insurance.type.slice(1) : 'Insurance';
                    
                    return `
                        <div class="item-card" data-category="insurances" data-index="${index}" data-item-id="${insurance.id}">
                            <div class="item-card-header">
                                <div>
                                    <div class="item-card-title">${insurance.name || insurance.provider || 'Insurance Provider'}</div>
                                    <div class="item-card-subtitle">${insurance.provider ? `${insurance.provider} • ${typeDisplay}` : typeDisplay} Insurance</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div class="item-card-badge" style="background: ${typeColor}20; border-color: ${typeColor}40; color: ${typeColor}">
                                        ${typeDisplay}
                                    </div>
                                    <button class="item-delete-btn" data-category="insurances" data-item-id="${insurance.id}" onclick="event.stopPropagation(); HapticFeedback.warning(); app.confirmDelete('insurances', '${insurance.id}', '${(insurance.provider || 'Insurance').replace(/'/g, "\\'")}')" title="Delete">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M3 6h18"/>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="item-card-details">
                                ${insurance.name && insurance.name !== insurance.provider ? `
                                    <div class="item-card-detail">
                                        <div class="item-card-detail-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                <circle cx="12" cy="7" r="4"/>
                                            </svg>
                                        </div>
                                        <span>${insurance.name}</span>
                                    </div>
                                ` : ''}
                                ${insurance.policyNumber ? `
                                    <div class="item-card-detail">
                                        <div class="item-card-detail-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <rect x="2" y="4" width="12" height="8"/>
                                                <line x1="4" y1="8" x2="12" y2="8"/>
                                            </svg>
                                        </div>
                                        <span>Policy: ${insurance.policyNumber}</span>
                                    </div>
                                ` : ''}
                                ${insurance.premium ? `
                                    <div class="item-card-detail">
                                        <div class="item-card-detail-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <line x1="12" y1="2" x2="12" y2="22"/>
                                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                            </svg>
                                        </div>
                                        <span>Premium: $${parseFloat(insurance.premium).toFixed(2)}</span>
                                    </div>
                                ` : ''}
                                ${insurance.renewalDate ? `
                                    <div class="item-card-detail ${isExpired ? 'expired' : isExpiringSoon ? 'expiring-soon' : ''}">
                                        <div class="item-card-detail-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                        </div>
                                        <span>Renewal: ${formatDate(insurance.renewalDate)}${isExpired ? ' <span class="expired-badge">Expired</span>' : isExpiringSoon ? ' <span class="expiring-badge">Soon</span>' : ''}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        this.setupCardClickHandlers();
    }

    renderTasks() {
        const container = document.getElementById('tasks-container');
        if (!container) return;

        // Get all todos
        const todos = storage.getTodos();
        
        // Render header with add button
        const headerHTML = `
            <div class="category-view-header">
                <div>
                    <h2 class="category-view-title">Tasks</h2>
                    <p class="category-view-subtitle">${todos.length} task${todos.length !== 1 ? 's' : ''}</p>
                </div>
                <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('todos')" title="Add Task">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v8" />
                        <path d="M8 12h8" />
                    </svg>
                </button>
            </div>
        `;
        
        // Render metrics first
        container.innerHTML = headerHTML + this.renderTaskMetrics(todos);
        
        // Group by date
        const grouped = this.groupByDate(todos);
        
        const today = new Date();
        let currentMonth = '';

        Object.keys(grouped).sort().forEach(dateStr => {
            const date = new Date(dateStr);
            const tasks = grouped[dateStr];
            const incompleteTasks = tasks.filter(t => !t.completed);
            const allCompleted = incompleteTasks.length === 0 && tasks.length > 0;

            // Month header
            const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (monthYear !== currentMonth) {
                currentMonth = monthYear;
                const monthHeader = document.createElement('div');
                monthHeader.className = 'month-header';
                monthHeader.textContent = monthYear;
                container.appendChild(monthHeader);
            }

            // Date section
            const section = document.createElement('div');
            section.className = 'date-section';

            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.innerHTML = `
                <span class="date-title">${this.formatDate(date)}</span>
            `;
            section.appendChild(dateHeader);

            // Task count
            if (tasks.length > 0) {
                const countEl = document.createElement('div');
                countEl.className = 'task-count';
                countEl.textContent = `${tasks.length} Task${tasks.length !== 1 ? 's' : ''} for ${this.getDayLabel(date)}`;
                section.appendChild(countEl);
            }

            // Completion message
            if (allCompleted && tasks.length > 0) {
                const completionMsg = document.createElement('div');
                completionMsg.className = 'completion-message';
                completionMsg.innerHTML = `
                    <div class="completion-message-inner">
                        <div class="completion-text">Nice work! You've wrapped up all tasks for today.</div>
                    </div>
                `;
                section.appendChild(completionMsg);
            }

            // Tasks
            tasks.forEach(task => {
                const taskEl = this.createTaskElement(task);
                section.appendChild(taskEl);
            });

            container.appendChild(section);
        });

        // Add empty state if no tasks
        if (todos.length === 0 && Object.keys(grouped).length === 0) {
            container.innerHTML = `
                <div class="category-view-header">
                    <div>
                        <h2 class="category-view-title">Tasks</h2>
                        <p class="category-view-subtitle">0 tasks</p>
                    </div>
                    <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('todos')" title="Add Task">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v8" />
                            <path d="M8 12h8" />
                        </svg>
                    </button>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
                            <rect x="8" y="8" width="48" height="48" rx="4"/>
                            <line x1="20" y1="24" x2="44" y2="24"/>
                            <line x1="20" y1="32" x2="36" y2="32"/>
                            <line x1="20" y1="40" x2="44" y2="40"/>
                        </svg>
                    </div>
                    <div class="empty-state-title">No tasks yet</div>
                    <div class="empty-state-text">Tap the + button to add your first task</div>
                </div>
            `;
            return;
        }
    }

    renderTaskMetrics(todos) {
        if (todos.length === 0) return '';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const incomplete = todos.filter(t => !t.completed).length;
        
        const overdue = todos.filter(task => {
            if (task.completed) return false;
            const taskDate = task.date || task.dueDate;
            if (!taskDate) return false;
            const dueDate = new Date(taskDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
        });
        
        const dueSoon = todos.filter(task => {
            if (task.completed) return false;
            const taskDate = task.date || task.dueDate;
            if (!taskDate) return false;
            const dueDate = new Date(taskDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today && dueDate <= nextWeek;
        });
        
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return `
            <div class="category-metrics-grid" style="margin-bottom: 24px;">
                <div class="category-metric-card">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${total}</div>
                        <div class="category-metric-label">Total Tasks</div>
                    </div>
                </div>
                <div class="category-metric-card">
                    <div class="category-metric-icon positive">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value positive">${completed}</div>
                        <div class="category-metric-label">Completed</div>
                    </div>
                </div>
                <div class="category-metric-card">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${incomplete}</div>
                        <div class="category-metric-label">Pending</div>
                    </div>
                </div>
                <div class="category-metric-card ${overdue.length > 0 ? 'urgent' : ''}">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${overdue.length}</div>
                        <div class="category-metric-label">Overdue</div>
                    </div>
                </div>
                <div class="category-metric-card ${dueSoon.length > 0 ? 'warning' : ''}">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${dueSoon.length}</div>
                        <div class="category-metric-label">Due Soon</div>
                    </div>
                </div>
                <div class="category-metric-card ${completionRate >= 80 ? 'positive' : ''}">
                    <div class="category-metric-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                    </div>
                    <div class="category-metric-content">
                        <div class="category-metric-value">${completionRate}%</div>
                        <div class="category-metric-label">Complete</div>
                    </div>
                </div>
            </div>
        `;
    }

    createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-item';
        
        const content = document.createElement('div');
        content.className = 'task-content';

        const title = document.createElement('span');
        title.className = `task-title ${task.completed ? 'completed' : ''}`;
        title.textContent = task.title;

        const icon = document.createElement('span');
        icon.className = 'task-icon';
        if (task.priority) {
            icon.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
                    <polygon points="8,2 4,8 6,8 8,14 10,8 12,8"/>
                </svg>
            `;
            icon.style.color = '#4ade80';
        }

        content.appendChild(title);
        content.appendChild(icon);
        taskEl.appendChild(content);

        // Add action buttons container on the right
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'task-actions';
        
        // Add checkbox button
        const checkbox = document.createElement('button');
        checkbox.className = `task-checkbox ${task.completed ? 'checked' : ''}`;
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            storage.updateTodo(task.id, { completed: !task.completed });
            this.renderTasks();
            this.updateCategoryCounts();
            this.updateNotificationBadge();
        });

        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete-btn';
        deleteBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
        `;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            HapticFeedback.warning();
            this.confirmDelete('todos', task.id, task.title || 'Task');
        });
        
        actionsContainer.appendChild(checkbox);
        actionsContainer.appendChild(deleteBtn);
        taskEl.appendChild(actionsContainer);

        // Double tap to edit
        let tapCount = 0;
        taskEl.addEventListener('click', (e) => {
            if (e.target !== checkbox && !e.target.closest('.task-delete-btn')) {
                tapCount++;
                setTimeout(() => {
                    if (tapCount === 2) {
                        this.openAddModal('todos', task);
                    }
                    tapCount = 0;
                }, 300);
            }
        });

        return taskEl;
    }

    groupByDate(tasks) {
        const grouped = {};
        tasks.forEach(task => {
            const date = task.date || task.dueDate || new Date().toISOString().split('T')[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(task);
        });
        return grouped;
    }

    formatDate(date) {
        const day = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        return `${day} ${month} - ${dayName}`;
    }

    getDayLabel(date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        }
    }

    updateCategoryCounts() {
        const counts = storage.getCounts();
        Object.keys(counts).forEach(category => {
            const countEl = document.querySelector(`[data-count="${category}"]`);
            if (countEl) {
                countEl.textContent = counts[category];
            }
        });
    }

    renderCars() {
        const container = document.getElementById('tasks-container');
        if (!container) return;
        
        const cars = storage.getCars();
        
        if (cars.length === 0) {
            container.innerHTML = `
                <div class="category-view-header">
                    <div>
                        <h2 class="category-view-title">Cars</h2>
                        <p class="category-view-subtitle">0 cars registered</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        ${this.renderViewToggle()}
                        <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('cars')" title="Add Car">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 8v8" />
                                <path d="M8 12h8" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
                            <rect x="6" y="20" width="52" height="28"/>
                            <rect x="8" y="16" width="48" height="4"/>
                            <rect x="9" y="44" width="4" height="6"/>
                            <rect x="51" y="44" width="4" height="6"/>
                            <rect x="10" y="45" width="4" height="4"/>
                            <rect x="50" y="45" width="4" height="4"/>
                        </svg>
                    </div>
                    <div class="empty-state-title">No cars yet</div>
                    <div class="empty-state-text">Tap the + button to add your first car</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="category-view-header">
                <div>
                    <h2 class="category-view-title">Cars</h2>
                    <p class="category-view-subtitle">${cars.length} car${cars.length !== 1 ? 's' : ''} registered</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${this.renderViewToggle()}
                    <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('cars')" title="Add Car">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v8" />
                            <path d="M8 12h8" />
                        </svg>
                    </button>
                </div>
            </div>
            ${this.renderCarMetrics(cars)}
            <div class="items-grid view-mode-${this.cardViewMode}">
                ${cars.map((car, index) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Check expiration dates
                    const insuranceExp = car.insuranceExp ? new Date(car.insuranceExp) : null;
                    const registrationExp = car.registrationExp ? new Date(car.registrationExp) : null;
                    const inspectionExp = car.inspectionExp ? new Date(car.inspectionExp) : null;
                    
                    const insuranceExpired = insuranceExp && insuranceExp < today;
                    const registrationExpired = registrationExp && registrationExp < today;
                    const inspectionExpired = inspectionExp && inspectionExp < today;
                    
                    const insuranceExpiringSoon = insuranceExp && insuranceExp >= today && insuranceExp <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                    const registrationExpiringSoon = registrationExp && registrationExp >= today && registrationExp <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                    const inspectionExpiringSoon = inspectionExp && inspectionExp >= today && inspectionExp <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                    
                    const formatDate = (date) => {
                        if (!date) return '';
                        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    };
                    
                    return `
                    <div class="item-card car-card" data-category="cars" data-index="${index}" data-item-id="${car.id}">
                        <div class="item-card-header">
                            <div>
                                <div class="item-card-title">${(car.make || '') + ' ' + (car.model || '')}</div>
                                <div class="item-card-subtitle">${car.year || 'Year not set'}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div class="item-card-badge">Vehicle</div>
                                <button class="item-delete-btn" data-category="cars" data-item-id="${car.id}" onclick="event.stopPropagation(); HapticFeedback.warning(); app.confirmDelete('cars', '${car.id}', '${(car.make || '') + ' ' + (car.model || '')}')" title="Delete">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 6h18"/>
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="item-card-details">
                            ${car.vin ? `
                                <div class="item-card-detail">
                                    <div class="item-card-detail-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect x="2" y="4" width="12" height="8"/>
                                            <line x1="4" y1="8" x2="12" y2="8"/>
                                        </svg>
                                    </div>
                                    <span>VIN: ${car.vin}</span>
                                </div>
                            ` : ''}
                            ${car.mileage ? `
                                <div class="item-card-detail">
                                    <div class="item-card-detail-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 6v6l4 2"/>
                                        </svg>
                                    </div>
                                    <span>${parseInt(car.mileage).toLocaleString()} miles</span>
                                </div>
                            ` : ''}
                        </div>
                        ${car.insuranceProvider || car.insuranceExp ? `
                        <div class="car-info-section">
                            <div class="car-info-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                                <span>Insurance</span>
                            </div>
                            <div class="car-info-content">
                                ${car.insuranceProvider ? `<div class="car-info-item">${car.insuranceProvider}</div>` : ''}
                                ${car.insurancePolicy ? `<div class="car-info-item">Policy: ${car.insurancePolicy}</div>` : ''}
                                ${car.insuranceExp ? `
                                    <div class="car-info-item ${insuranceExpired ? 'expired' : insuranceExpiringSoon ? 'expiring-soon' : ''}">
                                        Expires: ${formatDate(car.insuranceExp)}
                                        ${insuranceExpired ? ' <span class="expired-badge">Expired</span>' : insuranceExpiringSoon ? ' <span class="expiring-badge">Soon</span>' : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        ` : ''}
                        ${car.lastServiceDate || car.lastServiceType ? `
                        <div class="car-info-section">
                            <div class="car-info-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                                </svg>
                                <span>Last Service</span>
                            </div>
                            <div class="car-info-content">
                                ${car.lastServiceDate ? `<div class="car-info-item">Date: ${formatDate(car.lastServiceDate)}</div>` : ''}
                                ${car.lastServiceType ? `<div class="car-info-item">${car.lastServiceType}</div>` : ''}
                            </div>
                        </div>
                        ` : ''}
                        ${car.registrationExp || car.inspectionExp ? `
                        <div class="car-info-section">
                            <div class="car-info-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <span>Registration & Inspection</span>
                            </div>
                            <div class="car-info-content">
                                ${car.registrationExp ? `
                                    <div class="car-info-item ${registrationExpired ? 'expired' : registrationExpiringSoon ? 'expiring-soon' : ''}">
                                        Registration: ${formatDate(car.registrationExp)}
                                        ${registrationExpired ? ' <span class="expired-badge">Expired</span>' : registrationExpiringSoon ? ' <span class="expiring-badge">Soon</span>' : ''}
                                    </div>
                                ` : ''}
                                ${car.inspectionExp ? `
                                    <div class="car-info-item ${inspectionExpired ? 'expired' : inspectionExpiringSoon ? 'expiring-soon' : ''}">
                                        Inspection: ${formatDate(car.inspectionExp)}
                                        ${inspectionExpired ? ' <span class="expired-badge">Expired</span>' : inspectionExpiringSoon ? ' <span class="expiring-badge">Soon</span>' : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        ` : ''}
                        ${car.amountOwed || car.monthlyPayment || car.paymentDueDate ? `
                        <div class="car-info-section">
                            <div class="car-info-header">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 3v18"/>
                                    <path d="M16 7.5c0-1.9-1.8-3.5-4-3.5s-4 1.6-4 3.5 1.8 3.5 4 3.5 4 1.6 4 3.5-1.8 3.5-4 3.5-4-1.6-4-3.5" />
                                </svg>
                                <span>Payment</span>
                            </div>
                            <div class="car-info-content">
                                ${car.amountOwed ? `
                                    <div class="car-info-item">
                                        Amount Owed: $${parseFloat(car.amountOwed).toFixed(2)}
                                    </div>
                                ` : ''}
                                ${car.monthlyPayment ? `
                                    <div class="car-info-item">
                                        Monthly Payment: $${parseFloat(car.monthlyPayment).toFixed(2)}
                                    </div>
                                ` : ''}
                                ${car.paymentDueDate ? `
                                    <div class="car-info-item">
                                        Due Date: ${formatDate(car.paymentDueDate)}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                `;
                }).join('')}
            </div>
        `;
        this.setupCardClickHandlers();
    }

    renderFinance() {
        const container = document.getElementById('tasks-container');
        if (!container) return;
        
        const finances = storage.getFinances();
        const sortedFinances = [...finances].sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
        });
        
        if (finances.length === 0) {
            container.innerHTML = `
                <div class="category-view-header">
                    <div>
                        <h2 class="category-view-title">Finance</h2>
                        <p class="category-view-subtitle">0 transactions</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        ${this.renderViewToggle()}
                        <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('finances')" title="Add Finance">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 8v8" />
                                <path d="M8 12h8" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
                            <rect x="30" y="4" width="4" height="56"/>
                            <rect x="8" y="14" width="12" height="2"/>
                            <rect x="8" y="18" width="12" height="2"/>
                            <rect x="8" y="22" width="12" height="2"/>
                            <rect x="44" y="14" width="12" height="2"/>
                            <rect x="44" y="18" width="12" height="2"/>
                            <rect x="44" y="22" width="12" height="2"/>
                            <rect x="24" y="8" width="16" height="2"/>
                            <rect x="24" y="54" width="16" height="2"/>
                        </svg>
                    </div>
                    <div class="empty-state-title">No transactions yet</div>
                    <div class="empty-state-text">Tap the + button to add your first transaction</div>
                </div>
            `;
            this.setupCardClickHandlers();
            return;
        }
        
        container.innerHTML = `
            <div class="category-view-header">
                <div>
                    <h2 class="category-view-title">Finance</h2>
                    <p class="category-view-subtitle">${finances.length} transaction${finances.length !== 1 ? 's' : ''}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${this.renderViewToggle()}
                    <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('finances')" title="Add Finance">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v8" />
                            <path d="M8 12h8" />
                        </svg>
                    </button>
                </div>
            </div>
            ${this.renderFinanceMetrics(finances)}
            <div class="items-grid view-mode-${this.cardViewMode}">
                ${sortedFinances.map((finance, index) => {
                    const isIncome = finance.type === 'income';
                    const amount = parseFloat(finance.amount || 0);
                    const date = finance.date ? new Date(finance.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date';
                    
                    // Get finance category display name
                    const categoryMap = {
                        'cash': 'Cash',
                        'stocks': 'Stocks',
                        '401k': '401k',
                        'savings': 'Savings'
                    };
                    const financeCategory = finance.financeCategory || finance.category || '';
                    const categoryDisplay = categoryMap[financeCategory] || financeCategory || 'Transaction';
                    
                    return `
                        <div class="item-card" data-category="finances" data-index="${index}" data-item-id="${finance.id}">
                            <div class="item-card-header">
                                <div>
                                    <div class="item-card-title">${finance.description || categoryDisplay}</div>
                                    <div class="item-card-subtitle">${date}</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div class="item-card-badge finance-category-badge" data-category="${financeCategory}">${categoryDisplay}</div>
                                    <div class="item-card-badge">${isIncome ? 'Income' : 'Expense'}</div>
                                    <button class="item-delete-btn" data-category="finances" data-item-id="${finance.id}" onclick="event.stopPropagation(); HapticFeedback.warning(); app.confirmDelete('finances', '${finance.id}', '${(finance.description || categoryDisplay).replace(/'/g, "\\'")}')" title="Delete">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M3 6h18"/>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="item-card-amount ${isIncome ? 'positive' : 'negative'}">
                                ${isIncome ? '+' : '-'}$${Math.abs(amount).toFixed(2)}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        this.setupCardClickHandlers();
    }

    renderSubscriptions() {
        const container = document.getElementById('tasks-container');
        if (!container) return;
        
        const subscriptions = storage.getAll('subscriptions') || [];
        const sortedSubscriptions = [...subscriptions].sort((a, b) => {
            const dateA = new Date(a.billingDate || '9999-12-31');
            const dateB = new Date(b.billingDate || '9999-12-31');
            return dateA - dateB;
        });
        
        if (subscriptions.length === 0) {
            container.innerHTML = `
                <div class="category-view-header">
                    <div>
                        <h2 class="category-view-title">Subscriptions</h2>
                        <p class="category-view-subtitle">0 subscriptions</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('subscriptions')" title="Add Subscription">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 8v8" />
                                <path d="M8 12h8" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
                            <rect x="8" y="8" width="48" height="48" rx="4"/>
                            <line x1="20" y1="24" x2="44" y2="24"/>
                            <line x1="20" y1="32" x2="36" y2="32"/>
                            <line x1="20" y1="40" x2="44" y2="40"/>
                        </svg>
                    </div>
                    <div class="empty-state-title">No subscriptions yet</div>
                    <div class="empty-state-text">Tap the + button to add your first subscription</div>
                </div>
            `;
            return;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        container.innerHTML = `
            <div class="category-view-header">
                <div>
                    <h2 class="category-view-title">Subscriptions</h2>
                    <p class="category-view-subtitle">${subscriptions.length} subscription${subscriptions.length !== 1 ? 's' : ''}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('subscriptions')" title="Add Subscription">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v8" />
                            <path d="M8 12h8" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="items-grid view-mode-${this.cardViewMode}">
                ${sortedSubscriptions.map((subscription, index) => {
                    const billingDate = subscription.billingDate ? new Date(subscription.billingDate) : null;
                    const amount = parseFloat(subscription.amount || 0);
                    const formattedDate = billingDate ? billingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date';
                    
                    return `
                        <div class="item-card" data-category="subscriptions" data-index="${index}" data-item-id="${subscription.id}">
                            <div class="item-card-header">
                                <div>
                                    <div class="item-card-title">${subscription.name || 'Subscription'}</div>
                                    <div class="item-card-subtitle">${subscription.frequency || 'Monthly'}</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    ${subscription.autoRenew ? `
                                    <div class="item-card-badge" style="background: rgba(74, 222, 128, 0.2); border-color: #4ade80; color: #4ade80;">
                                        Auto-renew
                                    </div>
                                    ` : ''}
                                    <button class="item-delete-btn" data-category="subscriptions" data-item-id="${subscription.id}" onclick="event.stopPropagation(); HapticFeedback.warning(); app.confirmDelete('subscriptions', '${subscription.id}', '${(subscription.name || 'Subscription').replace(/'/g, "\\'")}')" title="Delete">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M3 6h18"/>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="item-card-amount">$${amount.toFixed(2)}</div>
                            <div class="item-card-details">
                                <div class="item-card-detail">
                                    <div class="item-card-detail-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/>
                                            <line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                    </div>
                                    <span>Billing: ${formattedDate}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        this.setupCardClickHandlers();
    }

    renderBills() {
        const container = document.getElementById('tasks-container');
        if (!container) return;
        
        const bills = storage.getBills();
        const sortedBills = [...bills].sort((a, b) => {
            const dateA = new Date(a.dueDate || '9999-12-31');
            const dateB = new Date(b.dueDate || '9999-12-31');
            return dateA - dateB;
        });
        
        if (bills.length === 0) {
            container.innerHTML = `
                <div class="category-view-header">
                    <div>
                        <h2 class="category-view-title">Bills</h2>
                        <p class="category-view-subtitle">0 bills</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        ${this.renderViewToggle()}
                        <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('bills')" title="Add Bill">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 8v8" />
                                <path d="M8 12h8" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
                            <rect x="12" y="8" width="40" height="48"/>
                            <line x1="16" y1="16" x2="48" y2="16"/>
                            <line x1="16" y1="24" x2="40" y2="24"/>
                            <line x1="16" y1="32" x2="40" y2="32"/>
                            <line x1="16" y1="40" x2="48" y2="40"/>
                            <line x1="16" y1="48" x2="36" y2="48"/>
                        </svg>
                    </div>
                    <div class="empty-state-title">No bills yet</div>
                    <div class="empty-state-text">Tap the + button to add your first bill</div>
                </div>
            `;
            return;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        container.innerHTML = `
            <div class="category-view-header">
                <div>
                    <h2 class="category-view-title">Bills</h2>
                    <p class="category-view-subtitle">${bills.length} bill${bills.length !== 1 ? 's' : ''}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${this.renderViewToggle()}
                    <button class="tasks-add-btn" onclick="HapticFeedback.medium(); app.openAddModal('bills')" title="Add Bill">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v8" />
                            <path d="M8 12h8" />
                        </svg>
                    </button>
                </div>
            </div>
            ${this.renderBillMetrics(bills)}
            <div class="items-grid view-mode-${this.cardViewMode}">
                ${sortedBills.map((bill, index) => {
                    const dueDate = bill.dueDate ? new Date(bill.dueDate) : null;
                    const isOverdue = dueDate && dueDate < today && !bill.paid;
                    const isDueSoon = dueDate && dueDate >= today && dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) && !bill.paid;
                    const formattedDate = dueDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date';
                    const amount = parseFloat(bill.amount || 0);
                    
                    return `
                        <div class="item-card" data-category="bills" data-index="${index}" data-item-id="${bill.id}">
                            <div class="item-card-header">
                                <div>
                                    <div class="item-card-title">${bill.name || 'Bill'}</div>
                                    <div class="item-card-subtitle">${bill.frequency || 'One-time'}</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div class="item-card-badge" style="${isOverdue ? 'background: rgba(248, 113, 113, 0.2); border-color: #f87171; color: #f87171;' : isDueSoon ? 'background: rgba(251, 191, 36, 0.2); border-color: #fbbf24; color: #fbbf24;' : bill.paid ? 'background: rgba(74, 222, 128, 0.2); border-color: #4ade80; color: #4ade80;' : ''}">
                                        ${bill.paid ? 'Paid' : isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Pending'}
                                    </div>
                                    <button class="item-delete-btn" data-category="bills" data-item-id="${bill.id}" onclick="event.stopPropagation(); HapticFeedback.warning(); app.confirmDelete('bills', '${bill.id}', '${(bill.name || 'Bill').replace(/'/g, "\\'")}')" title="Delete">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M3 6h18"/>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="item-card-amount">$${amount.toFixed(2)}</div>
                            <div class="item-card-details">
                                <div class="item-card-detail">
                                    <div class="item-card-detail-icon">
                                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
                                            <rect x="2" y="3" width="12" height="10"/>
                                            <line x1="2" y1="6" x2="14" y2="6"/>
                                            <line x1="5" y1="9" x2="11" y2="9"/>
                                        </svg>
                                    </div>
                                    <span>Due: ${formattedDate}</span>
                                </div>
                                ${bill.autoPay ? `
                                    <div class="item-card-detail">
                                        <div class="item-card-detail-icon">
                                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter">
                                                <rect x="2" y="4" width="12" height="8" rx="1"/>
                                                <line x1="4" y1="8" x2="12" y2="8"/>
                                            </svg>
                                        </div>
                                        <span>Auto-pay enabled</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        this.setupCardClickHandlers();
    }

    // Notification Management
    async initNotifications() {
        if ('serviceWorker' in navigator && 'Notification' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                this.swRegistration = registration;
            } catch (error) {
                console.error('Service Worker registration error:', error);
            }
        }
    }

    async checkNotificationPermission() {
        // Check if running on iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // iOS 16.4+ supports web push notifications, but only for installed PWAs
        if (isIOS) {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                                window.navigator.standalone || 
                                document.referrer.includes('android-app://');
            
            if (!isStandalone) {
                this.updateNotificationUI('ios-install-required');
                return;
            }
        }

        if (!('Notification' in window)) {
            this.updateNotificationUI('not-supported');
            return;
        }

        const permission = Notification.permission;
        this.updateNotificationUI(permission);
    }

    updateNotificationUI(permission) {
        const toggleSwitch = document.getElementById('notification-toggle-switch');
        const statusDesc = document.getElementById('notification-status');

        if (!toggleSwitch || !statusDesc) return;

        if (permission === 'granted') {
            toggleSwitch.checked = localStorage.getItem('notificationsEnabled') !== 'false';
            statusDesc.textContent = 'Notifications are enabled';
        } else if (permission === 'denied') {
            toggleSwitch.checked = false;
            toggleSwitch.disabled = true;
            statusDesc.textContent = 'Notifications are blocked. Please enable in browser settings.';
        } else if (permission === 'not-supported') {
            toggleSwitch.checked = false;
            toggleSwitch.disabled = true;
            statusDesc.textContent = 'Notifications are not supported on this device';
        } else if (permission === 'ios-install-required') {
            toggleSwitch.checked = false;
            toggleSwitch.disabled = false;
            statusDesc.innerHTML = 'Install this app to your home screen to enable notifications on iOS. Tap the share button → "Add to Home Screen"';
        } else {
            toggleSwitch.checked = false;
            statusDesc.textContent = 'Enable notifications for bills, tasks, and reminders';
        }
    }

    async toggleNotificationsSwitch() {
        HapticFeedback.light();
        const toggleSwitch = document.getElementById('notification-toggle-switch');
        if (!toggleSwitch) return;

        if (toggleSwitch.checked) {
            // Turn on notifications
            if (!('Notification' in window)) {
                alert('Notifications are not supported on this device.');
                toggleSwitch.checked = false;
                return;
            }

            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    localStorage.setItem('notificationsEnabled', 'true');
                    this.updateNotificationUI('granted');
                    
                    // Try to subscribe to push notifications
                    if (this.swRegistration) {
                        try {
                            const subscription = await this.swRegistration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: this.urlBase64ToUint8Array(this.getVapidPublicKey())
                            });
                            console.log('Push subscription:', subscription);
                        } catch (error) {
                            console.log('Push subscription failed (using local notifications):', error);
                        }
                    }
                } else {
                    toggleSwitch.checked = false;
                    this.updateNotificationUI('denied');
                }
            } else if (Notification.permission === 'granted') {
                localStorage.setItem('notificationsEnabled', 'true');
                this.updateNotificationUI('granted');
            } else {
                toggleSwitch.checked = false;
                alert('Notifications are blocked. Please enable them in your browser settings.');
            }
        } else {
            // Turn off notifications
            localStorage.setItem('notificationsEnabled', 'false');
            this.updateNotificationUI(Notification.permission);
        }
    }

    async toggleNotifications() {
        if (!('Notification' in window)) {
            alert('Notifications are not supported on this device.');
            return;
        }

        if (Notification.permission === 'granted') {
            // Disable notifications (just revoke permission - user can re-enable)
            const confirmed = confirm('Disable notifications? You can re-enable them later in settings.');
            if (confirmed) {
                // Note: We can't actually revoke permission, but we can stop sending notifications
                localStorage.setItem('notificationsEnabled', 'false');
                this.updateNotificationUI('default');
            }
        } else if (Notification.permission === 'default') {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                localStorage.setItem('notificationsEnabled', 'true');
                this.updateNotificationUI('granted');
                
                // Try to subscribe to push notifications
                if (this.swRegistration) {
                    try {
                        const subscription = await this.swRegistration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: this.urlBase64ToUint8Array(this.getVapidPublicKey())
                        });
                        console.log('Push subscription:', subscription);
                    } catch (error) {
                        console.log('Push subscription failed (using local notifications):', error);
                    }
                }
            } else {
                this.updateNotificationUI('denied');
            }
        } else {
            alert('Notifications are blocked. Please enable them in your browser settings.');
        }
    }

    async sendTestNotification() {
        HapticFeedback.medium();
        if (Notification.permission !== 'granted') {
            await this.toggleNotifications();
            if (Notification.permission !== 'granted') {
                return;
            }
        }

        const options = {
            body: 'This is a test notification from Home Manager. If you see this, notifications are working!',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'test-notification',
            requireInteraction: false
        };

        if (this.swRegistration) {
            this.swRegistration.showNotification('Home Manager - Test', options);
        } else if ('Notification' in window) {
            new Notification('Home Manager - Test', options);
        }
    }

    checkAndSendNotifications() {
        if (Notification.permission !== 'granted') return;
        if (localStorage.getItem('notificationsEnabled') === 'false') return;

        const actionItems = this.getActionItems();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        actionItems.forEach(item => {
            const notificationKey = `notified-${item.type}-${item.id}`;
            const lastNotified = localStorage.getItem(notificationKey);
            const lastNotifiedDate = lastNotified ? new Date(lastNotified) : null;

            // Only send notification if we haven't notified today
            if (!lastNotifiedDate || lastNotifiedDate.toDateString() !== today.toDateString()) {
                this.sendActionItemNotification(item);
                localStorage.setItem(notificationKey, today.toISOString());
            }
        });
    }

    sendActionItemNotification(item) {
        const options = {
            body: item.subtitle || 'Action required',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: item.urgent ? [200, 100, 200, 100, 200] : [200, 100, 200],
            tag: `action-item-${item.type}-${item.id}`,
            requireInteraction: item.urgent,
            data: {
                type: item.type,
                id: item.id,
                url: '/'
            }
        };

        if (this.swRegistration) {
            this.swRegistration.showNotification(item.title, options);
        } else if ('Notification' in window) {
            new Notification(item.title, options);
        }
    }

    startNotificationChecker() {
        // Check for notifications every hour
        setInterval(() => {
            this.checkAndSendNotifications();
        }, 60 * 60 * 1000); // 1 hour

        // Also check immediately
        setTimeout(() => {
            this.checkAndSendNotifications();
        }, 5000); // After 5 seconds
    }

    getVapidPublicKey() {
        // For now, return a placeholder. In production, you'd use a real VAPID key from a push service
        // You can generate one at https://web-push-codelab.glitch.me/
        return 'BEl62iUYgUivxIkv69yViEuiBIa40HI8vU8vK8vK8vK8vK8vK8vK8vK8vK8vK8vK8vK8vK8vK8vK8';
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// Initialize app
const app = new HomeManagerApp();

// Prevent default touch behaviors
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
