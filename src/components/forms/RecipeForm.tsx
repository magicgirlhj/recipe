import { ClipboardPaste, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Ingredient, Recipe, RecipeDifficulty, RecipeDraft } from "../../data/types";
import { parseRecipeText, recipeImportTemplate } from "../../utils/recipeImport";

interface RecipeFormProps {
  initial?: Recipe;
  onSubmit: (draft: RecipeDraft) => void;
  onCancel: () => void;
}

const splitTags = (value: string) =>
  value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

export function RecipeForm({ initial, onSubmit, onCancel }: RecipeFormProps) {
  const [showImporter, setShowImporter] = useState(!initial);
  const [importText, setImportText] = useState("");
  const [importFeedback, setImportFeedback] = useState<{ tone: "success" | "warning" | "error"; text: string } | null>(
    null,
  );
  const [name, setName] = useState(initial?.name ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [tags, setTags] = useState(initial?.tags.join("，") ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial?.ingredients.length ? initial.ingredients : [{ name: "", amount: "" }],
  );
  const [steps, setSteps] = useState<string[]>(initial?.steps.length ? initial.steps : [""]);
  const [cookingMethod, setCookingMethod] = useState(initial?.cookingMethod ?? "");
  const [cookingTime, setCookingTime] = useState(initial?.cookingTime?.toString() ?? "");
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>(initial?.difficulty ?? "easy");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanIngredients = ingredients
      .map((item) => ({ name: item.name.trim(), amount: item.amount?.trim() }))
      .filter((item) => item.name);
    const cleanSteps = steps.map((step) => step.trim()).filter(Boolean);

    onSubmit({
      name: name.trim(),
      image: image.trim() || undefined,
      tags: splitTags(tags),
      ingredients: cleanIngredients.length ? cleanIngredients : [{ name: "待补充" }],
      steps: cleanSteps.length ? cleanSteps : ["待补充做法"],
      cookingMethod: cookingMethod.trim() || undefined,
      cookingTime: cookingTime ? Number(cookingTime) : undefined,
      difficulty,
      notes: notes.trim() || undefined,
    });
  }

  const updateIngredient = (index: number, value: Partial<Ingredient>) => {
    setIngredients((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...value } : item)));
  };

  function importRecipeText() {
    if (!importText.trim()) {
      setImportFeedback({ tone: "error", text: "先粘贴一段菜谱文本。" });
      return;
    }

    const result = parseRecipeText(importText);
    const parsed = result.recipe;
    const importedParts: string[] = [];

    if (parsed.name) {
      setName(parsed.name);
      importedParts.push("菜名");
    }
    if (parsed.image !== undefined) {
      setImage(parsed.image);
      importedParts.push("图片");
    }
    if (parsed.tags?.length) {
      setTags(parsed.tags.join("，"));
      importedParts.push("标签");
    }
    if (parsed.cookingMethod) {
      setCookingMethod(parsed.cookingMethod);
      importedParts.push("烹饪方式");
    }
    if (parsed.cookingTime !== undefined) {
      setCookingTime(String(parsed.cookingTime));
      importedParts.push("制作时间");
    }
    if (parsed.difficulty) {
      setDifficulty(parsed.difficulty);
      importedParts.push("难度");
    }
    if (parsed.ingredients?.length) {
      setIngredients(parsed.ingredients);
      importedParts.push(`${parsed.ingredients.length} 个食材`);
    }
    if (parsed.steps?.length) {
      setSteps(parsed.steps);
      importedParts.push(`${parsed.steps.length} 个步骤`);
    }
    if (parsed.notes !== undefined) {
      setNotes(parsed.notes);
      importedParts.push("备注");
    }

    if (!importedParts.length) {
      setImportFeedback({ tone: "error", text: "没有识别到可导入的菜谱字段。" });
      return;
    }

    setImportFeedback({
      tone: result.warnings.length ? "warning" : "success",
      text: result.warnings.length
        ? `已填入 ${importedParts.join("、")}。${result.warnings.join(" ")}`
        : `已填入 ${importedParts.join("、")}。`,
    });
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <section className="rounded-lg border border-orange-200 bg-orange-50/60 p-3">
        <button
          className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
          type="button"
          onClick={() => setShowImporter((visible) => !visible)}
          aria-expanded={showImporter}
        >
          <span className="flex items-center gap-2 font-black text-kitchen-ink">
            <Sparkles className="text-kitchen-orange" size={18} />
            AI 文本导入
          </span>
          <span className="text-sm font-bold text-kitchen-muted">{showImporter ? "收起" : "展开"}</span>
        </button>

        {showImporter ? (
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-bold">粘贴菜谱文本</span>
              <textarea
                className="k-input min-h-52 font-mono text-xs leading-5"
                value={importText}
                onChange={(event) => {
                  setImportText(event.target.value);
                  setImportFeedback(null);
                }}
                placeholder={recipeImportTemplate}
              />
            </label>
            {importFeedback ? (
              <p
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  importFeedback.tone === "success"
                    ? "bg-green-100 text-green-800"
                    : importFeedback.tone === "warning"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {importFeedback.text}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button className="k-button-primary min-h-11" type="button" onClick={importRecipeText}>
                <ClipboardPaste size={17} />
                识别并填入
              </button>
              <button
                className="k-button-secondary min-h-11"
                type="button"
                onClick={() => {
                  setImportText(recipeImportTemplate);
                  setImportFeedback(null);
                }}
              >
                填入示例
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-bold">菜名</span>
          <input className="k-input" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-bold">图片链接</span>
          <input className="k-input" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-bold">标签</span>
          <input className="k-input" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="自由填写，用逗号分隔，例如：一人食，少油，便当" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">烹饪方式</span>
          <input
            className="k-input"
            value={cookingMethod}
            onChange={(event) => setCookingMethod(event.target.value)}
            placeholder="炒 / 煎 / 炖 / 烤 / 蒸"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">制作时间</span>
          <input
            className="k-input"
            min="0"
            type="number"
            value={cookingTime}
            onChange={(event) => setCookingTime(event.target.value)}
            placeholder="分钟"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">难度</span>
          <select className="k-input" value={difficulty} onChange={(event) => setDifficulty(event.target.value as RecipeDifficulty)}>
            <option value="easy">简单</option>
            <option value="medium">适中</option>
            <option value="hard">费工夫</option>
          </select>
        </label>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold">食材</h3>
          <button
            className="k-button-secondary"
            type="button"
            onClick={() => setIngredients((items) => [...items, { name: "", amount: "" }])}
          >
            <Plus size={16} />
            添加
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2" key={index}>
              <input
                className="k-input"
                value={ingredient.name}
                onChange={(event) => updateIngredient(index, { name: event.target.value })}
                placeholder="食材"
              />
              <input
                className="k-input"
                value={ingredient.amount ?? ""}
                onChange={(event) => updateIngredient(index, { amount: event.target.value })}
                placeholder="用量"
              />
              <button
                className="k-button-secondary h-10 w-10 p-0"
                type="button"
                onClick={() => setIngredients((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                aria-label="删除食材"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold">步骤</h3>
          <button className="k-button-secondary" type="button" onClick={() => setSteps((items) => [...items, ""])}>
            <Plus size={16} />
            添加
          </button>
        </div>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div className="grid grid-cols-[1fr_auto] gap-2" key={index}>
              <textarea
                className="k-input min-h-16"
                value={step}
                onChange={(event) => setSteps((items) => items.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
                placeholder={`步骤 ${index + 1}`}
              />
              <button
                className="k-button-secondary h-10 w-10 p-0"
                type="button"
                onClick={() => setSteps((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                aria-label="删除步骤"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <label className="block">
        <span className="mb-1 block text-sm font-bold">备注</span>
        <textarea className="k-input min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>

      <div className="flex justify-end gap-2 border-t border-stone-200 pt-4">
        <button className="k-button-secondary" type="button" onClick={onCancel}>
          取消
        </button>
        <button className="k-button-primary" type="submit">
          保存菜谱
        </button>
      </div>
    </form>
  );
}
