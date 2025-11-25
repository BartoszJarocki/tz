import crypto from 'node:crypto';

const TIMESTAMP_WINDOW_SECONDS = 60; // Tighter than Slack's suggested 5 min

export function verifySlackSignature(
  signature: string,
  timestamp: string,
  body: string
): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) {
    throw new Error('SLACK_SIGNING_SECRET is not set');
  }

  const time = Math.floor(Date.now() / 1000);
  if (Math.abs(time - Number.parseInt(timestamp, 10)) > TIMESTAMP_WINDOW_SECONDS) {
    return false;
  }

  const baseString = `v0:${timestamp}:${body}`;
  const mySignature = `v0=${crypto.createHmac('sha256', signingSecret).update(baseString, 'utf8').digest('hex')}`;

  return crypto.timingSafeEqual(
    Buffer.from(mySignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
}
