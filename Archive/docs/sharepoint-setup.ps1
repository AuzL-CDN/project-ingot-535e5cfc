# Project INGOT - SharePoint Setup Script
# Run this script as SharePoint Administrator

param(
    [Parameter(Mandatory=$true)]
    [string]$TenantUrl,  # e.g., "https://contoso-admin.sharepoint.com"
    
    [Parameter(Mandatory=$true)]
    [string]$SiteUrl,    # e.g., "https://contoso.sharepoint.com/sites/ProjectINGOT"
    
    [Parameter(Mandatory=$true)]
    [string]$AdminEmail  # e.g., "admin@contoso.com"
)

# Connect to SharePoint Online
Write-Host "Connecting to SharePoint Online..." -ForegroundColor Green
Connect-SPOService -Url $TenantUrl

# Create site collection
Write-Host "Creating Project INGOT site collection..." -ForegroundColor Green
try {
    New-SPOSite -Url $SiteUrl -Owner $AdminEmail -StorageQuota 1024 -Template STS#3 -Title "Project INGOT - Inspection Management System"
    Write-Host "✅ Site collection created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creating site collection: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Wait for site provisioning
Write-Host "Waiting for site provisioning to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Connect to the new site
Write-Host "Connecting to the new site..." -ForegroundColor Green
Connect-PnPOnline -Url $SiteUrl -Interactive

# Create SharePoint Lists
Write-Host "Creating SharePoint lists..." -ForegroundColor Green

# Inspectors List
Write-Host "Creating Inspectors list..." -ForegroundColor Yellow
New-PnPList -Title "Inspectors" -Template GenericList
Add-PnPField -List "Inspectors" -DisplayName "Initials" -InternalName "Initials" -Type Text -Required
Add-PnPField -List "Inspectors" -DisplayName "Email" -InternalName "Email" -Type Text -Required
Add-PnPField -List "Inspectors" -DisplayName "FolderPath" -InternalName "FolderPath" -Type Text

# Activities List
Write-Host "Creating Activities list..." -ForegroundColor Yellow
New-PnPList -Title "Activities" -Template GenericList
Add-PnPField -List "Activities" -DisplayName "OrgSiteNumber" -InternalName "OrgSiteNumber" -Type Text -Required
Add-PnPField -List "Activities" -DisplayName "CompanyName" -InternalName "CompanyName" -Type Text -Required
Add-PnPField -List "Activities" -DisplayName "ClientDepartment" -InternalName "ClientDepartment" -Type Text
Add-PnPField -List "Activities" -DisplayName "ContractType" -InternalName "ContractType" -Type Choice -Choices "Government","Commercial","International"
Add-PnPField -List "Activities" -DisplayName "ContractNumber" -InternalName "ContractNumber" -Type Text
Add-PnPField -List "Activities" -DisplayName "SecurityLevel" -InternalName "SecurityLevel" -Type Choice -Choices "Unclassified","Protected A","Protected B","Protected C","Classified","Secret","Top Secret"
Add-PnPField -List "Activities" -DisplayName "InspectionType" -InternalName "InspectionType" -Type Choice -Choices "DoC","Onsite","Virtual","Remote"
Add-PnPField -List "Activities" -DisplayName "InspectionClass" -InternalName "InspectionClass" -Type Choice -Choices "1F","1G","19F","19G"
Add-PnPField -List "Activities" -DisplayName "InspectionDate" -InternalName "InspectionDate" -Type DateTime -Required
Add-PnPField -List "Activities" -DisplayName "Status" -InternalName "Status" -Type Choice -Choices "Draft","In Progress","Completed","Archived"

# CorrectiveMeasures List
Write-Host "Creating CorrectiveMeasures list..." -ForegroundColor Yellow
New-PnPList -Title "CorrectiveMeasures" -Template GenericList
Add-PnPField -List "CorrectiveMeasures" -DisplayName "ActivityNumber" -InternalName "ActivityNumber" -Type Text -Required
Add-PnPField -List "CorrectiveMeasures" -DisplayName "Index" -InternalName "Index" -Type Number -Required
Add-PnPField -List "CorrectiveMeasures" -DisplayName "MeasureText" -InternalName "MeasureText" -Type Note -Required

# ApprovalCCs List  
Write-Host "Creating ApprovalCCs list..." -ForegroundColor Yellow
New-PnPList -Title "ApprovalCCs" -Template GenericList
Add-PnPField -List "ApprovalCCs" -DisplayName "ActivityNumber" -InternalName "ActivityNumber" -Type Text -Required
Add-PnPField -List "ApprovalCCs" -DisplayName "Index" -InternalName "Index" -Type Number -Required
Add-PnPField -List "ApprovalCCs" -DisplayName "CCName" -InternalName "CCName" -Type Text -Required
Add-PnPField -List "ApprovalCCs" -DisplayName "CCTitle" -InternalName "CCTitle" -Type Text
Add-PnPField -List "ApprovalCCs" -DisplayName "CCDepartment" -InternalName "CCDepartment" -Type Text
Add-PnPField -List "ApprovalCCs" -DisplayName "CCEmail" -InternalName "CCEmail" -Type Text

# RunLog List
Write-Host "Creating RunLog list..." -ForegroundColor Yellow
New-PnPList -Title "RunLog" -Template GenericList
Add-PnPField -List "RunLog" -DisplayName "ActivityNumber" -InternalName "ActivityNumber" -Type Text -Required
Add-PnPField -List "RunLog" -DisplayName "Action" -InternalName "Action" -Type Text -Required
Add-PnPField -List "RunLog" -DisplayName "Result" -InternalName "Result" -Type Choice -Choices "Success","Error","Warning"
Add-PnPField -List "RunLog" -DisplayName "Message" -InternalName "Message" -Type Note
Add-PnPField -List "RunLog" -DisplayName "FileLink" -InternalName "FileLink" -Type URL
Add-PnPField -List "RunLog" -DisplayName "Timestamp" -InternalName "Timestamp" -Type DateTime -Required
Add-PnPField -List "RunLog" -DisplayName "Inspector" -InternalName "Inspector" -Type Text

# Create folder structure in Documents library
Write-Host "Creating folder structure..." -ForegroundColor Green
Add-PnPFolder -Name "Templates" -Folder "Shared Documents"
Add-PnPFolder -Name "Inspectors" -Folder "Shared Documents"

Write-Host "✅ SharePoint setup completed successfully!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Upload Word templates to Documents/Templates folder" -ForegroundColor White
Write-Host "  2. Configure Azure AD App Registration" -ForegroundColor White
Write-Host "  3. Deploy the React application" -ForegroundColor White
Write-Host "  4. Create Power Automate flows" -ForegroundColor White

# Disconnect
Disconnect-PnPOnline