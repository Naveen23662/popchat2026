import React from 'react';

interface SnapshotPreviewProps {
    snapshot: string;
    onClear: () => void;
}

const SnapshotPreview: React.FC<SnapshotPreviewProps> = ({ snapshot, onClear }) => {
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = snapshot;
        link.download = 'popchat-snapshot.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-3 border-t border-gray-700 space-y-2 shrink-0">
             <h3 className="text-sm font-bold">Snapshot Preview</h3>
            <img src={snapshot} alt="Snapshot" className="rounded-md w-full" />
            <div className="flex gap-2">
                <button 
                    onClick={handleDownload}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-1.5 px-3 rounded-md transition"
                >
                    Download
                </button>
                <button 
                    onClick={onClear}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold py-1.5 px-3 rounded-md transition"
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default SnapshotPreview;
