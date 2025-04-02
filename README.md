# FinTrack - Personal Budgeting and Net Worth Tracker

FinTrack is a modern, fully-featured personal finance management web application built with Next.js, React, TypeScript, Tailwind CSS, and Firebase. It helps users track expenses, manage budgets, monitor investments, and calculate their net worth.

## Features

- **User Authentication**
  - Email and Google sign-in
  - Multi-Factor Authentication
  - User profiles with customizable avatars

- **Expense & Income Tracking**
  - Add, edit, and delete transactions
  - Categorization of expenses and income
  - Recurring transactions
  - Receipt attachment

- **Smart Budgeting**
  - Monthly/annual budget setting by category
  - Spending insights and recommendations
  - Overspending alerts

- **Net Worth Tracking**
  - Asset management (Cash, Bank, Stocks, Crypto, Real Estate)
  - Liability tracking (Loans, Credit Cards, Mortgages)
  - Automatic net worth calculation

- **Interactive Dashboards**
  - Visual representations of financial data
  - Customizable dashboard widgets
  - Export reports to PDF/CSV

- **Investment & Goal Tracking**
  - Financial goal setting and monitoring
  - Investment portfolio tracking
  - Real-time market data integration

- **Dark Mode & UI Customization**
  - Toggle between light and dark themes
  - Drag-and-drop dashboard widgets

## Tech Stack

- **Frontend**
  - Next.js (React framework)
  - TypeScript
  - Tailwind CSS
  - Framer Motion (animations)
  - Chart.js (data visualization)
  - React Icons
  - React Hook Form

- **State Management**
  - Zustand

- **Backend & Database**
  - Firebase Authentication
  - Firestore (database)
  - Firebase Storage (for receipt uploads)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/financial-tracker.git
   cd financial-tracker
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Configure Firebase:
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Enable Storage
   - Copy your Firebase configuration

4. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

5. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect to Vercel
3. Set up your environment variables in Vercel
4. Deploy

## Project Structure

```
financial-tracker/
├── src/
│   ├── app/
│   │   ├── (protected)/
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── budgeting/
│   │   │   ├── networth/
│   │   │   ├── investments/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── budgeting/
│   │   ├── networth/
│   │   ├── investments/
│   │   └── ui/
│   ├── lib/
│   │   ├── context/
│   │   ├── firebase/
│   │   ├── store/
│   │   ├── types.ts
│   │   └── utils.ts
│   └── ...
└── ...
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Framer Motion](https://www.framer.com/motion/)
- [Chart.js](https://www.chartjs.org/)
