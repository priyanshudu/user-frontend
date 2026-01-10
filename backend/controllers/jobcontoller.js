

const skillsArray = skills.split(',').map(skill => skill.trim());
await supabase.from('jobs').insert([{ department, role, vacancy, description, skills: skillsArray }]);
