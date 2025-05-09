// This function takes a file name as input and returns the file type based on its extension.

export function getFileType(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const fileTypes: Record<string, string> = {
        "mp4": "video/mp4",
        "webm": "video/webm",
        "ogg": "video/ogg",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "svg": "image/svg+xml",
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        "zip": "archive/zip",
        "rar": "archive/rar",
        "pdf": "text/pdf",
        "txt": "text/plain",
        "c": "code/c",
        "cpp": "code/cpp",
        "py": "code/python",
        "js": "code/javascript",
        "html": "code/html",
        "css": "code/css",
        "md": "markdown/markdown",
        "json": "code/json",
        "xml": "code/xml",
        "csv": "code/csv",
    };
    return extension ? fileTypes[extension] || "unknown" : "unknown";
  };