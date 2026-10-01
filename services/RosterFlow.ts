import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

const COOKIE_NAME = "roster_return"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Hand-off from the roster app: a DJ arriving via /create?roster=<eventId>
// gets the event stashed in a cookie so we can link them back after their
// card is created.
export class RosterFlow {
  static setCookie(eventId: string, jar: ReadonlyRequestCookies) {
    jar.set(COOKIE_NAME, eventId, { httpOnly: true, path: "/", maxAge: COOKIE_MAX_AGE })
  }

  static getEventId(jar: ReadonlyRequestCookies) {
    return jar.get(COOKIE_NAME)?.value ?? null
  }

  static clear(jar: ReadonlyRequestCookies) {
    jar.delete(COOKIE_NAME)
  }

  static rosterEventUrl(eventId: string) {
    const base = process.env.NEXT_PUBLIC_ROSTER_URL ?? "http://localhost:3010"
    return `${base}/event/${eventId}`
  }
}
