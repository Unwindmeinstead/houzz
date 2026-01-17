// Local Storage Manager for Home Manager App
class StorageManager {
    constructor() {
        this.storageKey = 'homeManagerData';
        this.init();
    }

    init() {
        if (!this.getData()) {
            this.setData({
                todos: [],
                cars: [],
                bills: [],
                insurances: [],
                finances: [],
                savings: [],
                checking: []
            });
        }
    }

    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from storage:', e);
            return null;
        }
    }

    setData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error writing to storage:', e);
            return false;
        }
    }

    // Generic CRUD operations
    getAll(category) {
        const data = this.getData();
        return data && data[category] ? data[category] : [];
    }

    add(category, item) {
        const data = this.getData();
        if (!data) return false;

        const newItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...item,
            createdAt: new Date().toISOString()
        };

        data[category] = data[category] || [];
        data[category].push(newItem);
        return this.setData(data) ? newItem : null;
    }

    update(category, id, updates) {
        const data = this.getData();
        if (!data || !data[category]) return false;

        const index = data[category].findIndex(item => item.id === id);
        if (index === -1) return false;

        data[category][index] = {
            ...data[category][index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        return this.setData(data);
    }

    delete(category, id) {
        const data = this.getData();
        if (!data || !data[category]) return false;

        data[category] = data[category].filter(item => item.id !== id);
        return this.setData(data);
    }

    // Category-specific methods
    getTodos() { return this.getAll('todos'); }
    getCars() { return this.getAll('cars'); }
    getBills() { return this.getAll('bills'); }
    getInsurances() { return this.getAll('insurances'); }
    getFinances() { return this.getAll('finances'); }
    getSavings() { return this.getAll('savings'); }

    addTodo(todo) { return this.add('todos', todo); }
    addCar(car) { return this.add('cars', car); }
    addBill(bill) { return this.add('bills', bill); }
    addInsurance(insurance) { return this.add('insurances', insurance); }
    addFinance(finance) { return this.add('finances', finance); }
    addSaving(saving) { return this.add('savings', saving); }

    updateTodo(id, updates) { return this.update('todos', id, updates); }
    updateCar(id, updates) { return this.update('cars', id, updates); }
    updateBill(id, updates) { return this.update('bills', id, updates); }
    updateInsurance(id, updates) { return this.update('insurances', id, updates); }
    updateFinance(id, updates) { return this.update('finances', id, updates); }
    updateSaving(id, updates) { return this.update('savings', id, updates); }

    deleteTodo(id) { return this.delete('todos', id); }
    deleteCar(id) { return this.delete('cars', id); }
    deleteBill(id) { return this.delete('bills', id); }
    deleteInsurance(id) { return this.delete('insurances', id); }
    deleteFinance(id) { return this.delete('finances', id); }
    deleteSaving(id) { return this.delete('savings', id); }

    // Get counts for each category
    getCounts() {
        const data = this.getData();
        if (!data) return {};
        return {
            todos: data.todos?.length || 0,
            cars: data.cars?.length || 0,
            bills: data.bills?.length || 0,
            insurances: data.insurances?.length || 0,
            finances: data.finances?.length || 0,
            savings: data.savings?.length || 0,
            checking: data.checking?.length || 0
        };
    }
}

// Initialize storage manager
const storage = new StorageManager();
