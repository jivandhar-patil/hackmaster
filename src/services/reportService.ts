import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult } from './geminiService';

export function generatePDFReport(result: AnalysisResult) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text('Skill Gap Analysis Report', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Match Score
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(`Overall Match Score: ${result.matchScore}%`, 20, 45);
  
  // Skills Summary
  doc.setFontSize(14);
  doc.text('Skills Summary', 20, 60);
  
  autoTable(doc, {
    startY: 65,
    head: [['Category', 'Skills']],
    body: [
      ['Existing Skills', result.existingSkills.join(', ')],
      ['Skill Gap', result.skillGap.join(', ')],
      ['Total Required', result.jobSkills.join(', ')]
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }
  });
  
  // Course Recommendations
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(14);
  doc.text('Course Recommendations', 20, finalY + 15);
  
  autoTable(doc, {
    startY: finalY + 20,
    head: [['Course Title', 'Platform', 'Duration', 'Skill']],
    body: result.courseRecommendations.map(c => [c.title, c.platform, c.duration, c.skill]),
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] } // Emerald-500
  });
  
  // Job Recommendations
  const finalY2 = (doc as any).lastAutoTable.finalY || 180;
  doc.setFontSize(14);
  doc.text('Job Recommendations', 20, finalY2 + 15);
  
  autoTable(doc, {
    startY: finalY2 + 20,
    head: [['Job Title', 'Company', 'Match Score']],
    body: result.jobRecommendations.map(j => [j.title, j.company, `${j.matchScore}%`]),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] } // Blue-500
  });
  
  doc.save('Skill_Gap_Report.pdf');
}
