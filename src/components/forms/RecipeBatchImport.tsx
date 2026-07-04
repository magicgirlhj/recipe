import { AlertCircle, CheckCircle2, ClipboardPaste, FileText, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Recipe, RecipeDraft } from "../../data/types";
import {
  parseRecipeBatchMarkdown,
  recipeBatchImportTemplate,
  type RecipeBatchImportItem,
} from "../../utils/recipeImport";

interface RecipeBatchImportProps {
  existingRecipes: Recipe[];
  onCancel: () => void;
  onImport: (drafts: RecipeDraft[]) => void;
}

function recipeKey(name = "") {
  return name.trim().toLowerCase();
}

function isImportable(item: RecipeBatchImportItem) {
  return Boolean(item.draft && !item.errors.length);
}

export function RecipeBatchImport({ existingRecipes, onCancel, onImport }: RecipeBatchImportProps) {
  const [text, setText] = useState("");
  const [items, setItems] = useState<RecipeBatchImportItem[]>([]);
  const [batchWarnings, setBatchWarnings] = useState<string[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
  const [hasParsed, setHasParsed] = useState(false);

  const existingNames = useMemo(
    () => new Set(existingRecipes.map((recipe) => recipeKey(recipe.name)).filter(Boolean)),
    [existingRecipes],
  );

  const selectedDrafts = items
    .filter((item) => selectedIndexes.has(item.index))
    .map((item) => item.draft)
    .filter((draft): draft is RecipeDraft => Boolean(draft));

  function parseText() {
    const result = parseRecipeBatchMarkdown(text);
    const nextSelected = new Set<number>();

    result.items.forEach((item) => {
      const name = item.draft?.name ?? item.recipe.name ?? "";
      if (isImportable(item) && !existingNames.has(recipeKey(name))) {
        nextSelected.add(item.index);
      }
    });

    setItems(result.items);
    setBatchWarnings(result.warnings);
    setSelectedIndexes(nextSelected);
    setHasParsed(true);
  }

  function toggleItem(index: number) {
    setSelectedIndexes((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function importSelected() {
    if (!selectedDrafts.length) return;
    onImport(selectedDrafts);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-orange-200 bg-orange-50/70 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-kitchen-orange">
            <Sparkles size={19} />
          </div>
          <div>
            <h3 className="font-black">Markdown 批量导入</h3>
            <p className="mt-1 text-sm leading-6 text-kitchen-muted">
              每个菜谱用一级标题开头，例如「# 番茄炒蛋」。多个菜谱之间可以用一行「---」分隔。
            </p>
          </div>
        </div>
      </section>

      <label className="block">
        <span className="mb-1 block text-sm font-bold">粘贴多个菜谱</span>
        <textarea
          className="k-input min-h-80 font-mono text-xs leading-5"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setItems([]);
            setBatchWarnings([]);
            setSelectedIndexes(new Set());
            setHasParsed(false);
          }}
          placeholder={recipeBatchImportTemplate}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button className="k-button-primary min-h-11" type="button" onClick={parseText}>
          <ClipboardPaste size={17} />
          识别 Markdown
        </button>
        <button
          className="k-button-secondary min-h-11"
          type="button"
          onClick={() => {
            setText(recipeBatchImportTemplate);
            setItems([]);
            setBatchWarnings([]);
            setSelectedIndexes(new Set());
            setHasParsed(false);
          }}
        >
          <FileText size={17} />
          填入示例
        </button>
        <button
          className="k-button-secondary min-h-11 text-red-600 hover:bg-red-50"
          type="button"
          onClick={() => {
            setText("");
            setItems([]);
            setBatchWarnings([]);
            setSelectedIndexes(new Set());
            setHasParsed(false);
          }}
        >
          <Trash2 size={17} />
          清空
        </button>
      </div>

      {batchWarnings.length ? (
        <div className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800">
          {batchWarnings.join(" ")}
        </div>
      ) : null}

      {hasParsed ? (
        <section className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-black">识别结果</h3>
              <p className="text-sm text-kitchen-muted">
                共识别 {items.length} 个菜谱，已选择 {selectedDrafts.length} 个可导入项。
              </p>
            </div>
            {items.length ? (
              <button
                className="text-sm font-bold text-kitchen-muted hover:text-kitchen-ink"
                type="button"
                onClick={() => {
                  const nextSelected = new Set<number>();
                  items.forEach((item) => {
                    if (isImportable(item)) nextSelected.add(item.index);
                  });
                  setSelectedIndexes(nextSelected);
                }}
              >
                选择全部可导入项
              </button>
            ) : null}
          </div>

          {items.length ? (
            <div className="max-h-[42vh] space-y-3 overflow-y-auto pr-1">
              {items.map((item) => {
                const name = item.draft?.name ?? item.recipe.name ?? `未命名菜谱 ${item.index}`;
                const duplicate = existingNames.has(recipeKey(name));
                const warnings = duplicate
                  ? [...item.warnings, "已有同名菜谱，默认不选中。"]
                  : item.warnings;
                const disabled = !isImportable(item);
                const checked = selectedIndexes.has(item.index);

                return (
                  <article
                    className={`rounded-lg border bg-white p-4 ${
                      checked ? "border-orange-300 ring-2 ring-orange-100" : "border-stone-200"
                    }`}
                    key={item.index}
                  >
                    <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
                      <input
                        className="mt-1 h-5 w-5 accent-kitchen-orange"
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleItem(item.index)}
                        aria-label={`选择 ${name}`}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="break-words text-lg font-black">{name}</h4>
                          {disabled ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                              <AlertCircle size={13} />
                              无法导入
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                              <CheckCircle2 size={13} />
                              可导入
                            </span>
                          )}
                        </div>

                        {item.draft?.tags.length ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.draft.tags.map((tag) => (
                              <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-bold text-kitchen-muted" key={tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="font-black">食材</p>
                            <p className="mt-1 line-clamp-2 text-kitchen-muted">
                              {item.draft?.ingredients.map((ingredient) => ingredient.name).join("、") ?? "未识别"}
                            </p>
                          </div>
                          <div>
                            <p className="font-black">步骤</p>
                            <p className="mt-1 line-clamp-2 text-kitchen-muted">
                              {item.draft?.steps.slice(0, 2).join(" / ") ?? "未识别"}
                            </p>
                          </div>
                        </div>

                        {item.errors.length ? (
                          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                            {item.errors.join(" ")}
                          </p>
                        ) : null}

                        {warnings.length ? (
                          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                            {warnings.join(" ")}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white/60 p-5 text-sm font-semibold text-kitchen-muted">
              没有识别到菜谱。请确认每个菜谱以「# 菜名」开头，或使用示例格式。
            </div>
          )}
        </section>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-stone-200 pt-4 sm:flex-row sm:justify-end">
        <button className="k-button-secondary min-h-11" type="button" onClick={onCancel}>
          取消
        </button>
        <button className="k-button-primary min-h-11" type="button" disabled={!selectedDrafts.length} onClick={importSelected}>
          导入选中的 {selectedDrafts.length} 个菜谱
        </button>
      </div>
    </div>
  );
}
