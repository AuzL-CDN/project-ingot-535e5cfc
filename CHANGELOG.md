# Changelog

All notable changes to Project INGOT - Inspection Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to Semantic Versioning with the following convention:
- **MAJOR.MINOR.PATCH** (e.g., 2.3.1)
- First number (2.x.x): Major version
- Second number (x.1.x): Major structural changes, new major features
- Third number (x.x.1): Minor changes, bug fixes, small enhancements

## [Unreleased]

### Planned Features
- Enhanced analytics dashboard for inspection metrics
- Advanced reporting with custom report templates
- Mobile-optimized inspection interface
- Bulk operations for managing multiple inspections
- Advanced search with filtering and sorting
- Integration with additional Microsoft 365 services
- Real-time collaboration features for team inspections
- Automated backup and data archiving system

---

## [2.3.1]

### Added
- GitHub + CI/CD Pipeline documentation for independent development
- Comprehensive deployment workflow for GitHub Actions with Azure Static Web Apps
- Team collaboration guidelines for parallel development
- Local development setup instructions without platform dependencies

### Changed
- Restructured README.md deployment options to include GitHub-based workflow
- Enhanced deployment documentation for production environments

---

## [2.3.0]

### Added
- Browser push notifications system for deadline alerts
- Service worker (`sw.js`) for background notification handling
- In-app notification banners for urgent deadlines (NotificationBanner, NotificationHeader)
- Push notification subscription management UI
- Supabase Edge Function (`check-deadline-notifications`) for automated deadline checking
- Automated cron job for daily notification checks at 8:00 AM UTC
- VAPID keys configuration for web push authentication
- `usePushNotifications` hook for notification management
- `useNotifications` hook for notification state management
- PushNotificationPrompt component for user opt-in
- NotificationDialog component for displaying notifications

### Changed
- Updated SystemStatus tab with notification controls and testing interface
- Enhanced deployment guide with push notification setup instructions
- Added notification configuration to environment variables
- Updated database schema with notification-related extensions (pg_cron, pg_net)

### Technical
- Integrated Web Push API for browser notifications
- Configured Supabase cron jobs for scheduled notification checks
- Implemented notification permission handling and subscription management
- Added notification testing and debugging tools in admin panel

---

## [2.2.0]

### Added
- Advanced checklist system with 1F (Protected) and 1G (Classified) sub-tabs
- Intelligent Analysis Engine for automated report population
- ChecklistAnalyzer.ts with comprehensive analysis logic
- Advanced file upload with drag-and-drop support (FileUploadZone)
- Smart image embedding and document linking in reports
- Progress tracking with real-time completion status
- Conditional logic for dynamic question flows
- ChecklistSection component with collapsible sections
- DocumentImporter for importing existing checklist data

### Enhanced
- Document automation with checklist integration
- Final Report auto-generation from checklist responses
- Content automation service with intelligent field mapping
- Template system with automated data population

### Technical
- React Dropzone integration for file handling
- TypeScript interfaces for checklist data structures (`types/checklist.ts`)
- Comprehensive analysis engine with confidence scoring
- State management for checklist responses and file attachments
- Image and document parsing utilities

---

## [2.1.0]

### Added
- Content automation color-coding system (yellow highlights, red placeholders)
- Template field mapping with visual indicators
- Enhanced approval letter generation (EnhancedApprovalLetter component)
- ContentAutomationService with business logic engine
- TemplateFieldMapper for dynamic field resolution
- Multi-language template support (English/French)
- Word template integration with content controls
- Document templates directory with standardized formats:
  - ApprovalLetter.docx
  - CSC_ApprovalLetter.docx
  - Checklist_Classified.docx
  - Checklist_Protected.docx
  - FinalReport.docx
  - Memorandum.docx

### Changed
- Refactored document generation workflow
- Enhanced approval letter UI with better user experience
- Improved template validation and error handling

### Technical
- Mammoth.js integration for Word document processing
- Advanced content control parsing and manipulation
- Business day calculation utilities
- Template versioning system

---

## [2.0.0]

### Added - Core System Infrastructure
- Project scaffolding with React + Vite + TypeScript
- Complete Supabase integration (Authentication, Database, Storage)
- Multi-tab inspection workflow interface (TabNavigation)
- Inspector profile management system (InspectorInfo)
- Main form with organization lookup (MainForm, AddressLookup)
- Search functionality and activity management (SearchTab)
- DISIS notes integration (DISISNotesTab)
- Supporting documents management (SupportingDocuments)
- Corrective measures tracking (CorrectiveMeasuresTab)
- Status tracking tab (StatusTab)
- Email management integration (EmailsTab)
- Resources tab with reference materials (ResourcesTab)
- Hardware inventory management (HardwareManager, SecurityFeaturesManager)
- Admin panel with user management (AdminTab, UserManagement, SystemStatus)
- Multi-language support system (EN/FR) with LanguageSwitcher
- Theme provider with dark/light mode support
- Authentication system with AuthPage and AuthProvider

### Added - Components & UI
- Responsive design with Tailwind CSS
- Accessibility compliance with Radix UI components
- Complete shadcn/ui component library integration:
  - Form components (input, textarea, select, checkbox, radio)
  - Layout components (card, tabs, accordion, dialog, sheet)
  - Feedback components (toast, alert, progress)
  - Navigation components (breadcrumb, dropdown-menu, navigation-menu)
  - Data display components (table, badge, avatar, separator)
- Custom hooks for state management:
  - `useInspectionState` for inspection data
  - `useTranslation` for i18n support
  - `useNotifications` for notification handling
  - `use-mobile` for responsive behavior

### Added - Data Management
- Organization directory data (ORGDirectory.xlsx)
- Organization address merge data
- Document parser service (DocumentParser.ts)
- Security products configuration
- Business day calculator utility

### Added - Documentation
- Comprehensive README.md with deployment instructions
- Application documentation (APPLICATION-DOCUMENTATION.md)
- System requirements specification
- M365 implementation guide
- SharePoint deployment guides (technical and non-technical)
- Migration verification checklist
- Quick start checklist
- Word template usage documentation

### Technical
- React 18.3.1 with TypeScript
- Vite build system for fast development
- React Router DOM for navigation
- React Hook Form with Zod validation
- TanStack Query for data fetching
- Date-fns for date manipulation
- XLSX for Excel file handling
- Recharts for data visualization
- Lucide React for icons
- ESLint and TypeScript configuration
- Tailwind CSS setup with custom configuration
- Initial routing structure
- Development environment setup

---

## Version History Summary

- **2.3.x**: Push notifications and CI/CD enhancements
- **2.2.x**: Advanced checklist system
- **2.1.x**: Document automation framework
- **2.0.x**: Core system infrastructure and UI (Initial Release)

---

## Notes

- **Current Version**: 2.3.1
- **Maintained By**: Austin Larocque, James Grace
- **License**: Internal use - Government of Canada
- **Documentation**: See `/docs` directory for detailed guides

For deployment instructions, see [README.md](./README.md)
For technical documentation, see [docs/APPLICATION-DOCUMENTATION.md](./docs/APPLICATION-DOCUMENTATION.md)
