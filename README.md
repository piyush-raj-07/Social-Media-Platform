# 🌐 Gupshup – Social Media Platform

A **full-stack, Instagram-style social media app** built with the MERN stack and Socket.IO.
Share photos, follow people (public or private accounts), get real-time notifications, chat, and share posts with friends.

---

## ✨ Features

### 👤 Accounts & Profiles
- 🔐 Sign up / login with **JWT stored in an httpOnly cookie**, passwords hashed with **bcrypt**
- ⏱️ Automatic logout in the app when the session expires
- ✏️ Edit profile: photo, bio, gender
- 🔒 **Public / Private account** switch
- 📊 Profile page with posts, followers, following and saved posts (saved posts are visible only to you)

### 📝 Posts & Feed
- 🖼️ Create posts with image upload (optimized with **Sharp**, stored on **Cloudinary**)
- ❤️ Like / unlike, 🔖 save (bookmark) and 🗑️ delete your own posts
- 💬 Comments in a dialog, loaded **20 at a time** (newest first)
- 📜 **Infinite-scroll feed, 20 posts at a time** — posts from people you follow first, then *“You're all caught up”*, then suggested posts from public accounts

### 🧑‍🤝‍🧑 Social
- ➕ Follow / unfollow — **follow requests** for private accounts (Confirm / Delete)
- 🛡️ Privacy is checked on the server: private posts, comments, likes and saves are blocked for non-followers
- 🔍 **Search all users** by username (people you follow shown first)
- 💡 **Suggested users** based on *friends of friends* (“Followed by rahul + 2 more”)

### 🔔 Notifications
- Follow requests, accepted requests, likes, comments and shared posts
- ⚡ Real-time pop-ups with **Socket.IO**
- 💾 Saved in the database, so nothing is lost while you are offline
- 🔴 Unread badge that clears when you open the notifications page

### 💬 Chat & Sharing
- Real-time one-to-one chat with online status
- 🕑 Recent chats list with last message
- ✈️ **Share posts** to one or more people — shown as a post card in the chat
  (shows *“Post unavailable”* if the post was deleted or is from a private account)

### 🎨 UI
- Animated interface with Tailwind CSS, shadcn/ui and Framer Motion
- 📱 Responsive for mobile, tablet and desktop

---

## 🛠️ Tech Stack

| Frontend | Backend |
|---|---|
| React 19 + Vite | Node.js + Express 5 |
| React Router | MongoDB + Mongoose |
| Redux Toolkit + redux-persist | JWT (httpOnly cookie) + bcrypt |
| Tailwind CSS + shadcn/ui (Radix) | Socket.IO |
| Framer Motion, Lucide icons | Multer + Sharp + Cloudinary |
| Axios, Socket.IO Client, Sonner | dotenv, cookie-parser, CORS |

---

## 📸 Screenshots

<img width="1887" height="910" alt="image" src="https://github.com/user-attachments/assets/f4a63316-3889-4fc4-9606-fa8a00420994" />

<img width="1125" height="845" alt="image" src="https://github.com/user-attachments/assets/9044df6a-172b-47fb-a799-1498316db20e" />

<img width="1885" height="893" alt="image" src="https://github.com/user-attachments/assets/2436a754-5e87-4cc6-aa8d-b31e1758b4e3" />

<img width="1848" height="888" alt="image" src="https://github.com/user-attachments/assets/e57f8260-bc48-46da-a950-29fed3ea7d44" />

<img width="1889" height="873" alt="image" src="https://github.com/user-attachments/assets/169062b0-d9e4-40be-9028-0d00c6ab129b" />

<img width="1899" height="890" alt="image" src="https://github.com/user-attachments/assets/6f25601a-0625-459d-aa18-b7b9dfc8577a" />

<img width="1896" height="859" alt="image" src="https://github.com/user-attachments/assets/544b0ec9-ca57-4c44-815c-e467448b0670" />

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- A **MongoDB** database (MongoDB Atlas or local)
- A free **Cloudinary** account (for image uploads)

### 1. Clone the repository
```bash
git clone https://github.com/piyush-raj-07/Social-Media-Platform.git
cd Social-Media-Platform
```

### 2. Backend
```bash
cd server
npm install
cp .env.example .env      # Windows: copy .env.example .env
```
Fill in your values in `server/.env` (see the table below), then start the server:
```bash
npm run dev               # runs on http://localhost:8000
```

### 3. Frontend
Open a second terminal:
```bash
cd client
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # opens on http://localhost:5173
```

> 💡 To test two accounts at the same time, use a normal window and an incognito window (login uses a cookie, which is shared by all tabs of one browser).

---

## 🔑 Environment Variables

### `server/.env`
| Variable | Description | Example |
|---|---|---|
| `PORT` | Port of the backend | `8000` |
| `CLIENT_URL` | Frontend URL (allowed by CORS and Socket.IO) | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret used to sign login tokens (long random string) | — |
| `CLOUD_NAME` | Cloudinary cloud name | — |
| `API_KEY` | Cloudinary API key | — |
| `API_SECRET` | Cloudinary API secret | — |

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### `client/.env`
| Variable | Description | Example |
|---|---|---|
| `VITE_SERVER_URL` | Backend URL (used for API calls and Socket.IO) | `http://localhost:8000` |

> ⚠️ Never commit your `.env` files — only the `.env.example` templates are in the repository.

---

## 📁 Project Structure

```
Social-Media-Platform/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── components/        # pages & UI (Feed, Profile, ChatPage, Notifications, ShareDialog…)
│       │   └── ui/            # shadcn/ui components
│       ├── hooks/             # data hooks (useGetAllPosts, useSearchUsers, useGetRTN…)
│       ├── redux/             # store + slices (auth, post, chat, notification, socket)
│       └── lib/               # config.js (server URL from .env), utils
│
└── server/                    # Express backend
    ├── controllers/           # route logic (user, post, message, notification)
    ├── models/                # Mongoose models (User, Post, Comment, Message, Conversation, Notification)
    ├── routes/                # API routes
    ├── middlewares/           # JWT auth, file upload (multer)
    ├── socket/                # Socket.IO (online users, live messages & notifications)
    ├── utils/                 # database, Cloudinary, notifications, privacy check
    └── index.js               # app entry point
```

---

## 🔌 API Overview

Base URL: `/api/v1` — all routes except register/login/logout need the login cookie.

<details>
<summary><b>User</b> — <code>/user</code></summary>

| Method | Route | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Login (sets cookie) |
| POST | `/logout` | Logout (clears cookie) |
| GET | `/:id/profile` | Profile (posts hidden for private accounts you don't follow) |
| POST | `/profile/edit` | Edit profile (photo, bio, gender) |
| POST | `/privacy` | Switch public / private |
| GET | `/suggested` | Suggested users (friends of friends) |
| GET | `/search?q=` | Search users by username |
| POST | `/followorunfollow/:id` | Follow, unfollow, send or cancel a follow request |
| GET | `/requests` | Your pending follow requests |
| POST | `/requests/:id/accept` | Accept a follow request |
| POST | `/requests/:id/reject` | Delete a follow request |
| GET | `/share-list` | People you can share a post with |
</details>

<details>
<summary><b>Post</b> — <code>/post</code></summary>

| Method | Route | Description |
|---|---|---|
| POST | `/addpost` | Create post (image upload) |
| GET | `/all?type=following\|suggested&cursor=` | Feed, 20 posts per page |
| GET | `/userpost/all` | Your posts |
| GET | `/:id/like` / `/:id/dislike` | Like / unlike |
| POST | `/:id/comment` | Add comment |
| POST | `/:id/comment/all?cursor=` | Comments, 20 per page |
| GET | `/:id/bookmark` | Save / unsave |
| DELETE | `/delete/:id` | Delete your post |
</details>

<details>
<summary><b>Message</b> — <code>/message</code></summary>

| Method | Route | Description |
|---|---|---|
| POST | `/send/:id` | Send a message or share a post (`textMessage`, `postId`) |
| GET | `/all/:id` | Chat with a user |
| GET | `/conversations` | Recent chats with last message |
</details>

<details>
<summary><b>Notification</b> — <code>/notification</code></summary>

| Method | Route | Description |
|---|---|---|
| GET | `/all` | Latest 30 notifications |
| POST | `/read` | Mark all as read |
</details>

---

## 👨‍💻 Author

**Piyush Raj** — [@piyush-raj-07](https://github.com/piyush-raj-07)

If you like this project, give it a ⭐ on GitHub!
