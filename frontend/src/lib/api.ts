/** Central place for backend communication. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type Student = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
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
  email: string;
  date_of_birth: string;
  gender: string;
  course: string;
  address: string;
};

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;
    try {
      const body: { detail?: string | { msg?: string }[] } =
        await response.json();
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        message = body.detail.map((issue) => issue.msg ?? "Invalid input.").join(" ");
      }
    } catch {
      // Keep the HTTP status message when the response has no JSON body.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
