import Link from "next/link";
import { Button } from "shadcn/button";

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: "url('/warehouse-bg.png')" }}
    >

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 text-center">
        <h1 className="text-3xl font-bold text-white mb-6">
          Witaj w MagazynierUZ
        </h1>

        <h3 className="text-lg font-medium text-gray-200 mb-8">
          Magazynuj z nami
        </h3>

        <div className="space-x-4">
          <Button asChild>
            <Link href="/login">Logowanie</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/register">Rejestracja</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
