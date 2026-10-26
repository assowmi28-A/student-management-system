
/** Central place for backend communication. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000"
    : "https://student-management-api-62kg.onrender.com");
const API_BASE_URL = API_URL.replace(/\/+$/, "");
const API_PATH_PREFIX = API_BASE_URL.endsWith("/api") ? "" : "/api";

export type Student = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  course: string | null;
  address: string | null;
};

export type StudentPage = {
  items: Student[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type StudentSummary = {
  total_students: number;
  total_courses: number;
  male_students: number;
  female_students: number;
};

export type CountItem = {
  label: string;
  total: number;
};

export type StudentReports = StudentSummary & {
  other_students: number;
  course_counts: CountItem[];
  gender_counts: CountItem[];
};

export type StudentInput = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  course: string | null;
  address: string | null;
};

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const headers = new Headers(options?.headers);
  if (options?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const method = (options?.method ?? "GET").toUpperCase();
  const attempts = method === "GET" ? 3 : 1;
  let response: Response | undefined;
  let networkError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      response = await fetch(`${API_BASE_URL}${API_PATH_PREFIX}${path}`, {
        ...options,
        headers,
      });
      break;
    } catch (error: unknown) {
      networkError = error;
      if (attempt + 1 < attempts) {
        await wait(500 * 2 ** attempt);
      }
    }
  }

  if (!response) {
    const reason =
      networkError instanceof Error ? ` ${networkError.message}` : "";
    throw new Error(
      `Could not connect to the student API at ${API_BASE_URL}. ` +
        `Check that the backend is available and permits this frontend origin.${reason}`
    );
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const body: { detail?: string | { msg?: string }[] } =
        await response.json();

      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        message = body.detail
          .map((issue) => issue.msg ?? "Invalid input.")
          .join(" ");
      }
    } catch {
      // Keep the HTTP status message if the response has no JSON body.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
