document.addEventListener("DOMContentLoaded", () => {
  const candidateId = localStorage.getItem("candidateId");
  if (!candidateId) {
    alert("Candidate ID missing. Please login first.");
    window.location.href = "login.html";
    return;
  }

  // =======================
  // ELEMENTS
  // =======================
  const careerObjective = document.getElementById("careerObjective");
  const educationContainer = document.getElementById("educationContainer");
  const experienceContainer = document.getElementById("experienceContainer");
  const skillsContainer = document.getElementById("skillsContainer");
  const projectsContainer = document.getElementById("projectsContainer");
  const trainingsContainer = document.getElementById("trainingsContainer");
  const portfolioContainer = document.getElementById("portfolioContainer");
  const accomplishments = document.getElementById("accomplishments");
  const resumeUpload = document.getElementById("resumeUpload");
  const resumePreview = document.getElementById("resumePreview");

  // =======================
  // NAVIGATION BUTTONS
  // =======================
  const navButtons = document.querySelectorAll(".nav-buttons button");
  navButtons[0].onclick = () => window.location.href = "personal-info.html";
  navButtons[1].onclick = () => window.location.href = "messages.html";
  navButtons[2].onclick = () => window.location.href = "dashboard.html";
  navButtons[3].onclick = () => {
    localStorage.clear();
    window.location.href = "login.html";
  };

  // =======================
  // HELPERS
  // =======================
  const createItemBox = (html, container) => {
    const div = document.createElement("div");
    div.className = "item-box";
    div.innerHTML = html;
    container.appendChild(div);
  };
  const clearSection = container => container.innerHTML = "";

  // =======================
  // ADD / REMOVE BUTTONS
  // =======================
  document.getElementById("addEducationBtn").onclick = () =>
    createItemBox(`<input placeholder="Degree"><input placeholder="Institute"><input placeholder="Year">`, educationContainer);

  document.getElementById("addExperienceBtn").onclick = () =>
    createItemBox(`<input placeholder="Role"><input placeholder="Company"><input type="date"><input type="date"><textarea placeholder="Description"></textarea>`, experienceContainer);

  document.getElementById("addSkillBtn").onclick = () =>
    createItemBox(`<input placeholder="Skill">`, skillsContainer);

  document.getElementById("addProjectBtn").onclick = () =>
    createItemBox(`<input placeholder="Project Name"><input placeholder="Description">`, projectsContainer);

  document.getElementById("addTrainingBtn").onclick = () =>
    createItemBox(`<input placeholder="Training Name"><input type="date">`, trainingsContainer);

  document.getElementById("addPortfolioBtn").onclick = () =>
    createItemBox(`<input placeholder="Link">`, portfolioContainer);

  document.getElementById("removeCareer").onclick = () => careerObjective.value = "";
  document.getElementById("removeEducation").onclick = () => clearSection(educationContainer);
  document.getElementById("removeExperience").onclick = () => clearSection(experienceContainer);
  document.getElementById("removeSkills").onclick = () => clearSection(skillsContainer);
  document.getElementById("removeProjects").onclick = () => clearSection(projectsContainer);
  document.getElementById("removeTrainings").onclick = () => clearSection(trainingsContainer);
  document.getElementById("removePortfolio").onclick = () => clearSection(portfolioContainer);
  document.getElementById("removeAccomplishments").onclick = () => accomplishments.value = "";
  document.getElementById("removeResume").onclick = () => {
    resumeUpload.value = "";
    resumePreview.src = "";
    resumePreview.style.display = "none";
  };

  // =======================
  // RESUME MAX SIZE + PREVIEW
  // =======================
  resumeUpload.addEventListener("change", () => {
    const file = resumeUpload.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size exceeds 5MB. Please select a smaller file.");
      resumeUpload.value = "";
      resumePreview.style.display = "none";
      return;
    }

    // Preview PDF
    const reader = new FileReader();
    reader.onload = (e) => {
      resumePreview.src = e.target.result;
      resumePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  // =======================
  // BUILD PAYLOAD FOR SAVE/UPDATE
  // =======================
  const buildPayload = async () => {
    const payload = {
      candidateId,
      careerObjective: careerObjective.value,
      education: [...educationContainer.children].map(d => ({
        degree: d.children[0].value,
        institute: d.children[1].value,
        year: d.children[2].value
      })),
      experience: [...experienceContainer.children].map(d => ({
        role: d.children[0].value,
        company: d.children[1].value,
        start: d.children[2].value,
        end: d.children[3].value,
        description: d.children[4].value
      })),
      skills: [...skillsContainer.children].map(d => d.children[0].value),
      projects: [...projectsContainer.children].map(d => ({
        name: d.children[0].value,
        description: d.children[1].value
      })),
      trainings: [...trainingsContainer.children].map(d => ({
        name: d.children[0].value,
        date: d.children[1].value
      })),
      portfolio: [...portfolioContainer.children].map(d => d.children[0].value),
      accomplishments: accomplishments.value
    };

    if (resumeUpload.files.length > 0) {
      const file = resumeUpload.files[0];
      const reader = new FileReader();
      payload.resume = await new Promise(resolve => {
        reader.onload = () => resolve(reader.result.split(",")[1]); // base64
        reader.readAsDataURL(file);
      });
      payload.resumeFileName = file.name;
    }

    return payload;
  };

  // =======================
  // SAVE / UPDATE PROFILE
  // =======================
  document.getElementById("submitPersonalInfoBtn").onclick = async () => {
    try {
      const payload = await buildPayload();

      const res = await fetch("http://localhost:5000/api/applications/createOrUpdate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) { 
        alert(data.message || "Error saving profile"); 
        return; 
      }

      alert("Profile saved successfully ✅");
      loadCandidateInfo();

    } catch (err) {
      console.error("Save error:", err);
      alert("Server error");
    }
  };

  // =======================
  // LOAD EXISTING DATA
  // =======================
  const loadCandidateInfo = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${candidateId}`);
      if (!res.ok) return;
      const info = await res.json();

      careerObjective.value = info.career_objective || "";

      if (Array.isArray(info.education)) {
        clearSection(educationContainer);
        info.education.forEach(ed =>
          createItemBox(`<input value="${ed.degree || ""}"><input value="${ed.institute || ""}"><input value="${ed.year || ""}">`, educationContainer)
        );
      }

      if (Array.isArray(info.experience)) {
        clearSection(experienceContainer);
        info.experience.forEach(ex =>
          createItemBox(`<input value="${ex.role || ""}"><input value="${ex.company || ""}"><input type="date" value="${ex.start || ""}"><input type="date" value="${ex.end || ""}"><textarea>${ex.description || ""}</textarea>`, experienceContainer)
        );
      }

      if (Array.isArray(info.skills)) {
        clearSection(skillsContainer);
        info.skills.forEach(sk =>
          createItemBox(`<input value="${sk}">`, skillsContainer)
        );
      }

      if (Array.isArray(info.projects)) {
        clearSection(projectsContainer);
        info.projects.forEach(p =>
          createItemBox(`<input value="${p.name || ""}"><input value="${p.description || ""}">`, projectsContainer)
        );
      }

      if (Array.isArray(info.trainings)) {
        clearSection(trainingsContainer);
        info.trainings.forEach(t =>
          createItemBox(`<input value="${t.name || ""}"><input type="date" value="${t.date || ""}">`, trainingsContainer)
        );
      }

      if (Array.isArray(info.portfolio)) {
        clearSection(portfolioContainer);
        info.portfolio.forEach(link =>
          createItemBox(`<input value="${link}">`, portfolioContainer)
        );
      }

      accomplishments.value = info.accomplishments || "";

      if (info.resume_url) {
        resumePreview.src = info.resume_url;
        resumePreview.style.display = "block";
      } else {
        resumePreview.src = "";
        resumePreview.style.display = "none";
      }

    } catch (err) {
      console.error("Load error:", err);
    }
  };

  loadCandidateInfo();
});
