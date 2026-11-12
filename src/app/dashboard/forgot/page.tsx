import Image from "next/image";
import Link from "next/link";
import { requestReset } from "@/dashboard/actions";
import { getDash } from "@/dashboard/i18n";
import { LangToggle } from "@/dashboard/ui";

export default async function ForgotPage({ searchParams }: PageProps<"/dashboard/forgot">) {
  const { t, lang } = await getDash();
  const { sent } = await searchParams;
  const field = "mt-2 h-13 w-full rounded-field border border-d-line bg-d-card px-4 text-base outline-none focus:border-d-teal";
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col px-5 py-6">
      <div className="flex items-center justify-between">
        <Image src="/brand/logo-word.png" alt="Bestim" width={900} height={194} priority className="h-7 w-auto" />
        <LangToggle lang={lang} className="rounded-full border border-d-line bg-d-card px-5 py-2 text-sm font-medium" />
      </div>
      <form action={requestReset} className="flex flex-1 flex-col justify-center py-10">
        <h1 className="text-3xl font-extrabold leading-snug">{t.forgot.title}</h1>
        <p className="mb-8 mt-2 text-d-muted">{t.forgot.hint}</p>
        {sent && <p role="status" className="mb-5 rounded-field border border-d-teal px-4 py-3 text-sm text-d-teal">{t.forgot.sent}</p>}
        <label className="block text-sm font-medium">
          {t.forgot.email}
          <input name="email" type="email" required autoComplete="email" dir="ltr" placeholder="name@example.com" className={field} />
        </label>
        <button type="submit" className="mt-7 h-13.5 w-full rounded-full bg-lime text-[17px] font-bold text-ink shadow-glow">{t.forgot.submit}</button>
        <Link href="/dashboard/login" className="mt-5 self-center text-sm font-medium text-d-teal hover:underline">{t.forgot.back}</Link>
      </form>
    </main>
  );
}
