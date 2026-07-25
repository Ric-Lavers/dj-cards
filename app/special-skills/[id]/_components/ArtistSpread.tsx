"use client"

import { useState } from "react"
import type { ArtistDoc } from "@/db/mongo/models/artist.schema"
import * as S from "./artist-spread.styles"

export const ArtistSpread = ({ artists }: { artists: (Partial<ArtistDoc> & { _id: string })[] }) => {
  const [activeId, s_activeId] = useState<string | null>(null)

  function toggleActive(id: string) {
    s_activeId((prev) => (prev === id ? null : id))
  }

  if (artists.length === 0) {
    return <S.Empty>No DJs have picked this special skill yet.</S.Empty>
  }

  return (
    <S.Spread>
      {artists.map((artist, i) => {
        const email = artist.contactDetails?.email
        const active = activeId === artist._id
        return (
          <S.Tile key={artist._id} $index={i} $active={active} onClick={() => toggleActive(artist._id)}>
            <S.TileImg src={artist.editedPhoto || ""} alt={artist.djName ?? "DJ"} />
            <S.TileName>{artist.djName}</S.TileName>
            {active && (
              <S.Menu onClick={(e) => e.stopPropagation()}>
                <S.MenuLink href={`/card/${artist._id}`}>View profile</S.MenuLink>
                <S.MenuLink href={email ? `mailto:${email}` : undefined} $disabled={!email}>
                  Book artist
                </S.MenuLink>
              </S.Menu>
            )}
          </S.Tile>
        )
      })}
    </S.Spread>
  )
}
