import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DirectoryEntry } from '../types/index.js';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface DirectoryTreeNodeProps {
  node: DirectoryEntry;
  selectedPaths: Set<string>;
  onToggleSelect: (path: string, isDir: boolean, children?: DirectoryEntry[]) => void;
  level: number;
}

// 辅助函数：格式化字节大小
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// 获取文件类型图标颜色
const getFileIconColor = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const colorMap: { [key: string]: string } = {
    'js': 'text-yellow-400',
    'jsx': 'text-yellow-400',
    'ts': 'text-blue-400',
    'tsx': 'text-blue-400',
    'py': 'text-green-400',
    'go': 'text-cyan-400',
    'rs': 'text-orange-400',
    'md': 'text-gray-300',
    'json': 'text-yellow-500',
    'css': 'text-pink-400',
    'scss': 'text-pink-400',
    'html': 'text-orange-300',
    'vue': 'text-green-500',
    'svelte': 'text-red-400',
  };
  return colorMap[ext || ''] || 'text-sky-400';
};

const DirectoryTreeNode: React.FC<DirectoryTreeNodeProps> = ({ node, selectedPaths, onToggleSelect, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const isSelected = selectedPaths.has(node.path);

  // 设置复选框的 indeterminate 状态
  useEffect(() => {
    if (checkboxRef.current && node.isDir && node.children) {
      const selectedChildren = node.children.filter(child => selectedPaths.has(child.path));
      const isPartiallySelected = selectedChildren.length > 0 && selectedChildren.length < node.children.length;
      checkboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [selectedPaths, node.children, node.isDir]);

  const handleToggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.isDir) {
      setIsOpen(!isOpen);
    }
  };
  
  const handleSelect = () => {
    onToggleSelect(node.path, node.isDir, node.children);
  };

  // 判断是否部分选择
  const isPartiallySelected = node.isDir && node.children && 
    node.children.some(child => selectedPaths.has(child.path)) && 
    !node.children.every(child => selectedPaths.has(child.path));

  // 动画变体
  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  const childrenVariants = {
    initial: { height: 0, opacity: 0 },
    animate: { 
      height: 'auto', 
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
        opacity: { duration: 0.2, delay: 0.1 }
      }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: {
        height: { duration: 0.2 },
        opacity: { duration: 0.1 }
      }
    }
  };

  const chevronVariants = {
    closed: { rotate: 0 },
    open: { rotate: 90 }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className={`tree-item flex items-center py-2 px-2 my-1 rounded-lg cursor-pointer transition-all duration-300 ease-out group
                    ${isSelected ? 'selected bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30' : 
                      'hover:bg-white/5 border border-transparent'}`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={handleSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* 选择指示器 */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isSelected ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* 展开/折叠按钮 */}
        {node.isDir ? (
          <motion.button 
            onClick={handleToggleOpen} 
            className="mr-2 p-1 rounded-md hover:bg-white/10 focus:outline-none text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              variants={chevronVariants}
              animate={isOpen ? "open" : "closed"}
              transition={{ duration: 0.2 }}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </motion.div>
          </motion.button>
        ) : (
          <span className="w-6 mr-2" />
        )}

        {/* 复选框 */}
        <motion.div className="relative">
          <input
            ref={checkboxRef}
            type="checkbox"
            className="checkbox-apple mr-3"
            checked={isSelected}
            onChange={handleSelect}
            onClick={(e) => e.stopPropagation()}
          />
          {isPartiallySelected && (
            <motion.div
              className="absolute inset-0 w-4 h-4 bg-blue-500/60 rounded border-2 border-blue-500 mr-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-0.5 bg-white rounded-full" />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 文件/文件夹图标 */}
        <motion.div
          className="mr-3"
          whileHover={{ scale: 1.1, rotate: isHovered ? 5 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {node.isDir ? (
            <FolderIcon className="h-5 w-5 text-yellow-500 icon-hover" />
          ) : (
            <DocumentIcon className={`h-5 w-5 icon-hover ${getFileIconColor(node.name)}`} />
          )}
        </motion.div>

        {/* 文件名 */}
        <span className="flex-1 truncate text-gray-200 font-medium transition-colors group-hover:text-white">
          {node.name}
        </span>

        {/* 文件大小 */}
        {!node.isDir && node.size !== undefined && (
          <motion.span 
            className="file-size-badge text-xs font-mono ml-3 px-2 py-1 rounded-full flex-shrink-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            {formatBytes(node.size)}
          </motion.span>
        )}

        {/* 悬浮时的发光效果 */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* 子级目录 */}
      <AnimatePresence>
        {node.isDir && isOpen && node.children && (
          <motion.div
            variants={childrenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="pl-2 border-l border-gray-600/30 ml-4">
              {node.children.map((child: DirectoryEntry, index) => (
                <motion.div
                  key={child.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  <DirectoryTreeNode
                    node={child}
                    selectedPaths={selectedPaths}
                    onToggleSelect={onToggleSelect}
                    level={level + 1}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 使用 React.memo 优化性能，避免不必要的重新渲染
export default React.memo(DirectoryTreeNode);