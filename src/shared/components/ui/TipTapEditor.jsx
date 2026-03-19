import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

const MenuBar = ({ editor }) => {
    if (!editor) return null;
    const btnClass = (isActive) => `p-2 rounded hover:bg-slate-100 transition-colors ${isActive ? 'bg-slate-200 text-primary' : 'text-slate-600'}`;
    return (
        <div className="flex items-center gap-1 border-b border-slate-200 p-2 bg-slate-50 rounded-t-xl">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}><Bold size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}><Italic size={18} /></button>
            <div className="w-px h-6 bg-slate-300 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}><List size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}><ListOrdered size={18} /></button>
        </div>
    );
};

export function TipTapEditor({ value, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: 'Mô tả chi tiết về dự án của bạn...' }),
        ],
        // Set initial content directly here to avoid unnecessary effects
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[200px] max-h-[500px] overflow-y-auto p-4',
            },
            handlePaste: (view, event, slice) => {
                const items = event.clipboardData?.items;
                if (!items) return false;
                for (const item of items) {
                    if (item.type.indexOf('image') === 0) {
                        event.preventDefault();
                        alert('Bảo mật băng thông: Vui lòng không copy-paste ảnh trực tiếp. Hãy dùng tính năng Upload Ảnh/Tài Liệu bên dưới.');
                        return true; 
                    }
                }
                return false; 
            },
            handleDrop: (view, event, slice, moved) => {
                const hasFiles = event.dataTransfer?.files?.length > 0;
                if (hasFiles) {
                    event.preventDefault();
                    alert('Tính năng chèn ảnh trực tiếp đang bị khóa. Hãy dùng Upload bên dưới.');
                    return true;
                }
                return false;
            }
        },
        onUpdate: ({ editor }) => {
            // Chỉ trigger onChange, không tự ý mutate external state nếu không cần thiết
            onChange(editor.getHTML());
        },
    });

    // [ENTERPRISE FIX]: Loại bỏ hoàn toàn setTimeout rác. 
    // Chỉ set lại content tĩnh từ bên ngoài khi có sự lệch pha thực sự (ví dụ load data từ API về)
    useEffect(() => {
        if (!editor || value === undefined) return;
        
        const currentEditorContent = editor.getHTML();
        // So sánh nhẹ nhàng để tránh vòng lặp update vô tận
        if (value !== currentEditorContent) {
            // Tham số false để không emit lại sự kiện onUpdate, tránh Infinite Loop
            editor.commands.setContent(value, false);
        }
    }, [value, editor]);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="bg-white" />
        </div>
    );
}