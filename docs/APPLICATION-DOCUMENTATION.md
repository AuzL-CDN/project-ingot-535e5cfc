# Project INGOT - Inspection Management System
## Comprehensive Application Documentation

### Table of Contents
1. [Application Overview](#application-overview)
2. [System Architecture](#system-architecture)
3. [Core Features & Capabilities](#core-features--capabilities)
4. [User Workflow](#user-workflow)
5. [Technical Requirements](#technical-requirements)
6. [Setup & Deployment](#setup--deployment)
7. [Document Automation System](#document-automation-system)
8. [Security & Authentication](#security--authentication)
9. [API Integration](#api-integration)
10. [Troubleshooting](#troubleshooting)
11. [Changelog](#changelog)

---

## Application Overview

**Project INGOT** is a comprehensive Inspection Management System designed for government security inspectors to streamline the inspection process, automate document generation, and ensure compliance with security protocols. The system supports multiple inspection types and integrates with Microsoft 365 and SharePoint environments.

### Primary Use Cases
- **1F & 1G Inspections**: Protected and Classified security inspections
- **19F & 19G Inspections**: Document and Memorandum-based workflows  
- **Final Report Generation**: Automated report creation from checklist responses
- **Document Management**: Template-based document automation
- **Compliance Tracking**: Corrective measures and status monitoring

---

## System Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Supabase (Authentication, Database, Storage, Edge Functions)
- **UI Components**: Shadcn/ui with Radix UI primitives
- **File Management**: React Dropzone for uploads
- **Routing**: React Router v6
- **State Management**: Custom hooks with React Context
- **Internationalization**: Custom translation system (English/French)

### Database Schema
```sql
-- Core Tables
- organizations: Company/site information
- profiles: User profile management  
- user_roles: Role-based access control

-- Storage Buckets
- document-templates: Word template storage
- inspection-files: Uploaded supporting documents
- generated-reports: System-generated outputs
```

---

## Core Features & Capabilities

### 1. Multi-Tab Inspection Workflow
- **Inspector Info**: Profile setup and configuration
- **Main Form**: Core inspection details and company information
- **Search**: Activity lookup and management
- **Approval Letter**: Automated letter generation
- **Emails**: Communication templates
- **DISIS Notes**: Integrated note-taking system
- **Status**: Progress tracking
- **Document/Memorandum**: 19F/19G workflows
- **Inspection**: 1F/1G checklist workflows *(NEW)*
- **Corrective Measures**: Issue tracking and resolution
- **Supporting Documents**: File management
- **Final Report**: Comprehensive report generation

### 2. Advanced Checklist System *(RECENTLY ADDED)*
#### 1F - Protected Checklist
- **Preliminary Questions**: Equipment, cloud usage, security measures
- **IT Infrastructure**: Physical location assessment
- **Threat Risk Assessment**: TRA evaluation and documentation
- **Personnel Security**: Clearance verification and awareness programs
- **IT Equipment**: System configuration and security measures

#### 1G - Classified Checklist  
- **System Location**: Floor plans and facility mapping
- **Personnel Security**: Enhanced clearance verification
- **Advanced Security Controls**: Classified-specific requirements

#### Intelligent Analysis Engine
- **Automated Report Generation**: Checklist responses auto-populate Final Report sections
- **Smart Mapping**: Questions automatically linked to report fields
- **Confidence Scoring**: AI-powered analysis with reliability metrics
- **Conditional Logic**: Dynamic question flow based on responses

### 3. Document Automation System
#### Color-Coding Framework
- **BLACK**: Static content (headers, labels) - No processing required
- **GREEN**: Dynamic content - Data lookup from forms/database
- **BLUE**: Conditional content - Business logic application
- **ORANGE**: Repeating content - Loop generation for lists/tables
- **RED**: User input required - Manual entry fields
- **PURPLE**: Auto-calculated - Formula execution

#### Template Integration
- Support for Word `.docx` templates with content controls
- Automatic field mapping and population
- Template validation and error checking
- Multi-language template support

### 4. File Management & Integration
- **Drag-and-Drop Upload**: Multi-file support up to 25MB per file
- **Auto-Embedding**: Images automatically embedded in Final Reports
- **Smart Linking**: Documents become clickable references
- **Format Support**: Images, PDF, Word docs, Excel files
- **Progress Tracking**: Real-time upload status
- **Security**: Encrypted storage in Supabase

### 5. Multi-Language Support
- **UI Languages**: English/French interface switching
- **Document Languages**: Separate language control for generated documents
- **Translation System**: Comprehensive translation management
- **Context-Aware**: Language settings persist across sessions

### 6. Authentication & Security
- **Supabase Auth**: Secure user authentication
- **Role-Based Access**: Admin/User role separation
- **Row-Level Security**: Database-level access control
- **Profile Management**: User profile and preferences
- **Session Management**: Secure session handling

---

## User Workflow

### Standard Inspection Process
1. **Setup**: Inspector configures profile (name, initials, email)
2. **Main Form**: Enter company and contract details
3. **Checklist Completion**: 
   - Select appropriate checklist (1F/1G)
   - Complete sections with supporting documentation
   - Upload required files and images
4. **Analysis**: System analyzes responses and generates findings
5. **Final Report**: Review auto-generated content, make adjustments
6. **Approval Letter**: Generate approval documentation
7. **Document Export**: Export final reports and communications

### Workflow Variations by Inspection Type
- **1F/1G**: Checklist-driven with automated analysis
- **19F/19G**: Document and memorandum focused
- **All Types**: Support corrective measures and status tracking

---

## Technical Requirements

### System Requirements
- **Node.js**: v18+ for development
- **Modern Browser**: Chrome, Firefox, Safari, Edge (latest versions)
- **Internet Connection**: Required for Supabase integration
- **File System Access**: For document template management

### Development Environment
```bash
# Required Dependencies
- React 18.3.1+
- TypeScript 5.0+
- Vite 5.0+
- Tailwind CSS 3.0+
- Supabase JS SDK 2.58.0+

# Development Tools
- ESLint for code quality
- TypeScript for type safety
- Tailwind for styling
- Radix UI for accessibility
```

### Production Requirements
- **Hosting**: Vercel, Netlify, or similar React hosting
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for file management
- **Environment Variables**: Supabase connection credentials
- **SSL Certificate**: HTTPS required for production
- **Domain**: Custom domain support available

---

## Setup & Deployment

### Local Development
```bash
# Clone and setup
npm install
npm run dev

# Environment Configuration
# Supabase credentials are pre-configured
# No additional .env setup required

# Database Setup
# Tables are automatically created via migrations
# RLS policies are pre-configured
```

### Production Deployment
1. **Build Application**: `npm run build`
2. **Deploy to Hosting**: Upload dist folder to hosting provider
3. **Configure Domain**: Set up custom domain if required
4. **SSL Setup**: Ensure HTTPS is enabled
5. **Environment Check**: Verify Supabase connection

### Microsoft 365 Integration (Optional)
- **SharePoint Setup**: Use provided PowerShell script
- **Word Templates**: Deploy templates to SharePoint library
- **Power Automate**: Configure workflow automation
- **Authentication**: Set up M365 service account

---

## Document Automation System

### Template Management
```
docs/word-templates/
├── ApprovalLetter.docx          # Standard approval letters
├── CSC_ApprovalLetter.docx      # CSC-specific approvals  
├── Checklist_Protected.docx     # 1F checklist template
├── Checklist_Classified.docx    # 1G checklist template
├── FinalReport.docx             # Comprehensive report template
├── Memorandum.docx              # Official memoranda
└── README-Templates.md          # Template configuration guide
```

### Content Control Configuration
Templates use Microsoft Word content controls with specific naming conventions:
- `{field_name}` for simple text replacement
- `{section_repeat}` for repeating content blocks
- `{conditional_field}` for conditional content
- Color-coded visual indicators for automation levels

### Field Mapping System
- **ContentAutomationService**: Core automation logic
- **TemplateFieldMapper**: Visual field mapping interface
- **Enhanced Components**: Auto-population from form data
- **Business Rules Engine**: Complex conditional logic

---

## Security & Authentication

### Authentication Flow
1. **Supabase Auth**: Email/password authentication
2. **Profile Creation**: Automatic profile generation
3. **Role Assignment**: Default user role with admin capabilities
4. **Session Management**: Secure token-based sessions

### Data Security
- **Row-Level Security**: Database-level access control
- **Encrypted Storage**: All files encrypted at rest
- **Secure Transmission**: HTTPS/TLS for all communications
- **Input Validation**: Client and server-side validation
- **SQL Injection Protection**: Parameterized queries only

### Access Control
```sql
-- User Roles
- admin: Full system access
- user: Standard inspection capabilities

-- RLS Policies
- Users can only access their own data
- Admins can access all user data
- Organizations are publicly readable
```

---

## API Integration

### Supabase Integration
- **Database Queries**: Real-time data synchronization
- **Storage API**: File upload and management
- **Authentication**: User management and security
- **Edge Functions**: Server-side processing
- **Real-time**: Live data updates

### External Integrations
- **Microsoft Graph API**: M365 integration (optional)
- **SharePoint REST API**: Document library access
- **Power Automate**: Workflow automation
- **Email Services**: SMTP integration for notifications

---

## Troubleshooting

### Common Issues
1. **Authentication Failures**
   - Verify Supabase credentials
   - Check internet connectivity
   - Clear browser cache/cookies

2. **File Upload Issues**
   - Check file size limits (25MB max)
   - Verify supported file formats
   - Ensure stable internet connection

3. **Template Generation Errors**
   - Validate template content controls
   - Check field mapping configuration
   - Verify data completeness

4. **Performance Issues**
   - Clear browser cache
   - Check network connectivity
   - Optimize image file sizes

### Debug Tools
- **Browser Developer Tools**: Console errors and network requests
- **Supabase Dashboard**: Database queries and real-time monitoring
- **Application Logs**: Built-in error tracking and reporting

---

## Changelog

### Version 2.5.0 - Latest (Current Release)
**🚀 Major Feature: Advanced Checklist System**
- ✅ **New**: 1F (Protected) and 1G (Classified) checklist sub-tabs under Inspection
- ✅ **New**: Intelligent Analysis Engine with automated Final Report population
- ✅ **New**: Advanced file upload system with drag-and-drop support
- ✅ **New**: Smart image embedding and document linking in reports
- ✅ **New**: Progress tracking with real-time completion status
- ✅ **New**: Conditional logic for dynamic question flows
- ✅ **Enhanced**: Document automation with checklist integration
- ✅ **Enhanced**: Final Report auto-generation from checklist responses
- ✅ **Technical**: React Dropzone integration for file management
- ✅ **Technical**: TypeScript interfaces for checklist data structures
- ✅ **Technical**: Comprehensive analysis engine with confidence scoring

### Version 2.4.0 - Previous Release
**📄 Document Automation Framework**
- ✅ Content automation color-coding system implementation
- ✅ Template field mapping with visual indicators
- ✅ Enhanced approval letter generation
- ✅ ContentAutomationService with business logic engine
- ✅ Multi-language template support
- ✅ Word template integration with content controls

### Version 2.3.0 - Previous Release  
**🔧 Core Infrastructure & UI**
- ✅ Complete Supabase integration (Auth, Database, Storage)
- ✅ Multi-tab inspection workflow
- ✅ Inspector profile management
- ✅ Main form with organization lookup
- ✅ Search and activity management
- ✅ DISIS notes integration
- ✅ Supporting documents management
- ✅ Corrective measures tracking
- ✅ Multi-language support (EN/FR)
- ✅ Responsive design with Tailwind CSS
- ✅ Accessibility compliance with Radix UI

### Planned Features (Roadmap)
- 🔄 **PDF Form Integration**: Fillable PDF support for complex sections
- 🔄 **AI Document Analysis**: Intelligent document parsing and extraction
- 🔄 **Mobile App**: React Native companion application  
- 🔄 **Advanced Reporting**: Business intelligence and analytics
- 🔄 **Workflow Automation**: Enhanced Power Automate integration
- 🔄 **Audit Trail**: Comprehensive change tracking and versioning
- 🔄 **Batch Processing**: Multi-inspection management capabilities
- 🔄 **Advanced Search**: Full-text search across all inspection data

---

## Support & Maintenance

### Documentation Updates
This documentation is updated with each release to reflect new features, changes, and improvements. All modifications to the application are documented in the changelog above.

### Getting Help
1. **Built-in Help**: Contextual help available throughout the application
2. **Documentation**: Comprehensive guides in the `/docs` folder
3. **Template Guides**: Specific instructions for Word template configuration
4. **Technical Support**: Contact system administrators for advanced issues

### Version Control
- **Application Versioning**: Semantic versioning (major.minor.patch)
- **Database Migrations**: Automated schema updates
- **Template Versioning**: Template compatibility tracking
- **Configuration Management**: Environment-specific settings

---

*Last Updated: September 27, 2025*  
*Documentation Version: 2.5.0*  
*Application Build: Latest*