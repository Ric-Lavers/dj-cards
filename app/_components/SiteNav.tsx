"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as S from "./site-nav.styles"

const LINKS = [
  { href: "/create", label: "Create" },
  { href: "/deck", label: "Deck" },
  { href: "/special-skills", label: "Special Skills" },
  { href: "/print", label: "Print" },
]

export const SiteNav = () => {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <S.Bar>
      <S.Wordmark as={Link} href="/">DJ CARDS</S.Wordmark>
      <S.Links>
        {LINKS.map(({ href, label }) => (
          <S.NavLink key={href} as={Link} href={href} $active={isActive(href)}>
            {label}
          </S.NavLink>
        ))}
      </S.Links>
    </S.Bar>
  )
}
