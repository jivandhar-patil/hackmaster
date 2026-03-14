import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  resumeSkills: string[];
  jobSkills: string[];
  existingSkills: string[];
  skillGap: string[];
  matchScore: number;
  courseRecommendations: {
    title: string;
    platform: string;
    duration: string;
    skill: string;
  }[];
  jobRecommendations: {
    title: string;
    company: string;
    skills: string[];
    matchScore: number;
    link: string;
  }[];
}

export interface RoadmapResult {
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  gaps: {
    critical: string[];
    important: string[];
    optional: string[];
  };
  roadmap: {
    step: string;
    description: string;
  }[];
  resources: {
    courses: string[];
    projects: string[];
    platforms: string[];
  };
  advice: string;
}

export async function generateCareerRoadmap(
  targetRole: string,
  currentSkills: string,
  experienceLevel: string,
  goals?: string
): Promise<RoadmapResult> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    You are an AI Skill Gap Analyzer. 
    Analyze the user's current skills and compare them with the skills required for the target role.
    
    Target Role: ${targetRole}
    Current Skills: ${currentSkills}
    Experience Level: ${experienceLevel}
    User Goals/Preferences: ${goals || "None specified"}
    
    Tasks:
    1. Identify core skills for the role in the current industry.
    2. Compare with user's existing skills.
    3. Identify gaps and categorize them (Critical, Important, Optional).
    4. Provide a 3-5 step learning roadmap.
    5. Recommend specific resources (Courses, Projects, Platforms).
    6. Provide short actionable advice.
    
    Return the result in the specified JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          targetRole: { type: Type.STRING },
          currentSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          gaps: {
            type: Type.OBJECT,
            properties: {
              critical: { type: Type.ARRAY, items: { type: Type.STRING } },
              important: { type: Type.ARRAY, items: { type: Type.STRING } },
              optional: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["critical", "important", "optional"]
          },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["step", "description"]
            }
          },
          resources: {
            type: Type.OBJECT,
            properties: {
              courses: { type: Type.ARRAY, items: { type: Type.STRING } },
              projects: { type: Type.ARRAY, items: { type: Type.STRING } },
              platforms: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["courses", "projects", "platforms"]
          },
          advice: { type: Type.STRING }
        },
        required: ["targetRole", "currentSkills", "requiredSkills", "gaps", "roadmap", "resources", "advice"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate roadmap from AI");
  }

  return JSON.parse(response.text);
}

export async function analyzeSkillGap(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    You are an intelligent AI system called Skill Gap Analyzer. 
    Your task is to analyze a user's resume and compare it with a target job description to identify skill gaps, recommend courses, and suggest suitable job opportunities.

    User Resume:
    ${resumeText}

    Target Job Description:
    ${jobDescription}

    Tasks:
    1. Extract skills from the resume.
    2. Extract required skills from the job description.
    3. Identify which required skills are present in the resume (existingSkills).
    4. Identify which required skills are missing from the resume (skillGap).
    5. Calculate a match score (0-100) based on how well the resume matches the job description.
    6. Recommend 3-5 relevant courses to bridge the skill gaps.
    7. Recommend 3-5 similar job opportunities based on the user's skills.

    Return the result in the specified JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          resumeSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          jobSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          existingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          skillGap: { type: Type.ARRAY, items: { type: Type.STRING } },
          matchScore: { type: Type.NUMBER },
          courseRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                platform: { type: Type.STRING },
                duration: { type: Type.STRING },
                skill: { type: Type.STRING }
              },
              required: ["title", "platform", "duration", "skill"]
            }
          },
          jobRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                matchScore: { type: Type.NUMBER },
                link: { type: Type.STRING }
              },
              required: ["title", "company", "skills", "matchScore", "link"]
            }
          }
        },
        required: ["resumeSkills", "jobSkills", "existingSkills", "skillGap", "matchScore", "courseRecommendations", "jobRecommendations"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to analyze skill gap from AI");
  }

  return JSON.parse(response.text);
}
