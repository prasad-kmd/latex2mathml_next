"use client"

import { Heart } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm">
          Made with <Heart className="inline-block h-4 w-4 text-red-500" /> by{" "}
          <Link
            href="https://github.com/prasad-kmd"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:text-foreground"
          >
            Prasad-kmd
          </Link>
        </p>
        <Link
          href="https://github.com/prasad-kmd/latex2mathml_next"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold hover:text-foreground"
        >
          View on GitHub
        </Link>
      </div>
    </footer>
  )
}
