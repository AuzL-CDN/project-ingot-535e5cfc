# Project INGOT - Quick Start Checklist

## 🚀 30-Minute Quick Start

### Prerequisites (5 minutes)
- [ ] M365 tenant with SharePoint Online
- [ ] Global Admin or SharePoint Admin access
- [ ] GitHub repository cloned locally
- [ ] Node.js 18+ installed

### SharePoint Setup (10 minutes)
- [ ] Create SharePoint site: `/sites/ProjectINGOT`
- [ ] Create 5 lists: Inspectors, Activities, CorrectiveMeasures, ApprovalCCs, RunLog
- [ ] Create Documents/Templates folder
- [ ] Upload Word templates (provided in repo)

### Azure Setup (10 minutes)
- [ ] Create Azure AD App Registration
- [ ] Configure API permissions (Sites.ReadWrite.All, Files.ReadWrite.All)
- [ ] Grant admin consent
- [ ] Note Client ID and Tenant ID

### Deployment (5 minutes)
- [ ] Update `.env.local` with your tenant details
- [ ] Run `npm install && npm run build`
- [ ] Deploy to Azure Static Web Apps or SharePoint App Catalog

## ✅ Success Criteria
- [ ] Can create inspector profile
- [ ] Main form saves data
- [ ] Search retrieves activities
- [ ] Document generation works
- [ ] Files upload successfully

## 🆘 Quick Troubleshooting
- **Can't authenticate?** Check Azure AD app permissions
- **SharePoint errors?** Verify site collection access
- **Build fails?** Check Node.js version (need 18+)

## 📞 Need Help?
Refer to the full implementation guide: `M365-Implementation-Guide.md`