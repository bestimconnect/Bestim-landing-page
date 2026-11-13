import Image from "next/image";
import { setPassword } from "@/dashboard/actions";
import { getDash } from "@/dashboard/i18n";
import { PendingLink, SubmitButton } from "@/dashboard/Pending";
import { Flash, LangToggle } from "@/dashboard/ui";

export default async function ResetPage({ searchParams }: PageProps<"/dashboard/reset">) {
  const { t, lang } = await getDash();
  const { code, e } = await searchParams;
  const c = typeof code === "string" ? code : "";
  const msg = e === "short" ? t.reset.short : e === "mismatch" ? t.reset.mismatch : e === "expired" || !c ? t.reset.expired : null;
  const field = "mt-2 h-13 w-full rounded-field border border-d-line bg-d-card px-4 text-base outline-none focus:border-d-teal";
  return (
    <main className="mx-auto flex min-h-[125dvh] w-full max-w-120 flex-col px-5 py-6">
      <div className="flex items-center justify-between">
        <Image src="/brand/logo-word.png" alt="Bestim" width={900} height={194} priority className="h-7 w-auto" />
        <LangToggle lang={lang} className="rounded-full border border-d-line bg-d-card px-5 py-2 text-sm font-medium" />
      </div>
      <form action={setPassword} className="flex flex-1 flex-col justify-center py-10">
        <h1 className="mb-6 text-3xl font-extrabold leading-snug">{t.reset.title}</h1>
        {msg && <Flash tone="err">{msg}</Flash>}
        {c && e !== "expired" ? (
          <>
            <input type="hidden" name="code" value={c} />
            <label className="block text-sm font-medium">
              {t.reset.password}
              <input name="password" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className={field} />
            </label>
            <label className="mt-5 block text-sm font-medium">
              {t.reset.confirm}
              <input name="confirm" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className={field} />
            </label>
            <SubmitButton className="mt-7 h-13.5 w-full rounded-full bg-lime text-[17px] font-bold text-ink shadow-glow">{t.reset.submit}</SubmitButton>
          </>
        ) : (
          <PendingLink href="/dashboard/forgot" className="self-start text-sm font-medium text-d-teal hover:underline">{t.reset.again}</PendingLink>
        )}
      </form>
    </main>
  );
}
