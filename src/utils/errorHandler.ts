export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleApiError(response: Response) {
  if (!response.ok) {
    const data = await response.json();
    throw new ApiError(
      response.status,
      data.error || 'Request failed',
      data
    );
  }
  return response.json();
}

