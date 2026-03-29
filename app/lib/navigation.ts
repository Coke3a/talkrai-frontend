/**
 * Returns the LINE Official Account deep link for returning users to chat.
 */
export function getLineReturnUrl(): string {
  return (
    process.env.NEXT_PUBLIC_LINE_OA_URL || "https://line.me/R/ti/p/@talkrai"
  );
}
