import { Schema, model, models, Model, Document } from "mongoose"

export interface SpecialSkillDoc extends Document {
  name: string
  prompt: string
  largeImage: string
  smallImage: string
  invented: boolean
  order: number
}

const SpecialSkillSchema = new Schema<SpecialSkillDoc>(
  {
    name: { type: String, required: true, unique: true },
    prompt: { type: String, default: "" },
    largeImage: { type: String, default: "" },
    smallImage: { type: String, default: "" },
    invented: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const SpecialSkillModel =
  (models.SpecialSkill as Model<SpecialSkillDoc> | undefined) ||
  model<SpecialSkillDoc>("SpecialSkill", SpecialSkillSchema)

export default SpecialSkillModel
