import React, { useState } from 'react';

const checklistItems = [
    "Allow camera/mic -> local preview appears.",
    "Open 2nd tab -> remote video appears.",
    "Click Mute/Camera Off -> media toggles.",
    "Send chat message -> appears on both ends.",
    "Click Snapshot -> preview appears with Download/Clear.",
    "Click Next -> new peer search is triggered.",
    "Test on mobile layout -> UI is responsive.",
    "Close one tab -> peer-left message shows."
];

const TestingChecklist: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-t border-gray-700 shrink-0 text-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-2 text-left text-gray-400 hover:bg-gray-700 transition"
            >
                <span className="font-mono text-xs">QA Checklist</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-3 text-xs text-gray-300 bg-gray-900/50">
                    <ul className="list-disc list-inside space-y-1">
                        {checklistItems.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TestingChecklist;
