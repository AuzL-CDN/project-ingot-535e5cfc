

## Generate M365 Setup Guide

Create a comprehensive step-by-step markdown guide at `docs/M365-Setup-Guide.md` covering the full deployment of Project INGOT using SharePoint, Power Automate, and Power Apps.

The guide will be structured from the existing deployment config, SharePoint setup script, and template documentation already in the codebase. It will cover:

1. **Prerequisites** - M365 licenses, admin access, PnP PowerShell
2. **SharePoint Site Setup** - Site collection creation, 5 lists (Inspectors, Activities, CorrectiveMeasures, ApprovalCCs, RunLog) with all fields, document library folders
3. **Word Templates Upload** - All 11 .docx templates to Documents/Templates
4. **Azure AD App Registration** - App setup, redirect URIs, API permissions (Sites.ReadWrite.All, Files.ReadWrite)
5. **Power Automate Flows** - 3 flows: Create Inspector Folder, Generate Document, Upload Supporting Documents (with trigger/action breakdowns)
6. **Power Apps Integration** - How to connect the canvas app or embed the React app
7. **Environment Configuration** - .env variables mapping
8. **Testing and Validation** - Verification checklist
9. **Security Considerations** - Permissions, encryption, RLS equivalent

The file will be written to the project's `docs/` folder as part of the codebase.

