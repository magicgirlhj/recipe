import appleIcon from "../assets/food-icons/apple.png";
import bananaIcon from "../assets/food-icons/banana.png";
import beefIcon from "../assets/food-icons/beef.png";
import breadIcon from "../assets/food-icons/bread.png";
import broccoliIcon from "../assets/food-icons/broccoli.png";
import butterIcon from "../assets/food-icons/butter.png";
import carrotIcon from "../assets/food-icons/carrot.png";
import cheeseIcon from "../assets/food-icons/cheese.png";
import chickenBreastIcon from "../assets/food-icons/chicken-breast.png";
import cucumberIcon from "../assets/food-icons/cucumber.png";
import eggIcon from "../assets/food-icons/egg.png";
import fishIcon from "../assets/food-icons/fish.png";
import ingredientIcon from "../assets/food-icons/ingredient.png";
import lettuceIcon from "../assets/food-icons/lettuce.png";
import milkIcon from "../assets/food-icons/milk.png";
import mushroomIcon from "../assets/food-icons/mushroom.png";
import noodlesIcon from "../assets/food-icons/noodles.png";
import onionIcon from "../assets/food-icons/onion.png";
import porkIcon from "../assets/food-icons/pork.png";
import potatoIcon from "../assets/food-icons/potato.png";
import riceIcon from "../assets/food-icons/rice.png";
import shrimpIcon from "../assets/food-icons/shrimp.png";
import strawberryIcon from "../assets/food-icons/strawberry.png";
import tofuIcon from "../assets/food-icons/tofu.png";
import tomatoIcon from "../assets/food-icons/tomato.png";

export interface FoodIconOption {
  key: string;
  label: string;
  category: string;
  aliases: string[];
  src: string;
}

export const fallbackFoodIcon: FoodIconOption = {
  key: "ingredient",
  label: "食材",
  category: "其他",
  aliases: [],
  src: ingredientIcon,
};

export const foodIconOptions: FoodIconOption[] = [
  { key: "milk", label: "牛奶", category: "蛋奶", aliases: ["鲜奶", "纯牛奶", "酸奶", "奶", "milk"], src: milkIcon },
  { key: "potato", label: "土豆", category: "蔬菜", aliases: ["马铃薯", "洋芋", "potato"], src: potatoIcon },
  { key: "egg", label: "鸡蛋", category: "蛋奶", aliases: ["蛋", "egg", "eggs"], src: eggIcon },
  { key: "tomato", label: "番茄", category: "蔬菜", aliases: ["西红柿", "小番茄", "圣女果", "tomato"], src: tomatoIcon },
  { key: "broccoli", label: "西兰花", category: "蔬菜", aliases: ["花椰菜", "broccoli"], src: broccoliIcon },
  { key: "chicken-breast", label: "鸡胸肉", category: "肉类", aliases: ["鸡肉", "鸡腿肉", "鸡", "chicken"], src: chickenBreastIcon },
  { key: "carrot", label: "胡萝卜", category: "蔬菜", aliases: ["红萝卜", "carrot"], src: carrotIcon },
  { key: "onion", label: "洋葱", category: "蔬菜", aliases: ["onion"], src: onionIcon },
  { key: "cucumber", label: "黄瓜", category: "蔬菜", aliases: ["青瓜", "cucumber"], src: cucumberIcon },
  { key: "mushroom", label: "蘑菇", category: "蔬菜", aliases: ["香菇", "口蘑", "菌菇", "mushroom"], src: mushroomIcon },
  { key: "beef", label: "牛肉", category: "肉类", aliases: ["牛排", "肥牛", "beef", "steak"], src: beefIcon },
  { key: "pork", label: "猪肉", category: "肉类", aliases: ["猪排", "五花肉", "里脊", "pork"], src: porkIcon },
  { key: "fish", label: "鱼", category: "水产", aliases: ["鱼肉", "鱼片", "fish"], src: fishIcon },
  { key: "shrimp", label: "虾", category: "水产", aliases: ["虾仁", "大虾", "shrimp", "prawn"], src: shrimpIcon },
  { key: "tofu", label: "豆腐", category: "豆制品", aliases: ["嫩豆腐", "老豆腐", "tofu"], src: tofuIcon },
  { key: "cheese", label: "芝士", category: "蛋奶", aliases: ["奶酪", "cheese"], src: cheeseIcon },
  { key: "butter", label: "黄油", category: "蛋奶", aliases: ["牛油", "butter"], src: butterIcon },
  { key: "lettuce", label: "生菜", category: "蔬菜", aliases: ["莴苣", "lettuce"], src: lettuceIcon },
  { key: "rice", label: "米饭", category: "主食", aliases: ["米", "饭", "大米", "rice"], src: riceIcon },
  { key: "noodles", label: "面条", category: "主食", aliases: ["拉面", "意面", "面", "noodle", "noodles", "pasta"], src: noodlesIcon },
  { key: "bread", label: "面包", category: "主食", aliases: ["吐司", "toast", "bread"], src: breadIcon },
  { key: "apple", label: "苹果", category: "水果", aliases: ["apple"], src: appleIcon },
  { key: "banana", label: "香蕉", category: "水果", aliases: ["banana"], src: bananaIcon },
  { key: "strawberry", label: "草莓", category: "水果", aliases: ["strawberry"], src: strawberryIcon },
];

const iconByKey = new Map(foodIconOptions.map((icon) => [icon.key, icon]));

const categoryFallbacks: Record<string, string> = {
  蛋奶: "milk",
  奶制品: "milk",
  蔬菜: "carrot",
  肉类: "beef",
  水产: "fish",
  海鲜: "fish",
  豆制品: "tofu",
  主食: "rice",
  水果: "apple",
};

function normalizeFoodText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[·\s_\-()（）]/g, "");
}

export function getFoodIconByKey(key?: string) {
  if (!key) return undefined;
  return iconByKey.get(key);
}

export function matchFoodIconByName(name?: string) {
  const normalized = normalizeFoodText(name ?? "");
  if (!normalized) return undefined;

  let bestMatch: { icon: FoodIconOption; score: number } | undefined;

  for (const icon of foodIconOptions) {
    const names = [icon.label, ...icon.aliases].map(normalizeFoodText);

    for (const alias of names) {
      if (!alias) continue;
      let score = 0;
      if (normalized === alias) score = 1000 + alias.length;
      else if (normalized.includes(alias)) score = 500 + alias.length;
      else if (normalized.length >= 2 && alias.includes(normalized)) score = 100 + normalized.length;

      if (score && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { icon, score };
      }
    }
  }

  return bestMatch?.icon;
}

function matchFoodIconByCategory(category?: string) {
  const normalized = normalizeFoodText(category ?? "");
  if (!normalized) return undefined;

  const fallbackKey = Object.entries(categoryFallbacks).find(([label]) =>
    normalized.includes(normalizeFoodText(label)),
  )?.[1];

  return getFoodIconByKey(fallbackKey);
}

export function resolveFoodIcon({
  iconKey,
  name,
  category,
}: {
  iconKey?: string;
  name?: string;
  category?: string;
}) {
  return getFoodIconByKey(iconKey) ?? matchFoodIconByName(name) ?? matchFoodIconByCategory(category) ?? fallbackFoodIcon;
}
