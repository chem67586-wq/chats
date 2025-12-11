const userIdMap = new Map<string, number>();
let userCounter = 1;

export function getAnonymousName(userId: string): string {
  if (!userIdMap.has(userId)) {
    userIdMap.set(userId, userCounter++);
  }
  return `User ${userIdMap.get(userId)}`;
}

export function getAnonymousInitial(userId: string): string {
  if (!userIdMap.has(userId)) {
    userIdMap.set(userId, userCounter++);
  }
  return `U${userIdMap.get(userId)}`;
}
