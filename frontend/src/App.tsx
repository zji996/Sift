// File: /Users/zeyuji/Projects/AI_Toolkit/Sift/frontend/src/App.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import './App.css';
import FileTree, { FileNode } from './FileTree'; // Import the updated component

import { SelectDirectory, ListDirectory, GenerateContext, CopyToClipboard } from '../wailsjs/go/main/App';
import { main } from '../wailsjs/go/models';

// Helper function (keep or import from FileTree.tsx if moved)
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


function App() {
    const [selectedDir, setSelectedDir] = useState<string>("");
    const [fileTree, setFileTree] = useState<FileNode[]>([]); // This holds children of root
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [isTreeExpanded, setIsTreeExpanded] = useState<boolean>(true); // Renamed for clarity

    // Ref for the root checkbox indeterminate state
    const rootCheckboxRef = useRef<HTMLInputElement>(null);

    // --- Memoized calculations ---
    const allVisibleFilePaths = useMemo(() => {
        // Calculate paths based on the *filtered* tree received from Go
        if (!fileTree || fileTree.length === 0) return [];
        return getAllPaths(fileTree);
    }, [fileTree]);

    const numSelected = selectedPaths.size;
    const numTotalVisible = allVisibleFilePaths.length;

    const selectionState: 'all' | 'none' | 'indeterminate' = useMemo(() => {
        if (numTotalVisible === 0 || numSelected === 0) return 'none';
        if (numSelected === numTotalVisible) return 'all';
        return 'indeterminate';
    }, [numSelected, numTotalVisible]);

    // --- Effect to set indeterminate state on root checkbox ---
    useEffect(() => {
        if (rootCheckboxRef.current) {
            rootCheckboxRef.current.indeterminate = (selectionState === 'indeterminate');
            // Also ensure checked state is correct based on selectionState
            rootCheckboxRef.current.checked = (selectionState === 'all');
        }
    }, [selectionState]);


    // --- Handlers ---
    const handleSelectDirectory = async () => {
        setIsLoading(true);
        setFileTree([]);
        setSelectedPaths(new Set());
        setSelectedDir("");
        setFeedbackMessage("");
        setIsTreeExpanded(true); // Expand tree on new selection
        try {
            const dir = await SelectDirectory();
            if (dir) {
                setSelectedDir(dir);
                // Go backend now handles filtering including .gitignore and dotfiles
                const tree = await ListDirectory(dir);
                setFileTree(tree); // Set the children of the root
            } else {
                 setSelectedDir("");
                 console.log("Directory selection cancelled.");
            }
        } catch (error: any) {
            console.error("Error selecting or listing directory:", error);
            setFeedbackMessage(`Error: ${error.message || String(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSelect = useCallback((path: string, isDir: boolean, checked: boolean) => {
        setSelectedPaths(prevSelected => {
            const newSelected = new Set(prevSelected);
            // Recursive function to update children
            const updateChildren = (nodes: FileNode[], select: boolean) => {
                nodes.forEach(node => {
                    // Only modify if it's not already in the desired state? No, overwrite.
                    if (select) { newSelected.add(node.path); }
                    else { newSelected.delete(node.path); }

                    if (node.children) { updateChildren(node.children, select); }
                });
            };

             // Recursive function to find node (needed for children update)
             const findNode = (nodes: FileNode[], targetPath: string): FileNode | null => {
                for (const node of nodes) {
                    if (node.path === targetPath) return node;
                    if (node.children) {
                        const found = findNode(node.children, targetPath);
                        if (found) return found;
                    }
                }
                return null;
            };

            // Recursive function to update parents upwards (only for checking)
             const updateParents = (startPath: string, select: boolean) => {
                if (!select) return; // Only select parents when checking a child

                 let currentPath = startPath;
                 while (true) {
                     const separator = currentPath.includes('\\') ? '\\' : '/';
                     const lastSeparatorIndex = currentPath.lastIndexOf(separator);
                     if (lastSeparatorIndex <= 0) break;

                     const parentPath = currentPath.substring(0, lastSeparatorIndex);
                     if (!parentPath || parentPath === selectedDir || parentPath.length < selectedDir.length) break;

                     const parentNode = findNode(fileTree, parentPath); // Check against the visible tree
                     if (parentNode) {
                         // Check if all siblings of the current node under the parent are now checked
                         // This logic is complex. Simpler: just add the parent.
                          newSelected.add(parentPath);
                          currentPath = parentPath;
                     } else {
                         break; // Parent not in visible tree
                     }
                 }
             };


            const node = findNode(fileTree, path); // Find the node in the *current* tree

            if (checked) {
                newSelected.add(path);
                if (node?.isDir && node.children) {
                    updateChildren(node.children, true);
                }
                updateParents(path, true);
            } else {
                newSelected.delete(path);
                 if (node?.isDir && node.children) {
                    updateChildren(node.children, false);
                }
                // Deselecting parents is tricky. If you uncheck a file,
                // should the parent become indeterminate? Yes. If you uncheck
                // the *last* selected child of a parent, should the parent become unchecked? Maybe.
                // The indeterminate logic handles the visual state based on children.
                // We don't need explicit parent deselection logic here if indeterminate works.
            }

            return newSelected;
        });
        setFeedbackMessage("");
    }, [fileTree, selectedDir]); // Dependencies for useCallback


    const handleSelectAllToggle = () => {
        // This toggle applies to the *visible* files from the filtered tree
        if (selectionState === 'all') {
            setSelectedPaths(new Set()); // Deselect all
        } else {
            // Select all paths derived from the current fileTree
            setSelectedPaths(new Set(allVisibleFilePaths));
        }
         setFeedbackMessage("");
    };

    const handleGenerate = async () => {
        if (!selectedDir || selectedPaths.size === 0) {
            setFeedbackMessage("Please select a directory and some files/folders.");
            return;
        }
        setIsLoading(true);
        setFeedbackMessage("Generating...");

        // Pass only the currently selected paths to the backend
        const pathsArray = Array.from(selectedPaths);

        const input: main.GenerateContextInput = {
             rootDir: selectedDir,
             // Backend now validates these against isHidden again
             selectedPaths: pathsArray
        };

        try {
            const contextString = await GenerateContext(input);
            await CopyToClipboard(contextString);
            setFeedbackMessage("Context copied to clipboard!");
        } catch (error: any) {
            console.error("Error generating or copying context:", error);
            setFeedbackMessage(`Error: ${error.message || String(error)}`);
        } finally {
            setIsLoading(false);
            setTimeout(() => setFeedbackMessage(""), 3000);
        }
    };

    const toggleTreeExpansion = () => {
        setIsTreeExpanded(prev => !prev);
    };

    const getBaseDirName = (dir: string): string => {
         if (!dir) return "";
         const separator = dir.includes('\\') ? '\\' : '/';
         return dir.substring(dir.lastIndexOf(separator) + 1);
    };

    // --- Render ---
    return (
        <div id="App" style={styles.appContainer}>
            {/* Top Bar: Select Dir Button and Title */}
             <div style={styles.topBar}>
                 <button onClick={handleSelectDirectory} disabled={isLoading} style={{...styles.button, ...styles.selectButton}}>
                    {isLoading && !selectedDir ? "Loading..." : "Select Project"}
                </button>
                 <h1 style={styles.title}>Sift Context Builder</h1>
                 {/* Placeholder for potential future actions */}
                 <div style={{width: '100px'}}></div>
             </div>


            {/* File Tree Area */}
            <div style={styles.fileTreeContainer} className="file-tree-container">
                {!selectedDir && !isLoading && <p style={styles.placeholderText}>Select a project directory to begin.</p>}
                {isLoading && !selectedDir && <p style={styles.placeholderText}>Loading...</p>}
                {selectedDir && isLoading && fileTree.length === 0 && <p style={styles.placeholderText}>Loading directory structure...</p>}
                 {selectedDir && !isLoading && fileTree.length === 0 && <p style={styles.placeholderText}>Directory appears empty or all items hidden by filters.</p>}

                {/* Render Root Node + Tree if directory is selected and not loading */}
                {selectedDir && !isLoading && fileTree.length >= 0 && ( // Render root even if tree is empty initially
                    <ul style={styles.rootList}> {/* Use UL for semantic consistency */}
                        <li style={styles.rootListItem}>
                            {/* Root Item Controls */}
                            <div style={styles.rootItemControls}>
                                <span onClick={toggleTreeExpansion} style={styles.rootToggle} title={isTreeExpanded ? "Collapse All" : "Expand All"}>
                                    {isTreeExpanded ? '▾' : '▸'}
                                </span>
                                <input
                                    ref={rootCheckboxRef}
                                    type="checkbox"
                                    style={styles.rootCheckbox}
                                    // Checked state is handled by the useEffect based on selectionState
                                    onChange={handleSelectAllToggle}
                                    title={selectionState === 'all' ? "Deselect All" : "Select All"}
                                    disabled={fileTree.length === 0} // Disable if nothing to select
                                />
                                <span style={styles.rootIcon}>{' '}</span> {/* Placeholder to align with file icons */}
                                <span style={styles.rootName}>{getBaseDirName(selectedDir)}</span>
                                 {/* Add other root icons here if needed (e.g., Refresh) */}
                            </div>

                             {/* Render Actual File Tree (conditionally) */}
                            {isTreeExpanded && fileTree.length > 0 && (
                                <div style={styles.nestedTree}>
                                    <FileTree
                                        nodes={fileTree} // Pass only children
                                        selectedPaths={selectedPaths}
                                        onToggleSelect={handleToggleSelect}
                                        level={0} // Start nested tree at level 0 indentation relative to root padding
                                    />
                                </div>
                            )}
                            {isTreeExpanded && fileTree.length === 0 && !isLoading && (
                                 <p style={styles.emptyTreeText}>No visible files or folders found.</p>
                            )}
                        </li>
                    </ul>
                 )}
            </div>


            {/* Generate Button & Feedback */}
            <div style={styles.generateArea}>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || numSelected === 0}
                    style={{ ...styles.button, ...styles.generateButton }}
                    title={numSelected === 0 ? "Select files or folders first" : "Generate context and copy to clipboard"}
                >
                    {isLoading ? "Generating..." : `Generate & Copy Context (${numSelected} items)`}
                </button>
                {feedbackMessage && <p style={styles.feedback}>{feedbackMessage}</p>}
            </div>
        </div>
    );
}

// --- Styles --- (Adjust as needed)
const styles: { [key: string]: React.CSSProperties } = {
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        padding: '0', // Remove padding from container, control inside sections
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor: '#2a3a4a', // Darker background overall
        color: '#e0e0e0',
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 15px',
        backgroundColor: '#1b2636', // Very dark top bar
        borderBottom: '1px solid #3a4a5a',
        flexShrink: 0,
    },
    title: {
        margin: 0,
        color: '#e0e0e0',
        fontSize: '1.2em', // Smaller title in top bar
        textAlign: 'center',
    },
    selectButton: {
        width: '100px', // Fixed width for the button
        textAlign: 'center',
        backgroundColor: '#4a90e2',
        margin: 0, // Remove margin if controlled by flex space-between
    },
    fileTreeContainer: {
        flexGrow: 1, // Takes up remaining space
        padding: '10px',
        overflowY: 'auto',
        backgroundColor: '#223040', // Dark tree background
    },
    placeholderText: {
        color: '#778899', // Lighter grey for placeholder
        textAlign: 'center',
        marginTop: '20px',
    },
     rootList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    rootListItem: {
        // Container for the root node's controls and its nested tree
    },
    rootItemControls: {
        display: 'flex',
        alignItems: 'center',
        padding: '4px 0',
        cursor: 'default',
    },
    rootToggle: {
        width: '15px',
        display: 'inline-block',
        textAlign: 'center',
        marginRight: '3px',
        cursor: 'pointer',
        color: '#c5d8e9',
        fontSize: '1.1em',
    },
    rootCheckbox: {
         marginRight: '6px',
         cursor: 'pointer',
         flexShrink: 0,
    },
    rootIcon: { // Keep spacing consistent with FileTreeItem
        width: '1em', // Adjust as needed to match folder/file icon width
        marginRight: '4px',
        display: 'inline-block',
    },
    rootName: {
        fontWeight: 'bold',
        color: '#e0e0e0',
    },
    nestedTree: {
       paddingLeft: '15px', // Indent the actual FileTree component relative to root controls
       borderLeft: '1px solid #445566', // Optional visual indicator for nesting
       marginLeft: '7px', // Align border with the toggle arrow center
       marginTop: '4px',
    },
     emptyTreeText: {
        paddingLeft: '30px', // Indent message
        color: '#778899',
        fontStyle: 'italic',
        fontSize: '0.9em',
        marginTop: '5px',
    },
    generateArea: {
        textAlign: 'center',
        padding: '15px',
        borderTop: '1px solid #3a4a5a',
        backgroundColor: '#1b2636', // Match top bar
        flexShrink: 0,
    },
    button: {
        padding: '7px 14px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#556a80',
        color: 'white',
        cursor: 'pointer',
        fontSize: '0.9em',
        transition: 'background-color 0.2s ease, opacity 0.2s ease',
        margin: '0 5px', // Keep margin for spacing if multiple buttons exist
    },
     generateButton: {
         backgroundColor: '#50e3c2',
         color: '#111827',
         fontWeight: 'bold',
     },
    feedback: {
        marginTop: '10px',
        color: '#50e3c2',
        textAlign: 'center',
        minHeight: '1.1em',
        fontSize: '0.9em',
    }
};

export default App;