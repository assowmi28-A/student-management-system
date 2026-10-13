
const API_BASE = "http://127.0.0.1:8000";
const STUDENTS_URL = `${API_BASE}/students`;

const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentsTableBody");
const searchInput = document.getElementById("searchInput");
const formMessage = document.getElementById("formMessage");
const listMessage = document.getElementById("listMessage");
const submitBtn = document.getElementById("submitBtn");

let students = [];
let filteredStudents = [];

function showMessage(element, message, type = "error") {
  element.textContent = message;
  element.className = `message ${type}`;
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "message";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Backend response-ai frontend format-ku convert pannum.
function normalizeStudent(student) {
  return {
    id: student.id ?? student.student_id,
    first_name: student.first_name ?? student.firstName ?? "",
    last_name: student.last_name ?? student.lastName ?? "",
    email: student.email ?? "",
    phone: student.phone_number ?? student.phone ?? "",
    date_of_birth: student.date_of_birth ?? student.dob ?? "",
    gender: student.gender ?? "",
    course: student.course ?? "",
    address: student.address ?? ""
  };
}

// API request and error handling.
async function apiRequest(url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? {
          "Content-Type": "application/json"
        } : {}),
        ...options.headers
      }
    });
  } catch (error) {
    throw new Error(
      "Backend connect aagala. FastAPI server running-ah irukka-nu check pannu."
    );
  }

  const responseText = await response.text();
  let data = null;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = responseText;
  }

  if (!response.ok) {
    const detail = data?.detail ?? data?.message ?? data?.error;

    if (Array.isArray(detail)) {
      throw new Error(
        detail.map(item => {
          const field = Array.isArray(item.loc)
            ? item.loc.filter(part => part !== "body").join(" → ")
            : "";

          return field
            ? `${field}: ${item.msg}`
            : item.msg || JSON.stringify(item);
        }).join(" | ")
      );
    }

    throw new Error(
      typeof detail === "string"
        ? detail
        : `Request failed (${response.status}).`
    );
  }

  return data;
}

// Form values edukkum.
function getPayload() {
  return {
    first_name: document.getElementById("firstName").value.trim(),
    last_name: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    date_of_birth: document.getElementById("dob").value,
    gender: document.getElementById("gender").value,
    course: document.getElementById("course").value.trim(),
    address: document.getElementById("address").value.trim()
  };
}

// Form validation.
function validateStudent(data) {
  const requiredFields = [
    ["first_name", "First Name"],
    ["last_name", "Last Name"],
    ["email", "Email"],
    ["phone", "Phone Number"],
    ["date_of_birth", "Date of Birth"],
    ["gender", "Gender"],
    ["course", "Course"],
    ["address", "Address"]
  ];

  for (const [key, label] of requiredFields) {
    if (!data[key]) {
      return `${label} is required.`;
    }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(data.email)) {
    return "Please enter a valid email address.";
  }

  if (!/^[0-9+() -]{7,15}$/.test(data.phone)) {
    return "Please enter a valid phone number.";
  }

  const dob = new Date(`${data.date_of_birth}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(dob.getTime())) {
    return "Please select a valid date of birth.";
  }

  // Backend-um past date mattum accept pannum.
  if (dob >= today) {
    return "Date of birth must be in the past.";
  }

  const editId = document.getElementById("studentId").value;

  const duplicateEmail = students.some(student =>
    student.email.toLowerCase() === data.email.toLowerCase() &&
    String(student.id) !== String(editId)
  );

  if (duplicateEmail) {
    return "This email is already registered.";
  }

  return "";
}

// Dashboard statistics.
function updateStats() {
  document.getElementById("totalStudents").textContent =
    students.length;

  document.getElementById("totalCourses").textContent =
    new Set(
      students
        .map(student => student.course.trim().toLowerCase())
        .filter(Boolean)
    ).size;

  document.getElementById("searchResults").textContent =
    filteredStudents.length;
}

// Student table render pannum.
function renderStudents() {
  if (!filteredStudents.length) {
    const message = searchInput.value.trim()
      ? "No matching students found."
      : "No student records found.";

    tableBody.innerHTML =
      `<tr><td colspan="5">${message}</td></tr>`;
    return;
  }

  tableBody.innerHTML = filteredStudents.map(student => {
    const name =
      `${student.first_name} ${student.last_name}`.trim();

    return `
      <tr>
        <td>${escapeHTML(name || "Unnamed Student")}</td>
        <td>${escapeHTML(student.email)}</td>
        <td>${escapeHTML(student.phone)}</td>
        <td>${escapeHTML(student.course)}</td>
        <td>
          <button type="button" class="action-button"
            data-action="view" data-id="${escapeHTML(student.id)}">
            View
          </button>

          <button type="button" class="action-button"
            data-action="edit" data-id="${escapeHTML(student.id)}">
            Edit
          </button>

          <button type="button" class="action-button delete"
            data-action="delete" data-id="${escapeHTML(student.id)}">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// Search filter.
function applySearch() {
  const query = searchInput.value.trim().toLowerCase();

  filteredStudents = students.filter(student => {
    const fullName =
      `${student.first_name} ${student.last_name}`.toLowerCase();

    return fullName.includes(query) ||
      student.email.toLowerCase().includes(query);
  });

  renderStudents();
  updateStats();
}

// Backend-lendhu students load pannum.
async function loadStudents() {
  tableBody.innerHTML =
    '<tr><td colspan="5">Loading students...</td></tr>';

  try {
    const result = await apiRequest(STUDENTS_URL);

    const records = Array.isArray(result)
      ? result
      : result?.students ?? result?.items ?? result?.data ?? [];

    students = records.map(normalizeStudent);

    applySearch();
    clearMessage(listMessage);
  } catch (error) {
    students = [];
    filteredStudents = [];

    renderStudents();
    updateStats();
    showMessage(listMessage, error.message);
  }
}

// Form reset.
function resetForm() {
  form.reset();

  document.getElementById("studentId").value = "";
  document.getElementById("formTitle").textContent = "Add New Student";
  submitBtn.textContent = "Add Student";
  document.getElementById("cancelEditBtn").hidden = true;

  clearMessage(formMessage);
}

// Add student / Update student.
form.addEventListener("submit", async event => {
  event.preventDefault();
  clearMessage(formMessage);

  const payload = getPayload();
  const validationError = validateStudent(payload);

  if (validationError) {
    showMessage(formMessage, validationError);
    return;
  }

  const studentId =
    document.getElementById("studentId").value;

  const editing = Boolean(studentId);

  // Backend schema expects phone_number, not phone.
  const apiPayload = {
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    phone_number: payload.phone,
    date_of_birth: payload.date_of_birth,
    gender: payload.gender,
    course: payload.course,
    address: payload.address
  };

  submitBtn.disabled = true;
  submitBtn.textContent = editing ? "Saving..." : "Adding...";

  try {
    const url = editing
      ? `${STUDENTS_URL}/${encodeURIComponent(studentId)}`
      : STUDENTS_URL;

    const result = await apiRequest(url, {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(apiPayload)
    });

    resetForm();

    showMessage(
      formMessage,
      result?.message || (
        editing
          ? "Student updated successfully!"
          : "Student added successfully!"
      ),
      "success"
    );

    await loadStudents();
  } catch (error) {
    showMessage(formMessage, error.message);
  } finally {
    submitBtn.disabled = false;

    submitBtn.textContent =
      document.getElementById("studentId").value
        ? "Save Changes"
        : "Add Student";
  }
});

// Reset button.
document.getElementById("resetBtn").addEventListener("click", () => {
  setTimeout(resetForm, 0);
});

// Cancel edit.
document.getElementById("cancelEditBtn").addEventListener(
  "click",
  resetForm
);

// Search input.
searchInput.addEventListener("input", applySearch);

// View student details.
function showDetails(student) {
  const fields = [
    ["First Name", student.first_name],
    ["Last Name", student.last_name],
    ["Email", student.email],
    ["Phone Number", student.phone],
    ["Date of Birth", student.date_of_birth],
    ["Gender", student.gender],
    ["Course", student.course],
    ["Address", student.address]
  ];

  document.getElementById("detailsContent").innerHTML =
    fields.map(([label, value]) => `
      <div class="detail-item">
        <span class="detail-label">${escapeHTML(label)}</span>
        <div class="detail-value">${escapeHTML(value || "-")}</div>
      </div>
    `).join("");

  document.getElementById("detailsDialog").showModal();
}

document.getElementById("closeDetailsBtn").addEventListener(
  "click",
  () => document.getElementById("detailsDialog").close()
);

// View, Edit and Delete actions.
tableBody.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const student = students.find(
    item => String(item.id) === button.dataset.id
  );

  if (!student) {
    showMessage(listMessage, "Student not found.");
    return;
  }

  if (button.dataset.action === "view") {
    showDetails(student);
    return;
  }

  if (button.dataset.action === "edit") {
    document.getElementById("studentId").value = student.id;
    document.getElementById("firstName").value = student.first_name;
    document.getElementById("lastName").value = student.last_name;
    document.getElementById("email").value = student.email;
    document.getElementById("phone").value = student.phone;
    document.getElementById("dob").value =
      student.date_of_birth.slice(0, 10);
    document.getElementById("gender").value = student.gender;
    document.getElementById("course").value = student.course;
    document.getElementById("address").value = student.address;

    document.getElementById("formTitle").textContent = "Edit Student";
    submitBtn.textContent = "Save Changes";
    document.getElementById("cancelEditBtn").hidden = false;

    clearMessage(formMessage);

    document.getElementById("formPanel").scrollIntoView({
      behavior: "smooth"
    });

    return;
  }

  if (button.dataset.action === "delete") {
    const name =
      `${student.first_name} ${student.last_name}`.trim();

    if (!confirm(`Are you sure you want to delete ${name}'s record?`)) {
      return;
    }

    button.disabled = true;

    try {
      await apiRequest(
        `${STUDENTS_URL}/${encodeURIComponent(student.id)}`,
        { method: "DELETE" }
      );

      showMessage(
        listMessage,
        "Student deleted successfully!",
        "success"
      );

      await loadStudents();
    } catch (error) {
      showMessage(listMessage, error.message);
      button.disabled = false;
    }
  }
});

// Page open aagumbodhu existing records load aagum.
loadStudents();