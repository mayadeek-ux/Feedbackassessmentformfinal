import React from 'react';
import { Button } from '../ui/button';
import { Download, FileText, User, Building2, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';

// Individual Assessment Report Types
interface IndividualReportData {
  candidateName: string;
  position?: string;
  department?: string;
  email?: string;
  overallScore: number;
  criteriaScores: Record<string, number>;
  caseStudy: string;
  status: string;
  timeSpent: number;
  submissionDate?: Date;
  summary?: string;
  redFlags?: string[];
}

// Group Assessment Report Types
interface GroupReportData {
  groupName: string;
  caseStudy: string;
  teamMembers: string[];
  assessorName: string;
  strategicApproach: number;
  innovationCreativity: number;
  teamDynamics: number;
  impactPracticality: number;
  businessAcumen: number;
  presentationSkills: number;
  overallGroupScore: number;
  strengths: string;
  areasForImprovement: string;
  additionalComments: string;
  createdAt: string;
}

const CRITERIA_LABELS: Record<string, string> = {
  'strategic-thinking': 'Strategic Thinking',
  'leadership': 'Leadership',
  'communication': 'Communication',
  'innovation': 'Innovation',
  'problem-solving': 'Problem Solving',
  'collaboration': 'Collaboration',
  'adaptability': 'Adaptability',
  'decision-making': 'Decision Making',
  'emotional-intelligence': 'Emotional Intelligence',
  'digital-fluency': 'Digital Fluency'
};

const getPerformanceBand = (score: number) => {
  if (score >= 80) return { label: 'Exceptional', color: '#10b981', bgColor: '#d1fae5', description: 'Outstanding performance demonstrating mastery' };
  if (score >= 60) return { label: 'Strong', color: '#3b82f6', bgColor: '#dbeafe', description: 'Solid performance with clear competence' };
  if (score >= 40) return { label: 'Developing', color: '#f59e0b', bgColor: '#fef3c7', description: 'Growing capabilities with targeted areas to refine' };
  return { label: 'Limited', color: '#ef4444', bgColor: '#fee2e2', description: 'Foundation building phase requiring support' };
};

const generatePersonalizedInsights = (data: IndividualReportData) => {
  const sortedCriteria = Object.entries(data.criteriaScores)
    .map(([key, score]) => ({ key, name: CRITERIA_LABELS[key] || key, score }))
    .sort((a, b) => b.score - a.score);

  const strengths = sortedCriteria.filter(c => c.score >= 7);
  const developing = sortedCriteria.filter(c => c.score >= 4 && c.score < 7);
  const needs_attention = sortedCriteria.filter(c => c.score < 4);

  const insights = {
    demonstrated: [] as string[],
    notDemonstrated: [] as string[],
    recommendations: [] as string[]
  };

  // What they DEMONSTRATED (strengths)
  if (strengths.some(s => s.key === 'strategic-thinking' || s.key === 'leadership')) {
    insights.demonstrated.push('Strong executive presence with the ability to see the bigger picture and connect tactical actions to strategic outcomes.');
  }
  if (strengths.some(s => s.key === 'communication' || s.key === 'emotional-intelligence')) {
    insights.demonstrated.push('Exceptional interpersonal skills, communicating with clarity and empathy across different stakeholder groups.');
  }
  if (strengths.some(s => s.key === 'problem-solving' || s.key === 'innovation')) {
    insights.demonstrated.push('Creative problem-solving approach, bringing fresh perspectives and innovative solutions to complex challenges.');
  }
  if (strengths.some(s => s.key === 'collaboration' || s.key === 'adaptability')) {
    insights.demonstrated.push('Natural collaborator who adapts seamlessly to changing circumstances and works effectively across diverse teams.');
  }

  // What they DIDN'T demonstrate (subtle areas for growth)
  if (needs_attention.some(n => n.key === 'strategic-thinking')) {
    insights.notDemonstrated.push('Opportunities exist to develop a more strategic mindset—connecting immediate actions to longer-term organizational goals.');
  }
  if (needs_attention.some(n => n.key === 'communication')) {
    insights.notDemonstrated.push('Communication could be enhanced by tailoring messages more precisely to different audiences and contexts.');
  }
  if (needs_attention.some(n => n.key === 'decision-making')) {
    insights.notDemonstrated.push('Decision-making would benefit from a more structured approach, weighing alternatives with clearer criteria.');
  }
  if (developing.some(d => d.key === 'leadership')) {
    insights.notDemonstrated.push('Leadership presence is emerging—next level would involve more proactive influence and inspiring others toward shared vision.');
  }
  if (developing.some(d => d.key === 'innovation')) {
    insights.notDemonstrated.push('While capable, there\'s room to push beyond conventional thinking and take calculated risks on novel approaches.');
  }

  return insights;
};

const generateIndividualCandidateReport = (data: IndividualReportData) => {
  const band = getPerformanceBand(data.overallScore);
  const sortedCriteria = Object.entries(data.criteriaScores)
    .map(([key, score]) => ({ key, name: CRITERIA_LABELS[key] || key, score }))
    .sort((a, b) => b.score - a.score);
  
  const insights = generatePersonalizedInsights(data);
  const topStrengths = sortedCriteria.slice(0, 3);
  const developmentAreas = sortedCriteria.slice(-3).reverse();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Development Insights - ${data.candidateName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      line-height: 1.7; 
      color: #0f172a;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    
    .container { 
      max-width: 1000px; 
      margin: 0 auto; 
      background: white;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    
    .hero { 
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: white;
      padding: 60px 48px;
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="none"/><circle cx="30" cy="30" r="1.5" fill="rgba(255,255,255,0.05)"/></svg>');
      opacity: 0.4;
    }
    
    .hero-content {
      position: relative;
      z-index: 1;
    }
    
    .hero h1 { 
      font-size: 42px; 
      font-weight: 800; 
      margin-bottom: 12px;
      background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }
    
    .hero .subtitle { 
      font-size: 18px; 
      opacity: 0.8; 
      font-weight: 400;
      letter-spacing: 0.01em;
    }
    
    .report-meta {
      background: ${band.bgColor};
      border-left: 6px solid ${band.color};
      padding: 24px 32px;
      margin: 32px 48px;
      border-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .report-meta-left h2 {
      color: ${band.color};
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .report-meta-left p {
      color: #64748b;
      font-size: 15px;
    }
    
    .report-meta-right {
      text-align: right;
    }
    
    .report-meta-right .score {
      font-size: 56px;
      font-weight: 800;
      color: ${band.color};
      line-height: 1;
      margin-bottom: 4px;
    }
    
    .report-meta-right .band {
      font-size: 16px;
      font-weight: 600;
      color: ${band.color};
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .content {
      padding: 0 48px 48px;
    }
    
    .section { 
      margin-bottom: 48px;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 3px solid #f1f5f9;
    }
    
    .section-header h3 { 
      color: #1e293b;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    
    .section-header .icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      font-size: 20px;
    }
    
    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .info-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      transition: all 0.3s ease;
    }
    
    .info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
    }
    
    .info-card label {
      display: block;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }
    
    .info-card value {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
    }
    
    .insights-grid {
      display: grid;
      gap: 24px;
    }
    
    .insight-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 20px;
      padding: 32px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .insight-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 6px;
      height: 100%;
      background: linear-gradient(180deg, #10b981 0%, #059669 100%);
    }
    
    .insight-card.growth::before {
      background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
    }
    
    .insight-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08);
    }
    
    .insight-card h4 {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
    }
    
    .insight-card h4 .badge {
      margin-left: 12px;
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 8px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .insight-card h4 .badge.strength {
      background: #d1fae5;
      color: #065f46;
    }
    
    .insight-card h4 .badge.growth {
      background: #fef3c7;
      color: #92400e;
    }
    
    .insight-card ul {
      list-style: none;
      padding: 0;
    }
    
    .insight-card li {
      font-size: 15px;
      color: #475569;
      margin-bottom: 14px;
      padding-left: 28px;
      position: relative;
      line-height: 1.7;
    }
    
    .insight-card li::before {
      content: '→';
      position: absolute;
      left: 0;
      font-weight: 700;
      font-size: 18px;
      color: #10b981;
    }
    
    .insight-card.growth li::before {
      content: '◆';
      color: #f59e0b;
    }
    
    .criteria-matrix {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 24px;
    }
    
    .criteria-bar {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    
    .criteria-bar .label {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .criteria-bar .score-text {
      font-size: 18px;
      font-weight: 800;
      color: #1e293b;
    }
    
    .criteria-bar .bar-track {
      height: 12px;
      background: #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }
    
    .criteria-bar .bar-fill {
      height: 100%;
      border-radius: 6px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 1s ease;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
    }
    
    .recommendation-box {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 3px solid #3b82f6;
      border-radius: 20px;
      padding: 32px;
      margin-top: 32px;
    }
    
    .recommendation-box h4 {
      color: #1e40af;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }
    
    .recommendation-box h4::before {
      content: '💡';
      margin-right: 12px;
      font-size: 28px;
    }
    
    .recommendation-box ul {
      list-style: none;
      padding: 0;
    }
    
    .recommendation-box li {
      background: white;
      padding: 16px 20px;
      border-radius: 12px;
      margin-bottom: 12px;
      color: #1e3a8a;
      font-size: 15px;
      border-left: 4px solid #3b82f6;
      font-weight: 500;
    }
    
    .footer {
      margin-top: 60px;
      padding: 32px 48px;
      background: #f8fafc;
      text-align: center;
      border-top: 3px solid #e2e8f0;
    }
    
    .footer p {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 6px;
    }
    
    .footer .confidential {
      color: #1e293b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 11px;
      margin-top: 12px;
    }
    
    @media print {
      body { 
        padding: 0; 
        background: white;
      }
      .section { page-break-inside: avoid; }
      .hero { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="hero-content">
        <h1>Personal Development Insights</h1>
        <p class="subtitle">A comprehensive analysis of your capabilities and growth trajectory</p>
      </div>
    </div>

    <div class="report-meta">
      <div class="report-meta-left">
        <h2>${data.candidateName}</h2>
        <p>${data.caseStudy} • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div class="report-meta-right">
        <div class="score">${data.overallScore}</div>
        <div class="band">${band.label}</div>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <div class="info-cards">
          ${data.position ? `
          <div class="info-card">
            <label>Position</label>
            <value>${data.position}</value>
          </div>` : ''}
          ${data.department ? `
          <div class="info-card">
            <label>Department</label>
            <value>${data.department}</value>
          </div>` : ''}
          <div class="info-card">
            <label>Time Invested</label>
            <value>${data.timeSpent} minutes</value>
          </div>
          <div class="info-card">
            <label>Performance Band</label>
            <value>${band.label}</value>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="icon">✨</div>
          <h3>What You Demonstrated</h3>
        </div>
        <div class="insights-grid">
          <div class="insight-card">
            <h4>Key Strengths <span class="badge strength">Leverage These</span></h4>
            <ul>
              ${insights.demonstrated.map(d => `<li>${d}</li>`).join('')}
              ${topStrengths.map(s => `<li><strong>${s.name}</strong> scored ${s.score}/10—this represents a significant capability you bring to your role.</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="icon">🎯</div>
          <h3>Growth Opportunities</h3>
        </div>
        <div class="insights-grid">
          <div class="insight-card growth">
            <h4>Areas to Develop <span class="badge growth">Focus Here</span></h4>
            <ul>
              ${insights.notDemonstrated.map(n => `<li>${n}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="icon">📊</div>
          <h3>Detailed Criteria Analysis</h3>
        </div>
        <div class="criteria-matrix">
          ${sortedCriteria.map(criteria => `
            <div class="criteria-bar">
              <div class="label">
                <span>${criteria.name}</span>
                <span class="score-text">${criteria.score}/10</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" style="width: ${criteria.score * 10}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <div class="recommendation-box">
          <h4>Recommended Development Path</h4>
          <ul>
            ${developmentAreas.map(area => `
              <li>Seek targeted development in <strong>${area.name}</strong> through mentoring, training, or stretch assignments</li>
            `).join('')}
            <li>Schedule a development conversation with your manager to align on growth priorities</li>
            <li>Identify 2-3 key behaviors you can practice in the next 90 days to strengthen development areas</li>
            <li>Leverage your strengths in ${topStrengths[0].name.toLowerCase()} and ${topStrengths[1].name.toLowerCase()} to build confidence while working on growth areas</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Assessment conducted: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p>This report is designed to support your professional growth and development journey</p>
      <p class="confidential">Confidential & Proprietary</p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
};

const generateIndividualHRReport = (data: IndividualReportData) => {
  const band = getPerformanceBand(data.overallScore);
  const sortedCriteria = Object.entries(data.criteriaScores)
    .map(([key, score]) => ({ key, name: CRITERIA_LABELS[key] || key, score }))
    .sort((a, b) => b.score - a.score);

  const insights = generatePersonalizedInsights(data);
  const highPerformers = sortedCriteria.filter(c => c.score >= 7);
  const needsDevelopment = sortedCriteria.filter(c => c.score < 5);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>HR Talent Analysis - ${data.candidateName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      line-height: 1.7; 
      color: #0f172a;
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    
    .container { 
      max-width: 1000px; 
      margin: 0 auto; 
      background: white;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    
    .hero { 
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
      color: white;
      padding: 60px 48px;
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="none"/><circle cx="30" cy="30" r="1.5" fill="rgba(255,255,255,0.05)"/></svg>');
      opacity: 0.4;
    }
    
    .hero-content { position: relative; z-index: 1; }
    
    .hero h1 { 
      font-size: 42px; 
      font-weight: 800; 
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    
    .hero .subtitle { 
      font-size: 18px; 
      opacity: 0.9; 
      font-weight: 400;
      letter-spacing: 0.01em;
    }
    
    .report-meta {
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border-left: 6px solid #7c3aed;
      padding: 24px 32px;
      margin: 32px 48px;
      border-radius: 16px;
    }
    
    .report-meta h2 {
      color: #7c3aed;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .report-meta p {
      color: #6b21a8;
      font-size: 15px;
    }
    
    .content { padding: 0 48px 48px; }
    
    .section { margin-bottom: 48px; }
    
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 3px solid #f1f5f9;
    }
    
    .section-header h3 { 
      color: #1e293b;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    
    .section-header .icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      font-size: 20px;
    }
    
    .metrics-dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .metric-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 28px;
      text-align: center;
      transition: all 0.3s ease;
    }
    
    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.12);
      border-color: #7c3aed;
    }
    
    .metric-card .value {
      font-size: 42px;
      font-weight: 800;
      color: #7c3aed;
      margin-bottom: 8px;
      line-height: 1;
    }
    
    .metric-card .label {
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }
    
    .talent-matrix {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-top: 24px;
    }
    
    .talent-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 20px;
      padding: 28px;
      border-left: 6px solid #7c3aed;
      transition: all 0.3s ease;
    }
    
    .talent-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08);
    }
    
    .talent-card h4 {
      color: #1e293b;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    
    .talent-card p {
      color: #475569;
      font-size: 15px;
      line-height: 1.7;
    }
    
    .competency-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 12px;
      margin-top: 20px;
    }
    
    .competency-table tr {
      background: #f8fafc;
      border-radius: 12px;
      transition: all 0.3s ease;
    }
    
    .competency-table tr:hover {
      background: #f1f5f9;
      transform: translateX(4px);
    }
    
    .competency-table td {
      padding: 18px 20px;
      font-size: 15px;
    }
    
    .competency-table td:first-child {
      border-top-left-radius: 12px;
      border-bottom-left-radius: 12px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .competency-table td:last-child {
      border-top-right-radius: 12px;
      border-bottom-right-radius: 12px;
    }
    
    .score-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      min-width: 60px;
      text-align: center;
    }
    
    .score-high {
      background: #d1fae5;
      color: #065f46;
    }
    
    .score-medium {
      background: #fef3c7;
      color: #92400e;
    }
    
    .score-low {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .recommendation-panel {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 3px solid #3b82f6;
      border-radius: 20px;
      padding: 32px;
      margin-top: 32px;
    }
    
    .recommendation-panel h4 {
      color: #1e40af;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    
    .recommendation-panel ul {
      list-style: none;
      padding: 0;
    }
    
    .recommendation-panel li {
      background: white;
      padding: 18px 22px;
      border-radius: 14px;
      margin-bottom: 14px;
      color: #1e3a8a;
      font-size: 15px;
      border-left: 4px solid #3b82f6;
      font-weight: 500;
    }
    
    .footer {
      margin-top: 60px;
      padding: 32px 48px;
      background: #f8fafc;
      text-align: center;
      border-top: 3px solid #e2e8f0;
    }
    
    .footer p {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 6px;
    }
    
    .footer .confidential {
      color: #dc2626;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-size: 12px;
      margin-top: 12px;
    }
    
    @media print {
      body { padding: 0; background: white; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="hero-content">
        <h1>HR Talent Analysis</h1>
        <p class="subtitle">Strategic workforce intelligence for talent management & succession planning</p>
      </div>
    </div>

    <div class="report-meta">
      <h2>📊 Confidential HR Report</h2>
      <p>Comprehensive assessment for strategic talent decisions and development planning</p>
    </div>

    <div class="content">
      <div class="section">
        <div class="section-header">
          <div class="icon">👤</div>
          <h3>Candidate Profile</h3>
        </div>
        <div class="metrics-dashboard">
          <div class="metric-card">
            <div class="value">${data.overallScore}</div>
            <div class="label">Overall Score</div>
          </div>
          <div class="metric-card">
            <div class="value">${band.label}</div>
            <div class="label">Performance Band</div>
          </div>
          <div class="metric-card">
            <div class="value">${highPerformers.length}/10</div>
            <div class="label">Strong Areas</div>
          </div>
          <div class="metric-card">
            <div class="value">${data.timeSpent}m</div>
            <div class="label">Assessment Time</div>
          </div>
        </div>
        
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px;">
          <p style="margin-bottom: 8px;"><strong>Name:</strong> ${data.candidateName}</p>
          ${data.position ? `<p style="margin-bottom: 8px;"><strong>Position:</strong> ${data.position}</p>` : ''}
          ${data.department ? `<p style="margin-bottom: 8px;"><strong>Department:</strong> ${data.department}</p>` : ''}
          ${data.email ? `<p style="margin-bottom: 8px;"><strong>Email:</strong> ${data.email}</p>` : ''}
          <p><strong>Assessment:</strong> ${data.caseStudy}</p>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="icon">📈</div>
          <h3>Competency Assessment</h3>
        </div>
        <table class="competency-table">
          ${sortedCriteria.map(criteria => {
            const scoreClass = criteria.score >= 7 ? 'score-high' : criteria.score >= 5 ? 'score-medium' : 'score-low';
            return `
              <tr>
                <td>${criteria.name}</td>
                <td style="text-align: center;">
                  <span class="score-badge ${scoreClass}">${criteria.score}/10</span>
                </td>
                <td style="color: #64748b; font-size: 14px;">
                  ${criteria.score >= 7 ? 'Ready for advanced responsibilities' : 
                    criteria.score >= 5 ? 'Developing capability—suitable for current role' : 
                    'Requires focused development support'}
                </td>
              </tr>
            `;
          }).join('')}
        </table>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="icon">🎯</div>
          <h3>Talent Management Strategy</h3>
        </div>
        <div class="talent-matrix">
          <div class="talent-card">
            <h4>Promotion Readiness</h4>
            <p>${data.overallScore >= 70 ? '✅ Ready for advancement—strong candidate for succession planning and leadership roles' : 
                 data.overallScore >= 50 ? '⏳ Developing—monitor progress over 6-12 months before advancement decisions' : 
                 '⚠️ Not ready—requires significant capability building before promotion consideration'}</p>
          </div>
          <div class="talent-card">
            <h4>Retention Priority</h4>
            <p>${data.overallScore >= 70 ? '🔥 High performer—critical retention priority. Engage with development opportunities and career path discussions' : 
                 data.overallScore >= 50 ? '📊 Medium priority—engage with structured development plans to prevent stagnation' : 
                 '📋 May benefit from performance improvement plan and intensive support'}</p>
          </div>
          <div class="talent-card">
            <h4>Development Investment</h4>
            <p>${data.overallScore >= 70 ? '💎 High ROI—invest in executive coaching, leadership programs, and strategic project exposure' : 
                 data.overallScore >= 50 ? '📚 Moderate investment—focus on targeted skill-building and mentorship' : 
                 '🎓 Foundational training required—basic capability development needed before advanced programs'}</p>
          </div>
          <div class="talent-card">
            <h4>Role Alignment</h4>
            <p>${data.overallScore >= 70 ? '⭐ Exceeds current role—consider stretch assignments or promotion to maximize engagement' : 
                 data.overallScore >= 50 ? '✓ Meets role expectations—good fit for current responsibilities' : 
                 '⚡ May require role adjustment, additional support, or redeployment consideration'}</p>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="recommendation-panel">
          <h4>🎓 Recommended HR Actions</h4>
          <ul>
            ${data.overallScore >= 70 ? `
              <li>Add to high-potential talent pool and succession planning pipeline</li>
              <li>Assign stretch projects and cross-functional leadership opportunities</li>
              <li>Schedule executive coaching and advanced leadership development</li>
              <li>Discuss career advancement opportunities within 6 months</li>
            ` : data.overallScore >= 50 ? `
              <li>Create 6-month development plan focusing on ${needsDevelopment.slice(0, 2).map(c => c.name.toLowerCase()).join(' and ')}</li>
              <li>Provide mentoring or coaching support from senior leaders</li>
              <li>Monitor progress with quarterly check-ins</li>
              <li>Consider lateral moves to build broader experience</li>
            ` : `
              <li>Implement structured 90-day performance improvement plan</li>
              <li>Provide intensive training in key development areas: ${needsDevelopment.slice(0, 2).map(c => c.name.toLowerCase()).join(' and ')}</li>
              <li>Assign buddy/mentor for daily support and guidance</li>
              <li>Conduct monthly progress reviews with HR and direct manager</li>
            `}
            <li>Schedule 12-month reassessment to track development progress</li>
          </ul>
        </div>
      </div>

      ${insights.notDemonstrated.length > 0 ? `
      <div class="section">
        <div style="background: #fef2f2; border: 3px solid #ef4444; border-radius: 20px; padding: 32px;">
          <h4 style="color: #991b1b; font-size: 20px; font-weight: 700; margin-bottom: 16px;">⚠️ Development Priorities</h4>
          <ul style="list-style: none; padding: 0;">
            ${insights.notDemonstrated.map(insight => `
              <li style="background: white; padding: 16px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #ef4444; color: #7f1d1d; font-size: 15px;">${insight}</li>
            `).join('')}
          </ul>
        </div>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <p>Assessment Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p>This analysis is provided for strategic talent management and succession planning purposes</p>
      <p class="confidential">⚠️ Strictly Confidential - HR & Leadership Only</p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
};

const generateIndividualLineManagerReport = (data: IndividualReportData) => {
  const band = getPerformanceBand(data.overallScore);
  const sortedCriteria = Object.entries(data.criteriaScores)
    .map(([key, score]) => ({ key, name: CRITERIA_LABELS[key] || key, score }))
    .sort((a, b) => b.score - a.score);
  
  const insights = generatePersonalizedInsights(data);
  const topStrengths = sortedCriteria.slice(0, 3);
  const developmentAreas = sortedCriteria.slice(-3).reverse();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Line Manager Report - ${data.candidateName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      line-height: 1.7; 
      color: #0f172a;
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    
    .container { 
      max-width: 1000px; 
      margin: 0 auto; 
      background: white;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    
    .hero { 
      background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
      color: white;
      padding: 60px 48px;
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="none"/><circle cx="30" cy="30" r="1.5" fill="rgba(255,255,255,0.05)"/></svg>');
      opacity: 0.4;
    }
    
    .hero-content { position: relative; z-index: 1; }
    
    .hero h1 { 
      font-size: 42px; 
      font-weight: 800; 
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    
    .hero .subtitle { 
      font-size: 18px; 
      opacity: 0.9; 
      font-weight: 400;
      letter-spacing: 0.01em;
    }
    
    .report-meta {
      background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%);
      border-left: 6px solid #0891b2;
      padding: 24px 32px;
      margin: 32px 48px;
      border-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .report-meta-left h2 {
      color: #0891b2;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .report-meta-left p {
      color: #0e7490;
      font-size: 15px;
    }
    
    .content { padding: 0 48px 48px; }
    
    .section { margin-bottom: 48px; }
    
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 3px solid #f1f5f9;
    }
    
    .section-header h3 { 
      color: #1e293b;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    
    .section-header .icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      font-size: 20px;
    }
    
    .quick-summary {
      background: linear-gradient(135deg, ${band.bgColor} 0%, white 100%);
      border: 3px solid ${band.color};
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .quick-summary .score-side {
      text-align: center;
    }
    
    .quick-summary .score-big {
      font-size: 72px;
      font-weight: 800;
      color: ${band.color};
      line-height: 1;
    }
    
    .quick-summary .band-label {
      font-size: 24px;
      font-weight: 700;
      color: ${band.color};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 8px;
    }
    
    .quick-summary .description {
      flex: 1;
      padding-left: 48px;
      color: #475569;
      font-size: 17px;
      line-height: 1.8;
    }
    
    .action-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 3px solid #f59e0b;
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 32px;
    }
    
    .action-box h4 {
      color: #92400e;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }
    
    .action-box h4::before {
      content: '⚡';
      margin-right: 12px;
      font-size: 28px;
    }
    
    .action-box ul {
      list-style: none;
      padding: 0;
    }
    
    .action-box li {
      background: white;
      padding: 18px 22px;
      border-radius: 14px;
      margin-bottom: 14px;
      color: #78350f;
      font-size: 15px;
      border-left: 5px solid #f59e0b;
      font-weight: 500;
    }
    
    .strength-development-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-top: 24px;
    }
    
    .strength-card, .development-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 20px;
      padding: 28px;
      transition: all 0.3s ease;
    }
    
    .strength-card {
      border-left: 6px solid #10b981;
      background: linear-gradient(135deg, #d1fae5 0%, white 100%);
    }
    
    .development-card {
      border-left: 6px solid #f59e0b;
      background: linear-gradient(135deg, #fef3c7 0%, white 100%);
    }
    
    .strength-card:hover, .development-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.12);
    }
    
    .strength-card h4 {
      color: #065f46;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .development-card h4 {
      color: #92400e;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .strength-card ul, .development-card ul {
      list-style: none;
      padding: 0;
    }
    
    .strength-card li {
      color: #047857;
      margin-bottom: 12px;
      padding-left: 24px;
      position: relative;
      font-size: 15px;
    }
    
    .strength-card li::before {
      content: '✓';
      position: absolute;
      left: 0;
      font-weight: 700;
      font-size: 18px;
      color: #10b981;
    }
    
    .development-card li {
      color: #78350f;
      margin-bottom: 12px;
      padding-left: 24px;
      position: relative;
      font-size: 15px;
    }
    
    .development-card li::before {
      content: '→';
      position: absolute;
      left: 0;
      font-weight: 700;
      font-size: 18px;
      color: #f59e0b;
    }
    
    .coaching-panel {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 3px solid #3b82f6;
      border-radius: 20px;
      padding: 32px;
      margin-top: 32px;
    }
    
    .coaching-panel h4 {
      color: #1e40af;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    
    .coaching-panel ul {
      list-style: none;
      padding: 0;
    }
    
    .coaching-panel li {
      background: white;
      padding: 18px 22px;
      border-radius: 14px;
      margin-bottom: 14px;
      color: #1e3a8a;
      font-size: 15px;
      border-left: 4px solid #3b82f6;
      font-weight: 500;
    }
    
    .conversation-starters {
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border: 3px dashed #a855f7;
      border-radius: 20px;
      padding: 32px;
      margin-top: 32px;
    }
    
    .conversation-starters h4 {
      color: #7e22ce;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }
    
    .conversation-starters h4::before {
      content: '💬';
      margin-right: 12px;
      font-size: 24px;
    }
    
    .conversation-starters .question {
      background: white;
      padding: 18px 22px;
      border-radius: 14px;
      margin-bottom: 16px;
      color: #6b21a8;
      font-size: 15px;
      font-style: italic;
      border-left: 4px solid #a855f7;
    }
    
    .footer {
      margin-top: 60px;
      padding: 32px 48px;
      background: #f8fafc;
      text-align: center;
      border-top: 3px solid #e2e8f0;
    }
    
    .footer p {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 6px;
    }
    
    @media print {
      body { padding: 0; background: white; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="hero-content">
        <h1>Line Manager Performance Guide</h1>
        <p class="subtitle">Actionable insights for coaching conversations and development planning</p>
      </div>
    </div>

    <div class="report-meta">
      <div class="report-meta-left">
        <h2>Team Member: ${data.candidateName}</h2>
        <p>${data.caseStudy} • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <div class="quick-summary">
          <div class="score-side">
            <div class="score-big">${data.overallScore}</div>
            <div class="band-label">${band.label}</div>
          </div>
          <div class="description">
            <strong>Performance Summary:</strong> ${band.description}
            <br><br>
            ${data.candidateName} demonstrates ${topStrengths.length} strong capability areas. This report provides specific coaching points and conversation starters for your next 1-on-1.
          </div>
        </div>
      </div>

      <div class="section">
        <div class="action-box">
          <h4>Immediate Action Items</h4>
          <ul>
            <li>Schedule 1-on-1 within next week to discuss assessment results and career development</li>
            <li>Leverage strengths in ${topStrengths[0].name.toLowerCase()} for upcoming projects or mentoring opportunities</li>
            <li>Create 30-60-90 day development plan focusing on ${developmentAreas[0].name.toLowerCase()}</li>
            <li>Identify stretch assignment or learning opportunity in development areas</li>
          </ul>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="icon">💪</div>
          <h3>Strengths & Development Areas</h3>
        </div>
        <div class="strength-development-grid">
          <div class="strength-card">
            <h4>✨ Key Strengths to Leverage</h4>
            <ul>
              ${topStrengths.map(s => `
                <li><strong>${s.name}</strong> (${s.score}/10) — Consider assigning projects that utilize this strength</li>
              `).join('')}
              ${insights.demonstrated.slice(0, 2).map(d => `<li>${d}</li>`).join('')}
            </ul>
          </div>
          <div class="development-card">
            <h4>🎯 Development Focus Areas</h4>
            <ul>
              ${developmentAreas.map(d => `
                <li><strong>${d.name}</strong> (${d.score}/10) — Needs targeted support and practice</li>
              `).join('')}
              ${insights.notDemonstrated.slice(0, 2).map(n => `<li>${n}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="coaching-panel">
          <h4>🎓 Coaching Recommendations</h4>
          <ul>
            <li><strong>Praise specifically:</strong> Recognize ${topStrengths[0].name.toLowerCase()} capability—be specific about behaviors you've observed</li>
            <li><strong>Create safe practice spaces:</strong> Provide low-stakes opportunities to develop ${developmentAreas[0].name.toLowerCase()} skills</li>
            <li><strong>Pair with mentor:</strong> Connect with a team member strong in ${developmentAreas[0].name.toLowerCase()} for peer learning</li>
            <li><strong>Set micro-goals:</strong> Break development into small, achievable weekly actions rather than overwhelming goals</li>
            <li><strong>Monitor progress:</strong> Schedule bi-weekly check-ins for first 90 days to discuss progress and adjust approach</li>
          </ul>
        </div>
      </div>

      <div class="section">
        <div class="conversation-starters">
          <h4>1-on-1 Conversation Starters</h4>
          <div class="question">
            "I've noticed your strength in ${topStrengths[0].name.toLowerCase()}. How do you feel about taking on more responsibility in this area?"
          </div>
          <div class="question">
            "Looking at your ${developmentAreas[0].name.toLowerCase()} development area, what kind of support would be most helpful from me?"
          </div>
          <div class="question">
            "Where do you see yourself growing most over the next 6 months? How can I help make that happen?"
          </div>
          <div class="question">
            "What's one skill you'd like to develop that would make your job more enjoyable or impactful?"
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Assessment Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p>This guide is designed to facilitate constructive coaching conversations</p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
};

// Group Report Generation Functions
const generateGroupCandidateReport = (data: GroupReportData) => {
  const overallBand = getPerformanceBand(data.overallGroupScore);
  
  const criteriaData = [
    { name: 'Strategic Approach', score: data.strategicApproach },
    { name: 'Innovation & Creativity', score: data.innovationCreativity },
    { name: 'Team Dynamics', score: data.teamDynamics },
    { name: 'Impact & Practicality', score: data.impactPracticality },
    { name: 'Business Acumen', score: data.businessAcumen },
    { name: 'Presentation Skills', score: data.presentationSkills }
  ].sort((a, b) => b.score - a.score);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Group Assessment Report - ${data.groupName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      line-height: 1.7; 
      color: #0f172a;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    
    .container { 
      max-width: 1000px; 
      margin: 0 auto; 
      background: white;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    
    .hero { 
      background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
      color: white;
      padding: 60px 48px;
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="none"/><circle cx="30" cy="30" r="1.5" fill="rgba(255,255,255,0.05)"/></svg>');
      opacity: 0.4;
    }
    
    .hero-content { position: relative; z-index: 1; }
    
    .hero h1 { 
      font-size: 42px; 
      font-weight: 800; 
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    
    .hero .subtitle { 
      font-size: 18px; 
      opacity: 0.9; 
      font-weight: 400;
      letter-spacing: 0.01em;
    }
    
    .report-meta {
      background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
      border-left: 6px solid #ea580c;
      padding: 24px 32px;
      margin: 32px 48px;
      border-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .report-meta-left h2 {
      color: #ea580c;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .report-meta-left p {
      color: #9a3412;
      font-size: 15px;
    }
    
    .report-meta-right {
      text-align: right;
    }
    
    .report-meta-right .score {
      font-size: 56px;
      font-weight: 800;
      color: #ea580c;
      line-height: 1;
      margin-bottom: 4px;
    }
    
    .report-meta-right .band {
      font-size: 16px;
      font-weight: 600;
      color: #ea580c;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .content { padding: 0 48px 48px; }
    
    .section { margin-bottom: 48px; }
    
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 3px solid #f1f5f9;
    }
    
    .section-header h3 { 
      color: #1e293b;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    
    .section-header .icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      font-size: 20px;
    }
    
    .team-members {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .member-badge {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .criteria-matrix {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 24px;
    }
    
    .criteria-bar {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    
    .criteria-bar .label {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .criteria-bar .score-text {
      font-size: 18px;
      font-weight: 800;
      color: #1e293b;
    }
    
    .criteria-bar .bar-track {
      height: 12px;
      background: #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }
    
    .criteria-bar .bar-fill {
      height: 100%;
      border-radius: 6px;
      background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
      transition: width 1s ease;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
    }
    
    .insight-panel {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 20px;
      padding: 32px;
      border-left: 6px solid #10b981;
      margin-bottom: 24px;
    }
    
    .insight-panel.improvement {
      border-left-color: #f59e0b;
    }
    
    .insight-panel h4 {
      color: #1e293b;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .insight-panel p {
      color: #475569;
      font-size: 15px;
      line-height: 1.8;
    }
    
    .footer {
      margin-top: 60px;
      padding: 32px 48px;
      background: #f8fafc;
      text-align: center;
      border-top: 3px solid #e2e8f0;
    }
    
    .footer p {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 6px;
    }
    
    @media print {
      body { padding: 0; background: white; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="hero-content">
        <h1>Group Assessment Report</h1>
        <p class="subtitle">Team Performance & Collaborative Capability Analysis</p>
      </div>
    </div>

    <div class="report-meta">
      <div class="report-meta-left">
        <h2>${data.groupName}</h2>
        <p>${data.caseStudy} • Assessed by ${data.assessorName}</p>
      </div>
      <div class="report-meta-right">
        <div class="score">${data.overallGroupScore}</div>
        <div class="band">${overallBand.label}</div>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <div class="section-header">
          <div class="icon">👥</div>
          <h3>Team Members</h3>
        </div>
        <div class="team-members">
          ${data.teamMembers.map(member => `
            <div class="member-badge">${member}</div>
          `).join('')}
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="icon">📊</div>
          <h3>Group Performance Metrics</h3>
        </div>
        <div class="criteria-matrix">
          ${criteriaData.map(criteria => `
            <div class="criteria-bar">
              <div class="label">
                <span>${criteria.name}</span>
                <span class="score-text">${criteria.score}/20</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" style="width: ${(criteria.score / 20) * 100}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${data.strengths ? `
      <div class="section">
        <div class="insight-panel">
          <h4>✨ Key Strengths Demonstrated</h4>
          <p>${data.strengths}</p>
        </div>
      </div>
      ` : ''}

      ${data.areasForImprovement ? `
      <div class="section">
        <div class="insight-panel improvement">
          <h4>🎯 Areas for Team Development</h4>
          <p>${data.areasForImprovement}</p>
        </div>
      </div>
      ` : ''}

      ${data.additionalComments ? `
      <div class="section">
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 20px; padding: 32px;">
          <h4 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-bottom: 16px;">💭 Assessor Comments</h4>
          <p style="color: #475569; font-size: 15px; line-height: 1.8;">${data.additionalComments}</p>
        </div>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <p>Assessment Date: ${new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p>Group assessment reports measure collaborative capability and team dynamics</p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
};

const downloadReport = (html: string, filename: string) => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Individual Report Export Component
export function IndividualReportExport({ data }: { data: IndividualReportData }) {
  const handleCandidateReport = () => {
    const html = generateIndividualCandidateReport(data);
    downloadReport(html, `Development-Report-${data.candidateName.replace(/\s+/g, '-')}.html`);
  };

  const handleHRReport = () => {
    const html = generateIndividualHRReport(data);
    downloadReport(html, `HR-Report-${data.candidateName.replace(/\s+/g, '-')}.html`);
  };

  const handleLineManagerReport = () => {
    const html = generateIndividualLineManagerReport(data);
    downloadReport(html, `Manager-Report-${data.candidateName.replace(/\s+/g, '-')}.html`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full hover-lift rounded-xl border-2 border-slate-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Reports
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Select Report Type
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCandidateReport} className="cursor-pointer">
          <User className="w-4 h-4 mr-2" />
          Candidate Development Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleHRReport} className="cursor-pointer">
          <Building2 className="w-4 h-4 mr-2" />
          HR Talent Analysis
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLineManagerReport} className="cursor-pointer">
          <Users className="w-4 h-4 mr-2" />
          Line Manager Guide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Group Report Export Component
export function GroupReportExport({ data }: { data: GroupReportData }) {
  const handleGroupReport = () => {
    const html = generateGroupCandidateReport(data);
    downloadReport(html, `Group-Assessment-${data.groupName.replace(/\s+/g, '-')}.html`);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleGroupReport}
      className="w-full hover-lift rounded-xl border-2 border-slate-200"
    >
      <Download className="w-4 h-4 mr-2" />
      Download Group Report
    </Button>
  );
}
