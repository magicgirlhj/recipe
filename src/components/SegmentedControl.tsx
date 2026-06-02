interface SegmentedControlProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg bg-stone-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          className={[
            "rounded-md px-3 py-2 text-sm font-bold transition",
            option.value === value ? "bg-white text-kitchen-ink shadow-sm" : "text-kitchen-muted hover:text-kitchen-ink",
          ].join(" ")}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
