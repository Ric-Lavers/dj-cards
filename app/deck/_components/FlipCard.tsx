"use client"

import { CardFront, CardBack, FlipPreview } from "@/component-library"
import type { ArtistDoc } from "@/db/mongo/models/artist.schema"
import * as S from "./flip-card.styles"

interface Props {
  artist: Partial<ArtistDoc> & { _id: string }
}

export const FlipCard = ({ artist }: Props) => (
  <div>
    <FlipPreview
      front={
        <CardFront
          djName={artist.djName ?? ""}
          editedPhoto={artist.editedPhoto}
          cardNumber={artist.cardNumber}
        />
      }
      back={<CardBack artist={artist} qrDataUrl={artist.qrCodeUrl} />}
      showHint={false}
    />
    <S.CardNumber>#{String(artist.cardNumber ?? 0).padStart(4, "0")} — {artist.djName}</S.CardNumber>
    <S.HintTap>tap to flip</S.HintTap>
  </div>
)
