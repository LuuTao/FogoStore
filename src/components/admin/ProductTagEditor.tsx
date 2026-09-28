'use client';
import { PRODUCT_TAGS } from '@/lib/productTags';

export function ProductTagEditor({ value, onChange, availableTags = PRODUCT_TAGS }: { value: string[]; onChange: (tags: string[]) => void; availableTags?: readonly string[] }) {
  return <fieldset className="space-y-2">
    <legend className="font-bold">Tag sản phẩm</legend>
    <div className="flex flex-wrap gap-3">
      {availableTags.map(tag => <label key={tag} className="flex items-center gap-1.5 text-sm">
        <input type="checkbox" checked={value.includes(tag)} onChange={e => onChange(e.target.checked ? [...value, tag] : value.filter(t => t !== tag))} />
        {tag}
      </label>)}
    </div>
    <p className="text-xs text-gray-500">Tag áp dụng cho mọi biến thể của sản phẩm. Like New 99% hoặc CPO xếp vào hàng cũ; Chính hãng hoặc New Seal xếp vào máy mới. Khi có cả hai nhóm, hàng cũ được ưu tiên.</p>
  </fieldset>;
}
