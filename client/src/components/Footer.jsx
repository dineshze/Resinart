import { Instagram, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[28px] bg-ink p-8 text-pearl shadow-resin dark:bg-pearl dark:text-ink">
        <div className="grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-end">
          <div>
            <h2 className="font-display text-4xl font-bold">Happy Creation</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 opacity-75">
              Handmade trays, coasters, shell art, jewelry dishes, and custom
              keepsakes poured in small batches.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a
              href="https://www.instagram.com/crafts_by_happyy/"
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-coral"
            >
              <Instagram size={16} /> Instagram
            </a>
            <a
              href="https://wa.me/+918763126640"
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-lagoon"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href="dinesh205.dk@gmail.com"
              className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-tide"
            >
              <Mail size={16} /> Email
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-white/15 pt-5 text-xs opacity-60">
          © 2026 Happy Creation. Handmade with care.
        </div>
      </div>
    </footer>
  );
}
