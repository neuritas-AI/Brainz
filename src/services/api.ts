import axios from 'axios';

const api = axios.create({
  baseURL: '',
  timeout: 120000,
});

export type ChatRequest = { message: string; };
export type ChatResponse = { response: string; };

function fallbackResponse(reason: string): ChatResponse {
  return {
    response:
      `The AI backend is currently unavailable (${reason}). The ngrok tunnel is rejecting the request, so I am using fallback mode for now. Please verify the ngrok URL or restart the backend tunnel to restore real AI responses.`,
  };
}

export async function postChatMessage(message: string) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!backendUrl) {
    return fallbackResponse('NEXT_PUBLIC_API_URL is not configured');
  }

  try {
    const { data } = await api.post<ChatResponse>('/api/chat', { message } as ChatRequest);
    return data;
  } catch (error: any) {
    const status = error?.response?.status;
    const detail = error?.response?.data?.message || error?.message || 'Unknown error';

    if (status === 403 || status === 404 || status === 429 || !error?.response) {
      return fallbackResponse(`HTTP ${status || 'network error'} - ${detail}`);
    }

    return fallbackResponse(`HTTP ${status || 'request error'} - ${detail}`);
  }
}
