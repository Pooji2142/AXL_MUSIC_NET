# AXOLOTL MUSIC COMMUNITY - Features Documentation

## Overview
AXOLOTL MUSIC COMMUNITY is a real-time Spotify-like music streaming web application built with React (frontend) and Node.js/Express (backend). It features real-time chat, social interactions, music playback, and an admin dashboard.

## Core Features

### 🎵 Music Streaming & Playback
- **Audio Player**: Full-featured music player with play/pause, next/previous controls
- **Volume Control**: Adjustable volume slider with visual feedback
- **Seek Functionality**: Click and drag to seek through songs with time display
- **Queue Management**: Automatic queue initialization from various song collections
- **Album Playback**: Play entire albums with track navigation
- **Real-time Activity Updates**: Shows what friends are currently listening to

### 🔍 Search & Discovery
- **Global Search**: Search across songs, albums, and users with debounced input
- **Tabbed Search Interface**: Separate tabs for Music and People search
- **Song Search**: Find songs by title or artist
- **Album Search**: Discover albums with cover images and metadata
- **User Search**: Find and connect with other users
- **Follow System**: Send/receive/accept/reject follow requests

### 💬 Real-time Chat & Social Features
- **Real-time Messaging**: Instant messaging with friends using Socket.io
- **Message Replies**: Reply to specific messages with context
- **Message Management**: Unsend messages (delete for all participants)
- **Online Status**: See who's online/offline in real-time
- **Friends Activity**: Live feed of what friends are listening to
- **User Profiles**: View and edit profile information (name, avatar)

### 🔔 Notifications System
- **Message Notifications**: Alerts for new messages with unread counts
- **Follow Request Notifications**: Handle incoming follow requests
- **Follow Status Updates**: Notifications for accepted/rejected requests
- **Follow Back Suggestions**: Prompt users to follow back mutual connections
- **Notification Management**: Mark as read, dismiss notifications

### 👥 Social Interactions
- **Follow/Unfollow**: Build your network of music friends
- **Friend Lists**: View following/followers in sidebar
- **Activity Sharing**: Automatic sharing of listening activity with friends
- **Profile Updates**: Real-time profile changes broadcast to friends

### 🎧 Music Library
- **Home Page**: Personalized dashboard with greeting and music recommendations
- **Featured Songs**: Curated featured music collection
- **Made For You**: Personalized song recommendations
- **Trending Songs**: Popular music discovery
- **Album Pages**: Dedicated pages for each album with track listings
- **Playlist Sidebar**: Quick access to all albums in left sidebar

### 🛠️ Admin Dashboard
- **Song Management**: Add, view, and delete songs
- **Album Management**: Create and manage albums
- **Statistics Dashboard**: View platform analytics (total songs, albums, users, artists)
- **File Upload**: Upload song audio files and cover images
- **Admin Authentication**: Role-based access control

### 🎨 User Interface & Experience
- **Responsive Design**: Works on desktop and mobile with adaptive layouts
- **Resizable Panels**: Adjustable sidebar sizes for customization
- **Dark Theme**: Consistent dark UI with zinc/black color scheme
- **Smooth Animations**: Hover effects, transitions, and loading states
- **Toast Notifications**: User feedback for actions and errors
- **Loading Skeletons**: Placeholder UI during data fetching

### 🔐 Authentication & Security
- **Clerk Authentication**: Secure OAuth login with Google
- **Session Management**: Persistent login state
- **Protected Routes**: Admin-only areas and authenticated features
- **File Upload Security**: Size limits and type validation

### ⚡ Real-time Features (WebSocket)
- **Live Chat**: Instant messaging with typing indicators
- **Activity Broadcasting**: Real-time music activity sharing
- **Online Presence**: Live user online/offline status
- **Notification Delivery**: Instant push notifications
- **Profile Sync**: Real-time profile updates across clients

### 📊 Analytics & Stats
- **Platform Statistics**: Total songs, albums, users, and artists
- **User-specific Stats**: Personal follower/following counts
- **Admin Analytics**: Comprehensive dashboard metrics

### 🗂️ Content Management
- **Cloud Storage**: Cloudinary integration for media files
- **File Organization**: Structured storage for songs, albums, and user images
- **Temporary File Cleanup**: Automated cron jobs for temp file management

### 🛡️ Error Handling & Reliability
- **Global Error Boundaries**: Graceful error handling
- **404 Page**: Custom not-found page with navigation
- **Loading States**: Comprehensive loading indicators
- **Offline Resilience**: Graceful degradation when features unavailable

## Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Socket.io Client** for real-time communication
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend Stack
- **Node.js** with Express
- **Socket.io** for WebSocket communication
- **MongoDB** with Mongoose
- **Clerk** for authentication
- **Cloudinary** for media storage
- **Multer** for file uploads
- **Node-cron** for scheduled tasks

### Database Models
- **Users**: Profile information, follow relationships
- **Songs**: Music metadata, audio URLs, album associations
- **Albums**: Album information with song collections
- **Messages**: Chat messages with reply support
- **Stats**: Platform analytics

### API Endpoints
- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*` (profile, messages, follows)
- **Songs**: `/api/songs/*` (streaming, search)
- **Albums**: `/api/albums/*` (browsing, details)
- **Admin**: `/api/admin/*` (management, stats)
- **Stats**: `/api/stats/*` (public analytics)

## Deployment & Environment
- **Development**: Local setup with hot reloading
- **Production**: Static file serving with Express
- **Environment Variables**: Secure configuration for API keys, database, etc.
- **CORS Configuration**: Proper cross-origin handling for development/production

This comprehensive feature set creates a fully functional, social music streaming platform with real-time capabilities, rivaling commercial applications like Spotify in terms of user experience and functionality.
