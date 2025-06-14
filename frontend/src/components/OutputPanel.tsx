import React from 'react';
import Card from './Card.js';
import Button from './Button.js';

interface OutputTextAreaProps {
    value: string;
    placeholder: string;
    onCopy: () => void;
    disabled: boolean;
}

const OutputTextArea: React.FC<OutputTextAreaProps> = ({
    value,
    placeholder,
    onCopy,
    disabled
}) => (
    <textarea
        readOnly
        value={value}
        placeholder={placeholder}
        className="flex-1 p-4 bg-transparent text-gray-200 border-0 resize-none font-mono text-xs focus:outline-none custom-scrollbar placeholder-gray-500"
    />
);

interface OutputPanelProps {
    fileMapOutput: string;
    fileContentsOutput: string;
    unifiedOutput?: string;
    onCopyFileMap: () => void;
    onCopyFileContents: () => void;
    onCopyUnified?: () => void;
}

const OutputPanel: React.FC<OutputPanelProps> = ({
    fileMapOutput,
    fileContentsOutput,
    unifiedOutput,
    onCopyFileMap,
    onCopyFileContents,
    onCopyUnified
}) => {
    // 如果有统一输出，优先显示统一输出
    if (unifiedOutput) {
        return (
            <Card
                title="AI Prompt"
                icon="🤖"
                variant="strong"
                gradientFrom="purple-600/20"
                gradientTo="pink-600/20"
                headerActions={
                    <Button
                        onClick={onCopyUnified}
                        disabled={!unifiedOutput}
                        variant="primary"
                        size="sm"
                    >
                        复制 AI Prompt
                    </Button>
                }
                className="flex-1"
                bodyClassName="flex flex-col"
            >
                <OutputTextArea
                    value={unifiedOutput}
                    placeholder="统一的 AI Prompt 将在这里显示..."
                    onCopy={onCopyUnified || (() => {})}
                    disabled={!unifiedOutput}
                />
            </Card>
        );
    }

    // 否则显示传统的分离输出
    return (
        <div className="flex flex-col space-y-6 overflow-hidden">
            {/* 文件映射输出 */}
            <Card
                title="文件映射"
                icon="🗺️"
                variant="strong"
                gradientFrom="green-600/20"
                gradientTo="teal-600/20"
                headerActions={
                    <Button
                        onClick={onCopyFileMap}
                        disabled={!fileMapOutput}
                        variant="success"
                        size="sm"
                    >
                        复制
                    </Button>
                }
                className="flex-1"
                bodyClassName="flex flex-col"
            >
                <OutputTextArea
                    value={fileMapOutput}
                    placeholder="<file_map> 将在这里显示..."
                    onCopy={onCopyFileMap}
                    disabled={!fileMapOutput}
                />
            </Card>

            {/* 文件内容输出 */}
            <Card
                title="文件内容"
                icon="📄"
                variant="strong"
                gradientFrom="cyan-600/20"
                gradientTo="blue-600/20"
                headerActions={
                    <Button
                        onClick={onCopyFileContents}
                        disabled={!fileContentsOutput}
                        variant="info"
                        size="sm"
                    >
                        复制
                    </Button>
                }
                className="flex-1"
                bodyClassName="flex flex-col"
            >
                <OutputTextArea
                    value={fileContentsOutput}
                    placeholder="所选文本文件的 <file_contents> 将在这里显示..."
                    onCopy={onCopyFileContents}
                    disabled={!fileContentsOutput}
                />
            </Card>
        </div>
    );
};

export default OutputPanel; 