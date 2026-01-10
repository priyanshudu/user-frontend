document.addEventListener("DOMContentLoaded", async () => {

    // ================================
    // LOGIN LOGIC
    // ================================
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert("Enter a valid email");
                return;
            }

            if (!password) {
                alert("Password cannot be empty");
                return;
            }

            try {
                const res = await fetch("http://localhost:5000/api/candidates/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.message || "Login failed");
                    return;
                }

                localStorage.setItem("candidateId", data.candidate.id);
                localStorage.setItem("candidateName", data.candidate.name);
                localStorage.setItem("candidateEmail", data.candidate.email);

                window.location.href = "dashboard.html";

            } catch (err) {
                console.error("LOGIN ERROR:", err);
                alert("Server error. Please try again later.");
            }
        });

        return; // Stop running the rest on login page
    }

    // ================================
    // DASHBOARD LOGIC
    // Only runs if we are on dashboard.html
    // ================================
    const menuBtn = document.getElementById("menuBtn");
    const slideMenu = document.getElementById("slideMenu");

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            slideMenu.classList.toggle("active");
        });
    }

    // Menu buttons
    const btnPersonalInfo = document.getElementById("btnpersonal-info");
    const btnJobs = document.getElementById("btnJobs");
    const btnMessages = document.getElementById("btnMessages");
    const btnLogout = document.getElementById("btnLogout");

    if (btnPersonalInfo) btnPersonalInfo.addEventListener("click", () => window.location.href = "personal-info.html");
    if (btnJobs) btnJobs.addEventListener("click", () => window.location.href = "dashboard.html");
    if (btnMessages) btnMessages.addEventListener("click", () => window.location.href = "messages.html");
    if (btnLogout) btnLogout.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
    });

    // Check login
    const candidateId = localStorage.getItem("candidateId");
    if (!candidateId && document.getElementById("jobsContainer")) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const jobsContainer = document.getElementById("jobsContainer");
    if (!jobsContainer) return;

    try {
        // Fetch all jobs
        const res = await fetch("http://localhost:5000/api/jobs");
        const data = await res.json();

        if (!res.ok || !data.jobs) {
            jobsContainer.innerHTML = "<p>Failed to load jobs</p>";
            return;
        }

        jobsContainer.innerHTML = "";

        for (const job of data.jobs) {
            // ✅ Check from backend if already applied
            const checkRes = await fetch(`http://localhost:5000/api/applications/check/${candidateId}/${job.id}`);
            const checkData = await checkRes.json();
            const isApplied = checkData.applied;

            const jobDiv = document.createElement("div");
            jobDiv.className = "job-card";
            jobDiv.innerHTML = `
                <h3>${job.role} (${job.department})</h3>
                <p><strong>Vacancy:</strong> ${job.vacancy}</p>
                <p><strong>Description:</strong> ${job.description}</p>
                <button class="applyBtn" data-jobid="${job.id}" ${isApplied ? "disabled" : ""}>
                    ${isApplied ? "Already Applied" : "Apply"}
                </button>
            `;
            jobsContainer.appendChild(jobDiv);
        }

        // Add click listeners for apply buttons
        document.querySelectorAll(".applyBtn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const jobId = e.target.dataset.jobid;

                try {
                    const applyRes = await fetch("http://localhost:5000/api/applications/apply", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ candidateId, jobId })
                    });

                    const applyData = await applyRes.json();

                    if (!applyRes.ok) {
                        alert(applyData.message || "Failed to apply");
                        return;
                    }

                    

                    // Disable button
                    btn.innerText = "Already Applied";
                    btn.disabled = true;

                    // Redirect to apply page
                    window.location.href = `apply.html?jobId=${jobId}`;

                } catch (err) {
                    console.error("Apply error:", err);
                    alert("Server error while applying");
                }
            });
        });

    } catch (err) {
        console.error(err);
        jobsContainer.innerHTML = "<p>Server error. Try again later.</p>";
    }

});
