// File: /Users/zeyuji/Projects/AI_Toolkit/Sift/frontend/src/App.tsx
import React, { useState, useCallback } from 'react';
import './App.css';
import FileTree, { FileNode } from './FileTree'; // Import the new component and type

// Import Wails runtime functions for Go backend calls
// Make sure you've run `wails generate` or `wails dev` after backend changes
import { SelectDirectory, ListDirectory, GenerateContext, CopyToClipboard } from '../wailsjs/go/main/App';
// Import the input type definition if needed (matches Go struct)
import { main } from '../wailsjs/go/models'; // Adjust path if needed


function App() {
    const [selectedDir, setSelectedDir] = useState<string>(""); // Store the root dir path
    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string>(""); // For "Copied!" message

    // --- Handlers ---

    const handleSelectDirectory = async () => {
        setIsLoading(true);
        setFileTree([]); // Clear previous tree
        setSelectedPaths(new Set()); // Clear selection
        setSelectedDir(""); // Clear display path
        setFeedbackMessage("");
        try {
            const dir = await SelectDirectory();
            if (dir) { // Check if a directory was actually selected (not cancelled)
                setSelectedDir(dir);
                const tree = await ListDirectory(dir);
                setFileTree(tree);
            } else {
                 setSelectedDir(""); // Explicitly clear if cancelled
                 console.log("Directory selection cancelled.");
            }
        } catch (error) {
            console.error("Error selecting or listing directory:", error);
            setFeedbackMessage(`Error: ${error}`); // Show error
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSelect = useCallback((path: string, isDir: boolean, checked: boolean) => {
        setSelectedPaths(prevSelected => {
            const newSelected = new Set(prevSelected);
            const updateChildren = (nodes: FileNode[], select: boolean) => {
                nodes.forEach(node => {
                    if (select) {
                        newSelected.add(node.path);
                    } else {
                        newSelected.delete(node.path);
                    }
                    if (node.children) {
                        updateChildren(node.children, select);
                    }
                });
            };

            const findNode = (nodes: FileNode[], targetPath: string): FileNode | null => {
                for (const node of nodes) {
                    if (node.path === targetPath) return node;
                    if (node.children) {
                        const found = findNode(node.children, targetPath);
                        if (found) return found;
                    }
                }
                return null;
            }

            if (checked) {
                newSelected.add(path);
                // If directory, select all children recursively
                if (isDir) {
                    const node = findNode(fileTree, path);
                    if (node?.children) {
                        updateChildren(node.children, true);
                    }
                }
                 // Select parents upwards (optional, but good UX)
                 let currentPath = path;
                 while (true) {
                    const parentPath = currentPath.substring(0, currentPath.lastIndexOf(window.navigator.platform.startsWith('Win') ? '\\' : '/')); // Basic parent path finding
                    if (!parentPath || parentPath === selectedDir || parentPath === currentPath) break; // Stop at root or if no parent
                     const parentNode = findNode(fileTree, parentPath);
                     if(parentNode) {
                        newSelected.add(parentPath);
                        currentPath = parentPath;
                     } else {
                         break; // Parent not in current tree view (shouldn't normally happen)
                     }
                 }

            } else {
                newSelected.delete(path);
                // If directory, deselect all children recursively
                if (isDir) {
                    const node = findNode(fileTree, path);
                     if (node?.children) {
                        updateChildren(node.children, false);
                    }
                }
                // Deselecting a child shouldn't necessarily deselect the parent unless it's the last one.
                // Keeping parent selected when deselecting a child is simpler. Advanced logic can be added later.
            }

            return newSelected;
        });
        setFeedbackMessage(""); // Clear feedback on selection change
    }, [fileTree, selectedDir]); // Add dependencies

    const handleGenerate = async () => {
        if (!selectedDir || selectedPaths.size === 0) {
            setFeedbackMessage("Please select a directory and some files/folders.");
            return;
        }
        setIsLoading(true);
        setFeedbackMessage("Generating...");

        // Prepare input for Go function
        // We need all selected paths, including folders, because the backend
        // uses this list to decide which *files* under selected folders get content.
        const pathsArray = Array.from(selectedPaths);

        // Ensure the type matches wailsjs/go/models -> main.GenerateContextInput if strict typing needed
        const input: main.GenerateContextInput = {
             rootDir: selectedDir,
             selectedPaths: pathsArray
        };

        try {
            const contextString = await GenerateContext(input);
            await CopyToClipboard(contextString);
            setFeedbackMessage("Context copied to clipboard!");
        } catch (error) {
            console.error("Error generating or copying context:", error);
            setFeedbackMessage(`Error: ${error}`);
        } finally {
            setIsLoading(false);
            // Optional: clear feedback message after a delay
            setTimeout(() => setFeedbackMessage(""), 3000);
        }
    };

    // --- Render ---

    return (
        <div id="App" style={styles.appContainer}>
            <h1 style={styles.title}>Sift - AI Context Builder</h1>

            {/* Controls */}
            <div style={styles.controls}>
                <button onClick={handleSelectDirectory} disabled={isLoading} style={styles.button}>
                    {isLoading ? "Loading..." : "Select Project Directory"}
                </button>
                {selectedDir && <p style={styles.selectedPath}>Selected: {selectedDir}</p>}
            </div>

            {/* File Tree Area */}
            <div style={styles.fileTreeContainer}>
                {isLoading && fileTree.length === 0 && <p>Loading directory...</p>}
                {!isLoading && !selectedDir && <p>Select a directory to view files.</p>}
                {selectedDir && fileTree.length === 0 && !isLoading && <p>Directory is empty or filtered.</p>}

                {fileTree.length > 0 && (
                    <FileTree
                        nodes={fileTree}
                        selectedPaths={selectedPaths}
                        onToggleSelect={handleToggleSelect}
                    />
                )}
            </div>

            {/* Generate Button & Feedback */}
            <div style={styles.generateArea}>
                 {/* Placeholder for future settings
                 <div style={styles.settingsArea}>
                     <h4>Settings (Placeholder)</h4>
                     <label>API Key: <input type="password" placeholder="sk-..."/></label><br/>
                     <label>Endpoint: <input type="text" placeholder="https://api.openai.com/v1"/></label>
                 </div>
                 */}
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || selectedPaths.size === 0}
                    style={{ ...styles.button, ...styles.generateButton }}
                >
                    {isLoading ? "Generating..." : "Generate & Copy Context"}
                </button>
                {feedbackMessage && <p style={styles.feedback}>{feedbackMessage}</p>}
            </div>
        </div>
    );
}

// --- Basic Inline Styles (Consider moving to App.css for larger projects) ---
const styles: { [key: string]: React.CSSProperties } = {
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        padding: '20px',
        boxSizing: 'border-box', // Include padding in height
        overflow: 'hidden', // Prevent body scroll
        textAlign: 'left', // Override global center align from style.css for layout
    },
    title: {
        textAlign: 'center',
        marginTop: 0,
        marginBottom: '20px',
        color: '#eee'
    },
    controls: {
        marginBottom: '15px',
        textAlign: 'center', // Center the select button
    },
    selectedPath: {
         marginTop: '10px',
         fontSize: '0.9em',
         color: '#aaa',
         wordBreak: 'break-all', // Prevent long paths from overflowing
    },
    fileTreeContainer: {
        flexGrow: 1, // Takes up available space
        border: '1px solid #444',
        borderRadius: '5px',
        padding: '10px',
        marginBottom: '15px',
        overflowY: 'auto', // Enable scrolling for the tree
        backgroundColor: '#2a3a4a' // Slightly different background
    },
    generateArea: {
        textAlign: 'center', // Center the generate button
    },
    settingsArea: { // Placeholder styling
        border: '1px dashed #555',
        padding: '10px',
        marginBottom: '15px',
        textAlign: 'left',
    },
    button: {
        padding: '8px 15px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#4a90e2',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.2s ease',
    },
     generateButton: {
         backgroundColor: '#50e3c2',
         color: '#111'
     },
    feedback: {
        marginTop: '10px',
        color: '#50e3c2', // Use a noticeable color for feedback
        textAlign: 'center',
        minHeight: '1.2em', // Reserve space to prevent layout jumps
    }
};

// Add :disabled and :hover styles to App.css if needed
// Example in App.css:
// button:disabled { background-color: #555; cursor: not-allowed; }
// button:hover:not(:disabled) { background-color: #6aaaf0; }
// button.generateButton:hover:not(:disabled) { background-color: #72f5d5; }


export default App;