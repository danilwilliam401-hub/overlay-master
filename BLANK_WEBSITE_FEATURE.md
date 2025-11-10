## 🎯 Blank Author/Source Feature Demo

### Before (Default behavior):
All images would show "Website.com" when no website parameter was provided.

### After (New behavior):
The Author/Source line is completely hidden when no website parameter is provided or when website is empty.

### Test Examples:

#### 1. Quote with no author:
```
/api/bundled-font-overlay?title=Success%20Is%20Not%20Final&design=quote1
```

#### 2. Regular design with no source:
```
/api/bundled-font-overlay?title=Anonymous%20Quote&design=bold
```

#### 3. Explicitly empty website:
```
/api/bundled-font-overlay?title=No%20Source&website=&design=aesthetic
```

### Features:
- ✅ Automatically adjusts text positioning when website is missing
- ✅ No extra spacing allocated for missing website text
- ✅ Works with all design themes (regular and quote designs)
- ✅ Proper SVG height calculation without website text
- ✅ Clean, professional appearance for anonymous quotes

### Perfect for:
- Anonymous quotes
- Personal thoughts
- Minimalist designs
- Content where source attribution isn't needed