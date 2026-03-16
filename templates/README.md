# Onboarding Plan Template System

## How It Works

The onboarding plan generator is powered by **markdown template files** organized by phase and section. When a manager fills out the wizard, the app selects the right template fragments based on their choices and combines them into a single plan.

## Template Structure

```
templates/
├── intro.md                    ← Universal intro with {{variable}} placeholders
├── 30/                         ← Phase 1: First 30 Days
│   ├── goals_{department}.md   ← Goals vary by department
│   ├── tasks_{dept}_{level}.md ← Tasks vary by department + seniority
│   ├── checkins.md             ← Universal check-in cadence
│   ├── resources_{dept}.md     ← Resources vary by department
│   └── metrics_{roleType}.md   ← Metrics vary by IC vs. manager
├── 60/                         ← Phase 2: Days 31-60
│   └── (same section pattern)
└── 90/                         ← Phase 3: Days 61-90
    └── (same section pattern)
```

## Template Resolution

When the app needs a template, it looks for the most specific match and falls back to more general options:

1. `{department}_{seniority}` (e.g., `engineering_senior`)
2. `{department}_{roleType}` (e.g., `engineering_manager`)
3. `{department}` (e.g., `engineering`)
4. `{roleType}` (e.g., `ic`)
5. `universal` or `general`

## Customization Dimensions

- **Department:** Engineering, Design, Sales, Marketing, People Ops, General
- **Seniority:** Junior, Mid, Senior, Lead
- **Role Type:** Individual Contributor, Manager
- **Work Mode:** On-site, Hybrid, Remote

## How to Edit Templates

Each markdown file is a self-contained section. To update the plan content:

1. Find the relevant file (e.g., `templates/30/goals_engineering.md`)
2. Edit the markdown content
3. The app will pick up the changes automatically

### Variables

The intro template supports these placeholders:
- `{{name}}` — New hire's name
- `{{roleTitle}}` — Job title
- `{{department}}` — Department name
- `{{startDate}}` — Start date
- `{{managerName}}` — Manager's name

## Adding a New Department

1. Create new goal files: `30/goals_{newdept}.md`, `60/goals_{newdept}.md`, `90/goals_{newdept}.md`
2. Create task files for each seniority: `30/tasks_{newdept}_junior.md`, etc.
3. Create a resources file: `30/resources_{newdept}.md`
4. Add the department to the app's department list

If you don't create a file for every combination, the app will fall back to the `general` template for missing sections.
