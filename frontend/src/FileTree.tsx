// File: /Users/zeyuji/Projects/AI_Toolkit/Sift/frontend/src/FileTree.tsx
import React from 'react';

// Define the structure matching the Go FileNode struct
interface FileNode {
    name: string;
    path: string;
    isDir: boolean;
    children?: FileNode[];
}

interface FileTreeProps {
    nodes: FileNode[];
    selectedPaths: Set<string>; // Use a Set for efficient lookups
    onToggleSelect: (path: string, isDir: boolean, checked: boolean) => void; // Pass isDir for folder logic
    level?: number; // For indentation
}

const FileTree: React.FC<FileTreeProps> = ({ nodes, selectedPaths, onToggleSelect, level = 0 }) => {
    const indent = level * 20; // Indentation level in pixels

    return (
        <ul style={{ listStyleType: 'none', paddingLeft: `${indent}px`, margin: '5px 0' }}>
            {nodes.map((node) => (
                <li key={node.path} style={{ marginBottom: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            checked={selectedPaths.has(node.path)}
                            onChange={(e) => onToggleSelect(node.path, node.isDir, e.target.checked)}
                            style={{ marginRight: '8px', cursor: 'pointer' }}
                            title={`Select ${node.isDir ? 'directory' : 'file'}: ${node.name}`}
                        />
                        <span>
                            {node.isDir ? '📁' : '📄'} {/* Basic icons */}
                            <span style={{ marginLeft: '4px' }}>{node.name}</span>
                        </span>
                    </div>
                    {node.isDir && node.children && node.children.length > 0 && (
                         // Only render children if the node itself is selected OR if the parent is selected
                         // This optimization can be tricky. For simplicity, always render if children exist.
                         // If performance becomes an issue with huge trees, optimize visibility later.
                        <FileTree
                            nodes={node.children}
                            selectedPaths={selectedPaths}
                            onToggleSelect={onToggleSelect}
                            level={level + 1}
                        />
                    )}
                </li>
            ))}
        </ul>
    );
};

export default FileTree;
export type { FileNode }; // Export the type for use in App.tsx