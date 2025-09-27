# Project INGOT - Inspection Management System

## 🔍 Project Overview

**Project INGOT** is a comprehensive Inspection Management System designed for government security inspectors to streamline inspection processes, automate document generation, and ensure compliance with security protocols. The system supports multiple inspection types (1F, 1G, 19F, 19G) and integrates with Microsoft 365 environments.

### 🌟 Key Features
- **Advanced Checklist System**: Intelligent 1F/1G checklists with automated analysis
- **Document Automation**: Template-based generation with color-coded content controls
- **Multi-Language Support**: English/French interface and document generation
- **File Management**: Drag-and-drop uploads with automatic embedding and linking
- **Real-time Analysis**: AI-powered checklist analysis for Final Report generation
- **Secure Authentication**: Supabase-powered user management and data security

### 🏗️ Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **UI Framework**: Shadcn/ui with Radix UI primitives
- **File Handling**: React Dropzone for uploads
- **State Management**: Custom hooks with React Context

---

## 📋 Documentation

### Core Documentation Files
- **[📖 Complete Application Documentation](./docs/APPLICATION-DOCUMENTATION.md)** - Comprehensive feature overview and capabilities
- **[⚙️ System Requirements](./docs/SYSTEM-REQUIREMENTS.md)** - Technical prerequisites and setup specifications
- **[🔄 Document Automation Flowchart](./docs/Document-Automation-Flowchart.md)** - Visual workflow diagrams

### Quick Start Resources
- **[🚀 Quick Start Checklist](./docs/Quick-Start-Checklist.md)** - Step-by-step setup guide
- **[🔗 M365 Integration Guide](./docs/M365-Implementation-Guide.md)** - Microsoft 365 setup instructions
- **[📝 Template Documentation](./docs/word-templates/README-Templates.md)** - Word template configuration guide

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for Supabase integration

### Quick Setup
```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration
The application uses Supabase for backend services. Environment variables are pre-configured:
- Database: PostgreSQL with Row-Level Security
- Authentication: Email/password with profile management
- Storage: Encrypted file storage with CDN delivery
- Real-time: Live data synchronization

---

## 🎯 Current Version: 2.5.0

### ✨ Latest Features (September 2025)
- **🆕 Advanced Checklist System**: Complete 1F/1G checklist workflows with sub-tabs
- **🤖 Intelligent Analysis Engine**: Automated Final Report generation from responses
- **📎 Enhanced File Integration**: Smart image embedding and document linking
- **📊 Progress Tracking**: Real-time completion status and conditional logic
- **🔄 Workflow Automation**: Seamless integration between checklists and reports

### 🛠️ Recent Improvements
- Enhanced document automation with color-coding framework
- Multi-language support for interface and generated documents
- Comprehensive template system with content controls
- Advanced file upload with drag-and-drop support
- Real-time progress tracking and validation

---

## 🔧 Development & Deployment

### Local Development
```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Options
- **Lovable Platform**: Click Share → Publish in Lovable editor
- **Vercel**: Automatic deployments with GitHub integration
- **Netlify**: Static site hosting with form handling
- **Custom Domain**: Available through Project → Settings → Domains

---

## 📊 Application Architecture

### Multi-Tab Workflow
1. **Inspector Setup**: Profile configuration and credentials
2. **Main Form**: Company and contract information
3. **Checklists**: 1F/1G security assessment workflows
4. **Analysis**: Automated response processing
5. **Final Report**: Comprehensive report generation
6. **Document Export**: Professional document output

### Security Features
- Row-Level Security (RLS) for data protection
- Encrypted file storage and transmission
- Role-based access control (Admin/User)
- Secure authentication with session management
- GDPR/Privacy compliance ready

---

## 🎓 User Guide

### Inspection Types Supported
- **1F (Protected)**: Standard protected information inspections
- **1G (Classified)**: Enhanced classified information inspections  
- **19F/19G**: Document and memorandum-based workflows
- **All Types**: Corrective measures and progress tracking

### Document Automation
The system uses a sophisticated color-coding framework for template automation:
- **⚫ Black**: Static content (no processing)
- **🟢 Green**: Dynamic data lookup
- **🔵 Blue**: Conditional business logic
- **🟠 Orange**: Repeating content blocks
- **🔴 Red**: Manual user input required
- **🟣 Purple**: Auto-calculated fields

---

## 📞 Support & Resources

### Getting Help
- **Built-in Documentation**: Contextual help throughout the application
- **Template Guides**: Comprehensive Word template instructions
- **System Requirements**: Detailed technical specifications
- **Troubleshooting**: Common issues and solutions

### Project Links
- **Lovable Project**: [Edit in Lovable](https://lovable.dev/projects/5de0c8ea-9941-4472-a148-fe7ccc971f11)
- **Documentation**: See `./docs/` directory for complete guides
- **Templates**: Located in `./docs/word-templates/`

---

## 🔄 Changelog & Updates

### Version History
- **v2.5.0** (Current): Advanced checklist system with intelligent analysis
- **v2.4.0**: Document automation framework implementation
- **v2.3.0**: Core infrastructure and multi-tab workflow
- **v2.2.0**: Authentication and user management
- **v2.1.0**: Basic inspection workflow and templates

### Planned Features
- PDF form integration for complex sections
- Enhanced AI document analysis
- Mobile-responsive improvements
- Advanced reporting and analytics
- Workflow automation enhancements

---

*Last Updated: September 27, 2025*  
*Version: 2.5.0*  
*Status: Production Ready*
