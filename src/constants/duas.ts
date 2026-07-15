export type Dua = {
  category: string;
  title: string;
  arabic: string;
  translation: string;
};

export const DUAS: Dua[] = [
  {
    category: 'Daily',
    title: 'Upon waking up',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    translation:
      'Praise be to Allah, Who gave us life after having caused us to die, and unto Him is the resurrection.',
  },
  {
    category: 'Daily',
    title: 'Before sleeping',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    translation: 'In Your name, O Allah, I die and I live.',
  },
  {
    category: 'Daily',
    title: 'Before eating',
    arabic: 'بِسْمِ اللَّهِ',
    translation: 'In the name of Allah.',
  },
  {
    category: 'Daily',
    title: 'After eating',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَـٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    translation:
      'Praise be to Allah who fed me this and provided it for me without any might or power on my part.',
  },
  {
    category: 'Home',
    title: 'Entering the home',
    arabic: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    translation:
      'In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we place our trust.',
  },
  {
    category: 'Home',
    title: 'Leaving the home',
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    translation:
      'In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.',
  },
  {
    category: 'Masjid',
    title: 'Entering the masjid',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    translation: 'O Allah, open the doors of Your mercy for me.',
  },
  {
    category: 'Masjid',
    title: 'Leaving the masjid',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    translation: 'O Allah, I ask You from Your bounty.',
  },
  {
    category: 'Travel',
    title: 'Setting out on a journey',
    arabic:
      'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَـٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ',
    translation:
      'Glory to Him Who has provided this for us, though we could never have accomplished it ourselves. And indeed, to our Lord we will return.',
  },
  {
    category: 'Distress & Comfort',
    title: 'In times of anxiety or sorrow',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ',
    translation: 'O Allah, I seek refuge in You from anxiety and sorrow.',
  },
  {
    category: 'Distress & Comfort',
    title: 'The supplication of Yunus (peace be upon him)',
    arabic: 'لَا إِلَـٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
  },
  {
    category: 'Family',
    title: 'For one’s parents',
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
  },
];
