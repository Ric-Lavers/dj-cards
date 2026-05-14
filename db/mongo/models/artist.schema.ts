import { Schema, model, models, Model, Document, Types } from "mongoose"

export type PoseChoice = "hands_in_air" | "knob_twiddler" | "headphone_grab" | "fist_pump" | "the_lean" | "eyes_closed" | "natural"
export type Skill = "scratching" | "long_mixes" | "vinyl" | "cdjs" | "ableton" | "guitar" | "vocalist"

export interface ArtistDoc extends Document {
  djName: string
  editedPhoto: string
  poseChoice: PoseChoice
  customPose: string
  genres: [string, string]
  stats: {
    yearsPlaying: number
    tracksUploaded: number
    totalFollowers: number
    bpm: number
    danceabilityScale: number
  }
  skills: Skill[]
  cardNumber: number
  qrCodeUrl: string
  socials: {
    instagram: string
    soundcloud: string
  }
  contactDetails: {
    email: string
    phone?: string
    address: string
  }
  invitedBy: Types.ObjectId | null
  team: Types.ObjectId
}

const ArtistSchema = new Schema<ArtistDoc>(
  {
    djName: { type: String, required: true },
    editedPhoto: { type: String, default: "" },
    poseChoice: {
      type: String,
      enum: ["hands_in_air", "knob_twiddler", "headphone_grab", "fist_pump", "the_lean", "eyes_closed", "natural"],
      default: "headphone_grab",
    },
    customPose: { type: String, default: "" },
    genres: { type: [String], validate: (v: string[]) => v.length === 2 },
    stats: {
      yearsPlaying: { type: Number, default: 0 },
      tracksUploaded: { type: Number, default: 0 },
      totalFollowers: { type: Number, default: 0 },
      bpm: { type: Number, default: 128 },
      danceabilityScale: { type: Number, min: 0, max: 100, default: 50 },
    },
    skills: [{ type: String }],
    cardNumber: { type: Number },
    qrCodeUrl: { type: String, default: "" },
    socials: {
      instagram: { type: String, default: "" },
      soundcloud: { type: String, default: "" },
    },
    contactDetails: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: "Artist", default: null },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
  },
  { timestamps: true }
)

const ArtistModel =
  (models.Artist as Model<ArtistDoc> | undefined) || model<ArtistDoc>("Artist", ArtistSchema)

export default ArtistModel
