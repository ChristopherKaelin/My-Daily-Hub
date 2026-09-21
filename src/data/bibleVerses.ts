export interface VerseReference {
  category: string   // Theme category
  reference: string  // API.Bible format (e.g. JHN.3.16)
  display: string    // Human-readable (e.g. John 3:16)
}

export const bibleVerses: VerseReference[] = [
  // Faith & Salvation (16)
  { category: 'Faith & Salvation', reference: 'ISA.53.5',           display: 'Isaiah 53:5' },
  { category: 'Faith & Salvation', reference: 'JHN.1.12',           display: 'John 1:12' },
  { category: 'Faith & Salvation', reference: 'JHN.3.16-JHN.3.17', display: 'John 3:16-17' },
  { category: 'Faith & Salvation', reference: 'JHN.8.32',           display: 'John 8:32' },
  { category: 'Faith & Salvation', reference: 'JHN.14.6',           display: 'John 14:6' },
  { category: 'Faith & Salvation', reference: 'ACT.4.12',           display: 'Acts 4:12' },
  { category: 'Faith & Salvation', reference: 'ACT.16.31',          display: 'Acts 16:31' },
  { category: 'Faith & Salvation', reference: 'ROM.3.23',           display: 'Romans 3:23' },
  { category: 'Faith & Salvation', reference: 'ROM.5.8',            display: 'Romans 5:8' },
  { category: 'Faith & Salvation', reference: 'ROM.6.23',           display: 'Romans 6:23' },
  { category: 'Faith & Salvation', reference: 'ROM.10.9',           display: 'Romans 10:9' },
  { category: 'Faith & Salvation', reference: 'EPH.2.8-EPH.2.9',   display: 'Ephesians 2:8-9' },
  { category: 'Faith & Salvation', reference: 'TIT.3.5',            display: 'Titus 3:5' },
  { category: 'Faith & Salvation', reference: 'HEB.11.1',           display: 'Hebrews 11:1' },
  { category: 'Faith & Salvation', reference: '1PE.1.18',           display: '1 Peter 1:18' },
  { category: 'Faith & Salvation', reference: '1JN.5.13',           display: '1 John 5:13' },

  // Hope & Future (10)
  { category: 'Hope & Future', reference: 'PSA.27.14',              display: 'Psalm 27:14' },
  { category: 'Hope & Future', reference: 'ISA.40.31',              display: 'Isaiah 40:31' },
  { category: 'Hope & Future', reference: 'ISA.41.10',              display: 'Isaiah 41:10' },
  { category: 'Hope & Future', reference: 'JER.29.11',              display: 'Jeremiah 29:11' },
  { category: 'Hope & Future', reference: 'LAM.3.22-LAM.3.23',     display: 'Lamentations 3:22-23' },
  { category: 'Hope & Future', reference: 'ROM.5.3-ROM.5.4',       display: 'Romans 5:3-4' },
  { category: 'Hope & Future', reference: 'ROM.8.28',               display: 'Romans 8:28' },
  { category: 'Hope & Future', reference: 'ROM.15.13',              display: 'Romans 15:13' },
  { category: 'Hope & Future', reference: 'HEB.6.19',               display: 'Hebrews 6:19' },
  { category: 'Hope & Future', reference: 'REV.21.4',               display: 'Revelation 21:4' },

  // Strength & Courage (13)
  { category: 'Strength & Courage', reference: 'DEU.31.6',          display: 'Deuteronomy 31:6' },
  { category: 'Strength & Courage', reference: 'JOS.1.9',           display: 'Joshua 1:9' },
  { category: 'Strength & Courage', reference: 'NEH.8.10',          display: 'Nehemiah 8:10' },
  { category: 'Strength & Courage', reference: 'PSA.28.7',          display: 'Psalm 28:7' },
  { category: 'Strength & Courage', reference: 'PSA.46.1',          display: 'Psalm 46:1' },
  { category: 'Strength & Courage', reference: 'ISA.40.29',         display: 'Isaiah 40:29' },
  { category: 'Strength & Courage', reference: 'MAT.4.4',           display: 'Matthew 4:4' },
  { category: 'Strength & Courage', reference: 'HEB.4.12',          display: 'Hebrews 4:12' },
  { category: 'Strength & Courage', reference: '2CO.12.9',          display: '2 Corinthians 12:9' },
  { category: 'Strength & Courage', reference: 'EPH.6.10',          display: 'Ephesians 6:10' },
  { category: 'Strength & Courage', reference: 'PHP.4.13',          display: 'Philippians 4:13' },
  { category: 'Strength & Courage', reference: '2TI.1.7',           display: '2 Timothy 1:7' },
  { category: 'Strength & Courage', reference: '2TI.4.7',           display: '2 Timothy 4:7' },

  // Peace & Anxiety (10)
  { category: 'Peace & Anxiety', reference: 'PSA.23.1',             display: 'Psalm 23:1' },
  { category: 'Peace & Anxiety', reference: 'PSA.46.10',            display: 'Psalm 46:10' },
  { category: 'Peace & Anxiety', reference: 'ISA.26.3',             display: 'Isaiah 26:3' },
  { category: 'Peace & Anxiety', reference: 'MAT.11.28-MAT.11.30', display: 'Matthew 11:28-30' },
  { category: 'Peace & Anxiety', reference: 'JHN.14.27',            display: 'John 14:27' },
  { category: 'Peace & Anxiety', reference: 'JHN.16.33',            display: 'John 16:33' },
  { category: 'Peace & Anxiety', reference: 'ROM.8.6',              display: 'Romans 8:6' },
  { category: 'Peace & Anxiety', reference: 'PHP.4.6-PHP.4.7',     display: 'Philippians 4:6-7' },
  { category: 'Peace & Anxiety', reference: 'COL.3.15',             display: 'Colossians 3:15' },
  { category: 'Peace & Anxiety', reference: '1PE.5.7',              display: '1 Peter 5:7' },

  // Love (10)
  { category: 'Love', reference: 'SNG.8.7',                         display: 'Song of Solomon 8:7' },
  { category: 'Love', reference: 'JHN.13.34',                       display: 'John 13:34' },
  { category: 'Love', reference: 'JHN.15.13',                       display: 'John 15:13' },
  { category: 'Love', reference: 'ROM.8.38-ROM.8.39',               display: 'Romans 8:38-39' },
  { category: 'Love', reference: '1CO.13.4',                        display: '1 Corinthians 13:4' },
  { category: 'Love', reference: '1CO.16.14',                       display: '1 Corinthians 16:14' },
  { category: 'Love', reference: 'EPH.3.17',                        display: 'Ephesians 3:17' },
  { category: 'Love', reference: '1JN.3.16',                        display: '1 John 3:16' },
  { category: 'Love', reference: '1JN.4.8',                         display: '1 John 4:8' },
  { category: 'Love', reference: '1JN.4.19',                        display: '1 John 4:19' },

  // Wisdom & Guidance (12)
  { category: 'Wisdom & Guidance', reference: 'PSA.32.8',           display: 'Psalm 32:8' },
  { category: 'Wisdom & Guidance', reference: 'PSA.37.23',          display: 'Psalm 37:23' },
  { category: 'Wisdom & Guidance', reference: 'PSA.119.11',         display: 'Psalm 119:11' },
  { category: 'Wisdom & Guidance', reference: 'PSA.119.105',        display: 'Psalm 119:105' },
  { category: 'Wisdom & Guidance', reference: 'PRO.3.5',            display: 'Proverbs 3:5' },
  { category: 'Wisdom & Guidance', reference: 'PRO.4.7',            display: 'Proverbs 4:7' },
  { category: 'Wisdom & Guidance', reference: 'PRO.16.3',           display: 'Proverbs 16:3' },
  { category: 'Wisdom & Guidance', reference: 'ISA.30.21',          display: 'Isaiah 30:21' },
  { category: 'Wisdom & Guidance', reference: 'JHN.16.13',          display: 'John 16:13' },
  { category: 'Wisdom & Guidance', reference: 'COL.3.16',           display: 'Colossians 3:16' },
  { category: 'Wisdom & Guidance', reference: '2TI.3.16',           display: '2 Timothy 3:16' },
  { category: 'Wisdom & Guidance', reference: 'JAS.1.5',            display: 'James 1:5' },

  // Prayer & Worship (10)
  { category: 'Prayer & Worship', reference: 'PSA.34.17',           display: 'Psalm 34:17' },
  { category: 'Prayer & Worship', reference: 'PSA.95.6',            display: 'Psalm 95:6' },
  { category: 'Prayer & Worship', reference: 'PSA.100.4',           display: 'Psalm 100:4' },
  { category: 'Prayer & Worship', reference: 'PSA.150.6',           display: 'Psalm 150:6' },
  { category: 'Prayer & Worship', reference: 'MAT.7.7',             display: 'Matthew 7:7' },
  { category: 'Prayer & Worship', reference: 'MAT.21.22',           display: 'Matthew 21:22' },
  { category: 'Prayer & Worship', reference: 'JHN.4.24',            display: 'John 4:24' },
  { category: 'Prayer & Worship', reference: 'HEB.4.16',            display: 'Hebrews 4:16' },
  { category: 'Prayer & Worship', reference: '1TH.5.17',            display: '1 Thessalonians 5:17' },
  { category: 'Prayer & Worship', reference: '1JN.5.14',            display: '1 John 5:14' },

  // Purpose & Identity (10)
  { category: 'Purpose & Identity', reference: 'GEN.1.27',          display: 'Genesis 1:27' },
  { category: 'Purpose & Identity', reference: 'PSA.139.14',        display: 'Psalm 139:14' },
  { category: 'Purpose & Identity', reference: 'JER.1.5',           display: 'Jeremiah 1:5' },
  { category: 'Purpose & Identity', reference: 'ROM.8.29',          display: 'Romans 8:29' },
  { category: 'Purpose & Identity', reference: '2CO.5.17',          display: '2 Corinthians 5:17' },
  { category: 'Purpose & Identity', reference: 'GAL.2.20',          display: 'Galatians 2:20' },
  { category: 'Purpose & Identity', reference: 'EPH.2.10',          display: 'Ephesians 2:10' },
  { category: 'Purpose & Identity', reference: 'PHP.1.6',           display: 'Philippians 1:6' },
  { category: 'Purpose & Identity', reference: 'COL.1.16',          display: 'Colossians 1:16' },
  { category: 'Purpose & Identity', reference: '1PE.2.9',           display: '1 Peter 2:9' },

  // Gratitude & Joy (9)
  { category: 'Gratitude & Joy', reference: 'PSA.9.1',              display: 'Psalm 9:1' },
  { category: 'Gratitude & Joy', reference: 'PSA.16.11',            display: 'Psalm 16:11' },
  { category: 'Gratitude & Joy', reference: 'PSA.118.24',           display: 'Psalm 118:24' },
  { category: 'Gratitude & Joy', reference: 'ECC.3.12',             display: 'Ecclesiastes 3:12' },
  { category: 'Gratitude & Joy', reference: 'HAB.3.17',             display: 'Habakkuk 3:17' },
  { category: 'Gratitude & Joy', reference: 'ROM.5.11',             display: 'Romans 5:11' },
  { category: 'Gratitude & Joy', reference: 'PHP.4.4',              display: 'Philippians 4:4' },
  { category: 'Gratitude & Joy', reference: '1TH.5.16-1TH.5.18',   display: '1 Thessalonians 5:16-18' },
  { category: 'Gratitude & Joy', reference: 'JAS.1.17',             display: 'James 1:17' },
]
