/**
 * Script de seed pour la base de données StageManager
 * Usage: node seed.js
 */
 
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
 
// ─── Models ────────────────────────────────────────────────────────────────
const User = require('./src/models/user.model');
const Student = require('./src/models/student.model');
const Offer = require('./src/models/offer.model');
const Application = require('./src/models/application.model');
const Internship = require('./src/models/internship.model');
 
// ─── Sample Data ───────────────────────────────────────────────────────────
const SKILLS_TECH = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Python',
  'Java', 'Spring Boot', 'PHP', 'Laravel', 'C#', '.NET', 'SQL', 'MongoDB',
  'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'CI/CD',
  'Flutter', 'React Native', 'Swift', 'Kotlin', 'TensorFlow', 'PyTorch'
];
 
const DOMAINS = [
  'Développement Web', 'Développement Mobile', 'Data Science', 'IA/Machine Learning',
  'Cybersécurité', 'DevOps', 'Cloud Computing', 'Réseaux', 'UI/UX Design',
  'Marketing Digital', 'Finance', 'RH', 'Gestion de Projet'
];
 
const COMPANIES = [
  { name: 'TechCorp Tunisia', sector: 'IT Services', logo: '🚀' },
  { name: 'Digital Solutions', sector: 'Consulting', logo: '💡' },
  { name: 'InnovLab', sector: 'R&D', logo: '🔬' },
  { name: 'DataVision', sector: 'Analytics', logo: '📊' },
  { name: 'SecureNet', sector: 'Cybersecurity', logo: '🔐' },
  { name: 'CloudFirst', sector: 'Cloud Services', logo: '☁️' },
  { name: 'MobileTech', sector: 'Mobile Dev', logo: '📱' },
  { name: 'AI Dynamics', sector: 'AI/ML', logo: '🤖' },
  { name: 'FinTech Plus', sector: 'Finance', logo: '💰' },
  { name: 'MediaPro', sector: 'Digital Media', logo: '🎨' }
];
 
const TUNISIAN_CITIES = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès',
  'Ariana', 'La Marsa', 'Ben Arous', 'Monastir'
];
 
// ─── Helper Functions ──────────────────────────────────────────────────────
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];
const randomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
 
// ─── Main Seed Function ────────────────────────────────────────────────────
async function seed() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');
 
    // Clear existing data
    console.log('🗑️  Suppression des anciennes données...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Offer.deleteMany({}),
      Application.deleteMany({}),
      Internship.deleteMany({})
    ]);
    console.log('✅ Données supprimées\n');
 
    // ─── 1. Create Users ───────────────────────────────────────────────────
    console.log('👥 Création des utilisateurs...');
   
    // Admin
    const admin = await User.create({
      email: 'admin@stagemanager.tn',
      password: 'admin123',
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      role: 'admin',
      phone: '+216 20 123 456',
      isActive: true
    });
 
    // Supervisors
    const supervisors = await User.create([
      {
        email: 'supervisor1@stagemanager.tn',
        password: 'super123',
        firstName: 'Fatma',
        lastName: 'Gharbi',
        role: 'supervisor',
        phone: '+216 22 234 567',
        isActive: true
      },
      {
        email: 'supervisor2@stagemanager.tn',
        password: 'super123',
        firstName: 'Mohamed',
        lastName: 'Trabelsi',
        role: 'supervisor',
        phone: '+216 23 345 678',
        isActive: true
      }
    ]);
 
    // Students (15)
    const studentUsers = [];
    const studentNames = [
      { first: 'Amine', last: 'Hamdi' },
      { first: 'Salma', last: 'BenSalem' },
      { first: 'Yassine', last: 'Jebali' },
      { first: 'Nour', last: 'Karoui' },
      { first: 'Karim', last: 'Bouazizi' },
      { first: 'Leila', last: 'Chatti' },
      { first: 'Mehdi', last: 'Masmoudi' },
      { first: 'Rim', last: 'Azzouz' },
      { first: 'Omar', last: 'BenMansour' },
      { first: 'Sonia', last: 'Dridi' },
      { first: 'Walid', last: 'Ghariani' },
      { first: 'Mariem', last: 'Hannachi' },
      { first: 'Anis', last: 'BenAmmar' },
      { first: 'Nesrine', last: 'Touati' },
      { first: 'Fares', last: 'Chamekh' }
    ];
 
    for (const name of studentNames) {
      const user = await User.create({
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@student.tn`,
        password: 'student123',
        firstName: name.first,
        lastName: name.last,
        role: 'student',
        isActive: true
      });
      studentUsers.push(user);
    }
 
    console.log(`✅ ${studentUsers.length} étudiants créés`);
    console.log(`✅ ${supervisors.length} encadrants créés`);
    console.log(`✅ 1 admin créé\n`);
 
    // ─── 2. Create Student Profiles ────────────────────────────────────────
    console.log('📚 Création des profils étudiants...');
   
    const students = [];
    const levels = ['L3', 'M1', 'M2', 'Ingénieur 2', 'Ingénieur 3'];
    const universities = ['ESPRIT', 'INSAT', 'FST', 'ISIMG', 'Sup\'Com', 'TEK-UP'];
 
    for (const user of studentUsers) {
      const skillCount = randomInt(3, 8);
      const skills = randomItems(SKILLS_TECH, skillCount).map(name => ({
        name,
        level: randomItem(['débutant', 'intermédiaire', 'avancé']),
        category: 'technique'
      }));
 
      const student = await Student.create({
        user: user._id,
        studentId: `ST${randomInt(100000, 999999)}`,
        university: randomItem(universities),
        department: randomItem(['Informatique', 'Génie Logiciel', 'Réseaux', 'IA']),
        level: randomItem(levels),
        skills,
        languages: [
          { name: 'Français', level: randomItem(['B2', 'C1', 'C2']) },
          { name: 'Anglais', level: randomItem(['B1', 'B2', 'C1']) },
          { name: 'Arabe', level: 'natif' }
        ],
        bio: `Étudiant(e) passionné(e) par le développement et les nouvelles technologies. Motivé(e) pour acquérir de l'expérience en entreprise.`,
        linkedIn: `https://linkedin.com/in/${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`,
        desiredDomain: randomItems(DOMAINS, randomInt(1, 3)),
        gpa: randomInt(12, 18) + Math.random(),
        cv: {
          filename: `cv_${user.firstName}_${user.lastName}.pdf`,
          originalName: `CV_${user.firstName}_${user.lastName}.pdf`,
          uploadedAt: new Date(),
          url: `/uploads/cvs/cv_${user._id}.pdf`
        }
      });
      students.push(student);
    }
 
    console.log(`✅ ${students.length} profils étudiants créés\n`);
 
    // ─── 3. Create Offers ──────────────────────────────────────────────────
    console.log('💼 Création des offres de stage...');
   
    const offers = [];
    const offerTemplates = [
      {
        title: 'Stage Développement Full Stack',
        description: 'Rejoignez notre équipe pour développer des applications web modernes. Vous travaillerez sur des projets clients variés en utilisant les dernières technologies.',
        mission: 'Développement de fonctionnalités front-end et back-end, participation aux code reviews, rédaction de tests unitaires.',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        domain: 'Développement Web',
        duration: 4
      },
      {
        title: 'Stage DevOps & Cloud',
        description: 'Participez à l\'automatisation de notre infrastructure cloud et au déploiement continu de nos applications.',
        mission: 'Configuration de pipelines CI/CD, gestion des conteneurs Docker, monitoring des services.',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Git', 'CI/CD'],
        domain: 'DevOps',
        duration: 6
      },
      {
        title: 'Stage Data Science',
        description: 'Analysez des données massives et créez des modèles prédictifs pour nos clients.',
        mission: 'Nettoyage et préparation des données, création de visualisations, développement de modèles ML.',
        skills: ['Python', 'TensorFlow', 'SQL', 'Pandas'],
        domain: 'Data Science',
        duration: 5
      },
      {
        title: 'Stage Développement Mobile',
        description: 'Développez des applications mobiles cross-platform pour iOS et Android.',
        mission: 'Conception d\'interfaces utilisateur, intégration d\'APIs REST, optimisation des performances.',
        skills: ['Flutter', 'React Native', 'Kotlin', 'Swift'],
        domain: 'Développement Mobile',
        duration: 4
      },
      {
        title: 'Stage Cybersécurité',
        description: 'Renforcez la sécurité de nos systèmes informatiques et réalisez des audits.',
        mission: 'Tests de pénétration, analyse de vulnérabilités, mise en place de solutions de sécurité.',
        skills: ['Cybersécurité', 'Linux', 'Python', 'Réseaux'],
        domain: 'Cybersécurité',
        duration: 6
      },
      {
        title: 'Stage UI/UX Design',
        description: 'Créez des interfaces utilisateur intuitives et attractives.',
        mission: 'Recherche utilisateur, wireframing, prototypage, tests utilisateurs.',
        skills: ['Figma', 'Adobe XD', 'HTML', 'CSS'],
        domain: 'UI/UX Design',
        duration: 3
      },
      {
        title: 'Stage Intelligence Artificielle',
        description: 'Développez des solutions IA innovantes pour nos projets R&D.',
        mission: 'Développement d\'algorithmes ML, traitement du langage naturel, vision par ordinateur.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'OpenCV'],
        domain: 'IA/Machine Learning',
        duration: 6
      },
      {
        title: 'Stage Développement Backend',
        description: 'Concevez et développez des APIs robustes et scalables.',
        mission: 'Architecture microservices, optimisation BDD, documentation API.',
        skills: ['Node.js', 'Java', 'Spring Boot', 'PostgreSQL'],
        domain: 'Développement Web',
        duration: 5
      }
    ];
 
    for (let i = 0; i < 20; i++) {
      const template = randomItem(offerTemplates);
      const company = randomItem(COMPANIES);
      const startDate = randomDate(new Date(2025, 2, 1), new Date(2025, 6, 1));
      const deadline = new Date(startDate);
      deadline.setDate(deadline.getDate() - randomInt(10, 40));
 
      const offer = await Offer.create({
        title: template.title,
        company: {
          name: company.name,
          sector: company.sector,
          website: `https://${company.name.toLowerCase().replace(/\s+/g, '')}.tn`
        },
        description: template.description,
        mission: template.mission,
        requiredSkills: template.skills.map(name => ({
          name,
          level: randomItem(['intermédiaire', 'avancé']),
          required: Math.random() > 0.3
        })),
        domain: template.domain,
        location: {
          city: randomItem(TUNISIAN_CITIES),
          country: 'Tunisie',
          remote: Math.random() > 0.6
        },
        duration: {
          months: template.duration,
          startDate
        },
        compensation: {
          paid: Math.random() > 0.4,
          amount: Math.random() > 0.4 ? randomInt(200, 600) : null,
          currency: 'TND'
        },
        targetLevel: randomItems(['L3', 'M1', 'M2', 'Ingénieur 2', 'Ingénieur 3'], randomInt(2, 4)),
        status: i < 15 ? 'published' : randomItem(['draft', 'published', 'closed']),
        maxCandidates: randomInt(3, 10),
        deadline,
        createdBy: admin._id,
        views: randomInt(10, 150),
        tags: randomItems(['stage', 'temps-plein', 'innovation', 'startup', 'formation'], randomInt(1, 3))
      });
      offers.push(offer);
    }
 
    console.log(`✅ ${offers.length} offres créées\n`);
 
    // ─── 4. Create Applications ────────────────────────────────────────────
    console.log('📝 Création des candidatures...');
   
    const applications = [];
    const publishedOffers = offers.filter(o => o.status === 'published');
   
    for (const student of students.slice(0, 12)) {
      const numApps = randomInt(2, 5);
      const selectedOffers = randomItems(publishedOffers, numApps);
 
      for (const offer of selectedOffers) {
        // Calculate compatibility
        const studentSkillNames = student.skills.map(s => s.name.toLowerCase());
        const offerSkillNames = offer.requiredSkills.map(s => s.name.toLowerCase());
        const matched = offerSkillNames.filter(s => studentSkillNames.some(ss => ss.includes(s) || s.includes(ss)));
        const missing = offerSkillNames.filter(s => !matched.includes(s));
        const score = Math.round((matched.length / offerSkillNames.length) * 100);
 
        const status = randomItem(['pending', 'reviewing', 'accepted', 'rejected']);
        const createdAt = randomDate(new Date(2025, 0, 1), new Date());
 
        const app = await Application.create({
          student: student._id,
          offer: offer._id,
          status,
          coverLetter: `Madame, Monsieur,\n\nJe me permets de vous adresser ma candidature pour le poste de ${offer.title}.\n\nActuellement étudiant(e) en ${student.level} à ${student.university}, je suis particulièrement intéressé(e) par votre offre car elle correspond parfaitement à mon profil et à mes aspirations professionnelles.\n\nCordialement,\n${student.user.firstName} ${student.user.lastName}`,
          cvSnapshot: student.cv,
          compatibilityScore: score,
          matchedSkills: matched,
          missingSkills: missing,
          timeline: [
            { status: 'pending', date: createdAt, note: 'Candidature soumise' },
            ...(status !== 'pending' ? [{
              status: status === 'reviewing' ? 'reviewing' : status,
              date: new Date(createdAt.getTime() + 86400000 * randomInt(1, 5)),
              note: status === 'accepted' ? 'Candidature acceptée' : status === 'rejected' ? 'Profil ne correspond pas' : 'En cours d\'examen'
            }] : [])
          ],
          createdAt
        });
 
        applications.push(app);
        await Offer.findByIdAndUpdate(offer._id, { $inc: { currentCandidates: 1 } });
      }
    }
 
    console.log(`✅ ${applications.length} candidatures créées\n`);
 
    // ─── 5. Create Internships ─────────────────────────────────────────────
    console.log('🎯 Création des stages...');
   
    const acceptedApps = applications.filter(a => a.status === 'accepted');
    const internships = [];
 
    for (const app of acceptedApps.slice(0, 8)) {
      const startDate = new Date(2025, 2, randomInt(1, 15));
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + randomInt(3, 6));
 
      const internship = await Internship.create({
        application: app._id,
        student: app.student,
        offer: app.offer,
        supervisor: randomItem(supervisors)._id,
        companySupervisor: {
          name: randomItem(['Amel Hamza', 'Sami Bouzid', 'Leila Mansour', 'Karim Fredj']),
          email: 'contact@company.tn',
          phone: '+216 71 123 456',
          position: 'Responsable Technique'
        },
        startDate,
        endDate,
        status: randomItem(['pending', 'active', 'active', 'completed']),
        objectives: [
          { description: 'Maîtriser les outils de développement', completed: Math.random() > 0.5 },
          { description: 'Livrer 3 fonctionnalités majeures', completed: Math.random() > 0.5 },
          { description: 'Participer aux daily meetings', completed: Math.random() > 0.3 },
          { description: 'Rédiger la documentation technique', completed: Math.random() > 0.6 }
        ],
        reports: randomInt(0, 2) > 0 ? [{
          title: 'Rapport mensuel - Premier mois',
          content: 'Découverte de l\'environnement de travail et montée en compétences sur les technologies utilisées.',
          submittedAt: new Date(startDate.getTime() + 30 * 86400000),
          validated: true,
          grade: randomInt(14, 18),
          feedback: 'Bon travail, continuez ainsi.'
        }] : [],
        finalGrade: Math.random() > 0.5 ? randomInt(13, 18) : undefined
      });
 
      internships.push(internship);
    }
 
    console.log(`✅ ${internships.length} stages créés\n`);
 
    // ─── Summary ───────────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════════');
    console.log('✨ SEED TERMINÉ AVEC SUCCÈS !');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`👥 Utilisateurs créés: ${studentUsers.length + supervisors.length + 1}`);
    console.log(`   - Admin: 1 (admin@stagemanager.tn / admin123)`);
    console.log(`   - Encadrants: ${supervisors.length}`);
    console.log(`   - Étudiants: ${studentUsers.length}`);
    console.log(`📚 Profils étudiants: ${students.length}`);
    console.log(`💼 Offres de stage: ${offers.length}`);
    console.log(`📝 Candidatures: ${applications.length}`);
    console.log(`🎯 Stages: ${internships.length}`);
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🔐 CREDENTIALS:');
    console.log('   Admin     → admin@stagemanager.tn / admin123');
    console.log('   Encadrant → supervisor1@stagemanager.tn / super123');
    console.log('   Étudiant  → amine.hamdi@student.tn / student123');
    console.log('═══════════════════════════════════════════════════════\n');
 
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnexion MongoDB');
    process.exit(0);
  }
}
 
// ─── Run ───────────────────────────────────────────────────────────────────
seed();