import type { Ingredient, RecipeDifficulty, RecipeDraft } from "../data/types";

export interface ParsedRecipeImport {
  name?: string;
  image?: string;
  tags?: string[];
  ingredients?: Ingredient[];
  steps?: string[];
  cookingMethod?: string;
  cookingTime?: number;
  difficulty?: RecipeDifficulty;
  notes?: string;
}

export interface RecipeImportResult {
  recipe: ParsedRecipeImport;
  warnings: string[];
}

export interface RecipeBatchImportItem {
  index: number;
  raw: string;
  recipe: ParsedRecipeImport;
  draft?: RecipeDraft;
  warnings: string[];
  errors: string[];
}

export interface RecipeBatchImportResult {
  items: RecipeBatchImportItem[];
  warnings: string[];
}

type SectionName = "ingredients" | "steps" | "notes";
type FieldName = keyof ParsedRecipeImport | SectionName;

const fieldAliases: Record<string, FieldName> = {
  name: "name",
  recipe: "name",
  "recipe name": "name",
  菜名: "name",
  名称: "name",
  图片: "image",
  图片链接: "image",
  image: "image",
  imageurl: "image",
  tags: "tags",
  标签: "tags",
  烹饪方式: "cookingMethod",
  做法类型: "cookingMethod",
  方式: "cookingMethod",
  method: "cookingMethod",
  cookingmethod: "cookingMethod",
  制作时间: "cookingTime",
  烹饪时间: "cookingTime",
  时间: "cookingTime",
  cookingtime: "cookingTime",
  难度: "difficulty",
  difficulty: "difficulty",
  食材: "ingredients",
  配料: "ingredients",
  ingredients: "ingredients",
  步骤: "steps",
  做法: "steps",
  做法步骤: "steps",
  steps: "steps",
  备注: "notes",
  笔记: "notes",
  notes: "notes",
};

const sectionNames = new Set<FieldName>(["ingredients", "steps", "notes"]);

export const recipeImportTemplate = `菜名：番茄炒蛋
标签：快手菜，中餐，晚餐
烹饪方式：炒
制作时间：15
难度：简单
食材：
- 番茄｜2个
- 鸡蛋｜3个
- 盐｜少许
步骤：
1. 番茄切块，鸡蛋打散。
2. 先炒鸡蛋盛出，再炒番茄出汁。
3. 倒回鸡蛋，调味后翻炒均匀。
备注：
适合工作日快速做。`;

export const recipeBatchImportTemplate = `# 番茄炒蛋

标签：快手菜，中餐，晚餐
烹饪方式：炒
制作时间：15
难度：简单

食材：
- 番茄：2个
- 鸡蛋：3个
- 盐：少许

步骤：
1. 番茄切块，鸡蛋打散。
2. 先炒鸡蛋盛出，再炒番茄出汁。
3. 倒回鸡蛋，调味后翻炒均匀。

备注：
适合工作日快速做。

---

# 鸡胸肉沙拉

标签：减脂，高蛋白，快手菜
烹饪方式：煎
制作时间：20
难度：简单

食材：
- 鸡胸肉：1块
- 生菜：适量
- 小番茄：6个

步骤：
1. 鸡胸肉加盐和黑胡椒腌 10 分钟。
2. 平底锅煎熟后切片。
3. 蔬菜洗净切好，和鸡胸肉混合。`;

function normalizeLabel(label: string) {
  return label.trim().replace(/\s+/g, " ").toLowerCase();
}

function cleanListLine(line: string) {
  return line
    .trim()
    .replace(/^[-*•]\s*/, "")
    .replace(/^\d+\s*[.)、]\s*/, "")
    .trim();
}

function splitTags(value = "") {
  return value
    .split(/[,，、/|｜]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function splitInlineItems(lines: string[]) {
  return lines
    .flatMap((line) => line.split(/[;；]\s*/))
    .map(cleanListLine)
    .filter(Boolean);
}

function splitIngredient(value: string): Ingredient | null {
  const line = cleanListLine(value);
  if (!line) return null;

  const pipeMatch = line.match(/^(.+?)\s*[|｜]\s*(.+)$/);
  if (pipeMatch) {
    return { name: pipeMatch[1].trim(), amount: pipeMatch[2].trim() };
  }

  const colonMatch = line.match(/^(.+?)\s*[:：]\s*(.+)$/);
  if (colonMatch) {
    return { name: colonMatch[1].trim(), amount: colonMatch[2].trim() };
  }

  const spacedMatch = line.match(/^(.+?)\s+([0-9一二两三四五六七八九十半适约大小少多若干].*)$/);
  if (spacedMatch) {
    return { name: spacedMatch[1].trim(), amount: spacedMatch[2].trim() };
  }

  return { name: line };
}

function parseDifficulty(value = ""): RecipeDifficulty | undefined {
  const cleanValue = value.trim().toLowerCase();
  if (!cleanValue) return undefined;
  if (["easy", "简单", "容易", "快手"].some((item) => cleanValue.includes(item))) return "easy";
  if (["medium", "适中", "中等", "普通"].some((item) => cleanValue.includes(item))) return "medium";
  if (["hard", "难", "费工夫", "复杂"].some((item) => cleanValue.includes(item))) return "hard";
  return undefined;
}

function parseTime(value = "") {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

export function parseRecipeText(text: string): RecipeImportResult {
  const recipe: ParsedRecipeImport = {};
  const warnings: string[] = [];
  const sections: Record<SectionName, string[]> = {
    ingredients: [],
    steps: [],
    notes: [],
  };
  let activeSection: SectionName | null = null;
  let firstContentLine = "";

  text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        if (activeSection === "notes") sections.notes.push("");
        return;
      }

      if (!firstContentLine) firstContentLine = line;

      const normalizedLine = line
        .replace(/^#{1,6}\s*/, "")
        .replace(/^\*\*(.+?)\*\*$/, "$1")
        .trim();
      const headingFieldName = /^#{2,6}\s+\S/.test(line)
        ? fieldAliases[normalizeLabel(normalizedLine.replace(/[:：]\s*$/, ""))]
        : undefined;
      if (headingFieldName && sectionNames.has(headingFieldName)) {
        activeSection = headingFieldName as SectionName;
        return;
      }

      const fieldMatch = normalizedLine.match(/^([^:：]{1,24})\s*[:：]\s*(.*)$/);
      const fieldName = fieldMatch ? fieldAliases[normalizeLabel(fieldMatch[1])] : undefined;

      if (fieldName) {
        const value = fieldMatch?.[2]?.trim() ?? "";
        if (sectionNames.has(fieldName)) {
          activeSection = fieldName as SectionName;
          if (value) sections[activeSection].push(value);
          return;
        }

        activeSection = null;
        if (fieldName === "name") recipe.name = value;
        if (fieldName === "image") recipe.image = value || undefined;
        if (fieldName === "tags") recipe.tags = splitTags(value);
        if (fieldName === "cookingMethod") recipe.cookingMethod = value || undefined;
        if (fieldName === "cookingTime") recipe.cookingTime = parseTime(value);
        if (fieldName === "difficulty") {
          const difficulty = parseDifficulty(value);
          if (difficulty) recipe.difficulty = difficulty;
          else if (value) warnings.push(`没有识别难度「${value}」，请使用简单 / 适中 / 费工夫。`);
        }
        if (fieldName === "notes") recipe.notes = value;
        return;
      }

      if (activeSection) {
        sections[activeSection].push(rawLine);
      }
    });

  if (!recipe.name && firstContentLine && !fieldAliases[normalizeLabel(firstContentLine.replace(/[:：].*$/, ""))]) {
    recipe.name = cleanListLine(firstContentLine.replace(/^#+\s*/, ""));
  }

  const ingredients = splitInlineItems(sections.ingredients)
    .map(splitIngredient)
    .filter((item): item is Ingredient => Boolean(item?.name));
  if (ingredients.length) recipe.ingredients = ingredients;

  const steps = splitInlineItems(sections.steps);
  if (steps.length) recipe.steps = steps;

  const notes = sections.notes.join("\n").trim();
  if (notes) recipe.notes = notes;

  if (!recipe.name) warnings.push("没有识别到菜名。");
  if (!recipe.ingredients?.length) warnings.push("没有识别到食材。");
  if (!recipe.steps?.length) warnings.push("没有识别到步骤。");

  return { recipe, warnings };
}

function hasMeaningfulContent(lines: string[]) {
  return lines.some((line) => line.trim() && !line.trim().match(/^[-*_]{3,}$/));
}

function splitRecipeMarkdownChunks(text: string) {
  const chunks: string[] = [];
  let current: string[] = [];

  text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .forEach((line) => {
      const trimmed = line.trim();
      const isSeparator = /^[-*_]{3,}$/.test(trimmed);
      const isRecipeHeading = /^#\s+\S/.test(trimmed);

      if (isSeparator) {
        if (hasMeaningfulContent(current)) chunks.push(current.join("\n").trim());
        current = [];
        return;
      }

      if (isRecipeHeading && hasMeaningfulContent(current)) {
        chunks.push(current.join("\n").trim());
        current = [line];
        return;
      }

      current.push(line);
    });

  if (hasMeaningfulContent(current)) chunks.push(current.join("\n").trim());

  return chunks;
}

function parsedRecipeToDraft(recipe: ParsedRecipeImport): RecipeDraft | undefined {
  const name = recipe.name?.trim();
  if (!name) return undefined;

  return {
    name,
    image: recipe.image?.trim() || undefined,
    tags: recipe.tags ?? [],
    ingredients: recipe.ingredients?.length ? recipe.ingredients : [{ name: "待补充" }],
    steps: recipe.steps?.length ? recipe.steps : ["待补充做法"],
    cookingMethod: recipe.cookingMethod?.trim() || undefined,
    cookingTime: recipe.cookingTime,
    difficulty: recipe.difficulty,
    notes: recipe.notes?.trim() || undefined,
  };
}

export function parseRecipeBatchMarkdown(text: string): RecipeBatchImportResult {
  const chunks = splitRecipeMarkdownChunks(text);
  const warnings: string[] = [];

  if (!text.trim()) {
    return { items: [], warnings: ["请先粘贴 Markdown 菜谱文本。"] };
  }

  if (!chunks.length) {
    return { items: [], warnings: ["没有识别到菜谱内容。"] };
  }

  const items = chunks.map((chunk, chunkIndex) => {
    const result = parseRecipeText(chunk);
    const draft = parsedRecipeToDraft(result.recipe);
    const errors: string[] = [];
    const warningsForItem = [...result.warnings];

    if (!draft) {
      errors.push("缺少菜名，无法导入。");
    }

    if (draft && !result.recipe.ingredients?.length) {
      warningsForItem.push("没有识别到食材，导入后会先填入「待补充」。");
    }

    if (draft && !result.recipe.steps?.length) {
      warningsForItem.push("没有识别到步骤，导入后会先填入「待补充做法」。");
    }

    return {
      index: chunkIndex + 1,
      raw: chunk,
      recipe: result.recipe,
      draft,
      warnings: Array.from(new Set(warningsForItem)),
      errors,
    };
  });

  return { items, warnings };
}
