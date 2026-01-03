# Dynamic Tips System - Architecture & Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PrintDashboard                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                   Component State                      │    │
│  │  • currentTipIndex: number                            │    │
│  │  • stats: { today, week, monthlyAmount }              │    │
│  │  • cachedFilesMap: Map<string, CacheEntry>            │    │
│  │  • recentPrints: PrintJob[]                           │    │
│  └───────────────────────────────────────────────────────┘    │
│                           │                                     │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────┐    │
│  │              getDynamicTips()                          │    │
│  │                                                        │    │
│  │  1. Evaluate all tip conditions                       │    │
│  │  2. Filter tips where show = true                     │    │
│  │  3. Return array of active tips                       │    │
│  └───────────────────────────────────────────────────────┘    │
│                           │                                     │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         activeTips = filtered tip array               │    │
│  │         currentTip = activeTips[currentTipIndex]      │    │
│  └───────────────────────────────────────────────────────┘    │
│                           │                                     │
│           ┌───────────────┴───────────────┐                    │
│           ▼                               ▼                    │
│  ┌─────────────────┐            ┌──────────────────┐          │
│  │  Auto-Rotation  │            │  Manual Navigation│          │
│  │   (useEffect)   │            │   (onPress)      │          │
│  │                 │            │                  │          │
│  │  Every 5s:      │            │  User taps card: │          │
│  │  index++        │            │  index++         │          │
│  └─────────────────┘            └──────────────────┘          │
│           │                               │                    │
│           └───────────────┬───────────────┘                    │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                  Render UI                             │    │
│  │                                                        │    │
│  │  • Dynamic background color                           │    │
│  │  • Dynamic icon and color                             │    │
│  │  • Dynamic title/subtitle                             │    │
│  │  • Visual indicators (if multiple tips)               │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Actions / Time
        │
        ▼
┌─────────────────┐
│  Data Sources   │
│  • User Stats   │
│  • Cached Files │
│  • Recent Jobs  │
│  • Current Time │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tip Conditions  │
│   Evaluation    │
│                 │
│ For each tip:   │
│  if (show)      │
│    include      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Active Tips    │
│   Array [0..N]  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Auto      Manual
Timer      Tap
    │         │
    └────┬────┘
         │
         ▼
  Update Index
  (with wrap)
         │
         ▼
┌─────────────────┐
│  Display Tip    │
│  [currentIndex] │
└─────────────────┘
```

## Tip Lifecycle

```
Tip Definition
     │
     ▼
┌──────────────────────┐
│  show: condition     │
│  Evaluated on:       │
│  • Component mount   │
│  • State changes     │
│  • Props changes     │
└──────┬───────────────┘
       │
       ├─→ TRUE  ─→ Include in activeTips
       │
       └─→ FALSE ─→ Exclude from activeTips
```

## Condition Types & Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                    Tip Conditions                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Static (Always True)                                │
│     └─→ No dependencies                                 │
│                                                         │
│  2. User Activity Based                                 │
│     └─→ Depends on: stats object                       │
│         • stats.today                                   │
│         • stats.week                                    │
│         • stats.monthlyAmount                           │
│                                                         │
│  3. Time Based                                          │
│     └─→ Depends on: new Date()                         │
│         • Current hour                                  │
│         • Day of week                                   │
│                                                         │
│  4. Feature Availability Based                          │
│     └─→ Depends on: cachedFilesMap, recentPrints       │
│         • Number of cached files                        │
│         • Print history length                          │
│                                                         │
│  5. Device/Printer Based                                │
│     └─→ Depends on: selectedPrinter                    │
│         • Printer capabilities                          │
│         • Queue status                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Component Tree

```
PrintDashboard
│
├── ScrollView
│   │
│   ├── Hero Section (Upload Button)
│   │
│   ├── Printer Status Bar
│   │
│   ├── Quick Stats (3 cards)
│   │
│   ├── Dynamic Tip Section ◄─── Focus Area
│   │   │
│   │   └── TouchableOpacity (tipCard)
│   │       │
│   │       ├── View (tipLeft)
│   │       │   ├── View (tipIconBox)
│   │       │   │   └── Icon (dynamic)
│   │       │   │
│   │       │   └── View (tipTextBox)
│   │       │       ├── Text (tipTitle)
│   │       │       └── Text (tipSubtitle)
│   │       │
│   │       └── View (tipIndicators) [conditional]
│   │           └── View[] (tipDot) × N tips
│   │
│   ├── Recent Activity Section
│   │
│   └── Help & Support
│
└── Snackbar (errors)
```

## State Update Flow

```
User Interaction OR Timer Event
            │
            ▼
    setCurrentTipIndex(prev => (prev + 1) % activeTips.length)
            │
            ▼
    currentTipIndex state updates
            │
            ▼
    Component re-renders
            │
            ▼
    currentTip = activeTips[currentTipIndex]
            │
            ▼
    UI updates with new tip data:
    • Background color changes
    • Icon changes
    • Text changes
    • Active dot indicator shifts
```

## Data Dependencies Graph

```
                    ┌──────────────┐
                    │ printerService│
                    │  .getPrintStats()
                    └───────┬──────┘
                            │
                            ▼
                    ┌──────────────┐
                    │    stats     │
                    │ {today, week,│
                    │ monthlyAmount}│
                    └───────┬──────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    ┌───────┐          ┌────────┐          ┌────────┐
    │ Tip 2 │          │ Tip 6  │          │ Tip 7  │
    │ Bulk  │          │ Stats  │          │Quality │
    └───────┘          └────────┘          └────────┘

┌──────────────┐
│ cacheService │
│.getCachedFiles()
└───────┬──────┘
        │
        ▼
┌──────────────┐
│cachedFilesMap│
└───────┬──────┘
        │
        ▼
    ┌───────┐
    │ Tip 5 │
    │ Cache │
    └───────┘

┌──────────────┐
│printerService│
│.getPrintHistory()
└───────┬──────┘
        │
        ▼
┌──────────────┐
│ recentPrints │
└───────┬──────┘
        │
        ▼
    ┌───────┐
    │ Tip 8 │
    │Schedule│
    └───────┘

┌──────────────┐
│ new Date()   │
└───────┬──────┘
        │
        ▼
    ┌───────┐
    │ Tip 3 │
    │ Time  │
    └───────┘
```

## Tip Visibility Decision Tree

```
                    Start
                      │
                      ▼
              Is tip.show === true?
                      │
            ┌─────────┴─────────┐
            NO                  YES
            │                    │
            ▼                    ▼
    Exclude from          Include in
    activeTips            activeTips
    (not displayed)             │
                                ▼
                        Is it currentTip?
                                │
                      ┌─────────┴─────────┐
                      NO                  YES
                      │                    │
                      ▼                    ▼
              Waiting in queue      Displayed on screen
              (will show on              with:
               rotation)           • Dynamic styling
                                  • Icon
                                  • Title/Subtitle
                                  • Active indicator
```

## Performance Optimization Points

```
1. Tip Filtering (getDynamicTips)
   ├─ O(N) where N = total tips (8)
   └─ Called: On every render with dependencies

2. Re-render Triggers
   ├─ currentTipIndex changes (every 5s or on tap)
   ├─ stats changes (on data load/refresh)
   ├─ cachedFilesMap changes (when files cached)
   └─ recentPrints changes (on history update)

3. Timer Management
   ├─ Created: On mount when activeTips.length > 1
   ├─ Cleaned up: On unmount or dependency change
   └─ Memory impact: Minimal (single interval)

4. Rendering Cost
   ├─ Conditional rendering: if (currentTip)
   ├─ Map operation: activeTips.map() for indicators
   └─ Dynamic styles: Computed on each render
```

## Integration Points

```
PrintDashboard Component
│
├─→ printerService
│   ├─ getPrintStats()
│   └─ getPrintHistory()
│
├─→ cacheService
│   └─ getCachedFiles()
│
├─→ Redux Store
│   ├─ state.auth (user info)
│   └─ state.print (active jobs)
│
└─→ Navigation
    └─ navigation.navigate() (from tips if needed)
```

---

**This diagram set provides a visual understanding of the Dynamic Tips System architecture, data flow, and component interactions.**
