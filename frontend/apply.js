document.addEventListener("DOMContentLoaded", () => {

  // ==============================
  // ELEMENTS
  // ==============================
  const phase1 = document.getElementById("phase1");
  const phase2 = document.getElementById("phase2");
  const phase3 = document.getElementById("phase3");
  const progressBar = document.getElementById("progressBar");

  const nextBtn1 = document.getElementById("nextBtn1");
  const backBtn2 = document.getElementById("backBtn2");
  const nextBtn2 = document.getElementById("nextBtn2");
  const backBtn3 = document.getElementById("backBtn3");
  const submitBtn = document.getElementById("submitBtn");

  // ==============================
  // AUTH CHECK
  // ==============================
  const candidateId = localStorage.getItem("candidateId");
  if (!candidateId) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const jobId = new URLSearchParams(window.location.search).get("jobId");
  if (!jobId) {
    alert("No job selected");
    window.location.href = "dashboard.html";
    return;
  }

  // ==============================
  // PROGRESS BAR
  // ==============================
  const setProgress = percent => {
    progressBar.style.width = percent + "%";
  };
  setProgress(33);

  // ==============================
  // LOAD PROFILE DATA
  // ==============================
  const loadProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${candidateId}`);
      if (!res.ok) throw new Error("Profile not found");

      const data = await res.json();

      document.getElementById("careerObjectiveDisplay").textContent =
        data.career_objective || "Not provided";

      document.getElementById("educationDisplay").textContent =
        (data.education || []).map(e =>
          `${e.degree} - ${e.institute} (${e.year})`
        ).join("\n") || "Not provided";

      document.getElementById("experienceDisplay").textContent =
        (data.experience || []).map(e =>
          `${e.role} at ${e.company} (${e.start} - ${e.end})`
        ).join("\n") || "Not provided";

      document.getElementById("skillsDisplay").textContent =
        (data.skills || []).join(", ") || "Not provided";

      document.getElementById("projectsDisplay").textContent =
        (data.projects || []).map(p =>
          `${p.name}: ${p.description}`
        ).join("\n") || "Not provided";

      document.getElementById("trainingsDisplay").textContent =
        (data.trainings || []).map(t =>
          `${t.name} (${t.date})`
        ).join("\n") || "Not provided";

      document.getElementById("accomplishmentsDisplay").textContent =
        data.accomplishments || "Not provided";

      const resumeLink = document.getElementById("resumeLink");
      if (data.resume_url) {
        resumeLink.href = data.resume_url;
        resumeLink.textContent = "View Resume";
      } else {
        resumeLink.removeAttribute("href");
        resumeLink.textContent = "Not uploaded";
      }

    } catch (err) {
      console.error(err);
      alert("Failed to load profile");
    }
  };

  loadProfile();

  // ==============================
  // PHASE NAVIGATION
  // ==============================
  nextBtn1.onclick = () => {
    phase1.classList.add("hidden");
    phase2.classList.remove("hidden");
    setProgress(66);
  };

  backBtn2.onclick = () => {
    phase2.classList.add("hidden");
    phase1.classList.remove("hidden");
    setProgress(33);
  };

  nextBtn2.onclick = () => {
    phase2.classList.add("hidden");
    phase3.classList.remove("hidden");
    setProgress(100);
  };

  backBtn3.onclick = () => {
    phase3.classList.add("hidden");
    phase2.classList.remove("hidden");
    setProgress(66);
  };

  // ==============================
  // FINAL SUBMIT
  // ==============================
  submitBtn.onclick = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, jobId })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Application failed");
        return;
      }

      alert("Application submitted successfully ✅");
      window.location.href = "dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

});
