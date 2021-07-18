export async function postLog(data) {
  const send = JSON.stringify({
    d: data,
    time: Date.now()
  });

  const LOG_URL = 'https://passwords-ana-recordings-marsh.trycloudflare.com';
  return await fetch(LOG_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: send
  });
}
