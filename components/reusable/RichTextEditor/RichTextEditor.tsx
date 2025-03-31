"use client";
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ImageResize from 'tiptap-extension-resize-image';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import ListItem from '@tiptap/extension-list-item';
import Toolbar from './Toolbar';


interface RichTextEditorIndexProps {
    content: string;
    onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorIndexProps) {

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                bulletList: false,
                orderedList: false,
                horizontalRule: false,
                // image: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Heading.configure({
                levels: [1, 2, 3, 4, 5],
            }),
            OrderedList.configure({
                HTMLAttributes: {
                    class: 'list-decimal ml-3'
                }
            }),
            BulletList.configure({
                HTMLAttributes: {
                    class: 'list-disc ml-3'
                }
            }),
            ListItem,
            Highlight,
            // Image,
            ImageResize,
            HorizontalRule,
        ],
        content,
        onUpdate({ editor }) {
            // console.log(editor.getHTML());
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'min-h-[156px] border rounded-md py-2 px-3'
            },
        },
        immediatelyRender: false,
    })


    return (
        <div className=''>
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
