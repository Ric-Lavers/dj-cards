import styled, { css, keyframes } from "styled-components"
import { theme } from "@/styles/theme"

const aiPulse = keyframes`
  0%   { box-shadow: 0 0 0px 0px #7c3aed44, 0 0 0px 0px #a855f744; border-color: #7c3aed; }
  50%  { box-shadow: 0 0 18px 6px #7c3aed99, 0 0 40px 12px #a855f733; border-color: #c084fc; }
  100% { box-shadow: 0 0 0px 0px #7c3aed44, 0 0 0px 0px #a855f744; border-color: #7c3aed; }
`

export const Page = styled.div`
  display: grid;
  grid-template-columns: 1fr 420px;
  min-height: 100vh;
  gap: 2rem;
  padding: 2rem;

  @media screen and (width < ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`

export const FormCol = styled.div`
  max-width: 600px;

  @media screen and (width < ${theme.breakpoints.lg}) {
    max-width: 100%;
  }
`

/* Mobile-only card preview — shown above the form on small screens */
export const MobilePreview = styled.div`
  display: none;

  @media screen and (width < ${theme.breakpoints.lg}) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid ${theme.colors.border};
    margin-bottom: 0.5rem;
  }
`

/* Scale the 350px-wide SVG card down to fit phone screens */
export const PreviewScaler = styled.div`
  @media screen and (width < ${theme.breakpoints.lg}) {
    transform-origin: top center;
    transform: scale(0.72);
    height: calc(490px * 0.72);
    width: calc(350px * 0.72);
    overflow: visible;
  }
`

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  font-family: ${theme.fonts.heading};
  color: ${theme.colors.white};
  margin-bottom: 2rem;

  @media screen and (width < ${theme.breakpoints.lg}) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`

export const Section = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`

export const SectionHeading = styled.p`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${theme.colors.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
`

export const Label = styled.label`
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${theme.colors.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
`

export const Input = styled.input`
  width: 100%;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.white};
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: ${theme.fonts.body};
  outline: none;

  &:focus {
    border-color: ${theme.colors.gold};
  }
`

export const Textarea = styled.textarea`
  width: 100%;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.white};
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: ${theme.fonts.body};
  resize: vertical;
  margin-top: 0.5rem;
  outline: none;

  &:focus {
    border-color: ${theme.colors.gold};
  }
`

export const RadioGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`

export const RadioOption = styled.button<{ $active: boolean }>`
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  border: 1px solid ${({ $active }) => ($active ? theme.colors.gold : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.gold : "transparent")};
  color: ${({ $active }) => ($active ? theme.colors.black : theme.colors.white)};
  font-size: 0.85rem;
  font-family: ${theme.fonts.body};
  cursor: pointer;
  transition: all 0.15s;
`

export const CustomPoseInput = styled.input`
  width: 100%;
  margin-top: 0.6rem;
  background: transparent;
  border: none;
  border-bottom: 1px dashed ${theme.colors.border};
  color: ${theme.colors.muted};
  padding: 0.4rem 0;
  font-size: 0.85rem;
  font-family: ${theme.fonts.body};
  outline: none;
  transition: border-color 0.15s, color 0.15s;

  &::placeholder { color: ${theme.colors.border}; }

  &:focus {
    border-bottom-color: ${theme.colors.gold};
    color: ${theme.colors.white};
  }
`

export const ChipGroupWrapper = styled.div`
  position: relative;
`

export const ChipGroup = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  overflow: hidden;
  ${({ $collapsed }) => $collapsed && `max-height: 72px;`}
`

export const ShowMoreButton = styled.button`
  margin-top: 0.4rem;
  background: none;
  border: none;
  color: ${theme.colors.muted};
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0;
  letter-spacing: 0.03em;

  &:hover { color: ${theme.colors.white}; }
`

export const AddGenreRow = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-top: 0.5rem;
  align-items: center;
`

export const AddGenreInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px dashed ${theme.colors.border};
  color: ${theme.colors.white};
  font-size: 0.85rem;
  font-family: ${theme.fonts.body};
  padding: 0.25rem 0;
  outline: none;
  transition: border-color 0.15s;

  &::placeholder { color: ${theme.colors.border}; }
  &:focus { border-bottom-color: ${theme.colors.gold}; }
`

export const AddGenreBtn = styled.button`
  background: none;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.muted};
  border-radius: 4px;
  padding: 0.2rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  flex-shrink: 0;

  &:hover { border-color: ${theme.colors.gold}; color: ${theme.colors.gold}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

export const Chip = styled.button<{ $active: boolean; $disabled: boolean }>`
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  border: 1px solid ${({ $active }) => ($active ? theme.colors.gold : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.gold : theme.colors.surface)};
  color: ${({ $active }) => ($active ? theme.colors.black : theme.colors.white)};
  font-size: 0.8rem;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
  transition: all 0.15s;
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "auto")};
`

export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`

export const StatField = styled.div``

export const ScaleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: ${theme.colors.muted};
`

export const Slider = styled.input`
  flex: 1;
  accent-color: ${theme.colors.gold};
`

export const SubmitButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: ${theme.colors.gold};
  color: ${theme.colors.black};
  font-size: 1rem;
  font-weight: 700;
  font-family: ${theme.fonts.heading};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const PreviewCol = styled.div`
  @media screen and (width < ${theme.breakpoints.lg}) {
    display: none;
  }
`

export const PreviewSticky = styled.div`
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`

export const FlipToggle = styled.button`
  background: transparent;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.muted};
  padding: 0.35rem 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.gold};
    color: ${theme.colors.gold};
  }
`

export const UploadArea = styled.div<{ $hasPhoto: boolean; $processing?: boolean; $isDragging?: boolean }>`
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed ${({ $hasPhoto, $isDragging }) =>
    $isDragging ? "#a855f7" : $hasPhoto ? theme.colors.gold : theme.colors.border};
  border-radius: 8px;
  background: ${({ $isDragging }) => $isDragging ? "#1e103a" : theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${theme.colors.gold};
  }

  ${({ $processing }) =>
    $processing &&
    css`
      animation: ${aiPulse} 1.4s ease-in-out infinite;
      border-style: solid;
      border-color: #7c3aed;
      cursor: wait;
    `}

  ${({ $isDragging }) =>
    $isDragging &&
    css`
      border-style: solid;
      box-shadow: 0 0 20px 4px #7c3aed66;
    `}
`

export const PhotoThumb = styled.img<{ $dim?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s;
  ${({ $dim }) => $dim && css`filter: brightness(0.35) saturate(0.4);`}
`

export const AiOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #e9d5ff;
  text-shadow: 0 0 12px #a855f7, 0 0 24px #7c3aed;
  pointer-events: none;
`

export const UploadPrompt = styled.div`
  color: ${theme.colors.muted};
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
  line-height: 1.5;
`

export const ProcessButton = styled.button`
  flex: 1;
  padding: 0.65rem;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.gold};
  color: ${theme.colors.gold};
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${theme.colors.gold};
    color: ${theme.colors.black};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const PhotoError = styled.p`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #f87171;
  line-height: 1.4;
`

export const PhotoActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

export const RetakeButton = styled.button`
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.muted};
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: ${theme.colors.white};
    color: ${theme.colors.white};
  }
`

const sheetSlideUp = keyframes`
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
`

/* Peek FAB — sticky at bottom, appears when preview scrolls out of view */
export const PeekFab = styled.button`
  display: none;

  @media screen and (width < ${theme.breakpoints.lg}) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 40;
    background: ${theme.colors.gold};
    color: ${theme.colors.black};
    border: none;
    border-radius: 24px;
    padding: 0.65rem 1.4rem;
    font-size: 0.9rem;
    font-weight: 700;
    font-family: ${theme.fonts.heading};
    cursor: pointer;
    box-shadow: 0 4px 24px #c9a84c55;
    white-space: nowrap;
  }
`

/* Backdrop */
export const SheetBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 50;
  backdrop-filter: blur(4px);
`

/* Slide-up sheet */
export const Sheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 51;
  background: #0f0518;
  border-top: 1px solid ${theme.colors.border};
  border-radius: 20px 20px 0 0;
  padding: 1.25rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: ${sheetSlideUp} 0.3s cubic-bezier(0.32, 0.72, 0, 1);
`

export const SheetHandle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${theme.colors.border};
  margin-bottom: 0.25rem;
`

export const SheetClose = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: ${theme.colors.muted};
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem;
`

/* Scales the 350px card to fit a phone without clipping */
export const SheetCardScaler = styled.div`
  transform-origin: top center;
  transform: scale(0.78);
  height: calc(490px * 0.78);
  width: calc(350px * 0.78);
  overflow: visible;
  cursor: pointer;
`

export const SheetFlipHint = styled.p`
  font-size: 0.75rem;
  color: ${theme.colors.muted};
  letter-spacing: 0.05em;
`

/* Mobile inline preview — shown below form, above submit */
export const MobileInlinePreview = styled.div`
  display: none;

  @media screen and (width < ${theme.breakpoints.lg}) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
`

export const InlinePreviewScaler = styled.div`
  transform-origin: top center;
  transform: scale(0.72);
  height: calc(490px * 0.72);
  width: calc(350px * 0.72);
  overflow: visible;
`
