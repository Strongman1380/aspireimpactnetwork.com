# Modular CSS Architecture

This directory contains the modular CSS architecture for the Aspire Impact Network website.

## Quick Start

Reference the main CSS file in your HTML:

```html
<link rel="stylesheet" href="/src/styles/main.css">
```

## Directory Structure

```
src/styles/
├── main.css                    Main entry point with @import statements
├── base/                       Foundation styles
│   ├── _variables.css         CSS custom properties (colors, spacing, etc.)
│   ├── _reset.css             CSS reset
│   ├── _typography.css        Body and text styles
│   └── _animations.css        @keyframes animations
├── components/                 Reusable components
│   ├── _header.css            Header and navigation
│   ├── _hero.css              Hero section
│   ├── _buttons.css           Button styles
│   ├── _panels.css            Panels and cards
│   ├── _forms.css             Form elements
│   └── _footer.css            Footer
├── pages/                      Page-specific styles
│   ├── _programs.css          Program pages
│   ├── _digital-solutions.css Digital solutions page
│   ├── _membership.css        Membership page
│   ├── _blog.css              Blog/resource hub
│   └── _contact.css           Contact page
└── utilities/                  Utility classes
    └── _helpers.css           Helper classes and responsive styles
```

## File Statistics

| Category    | Files | Lines  | Purpose                           |
|-------------|-------|--------|-----------------------------------|
| Base        | 4     | 184    | Foundation and variables          |
| Components  | 6     | 783    | Reusable UI components            |
| Pages       | 5     | 2,288  | Page-specific styles              |
| Utilities   | 1     | 947    | Helper classes and utilities      |
| **Total**   | **17**| **4,230** | **Complete modular architecture** |

## Load Order

Files are imported in this specific order to ensure proper CSS cascade:

1. **Base** - Variables, reset, typography, animations
2. **Components** - Reusable UI components
3. **Pages** - Page-specific overrides
4. **Utilities** - Helper classes (highest specificity)

## Editing Guidelines

### When to edit which file:

- **Changing colors/spacing?** → `base/_variables.css`
- **Adding animations?** → `base/_animations.css`
- **Updating header/nav?** → `components/_header.css`
- **Modifying buttons?** → `components/_buttons.css`
- **Page-specific changes?** → Appropriate `pages/*.css` file
- **New utility class?** → `utilities/_helpers.css`

## Benefits

✅ **Maintainable** - Easy to find and edit specific styles
✅ **Scalable** - Simple to add new components or pages
✅ **Collaborative** - Multiple developers can work simultaneously
✅ **Organized** - Clear separation of concerns
✅ **Performant** - Easy to identify unused code

## Key Features

- **Design System**: Centralized variables in `_variables.css`
- **Animations**: All @keyframes in one place
- **Components**: Reusable, modular UI components
- **Responsive**: Mobile-first responsive design
- **Theme**: Matrix Green tech aesthetic with glow effects

## Original File

This modular structure was split from:
- **Original**: `/css/styles.css` (3,888 lines)
- **New Structure**: 17 files across 4 directories (4,230 lines)

See `CSS_SPLITTING_REPORT.md` for detailed information about the splitting process.

## Version

- **Created**: October 20, 2025
- **Architecture**: Modular CSS
- **Methodology**: Component-based organization
