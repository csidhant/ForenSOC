# ForenSOC React Frontend (Option 2)

Advanced React + TypeScript + Material-UI frontend for the ForenSOC platform.

## Features

- **Modern UI**: Built with Material-UI (MUI) for a professional look and feel
- **TypeScript**: Full type safety with comprehensive type definitions
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **State Management**: Zustand for lightweight state management
- **API Integration**: Axios with interceptors for API communication
- **Authentication**: JWT-based authentication with token management
- **Real-time Updates**: WebSocket support ready for notifications
- **Dark Mode**: Built-in dark/light theme toggle
- **Charts & Data Visualization**: Recharts integration for analytics

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript 5
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) 5
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Date Management**: Day.js
- **Notifications**: Notistack
- **Charts**: Recharts
- **Styling**: Emotion + MUI

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── Navigation.tsx
│   └── Routes.tsx
├── pages/           # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CasesPage.tsx
│   ├── CaseDetailPage.tsx
│   ├── AlertsPage.tsx
│   ├── ReportsPage.tsx
│   ├── SettingsPage.tsx
│   └── NotFoundPage.tsx
├── services/        # API service layer
│   └── apiService.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── theme/           # Theme configuration
│   └── theme.tsx
├── utils/           # Utility functions
│   ├── store.ts     # Zustand stores
│   └── helpers.ts   # Helper functions
├── App.tsx          # Main App component
└── main.tsx         # Entry point
```

## Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API running on http://localhost:8000

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your settings:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_API_TIMEOUT=30000
   VITE_APP_NAME=ForenSOC
   VITE_ENABLE_DARK_MODE=true
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   Frontend will be available at: http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Docker Setup

### Build Docker Image
```bash
docker build -t forensoc-react-frontend:latest .
```

### Run Docker Container
```bash
docker run -p 3000:3000 forensoc-react-frontend:latest
```

The frontend will be available at http://localhost:3000

## API Integration

All API calls are handled through `apiService.ts`. The service includes:

- Authentication (login, logout, current user)
- Cases (CRUD operations)
- Alerts (fetch, update)
- Evidence (upload, download, chain of custody)
- Events (create, list)
- Timeline (fetch, generate)
- Reports (create, generate, download)

### Example Usage

```typescript
import { apiService } from '@services/apiService';

// Login
const response = await apiService.login({ username: 'admin', password: 'password' });

// Get cases
const cases = await apiService.getCases(1, 10);

// Create a new case
const newCase = await apiService.createCase({
  title: 'Investigation X',
  description: 'Details here',
  priority: 'high'
});
```

## State Management

The app uses Zustand for state management with these stores:

- **useAuthStore**: User authentication state
- **useCaseStore**: Current case and cases list
- **useAlertStore**: Alerts and unread count
- **useUiStore**: UI preferences (dark mode, sidebar state)

### Example Usage

```typescript
import { useAuthStore } from '@utils/store';

const { user, isAuthenticated, logout } = useAuthStore();
```

## Styling

Material-UI theming is configured in `src/theme/theme.tsx` with:
- Light and dark themes
- Custom color palettes
- Component customizations
- Typography settings

## Authentication Flow

1. User lands on `/login`
2. Enters credentials and submits
3. API validates and returns JWT token
4. Token is stored in localStorage
5. User is redirected to `/dashboard`
6. Token is included in all API requests via Axios interceptor
7. On token expiration (401), user is redirected to login

## Type Definitions

Comprehensive TypeScript types are defined in `src/types/index.ts`:

- `User`, `UserRole`
- `Case`, `CaseStatus`, `Priority`
- `Alert`, `AlertSeverity`, `AlertStatus`
- `Evidence`, `ChainOfCustody`
- `Event`, `Timeline`, `TimelineEvent`
- `Report`, `ReportStatus`
- `PaginatedResponse<T>`, `ApiError`

## Extending the App

### Adding a New Page

1. Create `src/pages/MyNewPage.tsx`
2. Add route in `src/components/Routes.tsx`
3. Import and add to menu in `Navigation.tsx` (optional)

### Adding a New API Endpoint

1. Add method to `apiService` in `src/services/apiService.ts`
2. Update types in `src/types/index.ts` if needed
3. Use in components with `apiService.methodName()`

### Adding a Reusable Component

1. Create `src/components/MyComponent.tsx`
2. Export from component
3. Import and use in pages/other components

## Performance Optimization

- Code splitting via React Router
- Lazy loading of pages
- Memoization of expensive components
- Efficient re-renders with React hooks
- Optimized bundle size with Vite

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When adding new features:

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Include loading states
5. Test with both light and dark themes
6. Ensure responsive design

## License

This project is part of ForenSOC. See LICENSE file for details.

## Support

For issues or questions:
- Check the backend API documentation at http://localhost:8000/api/docs
- Review the project README.md in the root directory
- Check development status in DEVELOPMENT_STATUS.md

## Roadmap

See IMPLEMENTATION_ROADMAP.md in the project root for planned features and timeline.
