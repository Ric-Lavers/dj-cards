import styled from "styled-components"
import { theme } from "@/styles/theme"
import { UploadArea } from "@/app/create/_components/create-page.styles"

// Shows the current/new card image — same look as the create page's upload
// box, but not itself clickable (uploads go through the "Upload new photo" chip).
export const PreviewArea = styled(UploadArea)`
  max-width: 200px;
  cursor: default;
`

export const PhotoRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: flex-end;
`

export const StagedNote = styled.p`
  color: ${theme.colors.gold};
  font-size: 0.8rem;
  line-height: 1.4;
`

export const SubLabel = styled.div`
  margin-top: 1rem;
`

export const UploadChip = styled.span`
  position: relative;
  display: inline-block;

  input {
    position: absolute;
    inset: 0;
    width: 100%;
    opacity: 0;
    cursor: pointer;
  }
`
