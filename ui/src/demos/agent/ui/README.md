# Agent Interaction Demo UI Components

## Overview
Professional React components for the Agent Interaction Demo, featuring sober styling with the OCN color palette and comprehensive explanation rendering.

## Components

### 🛒 CartPanel.tsx
**Purpose**: Displays cart items and checkout functionality

**Features**:
- **Cart Display**: Shows items with SKU, quantity, and pricing
- **Checkout Button**: Triggers `runAgentFlow()` with processing state
- **Total Calculation**: Displays subtotal and total with currency
- **Branding**: Gradient banner with OCN colors
- **Interactive States**: Hover effects and disabled states

**Props**:
```typescript
interface CartPanelProps {
  cart: Cart;
  onCheckout: () => void;
  isProcessing?: boolean;
}
```

**Styling**:
- Uses OCN color palette (`COLORS.purple`, `COLORS.light`, etc.)
- Hover effects with color transitions
- Gradient background for branding section
- Responsive layout with proper spacing

### 🎛️ VerbosityToggle.tsx
**Purpose**: Controls explanation detail level

**Features**:
- **Three Levels**: Brief, Standard, Forensics
- **Visual Feedback**: Active state highlighting
- **Smooth Transitions**: Color changes on hover/selection
- **Type Safety**: Uses `Verbosity` type from constants

**Props**:
```typescript
interface VerbosityToggleProps {
  value: Verbosity;
  onChange: (verbosity: Verbosity) => void;
}
```

**Behavior**:
- **Brief**: Shows only summary and decision
- **Standard**: Includes uncertainty, versions, key signals
- **Forensics**: Full evidence with masked JSON viewer

### 💬 ChatBubble.tsx
**Purpose**: Renders individual agent explanations

**Features**:
- **Header Section**: Agent label, timestamp, trace ID
- **Meta Line**: Policy and model versions
- **Summary**: 1-3 sentence human-readable explanation
- **Metrics Row**: Decision badge, score, uncertainty
- **Evidence Section**: Collapsible details (Forensics only)

**Evidence Components**:
- **Key Signals**: Path-value-weight tuples with highlighting
- **AP2 References**: Audit trail badges
- **Redacted Fields**: PII protection indicators
- **Masked JSON**: Full explanation with redacted PII

**Props**:
```typescript
interface ChatBubbleProps {
  explanation: Explanation;
  verbosity: Verbosity;
}
```

**Styling Highlights**:
- **Agent Colors**: Dynamic badges based on agent type
- **Decision Badges**: Color-coded (green=allow, blue=propose_alt, etc.)
- **Score Colors**: Dynamic based on score value and type
- **Evidence Layout**: Clean, scannable format with proper spacing

### 🤖 AgentChat.tsx
**Purpose**: Container for chat bubbles with choice handling

**Features**:
- **Vertical List**: ChatBubbles with separators
- **Choice Buttons**: Appear after Okra `propose_alt` decision
- **Processing States**: Loading indicators and status messages
- **Real-time Updates**: Handles streaming explanations
- **Choice Handling**: Re-runs flow with selected option

**Props**:
```typescript
interface AgentChatProps {
  explanations: Explanation[];
  verbosity: Verbosity;
  isProcessing: boolean;
  onChoiceSelect: (choice: 'credit' | 'bnpl') => void;
}
```

**Choice Flow**:
1. **Okra Decision**: When `propose_alt` is detected
2. **Choice Buttons**: "Use Revolving Credit" vs "Use BNPL"
3. **Re-run Flow**: Calls `onChoiceSelect()` with selected option
4. **State Management**: Prevents duplicate choice buttons

**UI States**:
- **Empty**: Ready to start message with robot emoji
- **Processing**: Loading indicators with animated elements
- **Complete**: Success banner with explanation count
- **Choice Mode**: Payment method selection interface

## Main Demo Component

### 🎯 AgentInteractionDemo.tsx
**Purpose**: Main orchestrator component

**Features**:
- **Layout**: Two-panel design (Cart + Chat)
- **Controls**: Verbosity toggle and action buttons
- **State Management**: Handles explanations and processing state
- **Flow Orchestration**: Coordinates between components

**Key Functions**:
```typescript
const startDemo = async (choice?: 'credit' | 'bnpl') => {
  // Initiates agent flow with optional payment choice
};

const handleChoiceSelect = (choice: 'credit' | 'bnpl') => {
  // Re-runs flow with selected payment method
};
```

## Design System

### 🎨 Color Usage
- **Primary**: `COLORS.purple` (#5063BF) for main actions
- **Secondary**: `COLORS.aqua` (#8EDFEB) for BNPL options
- **Dark**: `COLORS.dark` (#414B77) for headings and text
- **Medium**: `COLORS.medium` (#6F6F77) for secondary text
- **Light**: `COLORS.light` (#FAFAFD) for backgrounds

### 📐 Layout Principles
- **Consistent Spacing**: 4px grid system
- **Proper Hierarchy**: Clear visual hierarchy with typography
- **Responsive Design**: Works on desktop and mobile
- **Accessibility**: Proper contrast ratios and focus states

### 🔄 Interactive States
- **Hover Effects**: Subtle color transitions
- **Loading States**: Disabled buttons with opacity
- **Active States**: Clear visual feedback
- **Focus States**: Keyboard navigation support

## Technical Features

### 🛡️ Security & Privacy
- **PII Redaction**: Automatic masking of sensitive fields
- **JSON Masking**: Recursive masking based on redaction paths
- **Audit Trail**: Complete trace IDs and AP2 references
- **Evidence Display**: Controlled by verbosity level

### ⚡ Performance
- **Efficient Rendering**: React.memo where appropriate
- **Lazy Loading**: Evidence sections only when needed
- **Optimized Updates**: Minimal re-renders during processing
- **Smooth Animations**: CSS transitions for better UX

### 🔧 Type Safety
- **Full TypeScript**: Strict typing throughout
- **Interface Contracts**: Clear component APIs
- **Type Guards**: Runtime type checking where needed
- **Error Boundaries**: Graceful error handling

## Usage Examples

### Basic Implementation
```typescript
import { CartPanel, VerbosityToggle, AgentChat } from './ui';

const MyDemo = () => {
  const [verbosity, setVerbosity] = useState<Verbosity>('standard');
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  
  return (
    <div className="grid grid-cols-2 gap-8">
      <CartPanel 
        cart={cart}
        onCheckout={() => startDemo()}
        isProcessing={isProcessing}
      />
      <AgentChat 
        explanations={explanations}
        verbosity={verbosity}
        isProcessing={isProcessing}
        onChoiceSelect={handleChoice}
      />
    </div>
  );
};
```

### Custom Styling
```typescript
// Override colors for specific use cases
const customColors = {
  ...COLORS,
  purple: '#8B5CF6', // Custom purple
  aqua: '#06B6D4'    // Custom aqua
};
```

## Integration Status

✅ **Components Created**: All 4 UI components implemented
✅ **Type Safety**: Full TypeScript compliance
✅ **Styling**: OCN color palette integration
✅ **Functionality**: Complete feature set
✅ **Testing**: No linting errors
✅ **Server Status**: HTTP 200 - All working

## Future Enhancements

- **Animation Library**: Add Framer Motion for smoother transitions
- **Accessibility**: Enhanced screen reader support
- **Theming**: Dark mode support
- **Mobile Optimization**: Touch-friendly interactions
- **Export Features**: PDF/JSON export capabilities
- **Real-time Collaboration**: WebSocket integration








