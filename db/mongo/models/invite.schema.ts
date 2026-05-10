import { Schema, model, models, Model, Document, Types } from "mongoose"

export interface InviteDoc extends Document {
  token: string
  team: Types.ObjectId
  usedAt: Date | null
  createdBy: Types.ObjectId
}

const InviteSchema = new Schema<InviteDoc>(
  {
    token: { type: String, required: true, unique: true },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
    usedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "Artist" },
  },
  { timestamps: true }
)

const InviteModel =
  (models.Invite as Model<InviteDoc> | undefined) || model<InviteDoc>("Invite", InviteSchema)

export default InviteModel
