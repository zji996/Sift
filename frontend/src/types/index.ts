export interface DirectoryEntry {
  name: string;
  path: string; // Relative path
  isDir: boolean;
  size?: number; // 新增：文件大小 (字节)
  children?: DirectoryEntry[];
}

export interface FileContentResponse {
  path: string;
  content: string;
  isBinary: boolean;
  error?: string;
}