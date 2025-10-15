/**
 * Transform Event
 * Transforms Event model to match API contract
 * Adds creatorUsername from associated User model
 */
export function transformEvent(event: any): any {
  const eventData = event.toJSON ? event.toJSON() : event;
  return {
    ...eventData,
    creatorUsername: eventData.creator?.username || '',
    creator: undefined, // Remove the nested creator object
  };
}
