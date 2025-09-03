"use client";

import Image from "next/image";
import Link from "next/link";

export default function Brand() {
  return (
    <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto h-14 px-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          {/* Put your logo at /public/dovetail.png */}
          <Image
            src="/dovetail.png"
            alt="The Dovetail"
            width={28}
            height={28}
            className="rounded"
          />
          <span className="text-slate-900 font-semibold tracking-wide">
            The Dovetail
          </span>
        </Link>
      </div>
    </div>
  );
}
