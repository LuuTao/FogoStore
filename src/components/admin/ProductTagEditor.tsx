'use client';

import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PRODUCT_TAGS } from '@/lib/productTags';

const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 40;

export function ProductTagEditor({
  value,
  onChange,
  availableTags = PRODUCT_TAGS,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  availableTags?: readonly string[];
}) {
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const options = useMemo(
    () => Array.from(new Set([...availableTags, ...value])).filter(Boolean),
    [availableTags, value],
  );

  const toggleTag = (tag: string) => {
    setError('');
    if (value.includes(tag)) {
      onChange(value.filter((item) => item !== tag));
      return;
    }
    if (value.length >= MAX_TAGS) {
      setError(`Mỗi sản phẩm được gắn tối đa ${MAX_TAGS} tag.`);
      return;
    }
    onChange([...value, tag]);
  };

  const addCustomTag = () => {
    const tag = newTag.replace(/\s+/g, ' ').trim();
    setError('');
    if (!tag) return;
    if (tag.length > MAX_TAG_LENGTH) {
      setError(`Tên tag không được vượt quá ${MAX_TAG_LENGTH} ký tự.`);
      return;
    }
    if (/[<>]/.test(tag)) {
      setError('Tên tag không được chứa ký tự < hoặc >.');
      return;
    }
    const existing = options.find((item) => item.toLocaleLowerCase('vi-VN') === tag.toLocaleLowerCase('vi-VN'));
    if (existing) {
      if (!value.includes(existing)) toggleTag(existing);
      setNewTag('');
      return;
    }
    if (value.length >= MAX_TAGS) {
      setError(`Mỗi sản phẩm được gắn tối đa ${MAX_TAGS} tag.`);
      return;
    }
    onChange([...value, tag]);
    setNewTag('');
  };

  return (
    <fieldset className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/60 p-3">
      <legend className="px-1 font-bold text-gray-800">Tag hiển thị trên sản phẩm</legend>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#d70018] px-2.5 py-1 text-xs font-bold text-white">
              {tag}
              <button type="button" onClick={() => toggleTag(tag)} aria-label={`Bỏ tag ${tag}`} className="rounded-full p-0.5 hover:bg-white/20">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Sản phẩm chưa được gắn tag.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((tag) => {
          const selected = value.includes(tag);
          return (
            <button
              type="button"
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                selected
                  ? 'border-[#d70018] bg-red-50 text-[#d70018]'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
              }`}
            >
              {selected ? '✓ ' : '+ '}{tag}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          value={newTag}
          onChange={(event) => setNewTag(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addCustomTag();
            }
          }}
          maxLength={MAX_TAG_LENGTH}
          placeholder="Nhập tag mới, ví dụ: Bán chạy"
          className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-[#d70018]"
        />
        <button type="button" onClick={addCustomTag} className="inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-black">
          <Plus size={14} /> Thêm tag
        </button>
      </div>

      {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
      <p className="text-[11px] leading-relaxed text-gray-500">
        Tag áp dụng cho mọi cấu hình của sản phẩm và sẽ hiển thị ở thẻ sản phẩm lẫn trang chi tiết.
        “Like New 99%” hoặc “CPO” được xếp vào hàng cũ.
      </p>
    </fieldset>
  );
}
