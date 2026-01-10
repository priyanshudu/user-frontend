document.addEventListener("DOMContentLoaded", () => {
    const applyForm = document.getElementById("applyForm");
    const skillsContainer = document.getElementById("skillsContainer");
    const addSkillBtn = document.getElementById("addSkillBtn");

    // --- SET jobId from URL ---
    const jobIdFromUrl = new URLSearchParams(window.location.search).get('jobId');
    if (jobIdFromUrl) {
        const jobIdInput = document.getElementById('jobId');
        if (jobIdInput) jobIdInput.value = jobIdFromUrl;
    }

    // --- Dynamic skill adding ---
    addSkillBtn.addEventListener("click", () => {
        const div = document.createElement("div");
        div.className = "skill-input";
        div.innerHTML = `
            <input type="text" name="skills[]" placeholder="Enter a skill" required>
            <button type="button" class="removeSkillBtn">-</button>
        `;
        skillsContainer.appendChild(div);

        // Remove button
        div.querySelector(".removeSkillBtn").addEventListener("click", () => div.remove());
    });

    // --- Terms link ---
    const termsLink = document.getElementById("termsLink");
    if (termsLink) {
        termsLink.addEventListener("click", (e) => {
            e.preventDefault();
            alert("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.");
        });
    }

    // --- Form submission ---
    applyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("candidateName").value.trim();
        const email = document.getElementById("candidateEmail").value.trim();
        const phone = document.getElementById("candidatePhone").value.trim();
        const location = document.getElementById("location").value.trim();
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const educationLevel = document.getElementById("educationLevel").value;
        const graduationDate = document.getElementById("graduationDate").value;
        const experience = document.getElementById("experience").value.trim();
        const resume = document.getElementById("cv").files[0];
        const jobId = document.getElementById("jobId").value;

        // --- Validations ---
        if (!name || !email || !phone || !location || !gender || !educationLevel || !graduationDate || !experience || !resume || !jobId) {
            alert("All fields are required!");
            return;
        }

        if (!/^[A-Za-z\s]+$/.test(name)) {
            alert("Name should contain only letters.");
            return;
        }

        if (!/^\d{1,10}$/.test(phone)) {
            alert("Phone should contain only numbers (max 10).");
            return;
        }

        const skillInputs = document.querySelectorAll('input[name="skills[]"]');
        const skills = Array.from(skillInputs).map(i => i.value.trim()).filter(s => s);
        if (skills.length === 0) {
            alert("Add at least one skill.");
            return;
        }

        // --- Prepare FormData ---
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", phone);
        formData.append("location", location);
        formData.append("gender", gender);
        formData.append("education", JSON.stringify({ level: educationLevel, completionDate: graduationDate }));
        formData.append("experience", experience);
        formData.append("resume", resume);
        formData.append("skills", JSON.stringify(skills));
        formData.append("jobId", jobId);

        // --- Send to backend ---
        try {
            const res = await fetch("http://localhost:5000/api/applications/create", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                applyForm.innerHTML = `
                    <div style="text-align:center; margin-top:50px;">
                        <h2>🎉 Application Submitted! 🎉</h2>
                        <p>Our HR is reviewing your CV! 🦉</p>
                    </div>
                `;
            } else {
                alert(data.message || "Failed to submit application");
            }
        } catch (err) {
            console.error(err);
            alert("Server error. Try again later.");
        }
    });
});
