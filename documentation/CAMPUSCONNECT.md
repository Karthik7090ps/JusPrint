# CampusConnect - Event Management Platform

## Overview

**CampusConnect** is a new service integrated into the JusPrint app that enables college club coordinators to create events, collect registrations, and manage student data efficiently. The platform serves as a bridge between event organizers and students, streamlining the entire registration process.

## Features

### For Coordinators

1. **Event Management Dashboard**
   - Create unlimited events
   - Track registrations in real-time
   - View analytics and statistics
   - Manage multiple events simultaneously

2. **Custom Form Builder**
   - Design custom registration forms
   - Multiple field types (text, email, phone, dropdown, checkbox, date, number)
   - Mark fields as required/optional
   - Add/remove form fields dynamically

3. **Event Configuration**
   - Set event details (title, description, date, time, venue)
   - Configure registration fees
   - Set maximum capacity
   - Categorize events

4. **Share & Promote**
   - Get shareable registration links
   - Generate QR codes for easy access
   - Share via WhatsApp, Email, Social Media
   - Copy link to clipboard

5. **Registration Management**
   - View all registrations
   - Filter by status (confirmed, pending)
   - Export data to Excel
   - Track payment status

### For Students

1. **Browse Events**
   - Discover campus events
   - Search by keywords
   - Filter by category (Technical, Cultural, Workshop, Sports, Seminar)
   - View event details

2. **Easy Registration**
   - Fill custom registration forms
   - Pay registration fees (if applicable)
   - Get instant confirmation
   - Receive QR code for check-in

## Revenue Model

**Simple, transparent pricing:**
- ₹1 per successful registration
- No setup fees
- No monthly charges
- Pay only for actual registrations
- **First 100 registrations FREE** (promotional offer)

### Example:
- Event with 200 registrations at ₹50 per person
- Total collected: ₹10,000
- Platform commission: ₹200 (₹1 × 200)
- Coordinator receives: ₹9,800

## User Flows

### Coordinator Flow

1. **Onboarding**
   ```
   CampusConnect Hub → Coordinator Auth → Sign Up/Login → OTP Verification → Dashboard
   ```

2. **Create Event**
   ```
   Dashboard → Create Event → Fill Event Details → Design Form → Publish → Get Share Link
   ```

3. **Manage Registrations**
   ```
   Dashboard → Select Event → View Details → Check Registrations → Export Data
   ```

### Student Flow

1. **Discovery**
   ```
   CampusConnect Hub → Browse Events → Search/Filter → View Event Details
   ```

2. **Registration**
   ```
   Event Details → Fill Registration Form → Pay Fee (if required) → Submit → Get Confirmation
   ```

## Technical Implementation

### New Screens Created

1. **CampusConnect.tsx** - Landing page and service hub
2. **CoordinatorAuth.tsx** - Coordinator login/signup with OTP
3. **CoordinatorDashboard.tsx** - Event management dashboard
4. **CreateEvent.tsx** - Event creation with form builder
5. **EventDetails.tsx** - Event details with registration management
6. **StudentEventBrowse.tsx** - Event discovery for students

### Navigation Integration

All screens are integrated into the main `AppNavigator.tsx`:
- Accessible from Services tab
- Proper back navigation
- Deep linking support for event registration links

### Design System

**Color Palette:**
- Primary: `#6366F1` (Indigo)
- Secondary: `#8B5CF6` (Purple)
- Accent: `#EC4899` (Pink)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)

**UI Components:**
- Material Design with React Native Paper
- Linear gradients for premium feel
- Custom cards with elevation
- Icon integration (MaterialCommunityIcons)
- Responsive layouts

## Backend Integration Points

### API Endpoints Needed

1. **Authentication**
   - `POST /api/campus-connect/auth/send-otp` - Send OTP to coordinator
   - `POST /api/campus-connect/auth/verify-otp` - Verify OTP and create session

2. **Event Management**
   - `POST /api/campus-connect/events` - Create new event
   - `GET /api/campus-connect/events` - List coordinator's events
   - `GET /api/campus-connect/events/:id` - Get event details
   - `PUT /api/campus-connect/events/:id` - Update event
   - `DELETE /api/campus-connect/events/:id` - Delete event

3. **Registrations**
   - `POST /api/campus-connect/events/:id/register` - Student registration
   - `GET /api/campus-connect/events/:id/registrations` - Get all registrations
   - `GET /api/campus-connect/events/:id/export` - Export registrations to Excel

4. **Public Endpoints**
   - `GET /api/campus-connect/events/public` - Browse public events
   - `GET /api/campus-connect/events/public/:id` - Get public event details

### Data Models

```typescript
interface Event {
  id: string;
  coordinatorId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  status: 'draft' | 'active' | 'closed';
  maxCapacity?: number;
  registrationFee: number;
  formFields: FormField[];
  shareLink: string;
  createdAt: string;
  updatedAt: string;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'dropdown' | 'checkbox' | 'date';
  required: boolean;
  options?: string[];
  order: number;
}

interface Registration {
  id: string;
  eventId: string;
  studentData: Record<string, any>;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  registeredAt: string;
}

interface Coordinator {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  clubName: string;
  role: string;
  verified: boolean;
  createdAt: string;
}
```

## Next Steps

### Phase 1: Core Features (Completed ✓)
- [x] Landing page and hub
- [x] Coordinator authentication
- [x] Event creation with form builder
- [x] Dashboard with analytics
- [x] Student event browsing

### Phase 2: Registration Flow (Next)
- [ ] Student registration form rendering
- [ ] Payment integration for registration fees
- [ ] Email confirmations
- [ ] QR code generation for check-ins

### Phase 3: Advanced Features
- [ ] Event analytics dashboard
- [ ] Bulk email to registrants
- [ ] Check-in system with QR scanner
- [ ] Registration deadline and auto-close
- [ ] Waitlist management
- [ ] Refund processing

### Phase 4: Enhancements
- [ ] Event templates
- [ ] Recurring events
- [ ] Team collaboration (multiple coordinators)
- [ ] Custom branding for events
- [ ] Integration with college calendar systems

## Screenshots & Demos

The frontend is complete and integrated. You can now:

1. Navigate to **Services** tab
2. Tap on **CampusConnect** (first card with "New" badge)
3. Explore the coordinator flow:
   - Sign up/Login
   - Create events
   - Manage registrations
4. Test the student flow:
   - Browse events
   - View event details

## Marketing & Promotion

**Target Audience:**
- College club coordinators
- Event managers
- Student organizations
- Campus administration

**Value Propositions:**
1. Eliminate manual registration tracking
2. Professional online presence for events
3. Real-time data and analytics
4. Integrated payment processing
5. Minimal cost (₹1/registration)

**Launch Strategy:**
1. Pilot with 5-10 colleges
2. Offer first 100 registrations free
3. Get testimonials and case studies
4. Expand through word-of-mouth
5. Partner with college event committees

## Support & Documentation

For coordinators, provide:
- Video tutorials on event creation
- Best practices for form design
- Tips for maximizing registrations
- FAQ section

For students:
- Simple registration guide
- Payment security information
- Privacy policy

---

**Created**: December 2024
**Status**: Frontend Complete, Backend Integration Pending
**Next Review**: After backend API setup
