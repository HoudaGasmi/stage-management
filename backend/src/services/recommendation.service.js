/**
 * Service de recommandation intelligent
 * Analyse les profils étudiants et les offres pour calculer des scores de compatibilité
 */
class RecommendationService {

  /**
   * Calcule un score de compatibilité entre un étudiant et une offre (0-100)
   */
  static calculateScore(student, offer) {
    const studentSkills = (student.skills || []).map(s => s.name.toLowerCase().trim());
    const requiredSkills = offer.requiredSkills || [];

    const requiredNames = requiredSkills.filter(s => s.required).map(s => s.name.toLowerCase().trim());
    const optionalNames = requiredSkills.filter(s => !s.required).map(s => s.name.toLowerCase().trim());

    // Match skills with fuzzy matching
    const matched = [];
    const missing = [];

    for (const skill of requiredNames) {
      const found = studentSkills.some(s => this.fuzzyMatch(s, skill));
      if (found) matched.push(skill);
      else missing.push(skill);
    }

    for (const skill of optionalNames) {
      const found = studentSkills.some(s => this.fuzzyMatch(s, skill));
      if (found) matched.push(skill);
    }

    // Score calculation
    let score = 0;
    if (requiredNames.length > 0) {
      score += (matched.filter(s => requiredNames.includes(s)).length / requiredNames.length) * 70;
    } else {
      score += 70;
    }

    if (optionalNames.length > 0) {
      const optMatched = matched.filter(s => optionalNames.includes(s)).length;
      score += (optMatched / optionalNames.length) * 20;
    } else {
      score += 20;
    }

    // Level bonus
    if (offer.targetLevel?.includes(student.level)) score += 10;

    return {
      score: Math.min(Math.round(score), 100),
      matched: [...new Set(matched)],
      missing: [...new Set(missing)]
    };
  }

  /**
   * Retourne les offres recommandées pour un étudiant, triées par score
   */
  static async getRecommendations(student, offers, minScore = 30) {
    const scored = offers.map(offer => {
      const { score, matched, missing } = this.calculateScore(student, offer);
      return { offer, score, matched, missing };
    });

    return scored
      .filter(r => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }

  /**
   * Analyse les lacunes du profil et suggère des améliorations
   */
  static analyzeProfile(student, allOffers) {
    const missingSkillsMap = {};

    for (const offer of allOffers) {
      if (offer.status !== 'published') continue;
      const { missing } = this.calculateScore(student, offer);
      for (const skill of missing) {
        missingSkillsMap[skill] = (missingSkillsMap[skill] || 0) + 1;
      }
    }

    const suggestions = Object.entries(missingSkillsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, demandCount: count }));

    return {
      suggestions,
      profileCompleteness: this.getProfileCompleteness(student),
      cvTips: this.getCvTips(student)
    };
  }

  /**
   * Calcule le niveau de complétude du profil (0-100%)
   */
  static getProfileCompleteness(student) {
    const checks = [
      { field: 'bio', weight: 10 },
      { field: 'skills', weight: 25, isArray: true },
      { field: 'cv', weight: 20, isObject: true },
      { field: 'languages', weight: 10, isArray: true },
      { field: 'linkedIn', weight: 5 },
      { field: 'availability', weight: 10, isObject: true },
      { field: 'desiredDomain', weight: 10, isArray: true },
      { field: 'university', weight: 5 },
      { field: 'level', weight: 5 }
    ];

    let total = 0;
    for (const check of checks) {
      const val = student[check.field];
      if (check.isArray && Array.isArray(val) && val.length > 0) total += check.weight;
      else if (check.isObject && val && Object.keys(val).length > 0) total += check.weight;
      else if (!check.isArray && !check.isObject && val) total += check.weight;
    }

    return total;
  }

  /**
   * Suggestions d'amélioration du CV
   */
  static getCvTips(student) {
    const tips = [];
    if (!student.cv?.filename) tips.push({ type: 'error', message: 'CV non téléversé - priorité absolue !' });
    if (!student.bio) tips.push({ type: 'warning', message: 'Ajoutez une présentation personnelle.' });
    if (!student.skills?.length) tips.push({ type: 'error', message: 'Aucune compétence renseignée.' });
    if (student.skills?.length < 5) tips.push({ type: 'info', message: 'Ajoutez plus de compétences (min. 5 recommandées).' });
    if (!student.languages?.length) tips.push({ type: 'warning', message: 'Renseignez vos langues.' });
    if (!student.linkedIn) tips.push({ type: 'info', message: 'Ajoutez votre profil LinkedIn.' });
    return tips;
  }

  /**
   * Simple fuzzy match: checks includes or contains
   */
  static fuzzyMatch(a, b) {
    return a === b || a.includes(b) || b.includes(a) ||
      this.similarity(a, b) > 0.75;
  }

  /**
   * Dice coefficient for string similarity
   */
  static similarity(a, b) {
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;
    const aBigrams = new Map();
    for (let i = 0; i < a.length - 1; i++) {
      const bigram = a.substring(i, i + 2);
      aBigrams.set(bigram, (aBigrams.get(bigram) || 0) + 1);
    }
    let intersectionSize = 0;
    for (let i = 0; i < b.length - 1; i++) {
      const bigram = b.substring(i, i + 2);
      const count = aBigrams.get(bigram) || 0;
      if (count > 0) { aBigrams.set(bigram, count - 1); intersectionSize++; }
    }
    return (2.0 * intersectionSize) / (a.length + b.length - 2);
  }
}

module.exports = RecommendationService;
