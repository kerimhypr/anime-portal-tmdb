"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RouteFixer() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    // Fix old dynamic routes that were not pre-rendered and fell back to index.html
    // If user directly visits /anime/123 or /movie/123 where 123 not in generateStaticParams,
    // hosting serves /index.html (home) but URL stays /anime/123. Detect and redirect to query param page which is always available.
    if (pathname?.startsWith("/anime/")) {
      const id = pathname.split("/")[2];
      if (id && /^\d+$/.test(id)) {
        router.replace(`/anime?id=${id}`);
      }
    } else if (pathname?.startsWith("/movie/")) {
      const id = pathname.split("/")[2];
      if (id && /^\d+$/.test(id)) {
        router.replace(`/movie?id=${id}`);
      }
    }
  }, [pathname, router]);
  return null;
}
