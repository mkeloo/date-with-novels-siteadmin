"use client";
import React, { useState } from 'react';
import TextEdit from '@/components/reusable/RichTextEditor/TextEdit';

export default function DashboardPage() {
    const [submittedContent, setSubmittedContent] = useState<string | null>(null);

    const handleSubmit = (data: { description: string }) => {
        setSubmittedContent(data.description); // Store HTML content
    };

    return (
        <div className='w-full h-full max-w-7xl mx-auto'>
            <h1 className='text-4xl font-bold text-gray-900 font-sriracha tracking-wider leading-9 text-center my-14'>
                TipTap Editor Page
            </h1>

            <div className='max-w-3xl mx-auto py-5'>
                <TextEdit onSubmit={handleSubmit} />

                {/* Display Submitted Content */}
                {submittedContent && (
                    <div className="mt-6 p-4 border border-gray-300 rounded-md bg-white">
                        <h3 className="text-lg font-bold">Preview:</h3>
                        <div className="prose prose-lg mt-2" dangerouslySetInnerHTML={{ __html: submittedContent }} />

                        {/* Raw HTML Content */}
                        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-md">
                            <h3 className="text-lg font-bold">Raw HTML Content:</h3>
                            <pre className="whitespace-pre-wrap break-words text-sm text-black bg-gray-50 p-2 border border-gray-300 rounded-md">
                                {submittedContent}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
