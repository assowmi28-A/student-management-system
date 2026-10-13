```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Management System</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <header class="header">
        <div class="header-content">
            <div>
                <h1>Student Management System</h1>
                <p>Manage students, courses, and records in one place.</p>
            </div>
        </div>
    </header>

    <main class="container">

        <!-- Dashboard -->
        <section class="dashboard">
            <div class="dashboard-card">
                <h3>Total Students</h3>
                <p id="totalStudents">0</p>
            </div>

            <div class="dashboard-card">
                <h3>Total Courses</h3>
                <p id="totalCourses">0</p>
            </div>

            <div class="dashboard-card">
                <h3>Search Results</h3>
                <p id="searchResults">0</p>
            </div>
        </section>

        <!-- Add / Update Student Form -->
        <section class="form-section">
            <h2 id="formTitle">Add New Student</h2>
            <p class="section-description">
                Enter the student's details below.
            </p>

            <form id="studentForm">

                <div class="form-grid">

                    <div class="form-group">
                        <label for="first_name">First Name</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            placeholder="Enter first name"
                            required
                            minlength="1"
                            maxlength="100">
                    </div>

                    <div class="form-group">
                        <label for="last_name">Last Name</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            placeholder="Enter last name"
                            required
                            minlength="1"
                            maxlength="100">
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email address"
                            required>
                    </div>

                    <div class="form-group">
                        <label for="phone_number">Phone Number</label>
                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            placeholder="Enter phone number"
                            required
                            minlength="7"
                            maxlength="20">
                    </div>

                    <div class="form-group">
                        <label for="date_of_birth">Date of Birth</label>
                        <input
                            type="date"
                            id="date_of_birth"
                            name="date_of_birth"
                            required>
                    </div>

                    <div class="form-group">
                        <label for="gender">Gender</label>
                        <select id="gender" name="gender" required>
                            <option value="">Select gender</option>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">
                                Prefer not to say
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="course">Course</label>
                        <input
                            type="text"
                            id="course"
                            name="course"
                            placeholder="Enter course name"
                            required
                            minlength="2"
                            maxlength="100">
                    </div>

                    <div class="form-group full-width">
                        <label for="address">Address</label>
                        <textarea
                            id="address"
                            name="address"
                            rows="3"
                            placeholder="Enter full address"
                            required
                            minlength="5"
                            maxlength="500"></textarea>
                    </div>

                </div>

                <div class="form-actions">
                    <button type="submit" id="submitButton">
                        Add Student
                    </button>

                    <button
                        type="button"
                        id="cancelButton"
                        hidden>
                        Cancel Edit
                    </button>
                </div>

                <p id="statusMessage" role="status" aria-live="polite"></p>
            </form>
        </section>

        <!-- Student Records -->
        <section class="table-section">
            <div class="table-header">
                <div>
                    <h2>Student Records</h2>
                    <p class="section-description">
                        View, search, edit, and delete student information.
                    </p>
                </div>

                <div class="search-box">
                    <input
                        type="search"
                        id="searchInput"
                        placeholder="Search students..."
                        aria-label="Search students">
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Date of Birth</th>
                            <th>Gender</th>
                            <th>Course</th>
                            <th>Age</th>
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody id="studentTableBody">
                        <tr>
                            <td colspan="11">Loading student records...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

    </main>

    <footer class="footer">
        <p>Student Management System</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
```
