type ErrorLike = { code?: string | number; message?: string }

export function isUserRejection(error: unknown): boolean {
  const code = (error as ErrorLike)?.code
  if (code === 4001 || code === 'ACTION_REJECTED') return true
  const msg = ((error as ErrorLike)?.message ?? '').toLowerCase()
  return msg.includes('user rejected') || msg.includes('user denied')
}
