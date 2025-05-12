# File Hosting App

This is a [T3 Stack](https://create.t3.gg/) project. It provides a file hosting service where users can upload, download, and manage files.

## Features

- User authentication with NextAuth.js
- File upload and download using MinIO
- File metadata management with Prisma
- Real-time updates using Server-Sent Events (SSE)
- Responsive UI built with Tailwind CSS

## Technologies Used

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [MinIO](https://min.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## API Documentation

### **Download File**

**Endpoint**: `/api/files/download`

**Method**: `GET`

**Query Parameters**:
- `fileId` (required): The ID of the file to download.
- `fileName` (required): The name of the file to download.

**Response**:
- **200 OK**: Returns the file as a binary stream.
- **400 Bad Request**: If `fileId` or `fileName` is missing.
- **404 Not Found**: If the file does not exist.
- **500 Internal Server Error**: If there is an error fetching the file.

---

### **Serve File**

**Endpoint**: `/api/files/serv`

**Method**: `GET`

**Query Parameters**:
- `id` (required): The ID of the file to serve.

**Response**:
- **200 OK**: Returns the file as a binary stream with the appropriate MIME type.
- **400 Bad Request**: If `id` is missing.
- **404 Not Found**: If the file does not exist.
- **500 Internal Server Error**: If there is an error fetching the file.

---

### **List Files**

**Endpoint**: `/api/files`

**Method**: `GET`

**Response**:
- **200 OK**: Returns a list of files with metadata.
- **500 Internal Server Error**: If there is an error fetching the files.

---

### **Real-Time Updates**

**Endpoint**: `/api/files/stream`

**Method**: `GET`

**Response**:
- **200 OK**: Streams real-time updates for file additions and removals.

---

## How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/file-hosting.git
   cd file-hosting
