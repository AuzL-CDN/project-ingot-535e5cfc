# Document Automation Flowchart

## Content Type Color-Coding System

```mermaid
flowchart TD
    A[Document Template] --> B{Content Analysis}
    B --> C[Static Content - BLACK]
    B --> D[Dynamic Content - GREEN] 
    B --> E[Conditional Content - BLUE]
    B --> F[Repeating Content - ORANGE]
    B --> G[User Input - RED]
    B --> H[Auto-Calculated - PURPLE]
    
    C --> I[No Processing Required]
    D --> J[Data Lookup Required]
    E --> K[Business Logic Required]
    F --> L[Loop Generation Required]
    G --> M[User Interface Required]
    H --> N[Calculation Engine Required]
    
    I --> O[Direct Copy to Output]
    J --> P[Query Database/API]
    K --> Q[Apply Conditional Rules]
    L --> R[Generate Multiple Instances]
    M --> S[Present Input Form]
    N --> T[Execute Formulas]
    
    O --> U[Final Document]
    P --> U
    Q --> U
    R --> U
    S --> U
    T --> U
```

## Automation Processing Workflow

```mermaid
flowchart LR
    A[Start Document Generation] --> B[Load Template]
    B --> C[Parse Content Controls]
    C --> D[Categorize by Color Code]
    
    D --> E[Process Static - BLACK]
    D --> F[Process Dynamic - GREEN]
    D --> G[Process Conditional - BLUE]
    D --> H[Process Repeating - ORANGE]
    D --> I[Collect User Input - RED]
    D --> J[Calculate Auto Fields - PURPLE]
    
    E --> K[Merge Results]
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
    
    K --> L[Generate Final Document]
    L --> M[Save/Export Document]
```

## Content Control Mapping

```mermaid
graph TB
    subgraph "Template Structure"
        A[Word Template] --> B[Content Controls]
        B --> C[Field Mappings]
    end
    
    subgraph "Data Sources"
        D[Inspection Form Data]
        E[Organization Directory]
        F[User Profiles]
        G[Business Rules]
        H[Calculation Engine]
    end
    
    subgraph "Processing Engine"
        I[ContentAutomationService]
        J[TemplateFieldMapper]
        K[Enhanced Components]
    end
    
    C --> I
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J
    J --> K
    K --> L[Generated Document]
```

## Color-Coding Legend

| Color | Type | Description | Processing Method |
|-------|------|-------------|-------------------|
| **BLACK** | Static | Fixed text, headers, labels | Direct copy |
| **GREEN** | Dynamic | Data from forms/database | Lookup & populate |
| **BLUE** | Conditional | Content based on rules | Apply business logic |
| **ORANGE** | Repeating | Lists, tables, iterations | Generate loops |
| **RED** | User Input | Manual entry required | User interface |
| **PURPLE** | Auto-Calculated | Computed values | Formula execution |

## Implementation Files

- `ContentAutomationService.ts` - Core automation logic
- `TemplateFieldMapper.tsx` - Visual field mapping
- `EnhancedApprovalLetter.tsx` - Example implementation
- Enhanced tab components with color-coding integration
- Updated Word templates with content control markup