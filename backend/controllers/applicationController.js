const supabase = require('../config/db');

/* ==============================
   GET CANDIDATE PROFILE
============================== */
exports.getCandidateProfile = async (req, res) => {
  try {
    // ✅ Get candidateId from JWT
    const candidateId = req.candidate.id;

    const { data, error } = await supabase
      .from('candidate_resume')
      .select('*')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) return res.status(500).json({ message: error.message });
    if (!data) {
      // return empty structure for first-time users
      return res.json({
        career_objective: "",
        education: [],
        experience: [],
        skills: [],
        projects: [],
        trainings: [],
        accomplishments: "",
        resume_url: ""
      });
    }

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ==============================
   CREATE OR UPDATE PROFILE
============================== */
exports.createOrUpdateProfile = async (req, res) => {
  try {
    // ✅ Use candidateId from JWT
    const candidateId = req.candidate.id;
    const {
      careerObjective,
      education,
      experience,
      skills,
      projects,
      trainings,
      accomplishments,
      resume,
      resumeFileName
    } = req.body;

    // 1️⃣ Fetch existing resume URL
    let resume_url = null;
    const { data: existingData } = await supabase
      .from('candidate_resume')
      .select('resume_url')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (existingData && existingData.resume_url) resume_url = existingData.resume_url;

    // 2️⃣ Upload new resume if present
    if (resume && resumeFileName) {
      const buffer = Buffer.from(resume, 'base64');

      const { error: uploadError } = await supabase
        .storage
        .from('resumes')
        .upload(`candidate_${candidateId}/${resumeFileName}`, buffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf'
        });

      if (uploadError) return res.status(500).json({ message: uploadError.message });

      const { data: urlData } = supabase
        .storage
        .from('resumes')
        .getPublicUrl(`candidate_${candidateId}/${resumeFileName}`);

      resume_url = urlData.publicUrl;
    }

    // 3️⃣ Upsert candidate profile
    const { data, error } = await supabase
      .from('candidate_resume')
      .upsert({
        candidate_id: candidateId,
        career_objective: careerObjective,
        education,
        experience,
        skills,
        projects,
        trainings,
        accomplishments,
        resume_url
      }, { onConflict: 'candidate_id' })
      .select()
      .maybeSingle();

    if (error) return res.status(400).json({ message: error.message });

    res.json({
      message: "Profile saved successfully ✅",
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =============================
   APPLY FOR JOB
============================= */
exports.applyForJob = async (req, res) => {
  try {
    const candidateId = req.candidate.id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "JobId required" });
    }

    // Check already applied
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("candidate_id", candidateId)
      .eq("job_id", jobId)
      .maybeSingle();

    if (existing) {
      return res.json({ message: "Already applied" });
    }

    // Insert application
    const { error } = await supabase
      .from("applications")
      .insert([
        {
          candidate_id: candidateId,
          job_id: jobId,
          status: "pending"
        }
      ]);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: "Application submitted successfully ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =============================
   CHECK IF ALREADY APPLIED
============================= */
exports.checkApplied = async (req, res) => {
  try {
    const candidateId = req.candidate.id;
    const { jobId } = req.params;

    const { data, error } = await supabase
      .from("applications")
      .select("id")
      .eq("candidate_id", candidateId)
      .eq("job_id", jobId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ applied: !!data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
