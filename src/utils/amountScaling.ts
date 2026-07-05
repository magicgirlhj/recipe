export interface ParsedAmount {
  raw: string;
  value: number;
  prefix: string;
  unit: string;
}

const countLikeUnitPattern = /^(个|颗|只|枚|根|片|块|瓣|条|把|份|张|朵|粒|勺|匙|杯|碗|盒|袋|罐|撮)/;

function trimNumber(value: number) {
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 0.02) return String(rounded);

  const precision = Math.abs(value) >= 10 ? 1 : 2;
  return String(Number(value.toFixed(precision)));
}

function parseNumericMatch(raw: string): ParsedAmount | null {
  const mixedFractionMatch = raw.match(/^(.*?)(\d+(?:\.\d+)?)\s*(?:又|\+)\s*(\d+)\s*\/\s*(\d+)\s*(.*)$/);
  if (mixedFractionMatch) {
    const whole = Number(mixedFractionMatch[2]);
    const numerator = Number(mixedFractionMatch[3]);
    const denominator = Number(mixedFractionMatch[4]);
    if (denominator) {
      return {
        raw,
        value: whole + numerator / denominator,
        prefix: mixedFractionMatch[1].trim(),
        unit: mixedFractionMatch[5].trim(),
      };
    }
  }

  const fractionMatch = raw.match(/^(.*?)(\d+)\s*\/\s*(\d+)\s*(.*)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[2]);
    const denominator = Number(fractionMatch[3]);
    if (denominator) {
      return {
        raw,
        value: numerator / denominator,
        prefix: fractionMatch[1].trim(),
        unit: fractionMatch[4].trim(),
      };
    }
  }

  const numberMatch = raw.match(/^(.*?)(\d+(?:\.\d+)?)\s*(.*)$/);
  if (numberMatch) {
    return {
      raw,
      value: Number(numberMatch[2]),
      prefix: numberMatch[1].trim(),
      unit: numberMatch[3].trim(),
    };
  }

  return null;
}

export function parseScalableAmount(amount?: string) {
  const raw = amount?.trim() ?? "";
  if (!raw) return null;

  const halfMatch = raw.match(/^(.*?)半\s*(.*)$/);
  if (halfMatch) {
    return {
      raw,
      value: 0.5,
      prefix: halfMatch[1].trim(),
      unit: halfMatch[2].trim(),
    };
  }

  const parsed = parseNumericMatch(raw);
  if (!parsed || !Number.isFinite(parsed.value) || parsed.value <= 0) return null;

  return parsed;
}

export function formatScaleRatio(ratio: number) {
  if (!Number.isFinite(ratio)) return "";
  return trimNumber(ratio);
}

export function scaleAmount(amount: string | undefined, ratio: number) {
  const parsed = parseScalableAmount(amount);
  if (!parsed || !Number.isFinite(ratio) || ratio <= 0) {
    return amount?.trim() || "";
  }

  const nextValue = parsed.value * ratio;
  const unit = parsed.unit.trim();
  const prefix = parsed.prefix.trim();
  const shouldApproximate =
    countLikeUnitPattern.test(unit) && Math.abs(nextValue - Math.round(nextValue)) >= 0.02 && !prefix.includes("约");

  return `${shouldApproximate ? "约" : ""}${prefix}${trimNumber(nextValue)}${unit}`;
}
