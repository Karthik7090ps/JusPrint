# Dynamic Tips System Documentation

## Overview

The Dynamic Tips System is an intelligent, context-aware feature that displays personalized tips and recommendations to users on the JusPrint dashboard. It enhances user engagement, promotes best practices, and improves overall user satisfaction through timely, relevant suggestions.

## Features

### 🎯 Core Capabilities

1. **Contextual Relevance**: Tips are shown based on user behavior, time, and usage patterns
2. **Auto-Rotation**: Automatically cycles through applicable tips every 5 seconds
3. **Manual Navigation**: Users can tap to advance to the next tip
4. **Visual Feedback**: Color-coded indicators show which tip is currently active
5. **Smart Filtering**: Only displays tips relevant to the current user context

### 🎨 Visual Design

- **8 unique color schemes** with matching icons
- **Smooth transitions** between tips
- **Professional UI** with rounded corners and subtle shadows
- **Accessibility-friendly** with high contrast and clear typography

## Implementation

### Location

**File**: `src/screens/printing/PrintDashboard.tsx`

### Components

#### 1. State Management

```typescript
const [currentTipIndex, setCurrentTipIndex] = useState(0);
```

Tracks which tip is currently being displayed.

#### 2. Tip Configuration

```typescript
const getDynamicTips = () => {
  const tips = [
    {
      id: 'unique-identifier',
      icon: 'icon-name',
      color: '#HexColor',
      bgColor: '#BackgroundColor',
      borderColor: '#BorderColor',
      title: 'Tip Title',
      subtitle: 'Tip Description',
      show: boolean, // Conditional display logic
    },
    // ... more tips
  ];

  return tips.filter(tip => tip.show);
};
```

#### 3. Auto-Rotation Logic

```typescript
useEffect(() => {
  if (activeTips.length > 1) {
    const timer = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % activeTips.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(timer);
  }
}, [activeTips.length]);
```

## Available Tips

### 1. Duplex Printing Savings

- **ID**: `duplex`
- **Icon**: `book-open-page-variant`
- **Color**: Yellow/Amber
- **When Shown**: Always
- **Purpose**: Encourage eco-friendly double-sided printing
- **Message**: "Save with Duplex Printing • Print both sides • Get 20% off"

### 2. Bulk Printing Optimization

- **ID**: `bulk`
- **Icon**: `file-multiple`
- **Color**: Blue
- **When Shown**: When `stats.today > 0` (user has printed today)
- **Purpose**: Suggest efficient multi-page layouts
- **Message**: "Printing Multiple Pages? • Combine pages • Use 4-per-sheet layout"

### 3. Off-Peak Hours

- **ID**: `time`
- **Icon**: `clock-fast`
- **Color**: Green
- **When Shown**: During peak hours (10 AM - 4 PM)
- **Purpose**: Encourage printing during less busy times
- **Message**: "Off-Peak Hours = Faster Print • Print early morning • Skip the queue"

### 4. Preview Reminder

- **ID**: `preview`
- **Icon**: `eye-outline`
- **Color**: Purple
- **When Shown**: Always
- **Purpose**: Promote document preview to avoid mistakes
- **Message**: "Always Preview First • Check page count • Save paper & money"

### 5. Quick Reprint

- **ID**: `cache`
- **Icon**: `refresh-circle`
- **Color**: Orange/Red
- **When Shown**: When `cachedFilesMap.size > 0` (cached files exist)
- **Purpose**: Highlight quick reprint capability
- **Message**: "Quick Reprint Available • {N} docs cached • Instant reprint"

### 6. Usage Statistics

- **ID**: `stats`
- **Icon**: `chart-line`
- **Color**: Cyan
- **When Shown**: When `stats.today > 0` (user has printed today)
- **Purpose**: Provide usage feedback and eco-awareness
- **Message**: "You've Printed {N} Today! • {M} this week • Keep it eco-friendly"

### 7. Quality/Draft Mode

- **ID**: `quality`
- **Icon**: `quality-high`
- **Color**: Deep Purple
- **When Shown**: When `stats.monthlyAmount > 100` (frequent users)
- **Purpose**: Suggest cost-saving draft mode for notes
- **Message**: "Use Draft Mode for Notes • Faster printing • Lower cost"

### 8. Schedule Ahead

- **ID**: `schedule`
- **Icon**: `calendar-clock`
- **Color**: Teal
- **When Shown**: When `recentPrints.length === 0` (new users)
- **Purpose**: Introduce advanced scheduling feature
- **Message**: "Schedule Prints in Advance • Upload now • Pick up later"

## Customization Guide

### Adding a New Tip

1. **Add tip configuration** to the `getDynamicTips()` function:

```typescript
{
  id: 'my-new-tip',
  icon: 'material-icon-name',
  color: '#PrimaryColor',
  bgColor: '#LightBackground',
  borderColor: '#BorderAccent',
  title: 'Your Tip Title',
  subtitle: 'Your tip description',
  show: yourCondition // e.g., stats.week > 10
}
```

2. **Choose an appropriate condition** for the `show` property:

   - User behavior: `stats.today > 5`
   - Time-based: `new Date().getHours() < 9`
   - Feature availability: `selectedPrinter?.capabilities.supports_color`
   - User history: `recentPrints.length > 0`

3. **Select a color scheme** that doesn't conflict with existing tips

### Modifying Rotation Speed

Change the interval value in the auto-rotation `useEffect`:

```typescript
const timer = setInterval(() => {
  setCurrentTipIndex(prev => (prev + 1) % activeTips.length);
}, 5000); // Change 5000 to desired milliseconds
```

### Disable Auto-Rotation

Comment out or remove the auto-rotation `useEffect` hook entirely. Users will only be able to navigate tips manually by tapping.

## User Interaction

### Manual Navigation

Users can tap anywhere on the tip card to advance to the next tip:

```typescript
onPress={() => {
  setCurrentTipIndex(prev => (prev + 1) % activeTips.length);
}}
```

### Visual Indicators

Small dots appear on the right side showing:

- **Total number of active tips** (number of dots)
- **Current tip position** (elongated, color-matched dot)
- **Other tips** (small gray dots)

## Styling

### Main Styles

```typescript
tipSection: {
  paddingHorizontal: 20,
  marginBottom: 16,
}

tipCard: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 16,
  borderRadius: 16,
  borderWidth: 1,
  // backgroundColor and borderColor are dynamic
}

tipIndicators: {
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  marginLeft: 8,
}

tipDot: {
  height: 6,
  borderRadius: 3,
  // width is dynamic: 20px for active, 6px for inactive
  // backgroundColor is dynamic: tip color for active, gray for inactive
}
```

## Best Practices

### When to Show a Tip

✅ **DO**:

- Show tips relevant to the user's current context
- Use tips to promote features users might not know about
- Provide actionable advice
- Keep messages concise and clear

❌ **DON'T**:

- Show too many tips simultaneously (keep to 5-8 active at once)
- Display tips for features that aren't available
- Use overly technical language
- Make tips too long (keep subtitle under 50 characters)

### Tip Writing Guidelines

1. **Title**: Clear, benefit-focused (e.g., "Save with Duplex Printing")
2. **Subtitle**: Actionable steps separated by bullets (e.g., "Print both sides • Get 20% off")
3. **Icon**: Choose icons that immediately convey the tip's purpose
4. **Color**: Use colors that evoke the right emotion (green = eco, blue = info, red = urgent)

## Testing

### Test Cases

1. **New User Experience**

   - Should see: Preview reminder, Schedule ahead, Duplex savings
   - Should NOT see: Usage stats, Quick reprint

2. **Active User Experience**

   - Should see: Usage stats, Quick reprint (if applicable), Duplex savings
   - Should change based on: Time of day, cached files, monthly spending

3. **Peak Hours (10 AM - 4 PM)**

   - Should see: Off-peak hours tip
   - Should NOT see: (at other times)

4. **Frequent User (>₹100/month)**
   - Should see: Quality/draft mode tip
   - Should NOT see: (for infrequent users)

### Manual Testing

```typescript
// To test a specific tip, temporarily set its show condition to true:
{
  id: 'test-tip',
  // ... other properties
  show: true // Force display
}
```

## Performance Considerations

- **Lightweight**: Tips are filtered on each render but the list is small (8 items max)
- **Efficient**: Uses React's `useEffect` with proper cleanup for timers
- **No API calls**: All logic is client-side based on already-fetched data
- **Minimal re-renders**: Only re-renders when `currentTipIndex` or dependencies change

## Analytics Opportunities

Consider tracking:

- Which tips are shown most frequently
- How often users manually advance tips
- Correlation between tip views and feature adoption
- Time spent viewing each tip

### Example Implementation

```typescript
// Track tip view
const trackTipView = (tipId: string) => {
  analytics.track('tip_viewed', {
    tip_id: tipId,
    user_id: user.id,
    timestamp: new Date().toISOString(),
  });
};

// Track manual navigation
const handleTipTap = () => {
  analytics.track('tip_manual_advance', {
    from_tip: currentTip.id,
    user_id: user.id,
  });
  setCurrentTipIndex(prev => (prev + 1) % activeTips.length);
};
```

## Future Enhancements

### Potential Features

1. **Dismissible Tips**: Allow users to permanently dismiss certain tips
2. **Tip Prioritization**: Show more important tips more frequently
3. **A/B Testing**: Test different tip messages and designs
4. **Personalization**: Machine learning to show tips most likely to be useful
5. **Interactive Tips**: Add buttons for direct actions (e.g., "Enable Duplex Now")
6. **Achievements**: Award badges when users follow tip recommendations
7. **Tutorial Mode**: Show tips in sequence for onboarding

### Storage for User Preferences

```typescript
interface TipPreferences {
  dismissedTips: string[];
  lastSeenTipId: string;
  tipViewCounts: Record<string, number>;
}

// Store in AsyncStorage or secure storage
const saveTipPreferences = async (prefs: TipPreferences) => {
  await AsyncStorage.setItem('tip_preferences', JSON.stringify(prefs));
};
```

## Troubleshooting

### Tips Not Rotating

**Cause**: Only one tip is active
**Solution**: Check tip conditions - ensure multiple tips evaluate to `show: true`

### Wrong Tip Showing

**Cause**: Condition logic error
**Solution**: Review the `show` condition for that tip, check data availability

### Visual Indicators Not Appearing

**Cause**: Only one active tip
**Solution**: Indicators only show when `activeTips.length > 1`

### Styling Issues

**Cause**: Dynamic styles not applying
**Solution**: Check that tip object has all required properties (bgColor, borderColor, color)

## Version History

### v1.0.0 (2026-01-04)

- Initial implementation with 8 contextual tips
- Auto-rotation every 5 seconds
- Manual navigation via tap
- Visual indicators for tip position
- Context-aware display logic

## Contributors

- Dynamic tips system designed for JusPrint
- Integrated with existing dashboard analytics
- Follows Material Design principles

## Related Documentation

- `PrintDashboard.tsx` - Main implementation file
- `colors.ts` - Color scheme definitions
- `cacheService.ts` - File caching for quick reprint tip
- `printerService.ts` - Print stats for usage-based tips

---

**Last Updated**: January 4, 2026
**Maintained By**: JusPrint Development Team
