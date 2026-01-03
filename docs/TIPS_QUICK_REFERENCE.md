# Quick Reference: Dynamic Tips System

## TL;DR

The dynamic tips system shows contextual, rotating tips on the dashboard that adapt to user behavior and time of day.

## Quick Add a New Tip

```typescript
// In PrintDashboard.tsx > getDynamicTips()
{
  id: 'your-tip-id',
  icon: 'icon-name', // Material Community Icons
  color: '#FF5722',
  bgColor: '#FFEBEE',
  borderColor: '#FFAB91',
  title: 'Your Tip Title',
  subtitle: 'Description • Action points',
  show: yourCondition // When to display this tip
}
```

## Common Conditions

```typescript
// Always show
show: true;

// Based on user activity
show: stats.today > 0;
show: stats.week > 5;
show: stats.monthlyAmount > 100;

// Based on time
show: new Date().getHours() >= 10 && new Date().getHours() <= 16;

// Based on features
show: cachedFilesMap.size > 0;
show: recentPrints.length === 0;
show: selectedPrinter?.capabilities.supports_color;
```

## Color Palettes

```typescript
// Yellow/Amber (Warning/Savings)
color: '#FFA726', bgColor: '#FFF9E6', borderColor: '#FFE082'

// Blue (Information)
color: '#2196F3', bgColor: '#E3F2FD', borderColor: '#90CAF9'

// Green (Success/Eco)
color: '#4CAF50', bgColor: '#E8F5E9', borderColor: '#A5D6A7'

// Purple (Premium)
color: '#9C27B0', bgColor: '#F3E5F5', borderColor: '#CE93D8'

// Red/Orange (Urgent/Action)
color: '#FF5722', bgColor: '#FBE9E7', borderColor: '#FFAB91'

// Cyan (Stats)
color: '#00BCD4', bgColor: '#E0F7FA', borderColor: '#80DEEA'

// Deep Purple (Quality)
color: '#673AB7', bgColor: '#EDE7F6', borderColor: '#B39DDB'

// Teal (Utility)
color: '#009688', bgColor: '#E0F2F1', borderColor: '#80CBC4'
```

## Popular Icons

```typescript
// Feature promotion
'lightbulb-on-outline', 'star-outline', 'rocket-launch';

// Savings/Money
'cash', 'piggy-bank', 'sale';

// Time
'clock-fast', 'calendar-clock', 'timer-outline';

// Documents
'file-multiple', 'file-check', 'file-document-outline';

// Quality
'quality-high', 'quality-medium', 'image-filter-hdr';

// Actions
'refresh-circle', 'upload', 'download';

// Stats/Charts
'chart-line', 'chart-bar', 'trending-up';

// Settings
'cog-outline', 'tune-variant', 'settings-outline';
```

## Modify Rotation Speed

```typescript
// In the useEffect hook
const timer = setInterval(() => {
  setCurrentTipIndex(prev => (prev + 1) % activeTips.length);
}, 5000); // Change to desired milliseconds (e.g., 3000 for 3s, 10000 for 10s)
```

## Disable Auto-Rotation

Comment out or remove the entire `useEffect` block:

```typescript
// useEffect(() => {
//   if (activeTips.length > 1) {
//     const timer = setInterval(() => {
//       setCurrentTipIndex(prev => (prev + 1) % activeTips.length);
//     }, 5000);
//     return () => clearInterval(timer);
//   }
// }, [activeTips.length]);
```

## Test a Specific Tip

Force a tip to always show:

```typescript
{
  id: 'test-tip',
  // ... other properties
  show: true // Force display for testing
}
```

## Key Files

- **Implementation**: `src/screens/printing/PrintDashboard.tsx`
- **Colors**: `src/theme/colors.ts`
- **Stats**: `src/services/printerService.ts` (getPrintStats)
- **Cache**: `src/services/cacheService.ts`

## Dependencies

- User stats (`stats.today`, `stats.week`, `stats.monthlyAmount`)
- Cached files map (`cachedFilesMap`)
- Recent prints (`recentPrints`)
- Selected printer (`selectedPrinter`)
- Current time (`new Date()`)

## Style Classes

```typescript
styles.tipSection; // Container wrapper
styles.tipCard; // Main card (dynamic bg/border)
styles.tipLeft; // Left side content area
styles.tipIconBox; // Icon container
styles.tipTextBox; // Text content container
styles.tipTitle; // Bold title text
styles.tipSubtitle; // Gray description text
styles.tipIndicators; // Dots container
styles.tipDot; // Individual dot (dynamic size/color)
```

## Events

```typescript
// Tap to advance
onPress={() => setCurrentTipIndex(prev => (prev + 1) % activeTips.length)}

// Auto-rotation triggered every 5s
// Manual tap resets rotation timer
```

---

**For full documentation, see**: `docs/DYNAMIC_TIPS_SYSTEM.md`
