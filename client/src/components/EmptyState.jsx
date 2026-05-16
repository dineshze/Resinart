import { Sparkles } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", text = "Try another filter or add a new item." }) {
  return (
    <div className="rounded-[28px] glass p-10 text-center">
      <Sparkles className="mx-auto text-coral" size={34} />
      <h3 className="mt-4 font-display text-2xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/64 dark:text-pearl/66">{text}</p>
    </div>
  );
}
