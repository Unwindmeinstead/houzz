# Home Manager App - Features Plan

## Core Categories

### 1. **Cars**
- Vehicle information (make, model, year, VIN)
- Maintenance records (oil changes, repairs, services)
- Insurance details
- Registration renewal dates
- Mileage tracking
- Fuel expenses
- Upcoming maintenance reminders

### 2. **Bills**
- Recurring bills (utilities, rent, subscriptions)
- One-time bills
- Due dates and payment tracking
- Payment history
- Bill categories (electricity, water, internet, etc.)
- Auto-pay status
- Reminders for upcoming bills

### 3. **To-Do**
- Task list with dates (matching screenshot style)
- Priority levels
- Completion tracking
- Daily/weekly/monthly organization
- Notifications/reminders
- Task categories

### 4. **Insurances**
- Insurance types (car, home, health, life)
- Policy numbers
- Coverage details
- Premium amounts
- Renewal dates
- Provider information
- Claims history

### 5. **Finances**
- Income tracking
- Expense categories
- Budget management
- Spending analysis
- Financial goals
- Account balances
- Transaction history

### 6. **Savings**
- Savings goals
- Progress tracking
- Multiple savings accounts/categories
- Target dates
- Contribution tracking
- Visual progress indicators

## Technical Features

### Data Storage
- LocalStorage for all data persistence
- Data structure organized by categories
- Backup/export functionality (future)

### UI/UX Features
- Dark theme matching screenshot
- Date-organized lists (like screenshot)
- Add/edit overlay modals with gradient borders
- Completion messages with gradient boxes
- Smooth animations
- Mobile-first design
- Swipe gestures (future)

### Navigation
- Bottom nav: Home, Categories, Add (+), Settings, Profile
- Category tabs within sections
- Search functionality
- Filter and sort options

## Data Models

### Car
```javascript
{
  id: string,
  make: string,
  model: string,
  year: number,
  vin: string,
  maintenance: Array<{date, type, cost, notes}>,
  insurance: {provider, policyNumber, expiry},
  registration: {expiry, renewalDate},
  mileage: number,
  fuelExpenses: Array<{date, amount, gallons, mpg}>
}
```

### Bill
```javascript
{
  id: string,
  name: string,
  category: string,
  amount: number,
  dueDate: string,
  frequency: 'monthly' | 'weekly' | 'yearly' | 'one-time',
  autoPay: boolean,
  paid: boolean,
  paymentHistory: Array<{date, amount}>
}
```

### Todo
```javascript
{
  id: string,
  title: string,
  description: string,
  dueDate: string,
  priority: 'low' | 'medium' | 'high',
  completed: boolean,
  category: string,
  notify: boolean
}
```

### Insurance
```javascript
{
  id: string,
  type: 'car' | 'home' | 'health' | 'life',
  provider: string,
  policyNumber: string,
  premium: number,
  renewalDate: string,
  coverage: object,
  claims: Array<{date, type, amount, status}>
}
```

### Finance
```javascript
{
  id: string,
  type: 'income' | 'expense',
  category: string,
  amount: number,
  date: string,
  description: string,
  account: string
}
```

### Savings
```javascript
{
  id: string,
  name: string,
  targetAmount: number,
  currentAmount: number,
  targetDate: string,
  category: string,
  contributions: Array<{date, amount}>
}
```
