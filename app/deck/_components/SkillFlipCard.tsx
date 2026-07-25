"use client"

import Link from "next/link"
import { SkillCardFront, SkillCardBack, FlipPreview } from "@/component-library"
import * as S from "./flip-card.styles"

interface Props {
  skill: { _id: string; name: string; largeImage: string }
}

export const SkillFlipCard = ({ skill }: Props) => {
  return (
    <div>
      <FlipPreview
        faces={[
          <SkillCardFront key="front" name={skill.name} largeImage={skill.largeImage} instanceId={skill._id} />,
          <SkillCardBack key="back" instanceId={skill._id} />,
        ]}
        showHint={false}
      />
      <S.CardNumber as={Link} href={`/special-skills/${skill._id}`}>{skill.name}</S.CardNumber>
      <S.HintTap>tap to flip</S.HintTap>
    </div>
  )
}
