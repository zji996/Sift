// File: /Users/zeyuji/Projects/AI_Toolkit/Sift/frontend/src/FileTree.tsx
import React, { useRef, useEffect } from 'react';

// Define the structure matching the Go FileNode struct
export interface FileNode {
    name: string;
    path: string;
    isDir: boolean;
    children?: FileNode[];
}

interface FileTreeProps {
    nodes: FileNode[];
    selectedPaths: Set<string>;
    onToggleSelect: (path: string, isDir: boolean, checked: boolean) => void;
    level?: number;
    // Optional: Pass down indeterminate state if needed for subfolders, though complex.
    // For now, we only show indeterminate on the main root checkbox in App.tsx.
}

// Helper Component for Tree Item (to manage indeterminate state if needed later)
const FileTreeItem: React.FC<{
    node: FileNode;
    selectedPaths: Set<string>;
    onToggleSelect: (path: string, isDir: boolean, checked: boolean) => void;
    level: number;
}> = ({ node, selectedPaths, onToggleSelect, level }) => {

    const checkboxRef = useRef<HTMLInputElement>(null);
    const isChecked = selectedPaths.has(node.path);

    // Calculate children status for potential indeterminate state
    const childrenPaths = node.isDir && node.children ? getAllPaths(node.children) : [];
    const selectedChildrenCount = childrenPaths.filter(p => selectedPaths.has(p)).length;
    const isIndeterminate = node.isDir &&
                            selectedChildrenCount > 0 &&
                            selectedChildrenCount < childrenPaths.length;


    // Set indeterminate state directly on the DOM element
    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onToggleSelect(node.path, node.isDir, e.target.checked);
    };

    const indent = level * 20; // Indentation level in pixels

    return (
        <li style={{ marginBottom: '3px', paddingLeft: `${indent}px`, listStyleType: 'none' }}>
            <div style={styles.treeItem}>
                 {/* Basic expand/collapse toggle for directories */}
                 {node.isDir && (
                    <span style={styles.toggle}>
                        {/* Add state later if you want individual folder collapse */}
                        {node.children && node.children.length > 0 ? '▹' : ' '} {/* Simple indicator */}
                    </span>
                )}
                <input
                    ref={checkboxRef}
                    type="checkbox"
                    checked={isChecked && !isIndeterminate} // Don't show checkmark if indeterminate
                    onChange={handleCheckboxChange}
                    style={styles.checkbox}
                    title={`Select ${node.isDir ? 'directory' : 'file'}: ${node.name}`}
                    aria-label={`Select ${node.name}`}
                />
                <span style={styles.icon}>{node.isDir ? '📁' : '📄'}</span>
                <span style={styles.name}>{node.name}</span>
            </div>
            {/* Render children recursively */}
            {node.isDir && node.children && node.children.length > 0 && (
                 // Add state later to control visibility based on toggle above
                <FileTree
                    nodes={node.children}
                    selectedPaths={selectedPaths}
                    onToggleSelect={onToggleSelect}
                    level={level + 1} // Increment level for children
                />
            )}
        </li>
    );
};

// Main FileTree component - renders list of FileTreeItems
const FileTree: React.FC<FileTreeProps> = ({ nodes, selectedPaths, onToggleSelect, level = 0 }) => {
    return (
        <ul style={styles.treeList}>
            {nodes.map((node) => (
                <FileTreeItem
                    key={node.path}
                    node={node}
                    selectedPaths={selectedPaths}
                    onToggleSelect={onToggleSelect}
                    level={level}
                 />
            ))}
        </ul>
    );
};


// Helper function (can be moved)
const getAllPaths = (nodes: FileNode[]): string[] => {
    let paths: string[] = [];
    nodes.forEach(node => {
        paths.push(node.path);
        if (node.children) {
            paths = paths.concat(getAllPaths(node.children));
        }
    });
    return paths;
};


// Basic Styles (Consider moving to CSS file)
const styles: { [key: string]: React.CSSProperties } = {
    treeList: {
        listStyleType: 'none',
        paddingLeft: '0', // Base list has no padding, item controls it
        margin: '0',
    },
    treeItem: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'default', // Default cursor for the row
        padding: '2px 0', // Minimal vertical padding
    },
     toggle: { // Style for expand/collapse indicator
        width: '15px', // Reserve space
        display: 'inline-block',
        textAlign: 'center',
        marginRight: '3px',
        cursor: 'pointer', // Make toggle clickable
        color: '#aaa',
    },
    checkbox: {
        marginRight: '6px',
        cursor: 'pointer', // Checkbox is clickable
        flexShrink: 0, // Prevent checkbox from shrinking
    },
    icon: {
        marginRight: '4px',
        flexShrink: 0,
    },
    name: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis', // Prevent long names breaking layout
    },
};


export default FileTree;
// export type { FileNode }; // Already exported above