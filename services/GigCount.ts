import mongoose from "mongoose"

// Gigs played = roster events (in the shared djcards db, owned by the roster app)
// up to and including today where the artist held a slot. Computed live rather
// than stored, so the artists collection never needs a write.
export class GigCount {
  // Roster stores event dates as UTC midnight of the venue's (Sydney) calendar date.
  static todayCutoff() {
    const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" })
      .format(new Date())
      .split("-")
      .map(Number)
    return new Date(Date.UTC(y, m - 1, d))
  }

  static async byArtist(): Promise<Map<string, number>> {
    const db = mongoose.connection.db
    if (!db) return new Map()
    const rows = await db
      .collection("roster_events")
      .aggregate<{ _id: mongoose.Types.ObjectId; gigs: number }>([
        { $match: { date: { $lte: GigCount.todayCutoff() } } },
        { $unwind: "$slots" },
        { $match: { "slots.claim.artistId": { $ne: null } } },
        // One slot per event counts once, even if someone took two slots.
        { $group: { _id: { artist: "$slots.claim.artistId", event: "$_id" } } },
        { $group: { _id: "$_id.artist", gigs: { $sum: 1 } } },
      ])
      .toArray()
    return new Map(rows.map((r) => [String(r._id), r.gigs]))
  }

  static async attach<T extends { _id: unknown }>(artists: T[]): Promise<(T & { gigCount: number })[]> {
    const counts = await GigCount.byArtist()
    return artists.map((a) => ({ ...a, gigCount: counts.get(String(a._id)) ?? 0 }))
  }
}
