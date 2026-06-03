import { useState, type FormEvent } from "react";
import type { WishlistDraft, WishlistItem } from "../../data/types";

type CravingLevel = WishlistDraft["cravingLevel"];

interface WishlistFormProps {
  initial?: WishlistItem;
  onSubmit: (draft: WishlistDraft) => void;
  onCancel: () => void;
}

const splitTags = (value: string) =>
  value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

export function WishlistForm({ initial, onSubmit, onCancel }: WishlistFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [cravingLevel, setCravingLevel] = useState<CravingLevel>(initial?.cravingLevel ?? 3);
  const [tags, setTags] = useState(initial?.tags.join("，") ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name: name.trim(),
      image: image.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      cravingLevel: cravingLevel as WishlistDraft["cravingLevel"],
      tags: splitTags(tags),
    });
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">菜名</span>
        <input className="k-input" value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">图片链接</span>
        <input className="k-input" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">来源链接</span>
        <input className="k-input" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">想吃指数：{cravingLevel}</span>
        <input
          className="w-full accent-kitchen-orange"
          max="5"
          min="1"
          type="range"
          value={cravingLevel}
          onChange={(event) => setCravingLevel(Number(event.target.value) as CravingLevel)}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">标签</span>
        <input className="k-input" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="韩餐，晚餐" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold">备注</span>
        <textarea className="k-input min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
      <div className="flex justify-end gap-2 border-t border-stone-200 pt-4">
        <button className="k-button-secondary" type="button" onClick={onCancel}>
          取消
        </button>
        <button className="k-button-primary" type="submit">
          保存想吃
        </button>
      </div>
    </form>
  );
}
