# 🎬 CineStream

> A premium movie streaming experience built with **.NET 9** and **React 19**, focused on high performance and cinematic UI.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Notes](#notes)

---

## 🌟 Overview
**CineStream** is a modern movie streaming application designed to provide a seamless cinematic experience. It integrates with external movie APIs while maintaining a robust localized system for user management, watch history, and administrative control.

Built with a scalable **Clean Architecture** backend and a high-performance **React** frontend, CineStream demonstrates modern web development practices including JWT-based security, in-memory caching, and a highly responsive custom video player.

---

## ✨ Features

### 🎞️ Cinematic Experience
*   **High-Quality HLS Streaming**: Support for adaptive bitrate streaming with quality selector (Auto / 720p / 1080p).
*   **Custom Video Player**: Built on Video.js with playback speed control (0.5x → 2x) and interactive seek tracking.
*   **Keyboard Shortcuts**: Advanced player controls (`Space/K` Play/Pause · `L/J` Seek · `F` Fullscreen · `M` Mute · `↑↓` Volume).
*   **Expansion Previews**: React Portal-based hover cards for instant movie details without leaving the page.

### 👤 User Features
*   **Smart Watch History**: Automatic tracking of watch progress per episode/movie.
*   **Personal Library**: Manage favorite movies and access quickly from the profile.
*   **Advanced Discovery**: Powerful filter panel (Genre, Country, Type, Year) and intelligent search.
*   **Responsive UI**: Optimized for all devices with a smooth, glassmorphism design.

### 🔐 Security & Auth
*   **JWT Authentication**: Secure Access + Refresh Token flow.
*   **Role-Based Access**: Granular control for Admin and User roles.
*   **Secure Storage**: BCrypt password hashing and Cloudinary integration for images.

### 🛠️ Admin Dashboard
*   **Real-time Insights**: Overview charts for user activity and popular content.
*   **User Management**: Full control over user accounts, roles, and security resets.
*   **System Configuration**: Manage global application settings and API configurations.

---

## 💻 Technology Stack

### Backend
| Component | Technology |
|:---|:---|
| **Framework** | ASP.NET Core 9 |
| **ORM** | Entity Framework Core 9 |
| **Database** | MySQL 8 (Pomelo) |
| **Authentication** | JWT Bearer |
| **Storage** | Cloudinary |
| **Caching** | IMemoryCache |

### Frontend
| Component | Technology |
|:---|:---|
| **Framework** | React 19 + Vite |
| **Styling** | Tailwind CSS v4 |
| **State** | Zustand |
| **HTTP Client** | Axios |
| **Player** | Video.js + HLS Plugin |
| **Icons** | Lucide React |

---

## 🏗️ System Architecture

CineStream follows **Clean Architecture** and **Repository Pattern** to ensure maintainability and testability.

### Project Structure
```bash
cinestream/
├── backend/src/
│   ├── Cinestream.Domain/          # Core Business Entities
│   ├── Cinestream.Application/     # Interfaces, DTOs, Use Cases
│   ├── Cinestream.Infrastructure/  # DB, External API, Repositories
│   └── Cinestream.API/             # Controllers, DI, Middleware
└── frontend/src/
    ├── app/                        # Router & Layout
    ├── features/                   # Feature-based modules (Admin, Movies, Player)
    ├── store/                      # Zustand state management
    └── utils/                      # Axios client & Helpers
```

---

## 📊 Database Schema

The system uses **MySQL 8** with a relational schema optimized for performance.

### 1. `Users`
| Column | Data Type | Constraint | Description |
|:---|:---|:---|:---|
| `Id` | `CHAR(36)` | **PK** | Unique identifier (GUID). |
| `Email` | `VARCHAR(255)` | NOT NULL, UNIQUE | User login email. |
| `PasswordHash`| `TEXT` | NOT NULL | BCrypt hashed password. |
| `DisplayName` | `VARCHAR(100)` | NOT NULL | Display name for UI. |
| `AvatarUrl` | `TEXT` | NULL | Cloudinary image URL. |
| `RefreshTokenHash`| `TEXT` | NULL | Hashed refresh token. |
| `RefreshTokenExpiry`| `DATETIME`| NULL | Token expiration date. |
| `CreatedIpAddress`| `VARCHAR(45)` | NULL | IP used during registration. |
| `Role` | `INT` | NOT NULL | 0: User, 1: Admin. |
| `CreatedAt` | `DATETIME` | NOT NULL | Account creation timestamp. |
| `UpdatedAt` | `DATETIME` | NOT NULL | Last account update. |

### 2. `WatchHistories`
| Column | Data Type | Constraint | Description |
|:---|:---|:---|:---|
| `Id` | `INT` | **PK**, AI | Record identifier. |
| `UserId` | `CHAR(36)` | **FK** | Reference to `Users.Id`. |
| `MovieId` | `VARCHAR(255)` | NOT NULL | ID from external movie API. |
| `MovieName` | `VARCHAR(255)` | NOT NULL | Cached movie name. |
| `MovieSlug` | `VARCHAR(255)` | NOT NULL | Cached movie slug. |
| `MovieThumbUrl`| `TEXT` | NOT NULL | Cached thumbnail URL. |
| `Episode` | `VARCHAR(100)` | NULL | Episode name/number. |
| `WatchedTimeInSeconds`| `INT` | NOT NULL | Current watch progress. |
| `IsCompleted` | `TINYINT(1)` | NOT NULL | Whether finished. |
| `LastWatchedAt`| `DATETIME` | NOT NULL | Last update timestamp. |

### 3. `Comments`
| Column | Data Type | Constraint | Description |
|:---|:---|:---|:---|
| `Id` | `CHAR(36)` | **PK** | Comment identifier. |
| `MovieId` | `VARCHAR(255)` | NOT NULL | Movie ID being commented on. |
| `UserId` | `CHAR(36)` | **FK** | Reference to `Users.Id`. |
| `Content` | `VARCHAR(1000)`| NOT NULL | Comment text. |
| `ParentId` | `CHAR(36)` | **FK**, NULL | Reference to parent `Comments.Id`. |
| `IsSpoiler` | `TINYINT(1)` | NOT NULL | Spoiler flag. |
| `LikeCount` | `INT` | DEFAULT 0 | Number of likes. |
| `DislikeCount`| `INT` | DEFAULT 0 | Number of dislikes. |
| `ReplyCount` | `INT` | DEFAULT 0 | Number of replies. |
| `CreatedAt` | `DATETIME` | NOT NULL | Creation timestamp. |
| `UpdatedAt` | `DATETIME` | NOT NULL | Last update. |

### 4. `MovieRatings`
| Column | Data Type | Constraint | Description |
|:---|:---|:---|:---|
| `Id` | `CHAR(36)` | **PK** | Rating identifier. |
| `MovieId` | `VARCHAR(255)` | NOT NULL | Movie ID being rated. |
| `UserId` | `CHAR(36)` | **FK** | Reference to `Users.Id`. |
| `Score` | `INT` | NOT NULL (1-10)| Rating score. |
| `CreatedAt` | `DATETIME` | NOT NULL | Creation timestamp. |
| `UpdatedAt` | `DATETIME` | NOT NULL | Last update. |

### 5. `Other Tables`
*   **`Favorites`**: `Id` (PK), `UserId` (FK), `MovieId`, `AddedAt`.
*   **`CommentReactions`**: `Id` (PK), `CommentId` (FK), `UserId` (FK), `IsLike` (bool), `CreatedAt`.
*   **`AppSettings`**: `Key` (PK), `Value` (JSON), `UpdatedAt`.

---

## 🔌 API Documentation

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/register` | Register a new user account. |
| `POST` | `/login` | Login and receive JWT + Refresh tokens. |
| `POST` | `/refresh-token`| Obtain new access token using refresh token. |

### 🎬 Movies (`/api/movies`)
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/latest` | Get latest released movies (paginated). |
| `GET` | `/detail/{slug}`| Get full movie details and episodes. |
| `GET` | `/type/{type}` | Filter movies by type (series, movie, etc). |
| `GET` | `/search` | Search movies with keywords and filters. |
| `GET` | `/category/{slug}`| Get movies belonging to a specific genre. |
| `GET` | `/country/{slug}` | Get movies from a specific country. |
| `GET` | `/categories` | List all available genres. |
| `GET` | `/countries` | List all available countries. |
| `GET` | `/credits/{id}` | Get real actor profiles (vía TMDB Proxy). |

### 💬 Comments (`/api/movies/{movieId}/comments`)
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | Get comments for a movie (paged). |
| `GET` | `/{parentId}/replies`| Get replies for a specific comment. |
| `POST` | `/` | Post a new comment (Auth required). |
| `PUT` | `/comments/{id}` | Update comment content (Owner only). |
| `DELETE`| `/comments/{id}` | Remove a comment (Owner/Admin). |
| `POST` | `/comments/{id}/react`| Like/Dislike a comment. |

### ⭐ Ratings (`/api/movies/{movieId}/ratings`)
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | Get rating statistics and user's score. |
| `POST` | `/` | Submit/Update a movie rating (1-10). |

### 🕒 Watch History (`/api/watch-history`)
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | Get current user's watch history. |
| `GET` | `/{movieId}` | Get history for a specific movie. |
| `POST` | `/` | Save current playback progress. |

### 🛠️ Admin (`/api/admin`)
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/stats` | View application usage statistics. |
| `GET` | `/users` | List all registered users. |
| `PUT` | `/users/{id}/role` | Change a user's role (Admin only). |
| `PUT` | `/users/{id}` | Update user profile information. |
| `DELETE`| `/users/{id}` | Delete a user account. |
| `PUT` | `/users/{id}/password`| Force reset a user's password. |

---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org)
- MySQL 8+
- [Cloudinary](https://cloudinary.com) account (free tier is sufficient)

---

### Backend

```bash
# 1. Navigate to the backend folder
cd cinestream/backend

# 2. Create your local config from the example
copy src\Cinestream.API\appsettings.example.json src\Cinestream.API\appsettings.json

# 3. Fill in your real values in appsettings.json
#    (see Environment Variables section below)

# 4. Apply database migrations
dotnet ef database update --project src/Cinestream.Infrastructure --startup-project src/Cinestream.API

# 5. Start the API server
dotnet run --project src/Cinestream.API
# API runs at: http://localhost:5210
```

---

### Frontend

```bash
# 1. Navigate to the frontend folder
cd cinestream/frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
# App runs at: http://localhost:5173
```

---

## Environment Variables

### Backend — `appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=cinestream_db;User=YOUR_USER;Password=YOUR_PASSWORD;"
  },
  "JwtSettings": {
    "Secret": "YOUR_JWT_SECRET_MINIMUM_32_CHARACTERS_LONG",
    "Issuer": "CinestreamApp",
    "Audience": "CinestreamUsers",
    "ExpiryDays": 7
  },
  "Cloudinary": {
    "CloudName": "YOUR_CLOUD_NAME",
    "ApiKey": "YOUR_API_KEY",
    "ApiSecret": "YOUR_API_SECRET"
  },
  "MovieApi": {
    "BaseUrl": "https://ophim1.com",
    "ImageBaseUrl": "https://img.ophim.live/uploads/movies"
  }
}
```

> ⚠️ `appsettings.json` is listed in `.gitignore` and must **never** be committed to the repository.

---

## Notes

- All movie data is fetched from a third-party API ([Ophim](https://ophim1.com)). No movie content is stored in this project's database.
- This is a personal learning project and is not intended for commercial use.

Developed with ❤️ by **TunDuzz** 🚀
