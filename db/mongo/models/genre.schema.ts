import { Schema, model, models, Model, Document } from "mongoose"

export interface GenreDoc extends Document {
  name: string
  order: number
}

const GenreSchema = new Schema<GenreDoc>({
  name: { type: String, required: true, unique: true },
  order: { type: Number, default: 0 },
})

const GenreModel =
  (models.Genre as Model<GenreDoc> | undefined) || model<GenreDoc>("Genre", GenreSchema)

export default GenreModel
