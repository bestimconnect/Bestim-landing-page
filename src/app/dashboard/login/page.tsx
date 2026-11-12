import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "@/dashboard/actions";
import { getDash } from "@/dashboard/i18n";
import { LangToggle } from "@/dashboard/ui";

export default async function LoginPage({ searchParams }: PageProps<"/dashboard/login">) {
  const { t, lang } = await getDash();
  const { e } = await searchParams;
  const error = e === "invalid" ? t.login.invalid : e === "notAdmin" ? t.login.notAdmin : null;
  const done = e === "reset" ? t.login.resetDone : null;
  const field =
    "mt-2 h-13 w-full rounded-field border border-d-line bg-d-card px-4 text-base outline-none focus:border-d-teal";
  return (
    <main className="flex min-h-dvh gap-4 p-4">
      <div className="flex min-w-0 flex-1 flex-col lg:flex-none lg:basis-[calc(50%-0.5rem)] px-2 py-4 md:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Image src="/brand/logo-word.png" alt="Bestim" width={900} height={194} priority className="h-7 w-auto" />
          <LangToggle lang={lang} className="rounded-full border border-d-line bg-d-card px-5 py-2 text-sm font-medium" />
        </div>

        <form action={signIn} className="mx-auto flex w-full max-w-105 flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-extrabold leading-snug md:text-[34px]">{t.login.title}</h1>
          <p className="mb-8 mt-2 text-d-muted">{t.login.hint}</p>
          {error && (
            <p role="alert" className="mb-5 rounded-field border border-d-danger px-4 py-3 text-sm text-d-danger">
              {error}
            </p>
          )}
          {done && (
            <p role="status" className="mb-5 rounded-field border border-d-teal px-4 py-3 text-sm text-d-teal">
              {done}
            </p>
          )}
          <label className="block text-sm font-medium">
            {t.login.email}
            <input name="email" type="email" required autoComplete="email" dir="ltr" placeholder="name@example.com" className={field} />
          </label>
          <label className="mt-5 block text-sm font-medium">
            {t.login.password}
            <input name="password" type="password" required autoComplete="current-password" dir="ltr" className={field} />
          </label>
          <Link href="/dashboard/forgot" className="mt-3 self-start text-sm font-medium text-d-teal hover:underline">
            {t.login.forgot}
          </Link>
          <button
            type="submit"
            className="mt-7 h-13.5 w-full rounded-full bg-lime text-[17px] font-bold text-ink shadow-glow transition-transform hover:-translate-y-0.5"
          >
            {t.login.submit}
          </button>
        </form>

        <p className="flex items-center justify-center gap-2.5 text-center text-[13px] text-d-muted">
          <ShieldCheck size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-d-teal" />
          {t.login.auditNote}
        </p>
      </div>

      <aside className="relative hidden min-w-0 flex-none basis-[calc(50%-0.5rem)] flex-col justify-between overflow-hidden rounded-screen bg-d-panel p-12 text-[#f5f7f5] lg:flex">
        <Image
          src="/brand/logo-mark-inverse.png"
          alt=""
          width={512}
          height={401}
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -end-28 h-auto w-140 opacity-14"
        />
        <Image src="/brand/logo-mark-inverse.png" alt="Bestim" width={512} height={401} priority className="relative h-11 w-auto self-start" />
        <div className="relative">
          <h2 className="text-[44px] font-extrabold leading-snug">
            {t.login.panelTitle}
            <br />
            <span className="text-lime">{t.login.panelAccent}</span>
          </h2>
          <p className="mt-4 max-w-105 text-[17px] leading-7 text-[#b9c4be]">{t.login.panelText}</p>
        </div>
      </aside>
    </main>
  );
}
