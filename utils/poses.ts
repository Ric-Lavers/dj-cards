import type { PoseChoice } from "@/db/mongo/models/artist.schema"

// Shared by /create and /card/[id]/edit so both offer the same pose chips.
export const POSES: { value: PoseChoice; label: string; emoji: string }[] = [
  { value: "hands_in_air",  label: "Hands in the Air", emoji: "🙌" },
  { value: "knob_twiddler", label: "Knob Twiddler",    emoji: "🎛️" },
  { value: "headphone_grab",label: "Headphone Grab",   emoji: "🎧" },
  { value: "fist_pump",     label: "Fist Pump",        emoji: "✊" },
  { value: "the_lean",      label: "The Lean",         emoji: "🫦" },
  { value: "eyes_closed",   label: "Eyes Closed",      emoji: "😌" },
  { value: "natural",       label: "Natural",          emoji: "🪄" },
  { value: "original",      label: "Original",         emoji: "📷" },
  { value: "cutout",        label: "Cutout",           emoji: "✂️" },
]

export const POSE_VALUES = POSES.map((p) => p.value)
