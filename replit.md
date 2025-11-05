# Mini Chat Suporte

## Overview

This is a real-time customer support chat application built with vanilla JavaScript and Firebase Realtime Database. The system enables direct communication between customers and support agents through a web-based interface. Customers can initiate support sessions by providing their name and CPF, while support agents can manage multiple concurrent chat sessions through a dedicated panel. The application features real-time message synchronization, typing indicators, and timestamp displays for all messages.

## Recent Changes

**November 5, 2025 - Typing Indicators Fix**
- Fixed typing indicator synchronization between client and attendant interfaces
- Corrected Firebase database paths in `atendente.html` to use `typing/cliente` and `typing/atendente` (previously used inconsistent paths `digitandoCliente` and `digitandoAtendente`)
- Added `input` event listener to detect when attendant is typing
- Implemented automatic cleanup of typing status when attendant closes the browser tab
- Added 2-second inactivity timeout to prevent stale typing indicators
- Typing status now correctly appears on both client and attendant screens in real-time

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Single-Page Applications (SPAs)**: The project uses pure HTML/CSS/JavaScript without any frontend framework. Two separate interfaces are provided:
- `index.html` - Customer-facing chat interface
- `atendente.html` - Agent dashboard for managing multiple customer sessions

**Rationale**: This vanilla JS approach was chosen for simplicity and minimal dependencies, making the application lightweight and easy to deploy. For a small-scale support chat, the overhead of a framework like React or Vue is unnecessary.

**Pros**: Fast loading times, no build process required, minimal complexity
**Cons**: Limited scalability for complex features, manual DOM manipulation

### Real-Time Communication

**Firebase Realtime Database**: All chat messages and session state are synchronized through Firebase's real-time database. The application uses Firebase SDK 8.10.0 for database operations.

**Data Structure**: Messages are organized under a `suporte` node, with customer sessions identified by unique keys. Each message includes sender role (cliente/atendente), timestamp, and content.

**Rationale**: Firebase Realtime Database provides instant synchronization across all connected clients without requiring a custom WebSocket server. This eliminates backend infrastructure complexity.

**Pros**: Zero backend code needed, automatic scaling, built-in offline support
**Cons**: Vendor lock-in, costs scale with usage, limited query capabilities compared to SQL databases

### Session Management

**Client Identification**: A multi-step conversation flow collects customer name and CPF before establishing the support session. The `etapa` variable tracks conversation state ("nome" → "cpf" → "atendimento").

**Rationale**: Progressive data collection provides a natural conversation flow and validates customer identity before connecting to an agent.

**Alternative Considered**: Single-form submission was considered but rejected in favor of conversational UX that feels more natural in a chat context.

### Typing Indicators

**Real-Time Feedback**: The application implements typing indicators that show when the other party is composing a message. A timeout mechanism (`typingTimeout`) prevents stale "typing..." indicators.

**Rationale**: Typing indicators improve perceived responsiveness and set expectations for message delivery, creating a more engaging chat experience.

**Implementation**: Uses Firebase database listeners to detect typing events from the other party and DOM manipulation to show/hide typing status.

### UI/UX Design

**Responsive Layout**: CSS flexbox-based layout centers the chat container and maintains consistent spacing. The chat box uses auto-scrolling to keep the latest messages visible.

**Message Styling**: Messages are differentiated by sender role using CSS classes (`msg`, `cliente`, `atendente`), with timestamps displayed for each message.

**Rationale**: Visual distinction between customer and agent messages improves conversation readability. Timestamps provide context for message history.

## External Dependencies

### Firebase Services

**Firebase Realtime Database**: Core data persistence and synchronization layer
- Database URL: `https://minichatsuporte-default-rtdb.firebaseio.com`
- Project: `minichatsuporte`
- Configuration stored in `firebase.js`

**Firebase SDK**: Loaded via CDN (version 8.10.0)
- `firebase-app.js` - Core Firebase functionality
- `firebase-database.js` - Realtime Database API

**Authentication**: Currently uses public Firebase configuration without authentication. The empty `apiKey` in `firebase.js` suggests this needs to be configured with actual credentials.

**Security Consideration**: Firebase security rules should be implemented to prevent unauthorized access to customer chat data. Current setup appears to be development-only.

### Third-Party CDNs

**Firebase CDN**: `https://www.gstatic.com/firebasejs/8.10.0/`
- Provides Firebase JavaScript libraries
- Loads synchronously before application scripts

**Rationale**: CDN delivery reduces bundle size and leverages browser caching across sites using the same Firebase version.