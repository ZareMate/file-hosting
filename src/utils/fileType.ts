// This function takes a file name as input and returns the file type based on its extension.
import mime from "mime-types";

export function getFileType(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const fileTypes: Record<string, string> = {
        // Video
        "mp4": "video/mp4",
        "webm": "video/webm",
        "ogg": "video/ogg",
        // Image
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "svg": "image/svg+xml",
        // Audio
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        // Archive
        "zip": "archive/zip",
        "rar": "archive/rar",
        "jar": "archive/jar",
        "iso": "archive/iso",
        // Text
        "pdf": "text/pdf",
        "txt": "text/plain",
        // Code
        "c": "code/c",
        "cpp": "code/cpp",
        "py": "code/python",
        "js": "code/javascript",
        "html": "code/html",
        "css": "code/css",
        "json": "code/json",
        "xml": "code/xml",
        "csv": "code/csv",
        // Markdown
        "md": "markdown/markdown",
        // Applications
        "exe": "application/executable",
        "apk": "application/android",
    };
    return extension ? fileTypes[extension] ||
    //get the file type using the mime type library
    mime.lookup(extension) || "application/octet-stream" : "application/octet-stream";

  };