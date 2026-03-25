export async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf-8').trim();
  if (!text) {
    throw new Error('No data received from stdin');
  }
  return text;
}

export async function resolveInput(value: string): Promise<string> {
  return value === '-' ? readStdin() : value;
}
