# Fitness RPG Application

## Overview

This is a gamified fitness tracking application that transforms health and wellness activities into an RPG-style experience. Users maintain a character that levels up through completing fitness quests, logging nutrition, and performing workouts. The app features a fantasy-themed UI with character progression, XP systems, and achievement tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite build system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom fantasy theme colors
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Design**: RESTful API with JSON responses
- **Development**: Hot module replacement with Vite middleware in development

### Key Components

#### Character System
- Character progression with levels, XP, and fantasy avatars
- Fantasy-themed class system (Warrior of Wellness)
- Visual progress bars and level-up animations
- Character customization with 8 pixel art fantasy avatars (Knight, Wizard, Orc, Elf Ranger, Dwarf, Rogue, Paladin, Barbarian)
- SVG-based pixel art character portraits matching D&D aesthetic

#### Quest System
- Daily quests for cardio, nutrition, hydration, and strength
- Progress tracking with target values and rewards
- Quest completion triggers XP gain and character progression
- Difficulty levels (easy, normal, hard)

#### Activity Tracking
- Real-time activity feed showing user actions
- XP notifications and level-up modals
- Quick action buttons for common activities
- Activity categorization and metadata storage

#### Quality of Life Features
- **Barcode Scanner**: Camera-based barcode scanning for quick food lookup
- **Food Database**: Comprehensive searchable food database with verified nutrition data
- **Health Integration**: Connects to device health APIs for automatic activity sync
- **Smart XP Rewards**: Bonus XP for health milestones (10K steps, active minutes, calories)

#### Nutrition Logging
- Detailed food tracking with macronutrient breakdown
- Meal type categorization (breakfast, lunch, dinner, snack)
- Daily nutrition summaries and progress tracking
- Form-based food entry with validation

#### Workout Tracking
- Exercise logging with duration, intensity, and calories burned
- Workout type categorization and notes
- Progress visualization and historical data
- Intensity-based XP calculations

### Data Flow

1. **User Actions**: Users interact with React components (logging food, completing workouts)
2. **Form Validation**: Zod schemas validate input data on the client
3. **API Requests**: TanStack Query manages HTTP requests to Express endpoints
4. **Database Operations**: Drizzle ORM handles PostgreSQL queries and data persistence
5. **Real-time Updates**: Query invalidation triggers UI updates across components
6. **Character Progression**: XP calculations trigger level-up events and visual feedback

### External Dependencies

#### UI Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Icon library for consistent visual elements
- **Class Variance Authority**: Type-safe component variant system
- **Date-fns**: Date manipulation and formatting utilities

#### Development Tools
- **ESBuild**: Fast bundling for production builds
- **TSX**: TypeScript execution for development server
- **Drizzle Kit**: Database migration and schema management tools

### Deployment Strategy

#### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reloading**: Full-stack hot module replacement
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL for database connection

#### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Static Assets**: Express serves built frontend from production bundle
- **Database Migrations**: Drizzle push commands for schema updates

#### Architecture Benefits
- **Separation of Concerns**: Clear division between frontend React app and backend API
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Performance**: Optimized builds with code splitting and lazy loading
- **Scalability**: Serverless PostgreSQL and stateless Express design
- **User Experience**: Fantasy theme creates engaging gamification experience

The application successfully combines modern web technologies with gamification principles to create an engaging fitness tracking experience that motivates users through RPG-style progression systems.