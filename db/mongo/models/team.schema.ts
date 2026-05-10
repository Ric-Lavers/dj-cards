import { Schema, model, models, Model, Document } from "mongoose"

export interface TeamDoc extends Document {
  name: string
  slug: string
}

const TeamSchema = new Schema<TeamDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
)

const TeamModel =
  (models.Team as Model<TeamDoc> | undefined) || model<TeamDoc>("Team", TeamSchema)

export default TeamModel
