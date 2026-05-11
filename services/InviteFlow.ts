import { Types } from "mongoose"
import InviteModel from "@/db/mongo/models/invite.schema"
import { connectToDatabase } from "@/db/mongo/connect"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

const COOKIE_NAME = "invite_token"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export class InviteFlow {
  static async fromToken(token: string) {
    await connectToDatabase()
    const invite = await InviteModel.findOne({ token })
    return new InviteFlow(invite)
  }

  static setCookie(token: string, jar: ReadonlyRequestCookies) {
    jar.set(COOKIE_NAME, token, { httpOnly: true, path: "/", maxAge: COOKIE_MAX_AGE })
  }

  static getToken(jar: ReadonlyRequestCookies) {
    return jar.get(COOKIE_NAME)?.value ?? null
  }

  static async create(createdBy: Types.ObjectId) {
    await connectToDatabase()
    const { randomBytes } = await import("crypto")
    const token = randomBytes(16).toString("hex")
    const invite = await InviteModel.create({ token, createdBy })
    return invite.token
  }

  constructor(private invite: InstanceType<typeof InviteModel> | null) {}

  get valid() {
    return !!this.invite
  }

  get invitedBy() {
    return this.invite?.createdBy ?? null
  }

  async record(artistId: Types.ObjectId) {
    if (!this.invite) return
    await InviteModel.findByIdAndUpdate(this.invite._id, {
      $push: { usedBy: artistId },
    })
  }
}
