"use client"

import { useRouter } from "next/navigation"
import { CardFront, CardBack, FlipPreview } from "@/component-library"
import type { ArtistDoc } from "@/db/mongo/models/artist.schema"
import * as S from "./flip-card.styles"

interface Props {
  artist: Partial<ArtistDoc> & { _id: string }
  specialSkillsMap?: Record<string, { name: string; smallImage: string; largeImage: string }>
}

export const FlipCard = ({ artist, specialSkillsMap }: Props) => {
  const router = useRouter()
  const specialSkillsData = (artist.specialSkills ?? [])
    .map((name) => specialSkillsMap?.[name])
    .filter((s): s is { name: string; smallImage: string; largeImage: string } => !!s)

  return (
    <div>
      <FlipPreview
        faces={[
          <CardFront
            key="front"
            djName={artist.djName ?? ""}
            editedPhoto={artist.editedPhoto}
            cardNumber={artist.cardNumber}
            instanceId={artist._id}
          />,
          <CardBack
            key="back"
            artist={artist}
            qrDataUrl={artist.qrCodeUrl}
            specialSkillsData={specialSkillsData}
            instanceId={artist._id}
            onQrClick={() => router.push(`/card/${artist._id}/edit`)}
          />,
        ]}
        showHint={false}
      />
      <S.CardNumber>#{String(artist.cardNumber ?? 0).padStart(4, "0")} — {artist.djName}</S.CardNumber>
      <S.HintTap>tap to flip</S.HintTap>
    </div>
  )
}
