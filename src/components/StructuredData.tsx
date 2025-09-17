export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Elyees Waweru Tatua",
    "jobTitle": "Frontend Software Engineer",
    "description": "Frontend Engineer with 4+ years experience specializing in React, Next.js, and AI-powered solutions",
    "url": "https://elyees.dev",
    "sameAs": [
      "https://linkedin.com/in/elyees-tatua",
      "https://github.com/kooya3"
    ],
    "knowsAbout": [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "Three.js",
      "WebGL",
      "Python",
      "MongoDB",
      "PostgreSQL",
      "Docker",
      "AWS",
      "Git"
    ],
    "alumniOf": {
      "@type": "Organization",
      "name": "United States International University Africa"
    },
    "award": [
      "Davis & Shirtliff AI Hackathon Winner 2025",
      "Dean's List 2022-2023"
    ],
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "name": "Bachelor of Science in Applied Computer Technology",
        "credentialCategory": "degree"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "name": "Fullstack Software Development Bootcamp",
        "credentialCategory": "certificate",
        "issuedBy": {
          "@type": "Organization",
          "name": "Moringa School"
        }
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}